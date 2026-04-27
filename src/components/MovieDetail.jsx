import React, { useEffect, useState } from "react";
import { useParams, useLocation } from "react-router-dom";
import axios from "axios";
import { FaStar, FaPlay, FaCalendar, FaClock } from "react-icons/fa";
import API_BASE_URL from "../config/api";

const MovieDetails = () => {
  const { id } = useParams();
  const location = useLocation();
  const isSeries = location.pathname.startsWith("/series/");
  const [movie, setMovie] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [season, setSeason] = useState(1);
  const [episode, setEpisode] = useState(1);
  const [availableSeasons, setAvailableSeasons] = useState([]);
  const [streamUrl, setStreamUrl] = useState(
    isSeries
      ? `https://player.videasy.net/tv/${id}/1/1?nextEpisode=true&autoplayNextEpisode=true&episodeSelector=true&overlay=true&color=8B5CF6`
      : `https://player.videasy.net/movie/${id}?autoplay=1`
  );

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
    } catch (err) {
      console.error("Stream URL fetch failed:", err);
    }
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

        const movieResponse = await axios.get(
          `${API_BASE_URL}${detailsEndpoint}`,
          { timeout: 15000 }
        );
        setMovie(movieResponse.data);

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

  if (loading) {
    return (
      <div className="fixed inset-0 w-full h-screen bg-netflix-dark flex items-center justify-center">
        <div className="text-white text-2xl">Loading...</div>
      </div>
    );
  }

  if (isPlaying) {
    return (
      <div className="fixed inset-0 w-full h-screen bg-black">
        <iframe
          src={streamUrl}
          frameBorder="0"
          allowFullScreen
          allow="autoplay; fullscreen"
          title="Movie Player"
          className="w-full h-full"
        />
      </div>
    );
  }

  if (!movie) {
    return (
      <div className="fixed inset-0 w-full h-screen bg-netflix-dark flex items-center justify-center">
        <div className="text-white text-2xl">Movie not found</div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 w-screen h-screen bg-netflix-dark overflow-y-auto">
      <div
        className="absolute inset-0 w-full h-full bg-cover bg-center"
        style={{
          backgroundImage: `url(https://image.tmdb.org/t/p/original${movie.backdrop_path})`,
        }}
      >
        <div className="absolute inset-0 w-full h-full bg-black/20"></div>

        <div className="relative z-10 flex flex-col justify-center w-full h-full px-8 md:px-20">
          <div className="flex flex-col md:flex-row gap-8 bg-black/70 p-6 rounded-lg shadow-lg">
            <img
              src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
              alt={movie.title || movie.name}
              className="w-64 rounded-lg shadow-2xl hidden md:block"
            />

            <div className="flex-1 text-white">
              <h1 className=" text-5xl md:text-6xl font-bold mb-4">{movie.title || movie.name}</h1>
              
              <div className="flex items-center gap-4 mb-4 text-lg">
                <div className="flex items-center gap-2">
                  <FaStar className="text-yellow-400" />
                  <span>{movie.vote_average.toFixed(1)}/10</span>
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
                      className="bg-black/70 border border-white/30 rounded px-3 py-2"
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
                      className="bg-black/70 border border-white/30 rounded px-3 py-2"
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

              <button
                onClick={() => setIsPlaying(true)}
                className="bg-red-600 hover:bg-red-700 text-white font-bold py-4 px-8 rounded-lg flex items-center gap-3 text-xl transition-all shadow-lg hover:scale-105"
              >
                <FaPlay /> Play Now
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MovieDetails;
