import React, { useEffect, useState } from "react";
import { useLocation, Link } from "react-router-dom";
import API_BASE_URL from "../config/api";
import { tmdbImageUrl } from "../config/tmdbImage";
import Card from "./Card";

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
          <Card
            key={`${item.media_type || "movie"}-${item.id}`}
            id={item.id}
            title={item.title || item.name}
            img={item.poster_path ? tmdbImageUrl(item.poster_path, "w185") : "https://placehold.co/300x168?text=No+Image"}
            vote={item.vote_average}
            mediaType={item.media_type || "movie"}
          />
        ))}
      </div>
    </div>
  );
};

export default SearchPage;
