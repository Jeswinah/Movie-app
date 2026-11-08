import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { FaStar, FaBookmark, FaRegBookmark, FaMapMarkerAlt } from "react-icons/fa";
import axios from "axios";
import authApi from "../config/authApi";
import { tmdbImageUrl } from "../config/tmdbImage";
import useImdbRating from "../hooks/useImdbRating";

const MovieSlider = ({ movies, mediaType = "movie", setLoading }) => {
  const [current, setCurrent] = useState(0);
  const [providersCache, setProvidersCache] = useState({});
  const [watchlistKeys, setWatchlistKeys] = useState(() => new Set());
  const [watchlistBusyId, setWatchlistBusyId] = useState(null);
  const rootRef = useRef(null);
  const requestedRef = useRef(new Set());

  // Deduplicate movies by ID
  const uniqueMovies = React.useMemo(() => {
    if (!movies) return [];
    const seen = new Set();
    return movies.filter(movie => {
      if (seen.has(movie.id)) {
        return false;
      }
      seen.add(movie.id);
      return true;
    });
  }, [movies]);

  // Auto-slide every 5s
  useEffect(() => {
    if (!uniqueMovies || uniqueMovies.length === 0) return;
    const interval = setInterval(() => {
      setCurrent((prev) => (prev + 1) % uniqueMovies.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [uniqueMovies]);


  useEffect(() => {
    setCurrent(0);
    if (typeof setLoading === "function") setLoading(false);
  }, [uniqueMovies, setLoading]);

  useEffect(() => {
    let isMounted = true;

    const fetchWatchlist = async () => {
      try {
        const response = await authApi.get("/watchlist");
        const items = response.data.items || [];
        if (isMounted) {
          setWatchlistKeys(
            new Set(items.map((item) => `${item.mediaType}:${item.tmdbId}`))
          );
        }
      } catch {
        // Not logged in or network issue - keep watchlist icons inactive
      }
    };

    fetchWatchlist();

    return () => {
      isMounted = false;
    };
  }, []);

  const activeMovie = uniqueMovies[current];
  const imdbRating = useImdbRating(activeMovie?.id, mediaType);

  useEffect(() => {
    if (!activeMovie?.id) return;

    const cacheKey = `${mediaType}-${activeMovie.id}`;
    if (requestedRef.current.has(cacheKey)) return;
    requestedRef.current.add(cacheKey);

    const apiKey = import.meta.env.VITE_TMDB_API_KEY;

    axios
      .get(
        `https://api.themoviedb.org/3/${mediaType}/${activeMovie.id}/watch/providers?api_key=${apiKey}`
      )
      .then((response) => {
        const regionData = response.data?.results?.IN || response.data?.results?.US;
        const flatrate = (regionData?.flatrate || []).slice(0, 4);
        setProvidersCache((prev) => ({ ...prev, [activeMovie.id]: flatrate }));
      })
      .catch(() => {
        setProvidersCache((prev) => ({ ...prev, [activeMovie.id]: [] }));
      });
  }, [activeMovie, mediaType]);

  const toggleWatchlist = async (movie) => {
    if (!movie || watchlistBusyId) return;

    const key = `${mediaType}:${movie.id}`;
    const inWatchlist = watchlistKeys.has(key);
    setWatchlistBusyId(movie.id);

    try {
      if (inWatchlist) {
        await authApi.delete(`/watchlist/${movie.id}`, { params: { mediaType } });
        setWatchlistKeys((prev) => {
          const next = new Set(prev);
          next.delete(key);
          return next;
        });
      } else {
        await authApi.post("/watchlist", {
          tmdbId: movie.id,
          mediaType,
          title: movie.title || movie.name,
          posterPath: movie.poster_path,
          overview: movie.overview,
          voteAverage: movie.vote_average,
          releaseDate: movie.release_date || movie.first_air_date
        });
        setWatchlistKeys((prev) => new Set(prev).add(key));
      }
    } catch (error) {
      console.error("Error updating watchlist:", error);
    } finally {
      setWatchlistBusyId(null);
    }
  };

  if (!uniqueMovies || uniqueMovies.length === 0) return null;

  return (
    <div ref={rootRef} className="relative w-full h-[calc(100vh)] overflow-hidden -mt-16">
      {/* Slides: render all and fade between them */}
      {uniqueMovies.map((movie, idx) => {
        const isActive = idx === current;
        const inWatchlist = watchlistKeys.has(`${mediaType}:${movie.id}`);
        return (
          <div
            key={`slider-${movie.id}`}
            className={`absolute inset-0 w-full h-full transition-all duration-1000 ease-in-out bg-black ${
              isActive ? "opacity-100 scale-100 z-20" : "opacity-0 scale-105 z-10"
            }`}
            aria-hidden={!isActive}
          >
            <img
              src={tmdbImageUrl(movie.backdrop_path, "w1280")}
              alt={movie.title || movie.name}
              className="w-full h-full object-cover object-top "
              loading={isActive ? "eager" : "lazy"}
              decoding="async"
              fetchPriority={isActive ? "high" : "low"}
            />

            <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-transparent to-black/80"></div>

            <div className="absolute inset-0 flex flex-col justify-end px-6 pb-20">
              <h2 className={`text-4xl md:text-6xl font-bold text-white mb-4 drop-shadow-lg transition-all duration-700 delay-300 ${
                isActive ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
              }`}>
                {movie.title || movie.name}
              </h2>
              <p className={`text-white max-w-2xl mb-4 text-sm md:text-lg drop-shadow-md transition-all duration-700 delay-500 ${
                isActive ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
              }`}>
                {movie.overview}
              </p>

              <div className={`flex items-center gap-2 mb-3 transition-all duration-700 delay-600 ${
                isActive ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
              }`}>
                {isActive && imdbRating !== null ? (
                  <>
                    <span className="rounded bg-[#f5c518] px-2 py-0.5 text-sm font-extrabold text-black">
                      IMDb
                    </span>
                    <span className="text-white font-bold text-xl">{imdbRating.toFixed(1)}/10</span>
                  </>
                ) : (
                  <>
                    <FaStar className="text-yellow-400 text-xl" />
                    <span className="text-white font-bold text-xl">{movie.vote_average?.toFixed(1)}/10</span>
                  </>
                )}
              </div>

              {isActive && providersCache[movie.id]?.length > 0 && (
                <div className={`flex items-center gap-3 mb-4 transition-all duration-700 delay-700 ${
                  isActive ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
                }`}>
                  <span className="text-xs font-semibold uppercase tracking-widest text-white/60">
                    Stream on
                  </span>
                  <div className="flex items-center gap-2">
                    {providersCache[movie.id].map((provider) => (
                      <img
                        key={provider.provider_id}
                        src={tmdbImageUrl(provider.logo_path, "w92")}
                        alt={provider.provider_name}
                        title={provider.provider_name}
                        className="h-9 w-9 rounded-lg border border-white/20 bg-black/40 object-cover shadow-md"
                        loading="lazy"
                        decoding="async"
                      />
                    ))}
                  </div>
                </div>
              )}

              <div className={`flex items-center gap-3 transition-all duration-700 delay-700 ${
                isActive ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
              }`}>
                {(() => {
                  const isInTheaters = mediaType === "movie" && 
                    movie.release_date && 
                    new Date(movie.release_date) > new Date(Date.now() - 5 * 24 * 60 * 60 * 1000);
                  
                  if (isInTheaters) {
                    return (
                      <button
                        disabled
                        className="bg-gray-600 text-white font-medium rounded-md w-44 h-12 shadow-lg cursor-not-allowed opacity-70 flex items-center justify-center gap-2"
                      >
                        <FaMapMarkerAlt className="text-sm" /> In Theatres
                      </button>
                    );
                  }
                  
                  return (
                    <Link
                      to={mediaType === "tv" ? `/series/${movie.id}?autoplay=true` : `/movie/${movie.id}?autoplay=true`}
                    >
                      <button className="bg-red-600 text-white font-medium rounded-md w-44 h-12 shadow-lg hover:cursor-pointer hover:opacity-50 transition-all">
                        Watch Now
                      </button>
                    </Link>
                  );
                })()}

                <button
                  type="button"
                  onClick={() => toggleWatchlist(movie)}
                  disabled={watchlistBusyId === movie.id}
                  title={inWatchlist ? "Remove from watchlist" : "Add to watchlist"}
                  aria-label={inWatchlist ? "Remove from watchlist" : "Add to watchlist"}
                  className={`grid h-12 w-12 place-items-center rounded-md border text-lg shadow-lg backdrop-blur-sm transition-all disabled:opacity-60 ${
                    inWatchlist
                      ? "border-red-500 bg-red-600 text-white hover:bg-red-700"
                      : "border-white/40 bg-white/10 text-white hover:border-white hover:bg-white/20"
                  }`}
                >
                  {inWatchlist ? <FaBookmark /> : <FaRegBookmark />}
                </button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default MovieSlider;
