import Card from "../components/Card";
import React, { useState, useEffect, use } from "react";
import axios from "axios";
import MovieSlider from "../components/MovieSlider";
import Loading from "./Loading";
import API_BASE_URL from "../config/api";

import Snowfall from 'react-snowfall';
const Home = ({loading,setLoading}) => {
  const [movies, setMovies] = useState([]);
  const [tamilMovies, setTamilMovies] = useState([]);
  const [CurrDate,setCurrDate]=useState(new Date().getMonth()+1);

  async function apihandler() {
    try {
      const [popularResponse, tamilResponse] = await Promise.all([
        axios.get(`${API_BASE_URL}/api/movies`),
        axios.get(`${API_BASE_URL}/api/movies/tamil`)
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

    <div className="min-h-screen w-full">
      {CurrDate ==12 ?<Snowfall  color="white"/>:null}
      <MovieSlider movies={movies.filter(({ backdrop_path, vote_average }) => backdrop_path && vote_average >= 1)} />
      <h1 className="text-4xl text-center py-5 font-mono text-white bg-netflix-dark mt-10">Trending Movies</h1>
      <div className="cards grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-7 gap-5 mx-4 sm:gap-4 sm:mx-8 mb-10">
        {tamilMovies
          .filter(({ poster_path, vote_average }) => poster_path && vote_average >= 1)
          .slice(0, 42)
          .map(({ id, title, poster_path, vote_average }) => {
          const imgUrl = poster_path
            ? `https://image.tmdb.org/t/p/w500/${poster_path}`
            : "https://placehold.co/300x168?text=Loading...";
          return (
            <Card key={id} id={id} title={title} img={imgUrl} vote={vote_average} />
          );
        })}
      </div>
       <h1 className="text-4xl text-center py-5 font-mono text-white bg-netflix-dark">Popular Movies</h1>
      <div className="cards grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-7 gap-5 mx-4 sm:gap-4 sm:mx-8">
        {displayData
          .filter(({ poster_path, vote_average,original_language }) => poster_path && vote_average >= 1 && original_language==="en")
          .slice(0, 42)
          .map(({ id, title, poster_path, vote_average }) => {
          const imgUrl = poster_path
            ? `https://image.tmdb.org/t/p/w500/${poster_path}`
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