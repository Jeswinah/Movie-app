import React, { useEffect, useState } from "react";
import { useParams, useLocation } from "react-router-dom";
import axios from "axios";
import { FaStar, FaPlay, FaCalendar, FaClock } from "react-icons/fa";

const MovieDetails = () => {
  const { id } = useParams();
  const location = useLocation();
  const [movie, setMovie] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    const fetchMovieDetails = async () => {
      try {
        const response = await axios.get(
          `https://api.themoviedb.org/3/movie/${id}?api_key=${import.meta.env.VITE_TMDB_API_KEY}`
        );
        setMovie(response.data);
        
        // Check if autoplay parameter is present
        const params = new URLSearchParams(location.search);
        if (params.get('autoplay') === 'true') {
          setIsPlaying(true);
        }
      } catch (error) {
        console.error("Error fetching movie details:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchMovieDetails();
  }, [id, location.search]);

  if (loading) {
    return (
      <div className="fixed inset-0 w-full h-screen bg-netflix-dark flex items-center justify-center">
        <div className="text-white text-2xl">Loading...</div>
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

  if (isPlaying) {
    return (
      <div className="fixed inset-0 w-full h-screen bg-black">
        <iframe
          src={`https://player.videasy.net/movie/${id}?autoplay=1`}
          frameBorder="0"
          allowFullScreen
          allow="autoplay; fullscreen"
          title="Movie Player"
          className="w-full h-full"
        />
      </div>
    );
  }

  return (
    <div className="fixed inset-0 w-full h-screen bg-netflix-dark overflow-y-auto">
      <div
        className="relative w-full h-screen bg-cover bg-center"
        style={{
          backgroundImage: `url(https://image.tmdb.org/t/p/original${movie.backdrop_path})`,
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-netflix-dark via-netflix-dark/80 to-transparent"></div>

        <div className="relative z-10 flex flex-col justify-end h-full px-8 md:px-20 pb-20">
          <div className="flex flex-col md:flex-row gap-8 bg-black/70 p-6 rounded-lg shadow-lg">
            <img
              src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
              alt={movie.title}
              className="w-64 rounded-lg shadow-2xl"
            />

            <div className="flex-1 text-white">
              <h1 className="text-5xl md:text-6xl font-bold mb-4">{movie.title}</h1>
              
              <div className="flex items-center gap-4 mb-4 text-lg">
                <div className="flex items-center gap-2">
                  <FaStar className="text-yellow-400" />
                  <span>{movie.vote_average.toFixed(1)}/10</span>
                </div>
                <div className="flex items-center gap-2">
                  <FaCalendar />
                  <span>{movie.release_date}</span>
                </div>
                <div className="flex items-center gap-2">
                  <FaClock />
                  <span>{movie.runtime} min</span>
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

              <p className="text-lg mb-6 max-w-3xl leading-relaxed">{movie.overview}</p>

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
