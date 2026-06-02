import Card from "../components/Card";
import React, { useState, useEffect } from "react";
import axios from "axios";
import MovieSlider from "../components/MovieSlider";
import Loading from "./Loading";
import API_BASE_URL from "../config/api";
import { tmdbImageUrl } from "../config/tmdbImage";

import Snowfall from 'react-snowfall';
const Home = ({loading,setLoading}) => {
  const [movies, setMovies] = useState([]);
  const [tamilMovies, setTamilMovies] = useState([]);
  const [trendingTamilMovies, setTrendingTamilMovies] = useState([]);
  const [CurrDate,setCurrDate]=useState(new Date().getMonth()+1);
  const [selectedGenre, setSelectedGenre] = useState("all");
  const [tamilPage, setTamilPage] = useState(0);

  const MOVIES_PER_PAGE = 21; // 3 rows × 7 columns

  const genres = [
    { label: "All", value: "all" },
    { label: "Comedy", value: "comedy" },
    { label: "Romance", value: "romance" },
    { label: "Thriller", value: "thriller" },
    { label: "Action", value: "action" },
    { label: "Drama", value: "drama" },
    { label: "Horror", value: "horror" },
    { label: "Mystery", value: "mystery" }
  ];

  async function apihandler() {
    const popularPromise = axios.get(`${API_BASE_URL}/api/movies`);
    const tamilPromise = axios.get(`${API_BASE_URL}/api/movies/tamil`);
    const trendingTamilPromise = axios.get(`${API_BASE_URL}/api/movies/tamil/trending`);

    try {
      const popularResponse = await popularPromise;
      setMovies(popularResponse.data.results || []);
    } catch (error) {
      console.error("Error fetching popular movies:", error);
      setMovies([]);
    } finally {
      // Show the page once the primary feed is ready.
      setLoading(false);
    }

    try {
      const tamilResponse = await tamilPromise;
      setTamilMovies(tamilResponse.data.results || []);
      console.log(tamilMovies)
      
    } catch (error) {
      console.error("Error fetching Tamil movies:", error);
      setTamilMovies([]);
    }

    try {
      const trendingResponse = await trendingTamilPromise;
      setTrendingTamilMovies(trendingResponse.data.results || []);
    } catch (error) {
      console.error("Error fetching trending Tamil movies:", error);
      setTrendingTamilMovies([]);
    }
  }

  async function fetchTamilMoviesByGenre(genre) {
    try {
      const url = genre === "all" 
        ? `${API_BASE_URL}/api/movies/tamil`
        : `${API_BASE_URL}/api/movies/tamil?genre=${genre}`;
      const response = await axios.get(url);
      setTamilMovies(response.data.results || []);
    } catch (error) {
      console.error("Error fetching Tamil movies by genre:", error);
      setTamilMovies([]);
    }
  }

  useEffect(() => {
    setLoading(true);
    apihandler();
  }, [setLoading]);

  useEffect(() => {
    fetchTamilMoviesByGenre(selectedGenre);
    setTamilPage(0); // Reset to first page when genre changes
  }, [selectedGenre]);

  // Helper function to deduplicate movies by ID
  const deduplicateMovies = (movieList) => {
    const seen = new Set();
    return movieList.filter(movie => {
      if (seen.has(movie.id)) {
        return false;
      }
      seen.add(movie.id);
      return true;
    });
  };

  const placeholderData = Array.from({ length: 50 }, (_, i) => ({
    id: `placeholder-${i}`,
    title: "Loading...",
    backdrop_path: null,
    vote_average: "-",
  }));

  const displayData = loading ? placeholderData : (movies || []);
  const uniqueMovies = deduplicateMovies(displayData);
  const uniqueTamilMovies = deduplicateMovies(tamilMovies);
  const uniqueTrendingTamilMovies = deduplicateMovies(trendingTamilMovies);
console.log(uniqueMovies.length,uniqueTamilMovies.length)
  return (
    loading?<Loading/>:(

    <div className="min-h-screen w-full pb-10">
      {CurrDate ==12 ?<Snowfall  color="white"/>:null}
      <MovieSlider movies={uniqueTrendingTamilMovies.filter(({ backdrop_path, vote_average }) => backdrop_path && vote_average >= 1)} mediaType="movie" />
      <h1 className="section-title text-5xl text-center py-5 text-white section-frame ">Trending Movies</h1>
      <div className="flex justify-center gap-2 flex-wrap m-5 px-4">
        {genres.map((genre) => (
          <button
            key={genre.value}
            onClick={() => setSelectedGenre(genre.value)}
            className={`px-4 py-2 rounded-lg font-semibold transition-all ${
              selectedGenre === genre.value
                ? "bg-red-600 text-white"
                : "bg-gray-700 text-gray-300 hover:bg-gray-600"
            }`}
          >
            {genre.label}
          </button>
        ))}
      </div>
      <div className="cards grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-7 gap-5 mx-4 sm:gap-4 sm:mx-8 mb-10">
        {uniqueTamilMovies
          .filter(({ poster_path, vote_average }) => poster_path && vote_average >= 1)
          .slice(0, (tamilPage + 1) * MOVIES_PER_PAGE)
          .map(({ id, title, poster_path, vote_average }) => {
          const imgUrl = poster_path
            ? tmdbImageUrl(poster_path, "w342")
            : "https://placehold.co/300x168?text=Loading...";
          return (
            
            <Card key={`tamil-${id}`} id={id} title={title} img={imgUrl} vote={vote_average} />
          );
        })}
      </div>
      {uniqueTamilMovies.filter(({ poster_path, vote_average }) => poster_path && vote_average >= 1).length > (tamilPage + 1) * MOVIES_PER_PAGE && (
        <div className="flex justify-center mt-6 mb-10">
          <button
            onClick={() => setTamilPage(tamilPage + 1)}
            className="flex items-center gap-2 px-6 py-3 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition-all"
          >
            Load More
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
      )}
      <h1 className="section-title text-5xl text-center py-5 text-white section-frame">Popular Movies</h1>
      <div className="cards grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-7 gap-5 mx-4 sm:gap-4 sm:mx-8">
        {uniqueMovies
          .filter(({ poster_path, vote_average,original_language }) => poster_path && vote_average >= 1 && original_language==="en")
          .map(({ id, title, poster_path, vote_average }) => {
          const imgUrl = poster_path
            ? tmdbImageUrl(poster_path, "w342")
            : "https://placehold.co/300x168?text=Loading...";
          return (
            <Card key={`popular-${id}`} id={id} title={title} img={imgUrl} vote={vote_average} />
          );
        })}
      </div>
    </div>)
  );
};

export default Home;