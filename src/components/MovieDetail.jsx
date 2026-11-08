import React, { useEffect, useState } from "react";
import { useParams, useLocation } from "react-router-dom";
import axios from "axios";
import { FaStar, FaPlay, FaCalendar, FaClock, FaBookmark, FaRegBookmark, FaMapMarkerAlt } from "react-icons/fa";
import API_BASE_URL from "../config/api";
import authApi from "../config/authApi";
import { tmdbImageUrl } from "../config/tmdbImage";
import useImdbRating from "../hooks/useImdbRating";

const MovieDetails = () => {
  const { id } = useParams();
  const location = useLocation();
  const isSeries = location.pathname.startsWith("/series/");
  const imdbRating = useImdbRating(id, isSeries ? "tv" : "movie");
  const [movie, setMovie] = useState(null);
  const [cast, setCast] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [season, setSeason] = useState(1);
  const [episode, setEpisode] = useState(1);
  const [availableSeasons, setAvailableSeasons] = useState([]);
  const [providers, setProviders] = useState([]);

  // Check if movie is currently in theaters (released within last 5 days)
  const isInTheaters = movie && !isSeries && movie.release_date && (
    new Date(movie.release_date) > new Date(Date.now() - 5 * 24 * 60 * 60 * 1000) // within 5 days
  );
  const [streamUrl, setStreamUrl] = useState(
    isSeries
      ? `https://cinesrc.st/embed/tv/${id}?s=1&e=1`
      : `https://cinesrc.st/embed/movie/${id}`
  );
  const [fallbackUrl, setFallbackUrl] = useState(
    isSeries
      ? `https://vidsrc.to/embed/tv/${id}/1/1`
      : `https://vidsrc.to/embed/movie/${id}`
  );
  const [serverIndex, setServerIndex] = useState(0);
  const [iframeKey, setIframeKey] = useState(0);
  const [inWatchlist, setInWatchlist] = useState(false);
  const [watchlistBusy, setWatchlistBusy] = useState(false);
  const [trailerKey, setTrailerKey] = useState(null);

  const updateStreamUrl = async (streamEndpoint, selectedSeason = 1, selectedEpisode = 1) => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}${streamEndpoint}`,
        {
          timeout: 5000,
          params: isSeries ? { season: selectedSeason, episode: selectedEpisode } : undefined
        }
      );
      setStreamUrl(response.data.streamUrl);
      if (response.data.fallbackUrl) {
        setFallbackUrl(response.data.fallbackUrl);
      }
      setServerIndex(0);
      setIframeKey((k) => k + 1);
    } catch (err) {
      console.error("Stream URL fetch failed:", err);
    }
  };

  const streamServers = [
    { name: "CineSrc", url: streamUrl },
    { name: "VidSrc.to", url: fallbackUrl }
  ];
  const activeServer = streamServers[serverIndex] || streamServers[0];

  const handleIframeError = () => {
    setServerIndex((index) => Math.min(index + 1, streamServers.length - 1));
    setIframeKey((k) => k + 1);
  };

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const shouldAutoplay = params.get('autoplay') === 'true';
    
    // If autoplay, skip details and go straight to player
    if (shouldAutoplay) {
      setIsPlaying(true);
      setLoading(false);
      return;
    }

    const fetchMovieDetails = async () => {
      try {
        const detailsEndpoint = isSeries ? `/api/series/${id}` : `/api/movie/${id}`;
        const streamEndpoint = isSeries ? `/api/series/stream/${id}` : `/api/stream/${id}`;
        const creditsEndpoint = isSeries ? `/api/series/${id}/credits` : `/api/movie/${id}/credits`;

        const movieResponse = await axios.get(
          `${API_BASE_URL}${detailsEndpoint}`,
          { timeout: 15000 }
        );
        setMovie(movieResponse.data);

        // Fetch cast data
        try {
          const creditsResponse = await axios.get(
            `${API_BASE_URL}${creditsEndpoint}`,
            { timeout: 15000 }
          );
          setCast(creditsResponse.data.cast || []);
        } catch (err) {
          console.error("Error fetching cast:", err);
          setCast([]);
        }

        // Fetch watch providers
        try {
          const apiKey = import.meta.env.VITE_TMDB_API_KEY;
          const mediaType = isSeries ? 'tv' : 'movie';
          const providersResponse = await axios.get(`https://api.themoviedb.org/3/${mediaType}/${id}/watch/providers?api_key=${apiKey}`);
          const results = providersResponse.data.results;
          const countryData = results?.IN || results?.US;
          if (countryData?.flatrate) {
            setProviders(countryData.flatrate);
          }
        } catch (err) {
          console.error("Error fetching providers:", err);
          setProviders([]);
        }

        if (isSeries) {
          const seasonList = (movieResponse.data.seasons || []).filter((s) => s.season_number > 0);
          setAvailableSeasons(seasonList);
          if (seasonList.length) {
            const firstSeasonNumber = seasonList[0].season_number;
            setSeason(firstSeasonNumber);
            setEpisode(1);
            await updateStreamUrl(streamEndpoint, firstSeasonNumber, 1);
          } else {
            await updateStreamUrl(streamEndpoint, 1, 1);
          }
        } else {
          await updateStreamUrl(streamEndpoint);
        }
        setLoading(false);
      } catch (error) {
        console.error("Error fetching movie details:", error);
        setLoading(false);
        setMovie({
          id: id,
          title: isSeries ? "Series" : "Movie",
          name: isSeries ? "Series" : undefined,
          overview: "Information could not be loaded. You can still play this title.",
          vote_average: 0,
          release_date: "",
          first_air_date: "",
          runtime: 0,
          episode_run_time: [],
          genres: [],
          backdrop_path: null,
          poster_path: null
        });
      }
    };

    fetchMovieDetails();
  }, [id, location.search, isSeries]);

  useEffect(() => {
    let isMounted = true;

    const fetchTrailer = async () => {
      try {
        const response = await axios.get(
          `${API_BASE_URL}/api/${isSeries ? "series" : "movie"}/${id}/videos`
        );
        if (isMounted) {
          setTrailerKey(response.data?.trailer?.key || null);
        }
      } catch (error) {
        console.error("Error fetching trailer:", error);
        if (isMounted) setTrailerKey(null);
      }
    };

    fetchTrailer();

    return () => {
      isMounted = false;
    };
  }, [id, isSeries]);

  useEffect(() => {
    let isMounted = true;
    const mediaType = isSeries ? "tv" : "movie";

    const checkWatchlist = async () => {
      try {
        const response = await authApi.get("/watchlist");
        const items = response.data.items || [];
        if (isMounted) {
          setInWatchlist(
            items.some(
              (item) => String(item.tmdbId) === String(id) && item.mediaType === mediaType
            )
          );
        }
      } catch (error) {
        console.error("Error checking watchlist:", error);
      }
    };

    checkWatchlist();

    return () => {
      isMounted = false;
    };
  }, [id, isSeries]);

  const toggleWatchlist = async () => {
    if (!movie || watchlistBusy) return;

    const mediaType = isSeries ? "tv" : "movie";
    setWatchlistBusy(true);

    try {
      if (inWatchlist) {
        await authApi.delete(`/watchlist/${movie.id}`, { params: { mediaType } });
        setInWatchlist(false);
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
        setInWatchlist(true);
      }
    } catch (error) {
      console.error("Error updating watchlist:", error);
    } finally {
      setWatchlistBusy(false);
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 w-full h-screen bg-netflix-dark flex items-center justify-center">
        <div className="text-slate-900 dark:text-white text-2xl">Loading...</div>
      </div>
    );
  }

  if (isPlaying) {
    const cycleServer = () => {
      setServerIndex((index) => (index + 1) % streamServers.length);
      setIframeKey((k) => k + 1);
    };

    return (
      <div className="fixed inset-0 w-full h-screen bg-black">
        <iframe
          key={iframeKey}
          src={activeServer.url}
          frameBorder="0"
          allowFullScreen
          allow="autoplay;"
          title="Movie Player"
          className="w-full h-full"
          onError={handleIframeError}
        />
        <button
          onClick={cycleServer}
          className="fixed top-5 left-1/2 -translate-x-1/2 bg-white/20 hover:bg-white/30 text-white text-xs px-3 py-1.5 rounded-full backdrop-blur-sm transition-all z-50"
          title="Switch streaming server"
        >
          {activeServer.name}
        </button>
      </div>
    );
  }

  if (!movie) {
    return (
      <div className="fixed inset-0 w-full h-screen bg-netflix-dark flex items-center justify-center">
        <div className="text-slate-900 dark:text-white text-2xl">Movie not found</div>
      </div>
    );
  }

  return (
    <div className="w-screen min-h-screen bg-netflix-dark overflow-x-hidden">
      {/* Hero Section with Backdrop */}
      <div className="relative w-full h-screen bg-cover bg-center flex items-center"
        style={{
          backgroundImage: `url(${tmdbImageUrl(movie.backdrop_path, "w1280")})`,
          backgroundAttachment: 'fixed'
        }}
      >
        <div className="absolute inset-0 w-full h-full bg-black/15"></div>

        <div className="relative z-10 flex flex-col justify-end items-left w-full h-full px-8 md:px-10 mb-10">
          <div className="flex flex-col md:flex-row gap-8 bg-black/50 p-6 rounded-lg shadow-lg">
            <img
              src={tmdbImageUrl(movie.poster_path, "w342")}
              alt={movie.title || movie.name}
              className="w-64 rounded-lg shadow-2xl hidden md:block"
              loading="eager"
              decoding="async"
            />

            <div className="flex-1 text-white">
              <h1 className=" text-5xl md:text-6xl font-bold mb-4">{movie.title || movie.name}</h1>
              
              <div className="flex items-center gap-4 mb-4 text-lg">
                <div className="flex items-center gap-2">
                  {imdbRating !== null ? (
                    <>
                      <span className="rounded bg-[#f5c518] px-1.5 py-0.5 text-xs font-extrabold text-black">
                        IMDb
                      </span>
                      <span>{imdbRating.toFixed(1)}/10</span>
                    </>
                  ) : (
                    <>
                      <FaStar className="text-yellow-400" />
                      <span>{movie.vote_average.toFixed(1)}/10</span>
                    </>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <FaCalendar />
                  <span>{movie.release_date || movie.first_air_date}</span>
                </div>
                <div className="flex items-center gap-2">
                  <FaClock />
                  <span>{movie.runtime || movie.episode_run_time?.[0] || "-"} min</span>
                </div>
              </div>

              <div className="mb-4">
                {movie.genres.map((genre) => (
                  <span
                    key={genre.id}
                    className="inline-block bg-black rounded-full px-4 py-1 text-sm mr-2 mb-2"
                  >
                    {genre.name}
                  </span>
                ))}
              </div>

              {providers.length > 0 && (
                <div className="mb-6 flex flex-wrap gap-4 items-center">
                  <span className="text-gray-300 font-semibold text-lg">Stream on:</span>
                  {providers.map((provider) => (
                    <img
                      key={provider.provider_id}
                      src={tmdbImageUrl(provider.logo_path, "w45") || `https://image.tmdb.org/t/p/w45${provider.logo_path}`}
                      alt={provider.provider_name}
                      title={provider.provider_name}
                      className="w-10 h-10 rounded-lg shadow-md border border-white/20"
                    />
                  ))}
                </div>
              )}

              <p className="text-lg mb-6 max-w-3xl leading-relaxed max-h-52 overflow-y-hidden">{movie.overview}</p>

              {isSeries && availableSeasons.length > 0 && (
                <div className="flex flex-wrap gap-3 mb-6">
                  <div>
                    <label className="block text-sm mb-1">Season</label>
                    <select
                      value={season}
                      onChange={(e) => {
                        const selectedSeason = Number(e.target.value);
                        setSeason(selectedSeason);
                        setEpisode(1);
                        updateStreamUrl(`/api/series/stream/${id}`, selectedSeason, 1);
                      }}
                      className="bg-black/70 border border-white/30 rounded-lg px-3 py-2"
                    >
                      {availableSeasons.map((s) => (
                        <option key={s.id || s.season_number} value={s.season_number}>
                          Season {s.season_number}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm mb-1">Episode</label>
                    <select
                      value={episode}
                      onChange={(e) => {
                        const selectedEpisode = Number(e.target.value);
                        setEpisode(selectedEpisode);
                        updateStreamUrl(`/api/series/stream/${id}`, season, selectedEpisode);
                      }}
                      className="bg-black/70 border border-white/30 rounded-lg px-3 py-2"
                    >
                      {Array.from(
                        {
                          length:
                            availableSeasons.find((s) => s.season_number === season)?.episode_count || 1
                        },
                        (_, idx) => idx + 1
                      ).map((ep) => (
                        <option key={ep} value={ep}>
                          Episode {ep}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              )}

              <div className="flex flex-wrap items-center gap-2">
                {isInTheaters ? (
                  <button
                    disabled
                    className="bg-gray-600 text-white font-bold py-2.5 px-6 rounded-lg flex items-center gap-2 text-base transition-all shadow-lg cursor-not-allowed opacity-70"
                  >
                    <FaMapMarkerAlt className="text-sm" /> In Theatres
                  </button>
                ) : (
                  <button
                    onClick={() => setIsPlaying(true)}
                    className="bg-red-600 hover:bg-red-700 text-white font-bold py-2.5 px-6 rounded-lg flex items-center gap-2 text-base transition-all shadow-lg hover:scale-105"
                  >
                    <FaPlay className="text-sm" /> Play Now
                  </button>
                )}
                <button
                  onClick={toggleWatchlist}
                  disabled={watchlistBusy}
                  title={inWatchlist ? "Remove from watchlist" : "Add to watchlist"}
                  aria-label={inWatchlist ? "Remove from watchlist" : "Add to watchlist"}
                  className={`h-11 w-11 rounded-lg flex items-center justify-center text-lg transition-all shadow-lg border disabled:opacity-60 disabled:cursor-not-allowed ${
                    inWatchlist
                      ? "bg-white/15 hover:bg-white/25 text-white border-white/40"
                      : "bg-black/50 hover:bg-black/70 text-white border-white/25 hover:scale-105"
                  }`}
                >
                  {inWatchlist ? <FaBookmark /> : <FaRegBookmark />}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Trailer Section */}
      {trailerKey && (
        <div className="w-full py-12 px-8 md:px-20 bg-slate-100 dark:bg-[#0f141a]">
          <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-6">Trailer</h2>
          <div className="mx-auto max-w-4xl aspect-video overflow-hidden rounded-xl border border-slate-200 shadow-lg dark:border-white/10">
            <iframe
              src={`https://www.youtube.com/embed/${trailerKey}`}
              title={`${movie.title || movie.name} trailer`}
              className="h-full w-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
              loading="lazy"
            />
          </div>
        </div>
      )}

      {/* Cast Section - Scrollable */}
      {cast.length > 0 && (
        <div className="w-full py-12 px-8 md:px-20 bg-slate-100 dark:bg-[#0f141a]">
          <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-6">Cast</h2>
          <div className="grid grid-cols-3 gap-6 md:grid-cols-8">
            {cast.map((actor) => (
              <div key={actor.id} className="flex flex-col items-center hover:scale-110 transition-transform">
                {actor.profile_path ? (
                  <img
                    src={tmdbImageUrl(actor.profile_path, "w185")}
                    alt={actor.name}
                    className="w-24 h-24 rounded-full object-cover p-1 content-center border-2 border-red-600"
                    loading="lazy"
                    decoding="async"
                  />
                ) : (
                  <div className="w-24 h-24 rounded-full bg-gray-700 flex items-center justify-center border-2 border-gray-500">
                    <span className="text-gray-400 text-xs">No Img</span>
                  </div>
                )}
                <p className="text-slate-900 dark:text-white font-semibold text-sm mt-2 text-center w-20 truncate">{actor.name}</p>
                <p className="text-slate-500 dark:text-gray-400 text-xs text-center w-20 truncate">{actor.character}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default MovieDetails;
