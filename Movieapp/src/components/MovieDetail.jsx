import React from "react";
import { useParams, Link } from "react-router-dom";

const MovieDetails = () => {
  const { id } = useParams();

  return (
    <div className="min-h-100 bg-black py-8 flex flex-col   justify-center items-center">
      
      <div className="w-full h-100  md:h-full  max-w-5xl aspect-video  overflow-hidden">
        <iframe
          src={`https://vidsrc.to/embed/movie/${id}`}
          frameBorder="0"
          allowFullScreen
          title="Movie Player"
          className="w-full h-full"
        />
      </div>
    </div>
  );
};

export default MovieDetails;
