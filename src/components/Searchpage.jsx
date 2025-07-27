import React, { useEffect, useState } from "react";
import { useLocation, Link } from "react-router-dom";

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
      
        const res = await fetch(`https://api.themoviedb.org/3/search/movie?api_key=05054a63901c71f0817eb0028ead81f3&query=${encodeURIComponent(query)} `||`https://api.themoviedb.org/3/search/tv?api_key=05054a63901c71f0817eb0028ead81f3&query=${encodeURIComponent(query)}`);
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
    return <p className="text-center mt-8 text-gray-600">Please enter a search query.</p>;
  }

  return (
    <div className="my-10 mx-5">
      <h1 className="text-2xl font-semibold mb-6">
        Search Results for: <span className="text-blue-600">{query}</span>
      </h1>

      {loading && <p>Loading...</p>}
      {error && <p className="text-red-600">{error}</p>}

      {!loading && !error && movies.length === 0 && (
        <p>No results found for "{query}".</p>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
        {movies.map((movie) => (
          <Link
            key={movie.id}
            to={`/movie/${movie.id}`}
            className="bg-gray-800 rounded overflow-hidden shadow hover:shadow-lg transition-shadow duration-300"
          >
            {movie.poster_path ? (
              <img
                src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
                alt={movie.title}
                className="w-full h-64 object-cover"
              />
            ) : (
              <div className="w-full h-64 bg-gray-700 flex items-center justify-center text-gray-400">
                No Image
              </div>
            )}
            <div className="p-2">
              <h2 className="text-base font-semibold text-white line-clamp-2">{movie.title}</h2>
              <p className="text-sm text-gray-300">{movie.release_date}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default SearchPage;
