import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { FaStar } from "react-icons/fa";
import axios from "axios";
import { tmdbImageUrl } from "../config/tmdbImage";

const Card = ({ id, title, img, vote, mediaType = "movie" }) => {
  const result = vote ? Math.floor(vote * 10) / 10 : "-";
  const detailsPath = mediaType === "tv" ? `/series/${id}` : `/movie/${id}`;
  const [providers, setProviders] = useState([]);

  useEffect(() => {
    const fetchProviders = async () => {
      try {
        const apiKey = import.meta.env.VITE_TMDB_API_KEY;
        // Fetch service providers from the TMDB API
        const response = await axios.get(`https://api.themoviedb.org/3/${mediaType}/${id}/watch/providers?api_key=${apiKey}`);
        
        // Results are organized by country, IN (India) or US can be prioritized
        const results = response.data.results;
        const countryData = results?.IN || results?.US;
        
        if (countryData?.flatrate) {
          // Show top 3 providers to avoid cluttering the card
          setProviders(countryData.flatrate.slice(0, 3));
        }
      } catch (error) {
        console.error("Error fetching watch providers:", error);
      }
    };
    
    if (id && !String(id).includes("placeholder")) {
      fetchProviders();
    }
  }, [id, mediaType]);

  return (
    <Link to={detailsPath} className="group">
      <div className="relative rounded-xl overflow-hidden shadow-[0_10px_28px_rgba(0,0,0,0.45)] border border-white/10 group-hover:border-red-400/60 group-hover:scale-[1.03] group-hover:-translate-y-0.5 transition-all duration-300 cursor-pointer">
        <img src={img} alt={title} className="w-full h-auto aspect-[2/3] object-cover" loading="lazy" decoding="async" />

        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/10 to-transparent"></div>

        {/* Streaming Providers at Top Right */}
        {providers.length > 0 && (
          <div className="absolute top-2 right-2 flex flex-col gap-1 z-10">
            {providers.map((provider) => (
              <img
                key={provider.provider_id}
                src={tmdbImageUrl(provider.logo_path, "w45") || `https://image.tmdb.org/t/p/w45${provider.logo_path}`}
                alt={provider.provider_name}
                title={provider.provider_name}
                className="w-6 h-6 rounded-md shadow-md object-cover border border-white/20"
              />
            ))}
          </div>
        )}

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