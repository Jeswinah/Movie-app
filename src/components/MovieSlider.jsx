import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { FaStar } from "react-icons/fa";

const MovieSlider = ({ movies }) => {
  const [current, setCurrent] = useState(0);
  const rootRef = useRef(null);

  // Auto-slide every 5s
  useEffect(() => {
    if (!movies || movies.length === 0) return;
    const interval = setInterval(() => {
      setCurrent((prev) => (prev + 1) % movies.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [movies]);


  useEffect(() => {
    setCurrent(0);
  }, [movies]);
  (movies);
  
  if (!movies || movies.length === 0) return null;

  return (
    <div ref={rootRef} className="relative w-full h-[calc(100vh)] overflow-hidden -mt-16">
      {/* Slides: render all and fade between them */}
      {movies.map((movie, idx) => {
        const isActive = idx === current;
        return (
          <div
            key={movie.id}
            className={`absolute inset-0 w-full h-full transition-all duration-1000 ease-in-out bg-black ${
              isActive ? "opacity-80 scale-100 z-20" : "opacity-0 scale-105 z-10"
            }`}
            aria-hidden={!isActive}
          >
            <img
              src={`https://image.tmdb.org/t/p/original${movie.backdrop_path}`}
              alt={movie.title}
              className="w-full h-full object-cover object-top "
            />

            <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-transparent to-black/80"></div>

            <div className="absolute inset-0 flex flex-col justify-end px-6 pb-20">
              <h2 className={`text-4xl md:text-6xl font-bold text-white mb-4 drop-shadow-lg transition-all duration-700 delay-300 ${
                isActive ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
              }`}>
                {movie.title}
              </h2>
              <p className={`text-white max-w-2xl mb-4 text-sm md:text-lg drop-shadow-md transition-all duration-700 delay-500 ${
                isActive ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
              }`}>
                {movie.overview}
              </p>

              <div className={`flex items-center gap-2 mb-3 transition-all duration-700 delay-600 ${
                isActive ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
              }`}>
                <FaStar className="text-yellow-400 text-xl" />
                <span className="text-white font-bold text-xl">{movie.vote_average?.toFixed(1)}/10</span>
              </div>

              <Link to={`/movie/${movie.id}?autoplay=true`} className={`transition-all duration-700 delay-700 ${
                isActive ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
              }`}>
                <button className="bg-red-600 text-white font-medium rounded-md w-44 h-12 shadow-lg hover:cursor-pointer hover:opacity-50 transition-all">
                  Watch Now
                </button>
              </Link>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default MovieSlider;
