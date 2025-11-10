import React, { useEffect, useState } from "react";
import { useLocation, Link } from "react-router-dom";

const SearchPage = ({ setNavbarTransparent }) => {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const query = new URLSearchParams(useLocation().search).get("query") || "";

  useEffect(() => {
    // Set navbar to transparent when component mounts
    if (setNavbarTransparent) {
      setNavbarTransparent(true);
    }
  }, [setNavbarTransparent]);

  useEffect(() => {
    if (!query) return;

    const fetchMovies = async () => {
      setLoading(true);
      setError(null);
      try {
        const apiKey = import.meta.env.VITE_TMDB_API_KEY;
        let res;
        if (import.meta.env.DEV) {
          res = await fetch(`https://api.themoviedb.org/3/search/movie?api_key=${apiKey}&query=${encodeURIComponent(query)}`);
        } else {
          res = await fetch(`/api/tmdb/search/movie?query=${encodeURIComponent(query)}`);
        }
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
          <Link
            key={movie.id}
            to={`/movie/${movie.id}`}
            className="bg-netflix-dark rounded-lg overflow-hidden shadow-lg hover:scale-105 hover:shadow-2xl transition-all duration-300"
          >
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
            <div className="p-3">
              <h2 className="text-sm font-semibold text-white line-clamp-2">{movie.title}</h2>
              <p className="text-xs text-muted mt-1">{movie.release_date}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default SearchPage;
