import React, { useState, useEffect, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { SiThemoviedatabase } from "react-icons/si";
import { FaSearch, FaStar, FaUser, FaBookmark } from "react-icons/fa";
import API_BASE_URL from "../config/api";
import { tmdbImageUrl } from "../config/tmdbImage";
import ThemeToggle from "./ThemeToggle";

const Navbar = () => {
  const [searchval, setSearchval] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [loadingSuggest, setLoadingSuggest] = useState(false);
  const [showMobileTabs, setShowMobileTabs] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();
  const wrapperRef = useRef(null);
  const debounceRef = useRef(null);
  const lastScrollY = useRef(0);

  const isSeriesPage = location.pathname.startsWith("/series");
  const isWatchlistPage = location.pathname.startsWith("/watchlist");
  const isProfilePage = location.pathname.startsWith("/profile");
  const isMoviesPage = location.pathname === "/";

  const navItems = [
    { label: "Home", to: "/", isActive: isMoviesPage },
    { label: "Series", to: "/series", isActive: isSeriesPage },
    { label: "Watchlist", to: "/watchlist", isActive: isWatchlistPage }
  ];

  const handleSearch = () => {
    if (searchval.trim() !== "") {
      navigate(`/search?query=${encodeURIComponent(searchval)}`);
      setSearchval("");
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      handleSearch();
    }
    if (e.key === "Escape") {
      setShowSuggestions(false);
    }
  };

  // fetch suggestions from TMDB (debounced)
  useEffect(() => {
    const q = searchval.trim();
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!q) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    debounceRef.current = setTimeout(async () => {
      try {
        setLoadingSuggest(true);
        const res = await fetch(
          `${API_BASE_URL}/api/movie?query=${encodeURIComponent(q)}`
        );
        const data = await res.json();
        const results = (data.results || []).filter((it) => it.poster_path || it.backdrop_path).slice(0, 6);
        setSuggestions(results);
        setShowSuggestions(results.length > 0);
      } catch {
        setSuggestions([]);
        setShowSuggestions(false);
      } finally {
        setLoadingSuggest(false);
      }
    }, 300);

    return () => clearTimeout(debounceRef.current);
  }, [searchval]);

  // click outside to close suggestions
  useEffect(() => {
    const onDoc = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  useEffect(() => {
    const onScroll = () => {
      const currentScrollY = window.scrollY;
      const isMobile = window.innerWidth < 768;
      if (!isMobile) {
        setShowMobileTabs(true);
        lastScrollY.current = currentScrollY;
        return;
      }

      if (currentScrollY <= 8) {
        setShowMobileTabs(true);
      } else {
        const delta = currentScrollY - lastScrollY.current;
        if (delta > 6) {
          setShowMobileTabs(false);
        } else if (delta < -6) {
          setShowMobileTabs(true);
        }
      }

      lastScrollY.current = currentScrollY;
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const inactiveActionClass =
    "grid h-10 w-10 place-items-center rounded-full border border-transparent text-slate-600 transition-colors hover:border-slate-200 hover:bg-white hover:text-red-600 dark:text-white/80 dark:hover:border-white/15 dark:hover:bg-white/10 dark:hover:text-white";

  return (
    <div className="fixed inset-x-0 top-0 z-50 glass-shell">
      <div className="mx-auto flex w-full max-w-[1520px] items-center gap-2 px-4 py-3 sm:gap-3 sm:px-6 lg:px-8">
        <Link to="/" className="flex shrink-0 items-center gap-2" title="MovieDB Home">
          <SiThemoviedatabase className="h-9 w-9 text-slate-900 drop-shadow-sm dark:text-white" />
          <span className="hidden display-title text-2xl leading-none tracking-wider text-slate-900 md:block dark:text-white">
            Movie<span className="text-red-600 dark:text-red-500">DB</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-1 rounded-full border border-slate-200/80 bg-white/60 p-1 text-sm font-semibold shadow-sm dark:border-white/10 dark:bg-white/5 md:flex">
          {navItems.filter((item) => item.to !== "/watchlist").map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className={`rounded-full px-3 py-1.5 transition-colors ${
                item.isActive
                  ? "bg-red-600 text-white shadow-sm"
                  : "text-slate-600 hover:bg-slate-200/60 hover:text-red-600 dark:text-white/80 dark:hover:bg-white/10 dark:hover:text-white"
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <Link
          to="/watchlist"
          className={`hidden items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold shadow-sm transition-colors md:inline-flex ${
            isWatchlistPage
              ? "border-red-600 bg-red-600 text-white"
              : "border-slate-300 bg-white/60 text-slate-700 hover:border-red-400 hover:text-red-600 dark:border-white/15 dark:bg-white/5 dark:text-white/80 dark:hover:border-red-400/50 dark:hover:text-white"
          }`}
        >
          <FaBookmark className="h-3.5 w-3.5" />
          Watchlist
        </Link>

        <div className="relative ml-auto min-w-0 w-full max-w-md" ref={wrapperRef}>
          <div className="relative">
            <input
              type="text"
              placeholder="Search movies or series"
              className="h-10 w-full rounded-full border border-slate-300 bg-white pl-4 pr-12 text-sm text-slate-900 shadow-sm outline-none transition placeholder:text-slate-500 focus:border-red-500 focus:ring-2 focus:ring-red-500/20 dark:border-white/10 dark:bg-white/5 dark:text-white dark:placeholder:text-white/40 dark:focus:border-red-500/60"
              onChange={(e) => setSearchval(e.target.value)}
              onKeyDown={handleKeyDown}
              value={searchval}
              onFocus={() => { if (suggestions.length) setShowSuggestions(true); }}
            />
            <button
              type="button"
              aria-label="Search"
              className="absolute right-1 top-1/2 grid h-8 w-8 -translate-y-1/2 place-items-center rounded-full bg-red-600 text-white shadow transition hover:bg-red-700 active:scale-95"
              onClick={handleSearch}
            >
              <FaSearch className="h-3.5 w-3.5" />
            </button>
          </div>

          {/* Suggestions dropdown */}
          {showSuggestions && (
            <div className="absolute inset-x-0 top-full z-50 mt-2 overflow-hidden rounded-xl suggestion-card shadow-xl">
              {loadingSuggest && <div className="p-3 text-sm text-muted">Loading...</div>}
              {!loadingSuggest && suggestions.map((s) => (
                <div
                  key={`${s.media_type || "movie"}-${s.id}`}
                  onClick={() => {
                    navigate(s.media_type === "tv" ? `/series/${s.id}` : `/movie/${s.id}`);
                    setSearchval("");
                    setShowSuggestions(false);
                  }}
                  className="flex cursor-pointer items-center gap-3 border-b border-slate-100 px-3 py-2 last:border-0 hover:bg-slate-100 dark:border-white/5 dark:hover:bg-white/5"
                >
                  <img
                    src={tmdbImageUrl(s.poster_path || s.backdrop_path, "w92")}
                    alt={s.title || s.name}
                    className="h-18 w-12 rounded-sm object-cover"
                    loading="lazy"
                    decoding="async"
                  />
                  <div className="min-w-0">
                    <div className="truncate text-sm font-semibold text-slate-900 dark:text-white">{s.title || s.name}</div>
                    <div className="text-xs text-muted">{s.release_date || s.first_air_date}</div>
                  </div>
                  <div className="ml-auto pr-1 text-sm text-slate-700 dark:text-white">
                    <FaStar className="mr-1 inline text-amber-500 dark:text-yellow-400" />
                    {s.vote_average?.toFixed(1)}
                  </div>
                </div>
              ))}
              {!loadingSuggest && suggestions.length === 0 && (
                <div className="p-3 text-sm text-muted">No suggestions</div>
              )}
            </div>
          )}
        </div>

        <div className="flex shrink-0 items-center gap-1.5">
          <ThemeToggle />

          <Link
            to="/profile"
            title="My Profile"
            aria-label="My Profile"
            className={`grid h-10 w-10 place-items-center rounded-full border transition-colors ${
              isProfilePage
                ? "border-red-200 bg-red-50 text-red-600 dark:border-red-500/40 dark:bg-red-500/15 dark:text-red-400"
                : inactiveActionClass
            }`}
          >
            <FaUser className="h-4 w-4" />
          </Link>
        </div>
      </div>

      <div
        className={`md:hidden absolute inset-x-0 top-full px-4 pt-2 transition-all duration-300 ${
          showMobileTabs ? "opacity-100 translate-y-0" : "pointer-events-none -translate-y-2 opacity-0"
        }`}
      >
        <div className="mx-auto flex w-fit items-center gap-1 rounded-full border border-slate-200/80 bg-white/95 p-1 text-sm font-semibold shadow-lg backdrop-blur-md dark:border-white/10 dark:bg-[#0f141a]/95">
          {navItems.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className={`rounded-full px-4 py-1.5 transition-colors ${
                item.isActive
                  ? "bg-red-600 text-white shadow-sm"
                  : "text-slate-600 hover:bg-slate-200/70 hover:text-red-600 dark:text-white/80 dark:hover:bg-white/10 dark:hover:text-white"
              }`}
            >
              {item.label === "Home" ? "Movies" : item.label}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Navbar;
