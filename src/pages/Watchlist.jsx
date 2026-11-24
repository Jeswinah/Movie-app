import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FaTrash } from "react-icons/fa";
import Card from "../components/Card";
import Loading from "./Loading";
import authApi from "../config/authApi";
import { tmdbImageUrl } from "../config/tmdbImage";

const Watchlist = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");

  const fetchWatchlist = async () => {
    try {
      const response = await authApi.get("/watchlist");
      setItems(response.data.items || []);
    } catch (error) {
      console.error("Error fetching watchlist:", error);
      setItems([]);
      setErrorMsg("Could not load your watchlist.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWatchlist();
  }, []);

  const removeItem = async (item) => {
    try {
      await authApi.delete(`/watchlist/${item.tmdbId}`, {
        params: { mediaType: item.mediaType }
      });
      setItems((prev) => prev.filter((entry) => entry._id !== item._id));
    } catch (error) {
      console.error("Error removing from watchlist:", error);
      setErrorMsg("Could not remove this title. Please try again.");
      setTimeout(() => setErrorMsg(""), 3000);
    }
  };

  if (loading) {
    return <Loading />;
  }

  return (
    <div className="min-h-screen w-full bg-netflix pb-10">
      <h1 className="section-title text-5xl text-center py-5 text-slate-900 dark:text-white bg-netflix mt-10">
        My Watchlist
      </h1>

      {errorMsg && (
        <div className="flex justify-center mb-4">
          <div className="bg-red-600/95 rounded-lg shadow-xl px-6 py-3 border border-red-400/60">
            <p className="text-white font-semibold text-sm">{errorMsg}</p>
          </div>
        </div>
      )}

      {items.length === 0 ? (
        <div className="text-center text-slate-600 dark:text-white/70 py-16">
          <p className="text-xl font-semibold mb-3">Your watchlist is empty</p>
          <p className="mb-6">Browse movies and series, then add them here.</p>
          <Link
            to="/"
            className="inline-block bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-6 rounded-lg transition-all"
          >
            Browse Movies
          </Link>
        </div>
      ) : (
        <div className="cards grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-7 gap-5 mx-4 sm:gap-4 sm:mx-8 mb-10">
          {items.map((item) => (
            <div key={item._id} className="relative">
              <Card
                id={item.tmdbId}
                title={item.title}
                img={tmdbImageUrl(item.posterPath, "w342")}
                vote={item.voteAverage}
                mediaType={item.mediaType}
              />
              <button
                onClick={() => removeItem(item)}
                title="Remove from watchlist"
                className="absolute top-2 left-2 z-20 bg-black/70 hover:bg-red-600 text-white p-2 rounded-md border border-white/20 transition-colors"
              >
                <FaTrash className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Watchlist;
