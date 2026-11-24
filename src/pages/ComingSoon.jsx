import React, { useEffect, useState } from "react";
import axios from "axios";
import Card from "../components/Card";
import API_BASE_URL from "../config/api";
import { tmdbImageUrl } from "../config/tmdbImage";

const ComingSoon = () => {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const fetchComingSoon = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/api/movies/category/coming-soon`);
        if (isMounted) setMovies(response.data.results || []);
      } catch (error) {
        console.error("Error fetching coming soon movies:", error);
        if (isMounted) setMovies([]);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchComingSoon();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div className="min-h-screen bg-[#08090c] px-6 pb-20 pt-28 text-white md:px-12 lg:px-20">
      <div className="mx-auto max-w-[1500px]">
        <h1 className="display-title text-5xl tracking-wide md:text-6xl">Coming Soon</h1>
        <p className="mt-3 max-w-xl text-sm text-white/60">
          A first look at the movies heading to your screen.
        </p>

        {loading ? (
          <p className="mt-12 text-sm text-white/60">Loading...</p>
        ) : (
          <div className="mt-10 grid grid-cols-2 gap-5 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-7">
            {movies
              .filter((movie) => movie.poster_path)
              .map((movie) => (
                <Card
                  key={movie.id}
                  id={movie.id}
                  title={movie.title}
                  img={tmdbImageUrl(movie.poster_path, "w342")}
                  vote={movie.vote_average}
                />
              ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ComingSoon;
