import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import {
  FaStar,
  FaPlay,
  FaPlus,
  FaCheck,
  FaThumbsUp,
  FaEllipsisH,
  FaTimes,
  FaMapMarkerAlt
} from "react-icons/fa";
import axios from "axios";
import authApi from "../config/authApi";
import API_BASE_URL from "../config/api";
import { tmdbImageUrl } from "../config/tmdbImage";
import useImdbRating from "../hooks/useImdbRating";

const MovieSlider = ({ movies, mediaType = "movie", setLoading }) => {
  const [current, setCurrent] = useState(0);
  const [providersCache, setProvidersCache] = useState({});
  const [watchlistKeys, setWatchlistKeys] = useState(() => new Set());
  const [watchlistBusyId, setWatchlistBusyId] = useState(null);
  const [trailers, setTrailers] = useState({});
  const [activeTrailer, setActiveTrailer] = useState(null);
  const [toast, setToast] = useState("");
  const [liked, setLiked] = useState({});
  const rootRef = useRef(null);
  const requestedRef = useRef(new Set());
  const trailerRequestedRef = useRef(new Set());
  const toastTimer = useRef(null);

  const uniqueMovies = React.useMemo(() => {
    if (!movies) return [];
    const seen = new Set();
    return movies.filter((movie) => {
      if (seen.has(movie.id)) {
        return false;
      }
      seen.add(movie.id);
      return true;
    });
  }, [movies]);

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

  useEffect(() => () => clearTimeout(toastTimer.current), []);

  const showToast = (message) => {
    setToast(message);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(""), 2600);
  };

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

  useEffect(() => {
    if (!activeMovie?.id || trailerRequestedRef.current.has(activeMovie.id)) return;
    trailerRequestedRef.current.add(activeMovie.id);

    axios
      .get(`${API_BASE_URL}/api/${mediaType === "tv" ? "series" : "movie"}/${activeMovie.id}/videos`)
      .then((response) => {
        setTrailers((prev) => ({ ...prev, [activeMovie.id]: response.data?.trailer || null }));
      })
      .catch(() => {
        setTrailers((prev) => ({ ...prev, [activeMovie.id]: null }));
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
        showToast("Removed from My List");
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
        showToast("Added to My List");
      }
    } catch (error) {
      console.error("Error updating watchlist:", error);
      showToast("Could not update My List");
    } finally {
      setWatchlistBusyId(null);
    }
  };

  const openTrailer = (movie) => {
    const trailer = trailers[movie.id];
    if (trailer?.key) {
      setActiveTrailer(trailer.key);
    } else {
      showToast("Trailer is not available for this title");
    }
  };

  const copyLink = async (movie) => {
    const path = mediaType === "tv" ? `/series/${movie.id}` : `/movie/${movie.id}`;
    try {
      await navigator.clipboard.writeText(`${window.location.origin}${path}`);
      showToast("Link copied to clipboard");
    } catch (error) {
      console.error("Could not copy link:", error);
      showToast("Could not copy link");
    }
  };

  if (!uniqueMovies || uniqueMovies.length === 0) return null;

  const roundButtonClass =
    "grid h-12 w-12 shrink-0 place-items-center rounded-full border border-white/20 bg-white/10 text-base text-white backdrop-blur-md transition hover:border-white/50 hover:bg-white/20 disabled:opacity-50";

  return (
    <div ref={rootRef} className="relative h-[100svh] w-full overflow-hidden bg-black">
      {uniqueMovies.map((movie, idx) => {
        const isActive = idx === current;
        const inWatchlist = watchlistKeys.has(`${mediaType}:${movie.id}`);
        const detailsPath = mediaType === "tv" ? `/series/${movie.id}` : `/movie/${movie.id}`;
        const playPath = `${detailsPath}?autoplay=true`;
        const rating = isActive && imdbRating !== null ? imdbRating : Number(movie.vote_average || 0);
        const likedPercent = Math.round(Number(movie.vote_average || 0) * 10);
        const isInTheaters =
          mediaType === "movie" &&
          movie.release_date &&
          new Date(movie.release_date) > new Date(Date.now() - 5 * 24 * 60 * 60 * 1000);
        const motionClass = `transition-all duration-700 ${
          isActive ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
        }`;

        return (
          <div
            key={`slider-${movie.id}`}
            className={`absolute inset-0 h-full w-full  bg-black transition-all duration-1000 ease-in-out ${
              isActive ? "z-20 scale-100 opacity-100" : "z-10 scale-105 opacity-0"
            }`}
            aria-hidden={!isActive}
          >
            <img
              src={tmdbImageUrl(movie.backdrop_path, "w1280")}
              alt={movie.title || movie.name}
              className="absolute inset-0 h-full w-full object-cover object-center"
              loading={isActive ? "eager" : "lazy"}
              decoding="async"
              fetchPriority={isActive ? "high" : "low"}
            />

            <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(6,7,9,0.96)_0%,rgba(6,7,9,0.78)_38%,rgba(6,7,9,0.12)_76%,rgba(6,7,9,0.4)_100%)]" />
            <div className="absolute inset-0 bg-[linear-gradient(0deg,rgba(6,7,9,0.85)_0%,rgba(6,7,9,0)_55%)]" />

            <div className="absolute inset-0 z-20 flex flex-col justify-end px-6 pb-24 pt-32 md:px-12 lg:px-20">
              <div className="mx-auto w-full max-w-[1500px]">
                <div className="flex flex-col items-start">
                <h1
                  className={`display-title text-[clamp(3rem,7vw,6rem)] font-bold uppercase leading-[0.9] tracking-wide text-white drop-shadow-[0_6px_24px_rgba(0,0,0,0.7)] ${motionClass}`}
                >
                  {movie.title || movie.name}
                </h1>

                <div
                  className={`mt-6 flex flex-wrap items-center gap-x-3 gap-y-2 text-sm font-semibold text-white/75 md:text-base ${motionClass}`}
                >
                  <span className="text-xs uppercase tracking-[0.2em] text-white/50">Featured</span>
                  {(movie.release_date || movie.first_air_date || "").slice(0, 4) && (
                    <span>{(movie.release_date || movie.first_air_date || "").slice(0, 4)}</span>
                  )}
                  <span className="flex items-center gap-1 text-amber-400">
                    <FaStar /> {Number(rating).toFixed(1)}
                  </span>
                  {likedPercent > 0 && (
                    <span className="flex items-center gap-1 text-emerald-400">
                      <FaThumbsUp /> {likedPercent}% liked
                    </span>
                  )}
                </div>

                <p
                  className={`mt-5 line-clamp-3 max-w-xl text-[15px] leading-relaxed text-white/85 md:text-base ${motionClass}`}
                >
                  {movie.overview}
                </p>

                <div className={`mt-8 flex flex-wrap items-center gap-3 ${motionClass}`}>
                  {isInTheaters ? (
                    <button
                      disabled
                      className="flex h-12 cursor-not-allowed items-center gap-2 rounded-full bg-white/15 px-7 font-semibold text-white/70"
                    >
                      <FaMapMarkerAlt /> In Theatres
                    </button>
                  ) : (
                    <Link to={playPath}>
                      <button className="flex h-12 items-center gap-2 rounded-full bg-white px-7 font-bold text-[#0b0c0e] shadow-lg transition hover:scale-[1.03] hover:bg-white/90">
                        <FaPlay /> Play
                      </button>
                    </Link>
                  )}
                  <button
                    type="button"
                    onClick={() => openTrailer(movie)}
                    className="flex h-12 items-center gap-2 rounded-full border border-white/20 bg-white/10 px-6 font-semibold text-white backdrop-blur-md transition hover:border-white/40 hover:bg-white/20"
                  >
                    <FaPlay /> Trailer
                  </button>
                  <button
                    type="button"
                    onClick={() => toggleWatchlist(movie)}
                    disabled={watchlistBusyId === movie.id}
                    title={inWatchlist ? "Remove from My List" : "Add to My List"}
                    aria-label={inWatchlist ? "Remove from My List" : "Add to My List"}
                    className={roundButtonClass}
                  >
                    {inWatchlist ? <FaCheck /> : <FaPlus />}
                  </button>
                  <button
                    type="button"
                    onClick={() => setLiked((prev) => ({ ...prev, [movie.id]: !prev[movie.id] }))}
                    title={liked[movie.id] ? "Unlike this title" : "Like this title"}
                    aria-label={liked[movie.id] ? "Unlike this title" : "Like this title"}
                    aria-pressed={Boolean(liked[movie.id])}
                    className={`grid h-12 w-12 shrink-0 place-items-center rounded-full border text-base backdrop-blur-md transition ${
                      liked[movie.id]
                        ? "border-emerald-400/60 bg-emerald-400/20 text-emerald-400 hover:border-emerald-300 hover:bg-emerald-400/30"
                        : "border-white/20 bg-white/10 text-white hover:border-white/50 hover:bg-white/20"
                    }`}
                  >
                    <FaThumbsUp />
                  </button>
                  <button
                    type="button"
                    onClick={() => copyLink(movie)}
                    title="Copy link"
                    aria-label="Copy link"
                    className={roundButtonClass}
                  >
                    <FaEllipsisH />
                  </button>
                </div>

                {providersCache[movie.id]?.length > 0 && (
                  <div className={`mt-8 flex items-center gap-3 ${motionClass}`}>
                    <span className="text-xs font-semibold uppercase tracking-[0.2em] text-white/45">
                      Available on
                    </span>
                    {providersCache[movie.id].map((provider) => (
                      <img
                        key={provider.provider_id}
                        src={tmdbImageUrl(provider.logo_path, "w92")}
                        alt={provider.provider_name}
                        title={provider.provider_name}
                        className="h-9 w-9 rounded-lg border border-white/15 bg-black/40 object-cover"
                        loading="lazy"
                        decoding="async"
                      />
                    ))}
                  </div>
                )}
                </div>

              </div>
            </div>
          </div>
        );
      })}

      {activeTrailer && (
        <div
          className="fixed inset-0 z-[70] flex items-center justify-center bg-black/90 p-4 backdrop-blur-sm"
          onClick={() => setActiveTrailer(null)}
        >
          <div className="relative w-full max-w-5xl" onClick={(event) => event.stopPropagation()}>
            <button
              onClick={() => setActiveTrailer(null)}
              aria-label="Close video"
              className="absolute -top-12 right-0 grid h-10 w-10 place-items-center rounded-full border border-white/20 bg-white/10 text-white transition hover:bg-white/20"
            >
              <FaTimes />
            </button>
            <div className="aspect-video overflow-hidden rounded-xl bg-black shadow-2xl">
              <iframe
                src={`https://www.youtube.com/embed/${activeTrailer}?autoplay=1`}
                title="Trailer"
                className="h-full w-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
              />
            </div>
          </div>
        </div>
      )}

      {toast && (
        <div className="fixed bottom-8 left-1/2 z-[80] -translate-x-1/2 rounded-full border border-white/15 bg-white/10 px-5 py-2.5 text-sm text-white shadow-xl backdrop-blur-md">
          {toast}
        </div>
      )}
    </div>
  );
};

export default MovieSlider;
