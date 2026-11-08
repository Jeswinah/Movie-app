import { useEffect, useState } from "react";
import API_BASE_URL from "../config/api";

const ratingCache = new Map();

const useImdbRating = (id, mediaType = "movie") => {
  const isValid = Boolean(id) && !String(id).includes("placeholder");
  const cacheKey = isValid ? `${mediaType}:${id}` : null;
  const [rating, setRating] = useState(() =>
    cacheKey && ratingCache.has(cacheKey) ? ratingCache.get(cacheKey) : null
  );

  useEffect(() => {
    if (!cacheKey) {
      setRating(null);
      return;
    }

    if (ratingCache.has(cacheKey)) {
      setRating(ratingCache.get(cacheKey));
      return;
    }

    setRating(null);
    let isMounted = true;

    const fetchRating = async () => {
      try {
        const response = await fetch(
          `${API_BASE_URL}/api/imdb-rating?tmdbId=${encodeURIComponent(id)}&mediaType=${mediaType}`
        );
        const data = await response.json();
        const value = typeof data.rating === "number" ? data.rating : null;
        ratingCache.set(cacheKey, value);
        if (isMounted) setRating(value);
      } catch {
        if (isMounted) setRating(null);
      }
    };

    fetchRating();

    return () => {
      isMounted = false;
    };
  }, [cacheKey, id, mediaType]);

  return rating;
};

export default useImdbRating;
