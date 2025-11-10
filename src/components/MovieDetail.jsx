import React from "react";
import { useParams } from "react-router-dom";

const MovieDetails = () => {
  const { id } = useParams();

  return (
    <div className="min-h-screen bg-black py-8 flex flex-col justify-center items-center">
      <div className="w-full max-w-6xl px-4">
        <div className="w-full aspect-video rounded-lg overflow-hidden shadow-2xl">
          <iframe
            src={`https://vidsrc.to/embed/movie/${id}`}
            title="Movie Player"
            className="w-full h-full"
            allowFullScreen
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            referrerPolicy="no-referrer-when-downgrade"
            style={{ border: 'none' }}
          />
        </div>
      </div>
    </div>
  );
};

export default MovieDetails;
