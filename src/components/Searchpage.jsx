import React, { useEffect, useState } from "react";
import { useLocation, Link } from "react-router-dom";
import { FaCircle } from "react-icons/fa";
import axios from "axios";

const SearchCard = ({ movie }) => {
  const [streamAvailable, setStreamAvailable] = useState(null);

  useEffect(() => {
    axios.get(`https://movie-backend-kr04.onrender.com/api/check-stream/${movie.id}`, { timeout: 3000 })
      .then(res => setStreamAvailable(res.data.available))
      .catch(() => setStreamAvailable(true));
  }, [movie.id]);

  return (
    <Link
      to={`/movie/${movie.id}`}
      className="bg-netflix-dark rounded-lg overflow-hidden shadow-lg hover:scale-105 hover:shadow-2xl transition-all duration-300"
    >
      <div className="relative">
        {movie.poster_path ? (
          <img
            src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
            alt={movie.title}
            className="w-full h-72 object-cover"
          />
        ) : (
          <div className="w-full h-72 bg-netflix-dark flex items-center justify-center text-muted">
            No Image
          </div>
        )}
        
        {/* Streaming availability indicator */}
        {streamAvailable !== null && (
          <div className={`absolute top-2 right-2 flex items-center gap-1 px-2 py-1 rounded-full text-xs font-bold ${
            streamAvailable ? 'bg-green-500' : 'bg-red-500'
          }`}>
            <FaCircle className="text-white text-[6px]" />
            <span className="text-white">{streamAvailable ? 'Available' : 'N/A'}</span>
          </div>
        )}
      </div>
      
      <div className="p-3">
        <h2 className="text-sm font-semibold text-white line-clamp-2">{movie.title}</h2>
        <p className="text-xs text-muted mt-1">{movie.release_date}</p>
      </div>
    </Link>
  );
};

const SearchPage = () => {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const query = new URLSearchParams(useLocation().search).get("query") || "";

  useEffect(() => {
    if (!query) return;

    const fetchMovies = async () => {
      setLoading(true);
      setError(null);
      try {
        const apiKey = import.meta.env.VITE_TMDB_API_KEY;
        const res = await fetch(`https://movie-backend-kr04.onrender.com/api/movie?query=${encodeURIComponent(query)}`);
        if (!res.ok) {
          throw new Error("Failed to fetch movies");
        }
        const data = await res.json();
        setMovies(data.results || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchMovies();
  }, [query]);

  if (!query) {
    return <p className="text-center mt-8 text-muted">Please enter a search query.</p>;
  }

  return (
    <div className="my-10 mx-5 min-h-screen">
      <h1 className="text-2xl font-semibold mb-6 text-white">
        Search Results for: <span className="netflix-accent">{query}</span>
      </h1>

      {loading && <p className="text-muted">Loading...</p>}
      {error && <p className="netflix-accent">{error}</p>}

      {!loading && !error && movies.length === 0 && (
        <p className="text-muted">No results found for "{query}".</p>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
        {movies.map((movie) => (
          <SearchCard key={movie.id} movie={movie} />
        ))}
      </div>
    </div>
  );
};

export default SearchPage;
