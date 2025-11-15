import Card from "../components/Card";
import React, { useState, useEffect } from "react";
import axios from "axios";
import MovieSlider from "../components/MovieSlider";
import Loading from "./Loading";
const Home = () => {
  const [movies, setMovies] = useState([]);
  const [tamilMovies, setTamilMovies] = useState([]);
  const [loading, setLoading] = useState(true);

  async function apihandler() {
    try {
      const [popularResponse, tamilResponse] = await Promise.all([
        axios.get("https://movie-backend-kr04.onrender.com/api/movies"),
        axios.get("https://movie-backend-kr04.onrender.com/api/movies/tamil")
      ]);
      setMovies(popularResponse.data.results || []);
      setTamilMovies(tamilResponse.data.results || []);
    } catch (error) {
      console.error("Error fetching movies:", error);
      setMovies([]);
      setTamilMovies([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    apihandler();
  }, []);

  const placeholderData = Array.from({ length: 10 }, (_, i) => ({
    id: `placeholder-${i}`,
    title: "Loading...",
    backdrop_path: null,
    vote_average: "-",
  }));

  const displayData = loading ? placeholderData : (movies || []);

  return (
    loading?<Loading/>:(
    <div className="grid place-content-center">
      <MovieSlider movies={movies} />
      <h1 className="text-4xl text-center py-5 font-mono text-white bg-netflix-dark">Popular Movies</h1>
      <div className="cards grid grid-cols-1 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5 mx-4 sm:gap-8 sm:mx-8">
        {displayData
          .filter(({ backdrop_path, vote_average }) => backdrop_path && vote_average >= 1)
          .map(({ id, title, backdrop_path, vote_average }) => {
          const imgUrl = backdrop_path
            ? `https://image.tmdb.org/t/p/w500/${backdrop_path}`
            : "https://placehold.co/300x168?text=Loading...";
          return (
            <Card key={id} id={id} title={title} img={imgUrl} vote={vote_average} />
          );
        })}
      </div>

      <h1 className="text-4xl text-center py-5 font-mono text-white bg-netflix-dark mt-10">Tamil Movies</h1>
      <div className="cards grid grid-cols-1 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5 mx-4 sm:gap-8 sm:mx-8 mb-10">
        {tamilMovies
          .filter(({ backdrop_path, vote_average }) => backdrop_path && vote_average >= 1)
          .slice(0, 45)
          .map(({ id, title, backdrop_path, vote_average }) => {
          const imgUrl = backdrop_path
            ? `https://image.tmdb.org/t/p/w500/${backdrop_path}`
            : "https://placehold.co/300x168?text=Loading...";
          return (
            <Card key={id} id={id} title={title} img={imgUrl} vote={vote_average} />
          );
        })}
      </div>
    </div>)
  );
};

export default Home;