import React, { useEffect, useState } from "react";
import axios from "axios";
import Card from "../components/Card";
import MovieSlider from "../components/MovieSlider";
import API_BASE_URL from "../config/api";
import Loading from "./Loading";
import { tmdbImageUrl } from "../config/tmdbImage";

const Series = () => {
  const [series, setSeries] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSeries = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/api/series`);
        setSeries(response.data.results || []);
      } catch (error) {
        console.error("Error fetching series:", error);
        setSeries([]);
      } finally {
        setLoading(false);
      }
    };

    fetchSeries();
  }, []);

  if (loading) {
    return <Loading />;
  }

  return (
    <div className="min-h-screen w-full pb-10">
      <MovieSlider
        movies={series.filter(({ backdrop_path, vote_average }) => backdrop_path && vote_average >= 1)}
        mediaType="tv"
      />
      <h1 className="section-title text-5xl text-center py-5 text-white section-frame mt-10">Popular Series</h1>
      <div className="cards grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-7 gap-5 mx-4 sm:gap-4 sm:mx-8 mb-10">
        {series
          .filter(({ poster_path, vote_average }) => poster_path && vote_average >= 1)
          .slice(0, 42)
          .map(({ id, name, poster_path, vote_average }) => {
            const imgUrl = tmdbImageUrl(poster_path, "w342");
            return <Card key={id} id={id} title={name} img={imgUrl} vote={vote_average} mediaType="tv" />;
          })}
      </div>
    </div>
  );
};

export default Series;
