import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";

const MovieSlider = ({ movies }) => {
  const [current, setCurrent] = useState(0);

  // Auto-slide every 5s
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrent((prev) => (prev + 1) % movies.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [movies]);

  if (!movies || movies.length === 0) return null;

  const movie = movies[current]; // current movie

  return (
    <div className="relative w-full h-[calc(100vh-40px)] overflow-hidden">
      {/* Background Image */}
      <img
        src={`https://image.tmdb.org/t/p/original${movie.backdrop_path}`}
        alt={movie.title}
        className="w-full h-full object-cover"
      />

      {/* Gradient Overlay (left & right shading) */}
      <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-transparent to-black/80"></div>

      {/* Text + Button */}
      <div className="absolute inset-0 flex flex-col justify-end px-6 pb-20">
        <h2 className="text-4xl md:text-6xl font-bold text-white mb-4 drop-shadow-lg">
          {movie.title}
        </h2>
        <p className="text-white max-w-2xl mb-4 text-sm md:text-lg drop-shadow-md">
          {movie.overview}
        </p>

        <Link to={`/movie/${movie.id}`}>
          <button className="bg-blue-600 text-white font-medium rounded-md w-40 h-12 shadow-lg hover:bg-blue-700 transition-all">
            Watch Now
          </button>
        </Link>
      </div>
    </div>
  );
};

export default MovieSlider;
