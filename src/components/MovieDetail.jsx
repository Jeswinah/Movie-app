import React from "react";
import { useParams } from "react-router-dom";

const MovieDetails = () => {
  const { id } = useParams();

  return (
    <div className="w-screen h-screen bg-black">
      <iframe
        src={`https://www.2embed.cc/embed/${id}`}
        title="Movie Player"
        className="w-full h-full"
        allowFullScreen
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        referrerPolicy="no-referrer-when-downgrade"
        style={{ border: 'none' }}
      />
    </div> 
  );
};

export default MovieDetails;
