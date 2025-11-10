import React, { useEffect } from "react";
import { useParams } from "react-router-dom";

const MovieDetails = ({ setNavbarTransparent }) => {
  const { id } = useParams();

  useEffect(() => {
    // Set navbar to transparent when component mounts
    if (setNavbarTransparent) {
      setNavbarTransparent(true);
    }
  }, [setNavbarTransparent]);

  return (
    <div className="fixed inset-0 w-full h-screen bg-black">
      <iframe
        src={`https://www.2embed.cc/embed/${id}`}
        frameBorder="0"
        allowFullScreen
        title="Movie Player"
        className="w-full h-full"
      />
    </div>
  );
};

export default MovieDetails;
