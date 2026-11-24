import React, { useCallback, useEffect, useRef, useState } from "react";
import { useParams, useLocation } from "react-router-dom";
import axios from "axios";
import {
  FaStar,
  FaPlay,
  FaPlus,
  FaCheck,
  FaThumbsUp,
  FaEllipsisH,
  FaTimes,
  FaMapMarkerAlt,
  FaExternalLinkAlt
} from "react-icons/fa";
import API_BASE_URL from "../config/api";
import authApi from "../config/authApi";
import { tmdbImageUrl } from "../config/tmdbImage";
import useImdbRating from "../hooks/useImdbRating";

const formatRuntime = (minutes) => {
  if (!minutes) return null;
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return hours ? `${hours}h ${mins}m` : `${mins}m`;
};

const AboutItem = ({ label, value }) => (
  <div>
    <p className="text-xs font-semibold uppercase tracking-wider text-white/40">{label}</p>
    <p className="mt-1 text-sm leading-relaxed text-white/90">{value || "—"}</p>
  </div>
);

const MovieDetails = () => {
  const { id } = useParams();
  const location = useLocation();
  const isSeries = location.pathname.startsWith("/series/");
  const imdbRating = useImdbRating(id, isSeries ? "tv" : "movie");
  const [movie, setMovie] = useState(null);
  const [cast, setCast] = useState([]);
  const [director, setDirector] = useState(null);
  const [writers, setWriters] = useState([]);
  const [producers, setProducers] = useState([]);
  const [music, setMusic] = useState([]);
  const [cinematography, setCinematography] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [season, setSeason] = useState(1);
  const [episode, setEpisode] = useState(1);
  const [availableSeasons, setAvailableSeasons] = useState([]);
  const [providers, setProviders] = useState([]);
  const [trailer, setTrailer] = useState(null);
  const [extras, setExtras] = useState([]);
  const [activeVideo, setActiveVideo] = useState(null);
  const [toast, setToast] = useState("");
  const [liked, setLiked] = useState(false);
  const toastTimer = useRef(null);

  const isInTheaters = movie && !isSeries && movie.release_date && (
    new Date(movie.release_date) > new Date(Date.now() - 5 * 24 * 60 * 60 * 1000)
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

  const showToast = (message) => {
    setToast(message);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(""), 2600);
  };

  useEffect(() => () => clearTimeout(toastTimer.current), []);

  const updateStreamUrl = useCallback(async (streamEndpoint, selectedSeason = 1, selectedEpisode = 1) => {
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
  }, [isSeries]);

  const streamServers = [
    { name: "VidSrc.to", url: fallbackUrl },
    { name: "CineSrc", url: streamUrl }
  ];
  const activeServer = streamServers[serverIndex] || streamServers[0];

  const handleIframeError = () => {
    setServerIndex((index) => Math.min(index + 1, streamServers.length - 1));
    setIframeKey((k) => k + 1);
  };

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const shouldAutoplay = params.get('autoplay') === 'true';

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

        try {
          const creditsResponse = await axios.get(
            `${API_BASE_URL}${creditsEndpoint}`,
            { timeout: 15000 }
          );
          setCast(creditsResponse.data.cast || []);
          setDirector(creditsResponse.data.director || null);
          setWriters(creditsResponse.data.writers || []);
          setProducers(creditsResponse.data.producers || []);
          setMusic(creditsResponse.data.music || []);
          setCinematography(creditsResponse.data.cinematography || []);
        } catch (err) {
          console.error("Error fetching cast:", err);
          setCast([]);
        }

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
  }, [id, location.search, isSeries, updateStreamUrl]);

  useEffect(() => {
    let isMounted = true;

    const fetchTrailer = async () => {
      try {
        const response = await axios.get(
          `${API_BASE_URL}/api/${isSeries ? "series" : "movie"}/${id}/videos`
        );
        if (isMounted) {
          setTrailer(response.data?.trailer || null);
          setExtras(response.data?.extras || []);
        }
      } catch (error) {
        console.error("Error fetching trailer:", error);
        if (isMounted) {
          setTrailer(null);
          setExtras([]);
        }
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
        setInWatchlist(true);
        showToast("Added to My List");
      }
    } catch (error) {
      console.error("Error updating watchlist:", error);
      showToast("Could not update My List");
    } finally {
      setWatchlistBusy(false);
    }
  };

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      showToast("Link copied to clipboard");
    } catch (error) {
      console.error("Could not copy link:", error);
      showToast("Could not copy link");
    }
  };

  const openTrailer = () => {
    if (!trailer) {
      showToast("Trailer is not available for this title");
      return;
    }
    setActiveVideo({ key: trailer.key, name: trailer.name || "Official Trailer", type: "Trailer" });
  };

  if (loading) {
    return (
      <div className="flex min-h-screen w-full items-center justify-center bg-[#08090c] text-lg text-white/70">
        Loading...
      </div>
    );
  }

  if (isPlaying) {
    const cycleServer = () => {
      setServerIndex((index) => (index + 1) % streamServers.length);
      setIframeKey((k) => k + 1);
    };

    return (
      <div className="fixed inset-0 z-[100] w-full bg-black">
        <iframe
          key={iframeKey}
          src={activeServer.url}
          frameBorder="0"
          allowFullScreen
          allow="autoplay;"
          title="Movie Player"
          className="h-full w-full"
          onError={handleIframeError}
        />
        <button
          onClick={() => setIsPlaying(false)}
          className="fixed left-5 top-5 z-50 flex items-center gap-2 rounded-full border border-white/20 bg-black/60 px-4 py-2 text-sm font-semibold text-white backdrop-blur-md transition hover:bg-black/80"
        >
          <FaTimes /> Back
        </button>
        <button
          onClick={cycleServer}
          className="fixed left-1/2 top-5 z-50 -translate-x-1/2 rounded-full bg-white/20 px-3 py-1.5 text-xs text-white backdrop-blur-sm transition hover:bg-white/30"
          title="Switch streaming server"
        >
          {activeServer.name}
        </button>
      </div>
    );
  }

  if (!movie) {
    return (
      <div className="flex min-h-screen w-full items-center justify-center bg-[#08090c] text-lg text-white/70">
        Movie not found
      </div>
    );
  }

  const title = movie.title || movie.name;
  const releaseYear = (movie.release_date || movie.first_air_date || "").slice(0, 4);
  const runtime = movie.runtime || movie.episode_run_time?.[0];
  const endTime = runtime
    ? new Date(Date.now() + runtime * 60000).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })
    : null;
  const displayRating = imdbRating ?? Number(movie.vote_average || 0);
  const likedPercent = Math.round(Number(movie.vote_average || 0) * 10);
  const genreNames = (movie.genres || []).map((genre) => genre.name);
  const releaseDate = movie.release_date || movie.first_air_date || "";
  const releaseLabel = releaseDate
    ? new Date(releaseDate).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })
    : null;
  const originalTitle = movie.original_title || movie.original_name || title;
  const originalLanguage = movie.spoken_languages?.[0]?.english_name || movie.original_language || null;
  const countries = (movie.production_countries || []).map((country) => country.name).join(", ");
  const studios = (movie.production_companies || []).map((company) => company.name).join(", ");
  const imdbUrl = movie.imdb_id
    ? `https://www.imdb.com/title/${movie.imdb_id}/`
    : `https://www.imdb.com/find/?q=${encodeURIComponent(title)}`;
  const tmdbUrl = `https://www.themoviedb.org/${isSeries ? "tv" : "movie"}/${id}`;
  const videos = [
    trailer ? { key: trailer.key, name: trailer.name || "Official Trailer", type: "Trailer" } : null,
    ...extras.map((video) => ({
      key: video.key,
      name: video.name || title,
      type: video.type || "Video"
    }))
  ].filter((video) => video?.key);

  const roundButtonClass =
    "grid h-12 w-12 shrink-0 place-items-center rounded-full border border-white/20 bg-white/10 text-base text-white backdrop-blur-md transition hover:border-white/50 hover:bg-white/20 disabled:opacity-50";

  return (
    <div className="min-h-screen overflow-x-hidden bg-[#08090c] text-white">
      <section className="relative min-h-[100svh] w-full overflow-hidden bg-[#08090c]">
        {movie.backdrop_path ? (
          <img
            src={tmdbImageUrl(movie.backdrop_path, "w1280")}
            alt=""
            className="absolute inset-0 h-full w-full object-cover"
            loading="eager"
            decoding="async"
          />
        ) : (
          <div className="absolute inset-0 bg-[#08090c]" />
        )}
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(6,7,9,0.96)_0%,rgba(6,7,9,0.78)_38%,rgba(6,7,9,0.12)_76%,rgba(6,7,9,0.4)_100%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(0deg,#08090c_0%,rgba(8,9,12,0)_48%)]" />

        <div className="relative z-10 mx-auto flex min-h-[100svh] max-w-[1500px] flex-col justify-center px-6 pb-10 pt-32 md:px-12 lg:px-20">
          <div className="w-full">
            <div className="max-w-2xl">
              <h1 className="display-title text-[clamp(3.5rem,7vw,6.5rem)] font-bold uppercase leading-[0.9] tracking-wide text-white drop-shadow-[0_6px_24px_rgba(0,0,0,0.7)]">
                {title}
              </h1>

              <div className="mt-6 flex flex-wrap items-center gap-x-3 gap-y-2 text-sm font-semibold text-white/75 md:text-base">
                {genreNames.length > 0 && <span>{genreNames.join(" · ")}</span>}
                {releaseYear && <span>{releaseYear}</span>}
                {runtime && <span>{formatRuntime(runtime)}</span>}
                {endTime && <span>Ends {endTime}</span>}
                <span className="flex items-center gap-1 text-amber-400">
                  <FaStar /> {Number(displayRating).toFixed(1)}
                </span>
                {likedPercent > 0 && (
                  <span className="flex items-center gap-1 text-emerald-400">
                    <FaThumbsUp /> {likedPercent}% liked
                  </span>
                )}
              </div>

              <p className="mt-5 line-clamp-4 max-w-xl text-[15px] leading-relaxed text-white/85 md:text-base">
                {movie.overview}
              </p>

              {isSeries && availableSeasons.length > 0 && (
                <div className="mt-6 flex flex-wrap gap-3">
                  <label className="text-xs font-semibold uppercase tracking-widest text-white/50">
                    Season
                    <select
                      value={season}
                      onChange={(e) => {
                        const selectedSeason = Number(e.target.value);
                        setSeason(selectedSeason);
                        setEpisode(1);
                        updateStreamUrl(`/api/series/stream/${id}`, selectedSeason, 1);
                      }}
                      className="ml-2 rounded-full border border-white/20 bg-[#11151b]/90 px-3 py-2 text-sm font-semibold normal-case tracking-normal text-white outline-none focus:border-white/60"
                    >
                      {availableSeasons.map((s) => (
                        <option key={s.id || s.season_number} value={s.season_number}>
                          {s.season_number}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="text-xs font-semibold uppercase tracking-widest text-white/50">
                    Episode
                    <select
                      value={episode}
                      onChange={(e) => {
                        const selectedEpisode = Number(e.target.value);
                        setEpisode(selectedEpisode);
                        updateStreamUrl(`/api/series/stream/${id}`, season, selectedEpisode);
                      }}
                      className="ml-2 rounded-full border border-white/20 bg-[#11151b]/90 px-3 py-2 text-sm font-semibold normal-case tracking-normal text-white outline-none focus:border-white/60"
                    >
                      {Array.from(
                        {
                          length:
                            availableSeasons.find((s) => s.season_number === season)?.episode_count || 1
                        },
                        (_, idx) => idx + 1
                      ).map((ep) => (
                        <option key={ep} value={ep}>
                          {ep}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>
              )}

              <div className="mt-8 flex flex-wrap items-center gap-3">
                {isInTheaters ? (
                  <button
                    disabled
                    className="flex h-12 cursor-not-allowed items-center gap-2 rounded-full bg-white/15 px-7 font-semibold text-white/70"
                  >
                    <FaMapMarkerAlt /> In Theatres
                  </button>
                ) : (
                  <button
                    onClick={() => setIsPlaying(true)}
                    className="flex h-12 items-center gap-2 rounded-full bg-white px-7 font-bold text-[#0b0c0e] shadow-lg transition hover:scale-[1.03] hover:bg-white/90"
                  >
                    <FaPlay /> Play
                  </button>
                )}
                <button
                  onClick={openTrailer}
                  className="flex h-12 items-center gap-2 rounded-full border border-white/20 bg-white/10 px-6 font-semibold text-white backdrop-blur-md transition hover:border-white/40 hover:bg-white/20"
                >
                  <FaPlay /> Trailer
                </button>
                <button
                  onClick={toggleWatchlist}
                  disabled={watchlistBusy}
                  title={inWatchlist ? "Remove from My List" : "Add to My List"}
                  aria-label={inWatchlist ? "Remove from My List" : "Add to My List"}
                  className={roundButtonClass}
                >
                  {inWatchlist ? <FaCheck /> : <FaPlus />}
                </button>
                <button
                  type="button"
                  onClick={() => setLiked((value) => !value)}
                  title={liked ? "Unlike this title" : "Like this title"}
                  aria-label={liked ? "Unlike this title" : "Like this title"}
                  aria-pressed={liked}
                  className={`grid h-12 w-12 shrink-0 place-items-center rounded-full border text-base backdrop-blur-md transition ${
                    liked
                      ? "border-emerald-400/60 bg-emerald-400/20 text-emerald-400 hover:border-emerald-300 hover:bg-emerald-400/30"
                      : "border-white/20 bg-white/10 text-white hover:border-white/50 hover:bg-white/20"
                  }`}
                >
                  <FaThumbsUp />
                </button>
                <button
                  onClick={copyLink}
                  title="Copy link"
                  aria-label="Copy link"
                  className={roundButtonClass}
                >
                  <FaEllipsisH />
                </button>
              </div>

              {providers.length > 0 && (
                <div className="mt-8 flex flex-wrap items-center gap-3">
                  <span className="text-xs font-semibold uppercase tracking-[0.2em] text-white/45">
                    Available on
                  </span>
                  {providers.slice(0, 6).map((provider) => (
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
      </section>

      {videos.length > 0 && (
        <section className="relative z-20 mx-auto max-w-[1500px] px-6 pb-16 md:px-12 lg:px-20">
          <h2 className="text-2xl font-bold tracking-tight md:text-3xl">Trailers &amp; Extras</h2>
          <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {videos.slice(0, 6).map((video) => (
              <button
                key={video.key}
                onClick={() => setActiveVideo(video)}
                className="group overflow-hidden rounded-xl border border-white/10 bg-white/5 text-left transition hover:border-white/30 hover:bg-white/10"
              >
                <div className="relative aspect-video overflow-hidden bg-black">
                  <img
                    src={`https://img.youtube.com/vi/${video.key}/hqdefault.jpg`}
                    alt=""
                    className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                    loading="lazy"
                    decoding="async"
                  />
                  <span className="absolute inset-0 grid place-items-center bg-black/25">
                    <span className="grid h-12 w-12 place-items-center rounded-full bg-white/90 text-[#0b0c0e] shadow-lg">
                      <FaPlay />
                    </span>
                  </span>
                </div>
                <div className="px-4 py-3">
                  <p className="truncate text-sm font-semibold text-white">{video.name}</p>
                  <p className="mt-0.5 text-xs text-white/50">{video.type}</p>
                </div>
              </button>
            ))}
          </div>
        </section>
      )}

      {cast.length > 0 && (
        <section className="relative z-20 border-t border-white/10 bg-[#0b0d11] px-6 py-14 md:px-12 lg:px-20">
          <div className="mx-auto max-w-[1500px]">
            <h2 className="text-2xl font-bold tracking-tight md:text-3xl">Cast</h2>
            <div className="mt-6 grid grid-cols-3 gap-6 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8">
              {cast.slice(0, 16).map((actor) => (
                <div key={actor.id} className="flex flex-col items-center text-center transition hover:scale-105">
                  {actor.profile_path ? (
                    <img
                      src={tmdbImageUrl(actor.profile_path, "w185")}
                      alt={actor.name}
                      className="h-24 w-24 rounded-full border-2 border-white/20 object-cover"
                      loading="lazy"
                      decoding="async"
                    />
                  ) : (
                    <div className="grid h-24 w-24 place-items-center rounded-full border-2 border-white/15 bg-white/5 text-xs text-white/40">
                      No image
                    </div>
                  )}
                  <p className="mt-2 w-full truncate text-sm font-semibold text-white">{actor.name}</p>
                  <p className="w-full truncate text-xs text-white/50">{actor.character}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="relative z-20 mx-auto max-w-[1500px] px-6 pb-16 md:px-12 lg:px-20">
        <h2 className="text-2xl font-bold tracking-tight md:text-3xl">About</h2>
        <div className="mt-6 rounded-2xl border border-white/10 bg-[#0c0e12] p-6 md:p-8">
          <p className="max-w-3xl text-sm leading-relaxed text-white/70 md:text-base">
            {movie.overview}
          </p>
          <div className="mt-8 grid gap-x-8 gap-y-7 md:grid-cols-2 lg:grid-cols-3">
            <div className="space-y-5">
              <AboutItem label="Directed by" value={director} />
              <AboutItem label="Written by" value={writers.join(", ")} />
              <AboutItem label="Produced by" value={producers.join(", ")} />
              <AboutItem label="Music by" value={music.join(", ")} />
              <AboutItem label="Cinematography" value={cinematography.join(", ")} />
            </div>
            <div className="space-y-5">
              <AboutItem label="Released" value={releaseLabel} />
              <AboutItem label="Genres" value={genreNames.join(", ")} />
              <AboutItem label="Original Title" value={originalTitle} />
              <AboutItem label="Countries" value={countries} />
            </div>
            <div className="space-y-5">
              <AboutItem label="Runtime" value={formatRuntime(runtime)} />
              <AboutItem label="Original Language" value={originalLanguage} />
              <AboutItem label="Studios" value={studios} />
            </div>
          </div>
          <div className="mt-8 flex flex-wrap gap-3">
            <a
              href={imdbUrl}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm font-semibold text-white transition hover:border-white/40 hover:bg-white/20"
            >
              IMDb <FaExternalLinkAlt className="text-xs" />
            </a>
            <a
              href={tmdbUrl}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm font-semibold text-white transition hover:border-white/40 hover:bg-white/20"
            >
              TMDB <FaExternalLinkAlt className="text-xs" />
            </a>
          </div>
        </div>
      </section>

      {activeVideo && (
        <div
          className="fixed inset-0 z-[70] flex items-center justify-center bg-black/90 p-4 backdrop-blur-sm"
          onClick={() => setActiveVideo(null)}
        >
          <div className="relative w-full max-w-5xl" onClick={(event) => event.stopPropagation()}>
            <button
              onClick={() => setActiveVideo(null)}
              aria-label="Close video"
              className="absolute -top-12 right-0 grid h-10 w-10 place-items-center rounded-full border border-white/20 bg-white/10 text-white transition hover:bg-white/20"
            >
              <FaTimes />
            </button>
            <div className="aspect-video overflow-hidden rounded-xl bg-black shadow-2xl">
              <iframe
                src={`https://www.youtube.com/embed/${activeVideo.key}?autoplay=1`}
                title={activeVideo.name}
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

export default MovieDetails;
