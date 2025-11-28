import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { FaStar, FaPlay, FaCircle } from "react-icons/fa";
import axios from "axios";

const Card = ({ id, title, img, vote }) => {
  const result = vote ? Math.floor(vote * 10) / 10 : "-";
  const [streamAvailable, setStreamAvailable] = useState(null);

  useEffect(() => {
    // Check stream availability in background
    axios.get(`https://movie-backend-kr04.onrender.com/api/check-stream/${id}`, { timeout: 3000 })
      .then(res => setStreamAvailable(res.data.available))
      .catch(() => setStreamAvailable(true)); // Assume available if check fails
  }, [id]);

  return (
    <Link to={`/movie/${id}`} className="group">
      <div className="relative rounded-lg overflow-hidden shadow-lg hover:scale-105 transition-transform duration-200 cursor-pointer">
        <img src={img} alt={title} className="w-full h-auto aspect-[2/3] object-cover" />

        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>

        {streamAvailable !== null && (
          <div className={`absolute top-2 right-2 flex items-center gap-1 p-1 rounded-full text-xs font-bold ${
            streamAvailable ? 'bg-green-500' : 'bg-red-500'
          }`}>
            <FaCircle className="text-white text-[6px]" />
          </div>
        )}

        <div className="absolute left-0 bottom-0 right-0 flex items-end justify-between bg-black/40 py-1 px-2">
          <div className="text-white">
            <h3 className="text-sm font-semibold line-clamp-2">{title}</h3>
          </div>
          <div className=" text-white px-2 py-1 rounded flex items-center text-sm">
            <FaStar className="text-yellow-400 mr-1" /> {result}
          </div>
        </div>
      </div>
    </Link>
  );
};

export default Card;