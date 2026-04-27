import React from "react";
import { Link } from "react-router-dom";
import { FaStar } from "react-icons/fa";

const Card = ({ id, title, img, vote, mediaType = "movie" }) => {
  const result = vote ? Math.floor(vote * 10) / 10 : "-";
  const detailsPath = mediaType === "tv" ? `/series/${id}` : `/movie/${id}`;

  return (
    <Link to={detailsPath} className="group">
      <div className="relative rounded-xl overflow-hidden shadow-[0_10px_28px_rgba(0,0,0,0.45)] border border-white/10 group-hover:border-red-400/60 group-hover:scale-[1.03] group-hover:-translate-y-0.5 transition-all duration-300 cursor-pointer">
        <img src={img} alt={title} className="w-full h-auto aspect-[2/3] object-cover" />

        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/10 to-transparent"></div>

        <div className="absolute left-0 bottom-0 right-0 flex items-end justify-between bg-black/45 py-2 px-2">
          <div className="text-white">
            <h3 className="text-sm font-semibold line-clamp-2">{title}</h3>
          </div>
          <div className="text-white px-2 py-1 rounded-md bg-black/35 flex items-center text-sm">
            <FaStar className="text-yellow-400 mr-1" /> {result}
          </div>
        </div>
      </div>
    </Link>
  );
};

export default Card;