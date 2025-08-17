import Card from "../components/Card";
import React, { useState, useEffect } from "react";
import axios from "axios";
import MovieSlider from "../components/MovieSlider";
const Home = () => {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);

  async function apihandler() {
    try {
      const response = await axios.get("https://api.themoviedb.org/3/movie/popular?api_key=05054a63901c71f0817eb0028ead81f3");
      setMovies(response.data.results);
    } catch (error) {
      console.error("Error fetching movies:", error);
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

  const displayData = loading ? placeholderData : movies;

  console.log(displayData);

  return (
    <div className="grid place-content-center ">
      <MovieSlider  movies={movies} />
      <h1 className="text-4xl text-center py-5 font-mono bg-amber-50">Popular Movies</h1>
      <div className="cards grid grid-cols-1 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5 mx-4 sm:gap-8 sm:mx-8">
        {displayData.map(({ id, title, backdrop_path, vote_average }) => {
          const imgUrl = backdrop_path
            ? `https://image.tmdb.org/t/p/w500/${backdrop_path}`
            : "https://placehold.co/300x168?text=Loading...";
          return (
            <Card key={id} title={title} img={imgUrl} vote={vote_average} />
          );
        })}
      </div>
    </div>
  );
};

export default Home;