import React from "react";

const movieCategories = [
  { id: "popular", label: "Popular", icon: "🎬", type: "movie" },
  { id: "top-rated", label: "Top Rated", icon: "🎬", type: "movie" },
  { id: "now-playing", label: "In Theatres", icon: "🎬", type: "movie" },
  { id: "upcoming", label: "Coming Soon", icon: "🎬", type: "movie" },
  { id: "for-rent", label: "For Rent", icon: "🎬", type: "movie" },
  { id: "new-on-streaming", label: "New on Streaming", icon: "🎬", type: "movie" },
  { id: "new-on-netflix", label: "New on Netflix", icon: "🎬", type: "movie" },
  { id: "new-on-prime", label: "New on Prime", icon: "🎬", type: "movie" },
  { id: "free-to-watch", label: "Free to Watch", icon: "🎬", type: "movie" },
  { id: "calendar", label: "Calendar", icon: "🎬", type: "movie" },
];

const seriesCategories = [
  { id: "popular", label: "Popular", icon: "📺", type: "series" },
  { id: "top-rated", label: "Top Rated", icon: "📺", type: "series" },
  { id: "airing-today", label: "Airing Tonight", icon: "📺", type: "series" },
  { id: "on-the-air", label: "Currently Airing", icon: "📺", type: "series" },
  { id: "airing-tonight", label: "Airing Tonight", icon: "📺", type: "series" },
  { id: "new-series", label: "New Series", icon: "📺", type: "series" },
  { id: "returning-this-week", label: "Returning This Week", icon: "📺", type: "series" },
  { id: "currently-airing", label: "Currently Airing", icon: "📺", type: "series" },
  { id: "top-rated", label: "Top Rated", icon: "📺", type: "series" },
];

const CategoryFilter = ({ activeCategory, onCategoryChange, activeType, onTypeChange }) => {
  const categories = activeType === "movie" ? movieCategories : seriesCategories;

  return (
    <div className="category-filter">
      <div className="filter-type-tabs">
        <button
          onClick={() => onTypeChange("movie")}
          className={`px-4 py-2 rounded-lg font-semibold transition-all ${
            activeType === "movie"
              ? "bg-red-600 text-white"
              : "bg-slate-200 text-slate-700 hover:bg-slate-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
          }`}
        >
          🎬 Movies
        </button>
        <button
          onClick={() => onTypeChange("series")}
          className={`px-4 py-2 rounded-lg font-semibold transition-all ${
            activeType === "series"
              ? "bg-red-600 text-white"
              : "bg-slate-200 text-slate-700 hover:bg-slate-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
          }`}
        >
          📺 Series
        </button>
      </div>

      <div className="filter-categories-scroll">
        {categories.map((cat) => (
          <button
            key={`${cat.type}-${cat.id}`}
            onClick={() => onCategoryChange(cat.id)}
            className={`px-4 py-2 rounded-lg font-semibold transition-all whitespace-nowrap flex items-center gap-2 ${
              activeCategory === cat.id
                ? "bg-red-600 text-white"
                : "bg-slate-200 text-slate-700 hover:bg-slate-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
            }`}
          >
            <span>{cat.icon}</span>
            <span>{cat.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default CategoryFilter;