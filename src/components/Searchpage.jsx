import React, { useEffect, useState } from "react";
import { useLocation, Link } from "react-router-dom";
import API_BASE_URL from "../config/api";
import { tmdbImageUrl } from "../config/tmdbImage";

const SearchPage = () => {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const query = new URLSearchParams(useLocation().search).get("query") || "";

  useEffect(() => {
    if (!query) return;

    const fetchResults = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`${API_BASE_URL}/api/movie?query=${encodeURIComponent(query)}`);
        if (!res.ok) {
          throw new Error("Failed to fetch results");
        }
        const data = await res.json();
        setResults(data.results || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
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

      {!loading && !error && results.length === 0 && (
        <p className="text-muted">No results found for "{query}".</p>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
        {results.map((item) => (
          <Link
            key={`${item.media_type || "movie"}-${item.id}`}
            to={item.media_type === "tv" ? `/series/${item.id}` : `/movie/${item.id}`}
            className="bg-netflix-dark rounded-lg overflow-hidden shadow-lg hover:scale-105 hover:shadow-2xl transition-all duration-300"
          >
            {item.poster_path ? (
              <img
                src={tmdbImageUrl(item.poster_path, "w185")}
                alt={item.title || item.name}
                className="w-full h-72 object-cover"
                loading="lazy"
                decoding="async"
              />
            ) : (
              <div className="w-full h-72 bg-netflix-dark flex items-center justify-center text-muted">
                No Image
              </div>
            )}
            <div className="p-3">
              <h2 className="text-sm font-semibold text-white line-clamp-2">{item.title || item.name}</h2>
              <p className="text-xs text-muted mt-1">{item.release_date || item.first_air_date}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default SearchPage;
