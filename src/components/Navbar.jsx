import React, { useState, useEffect, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { FaSearch, FaStar, FaBell, FaTimes, FaBars } from "react-icons/fa";
import API_BASE_URL from "../config/api";
import { tmdbImageUrl } from "../config/tmdbImage";
import ThemeToggle from "./ThemeToggle";

const Navbar = () => {
  const [searchval, setSearchval] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [loadingSuggest, setLoadingSuggest] = useState(false);
  const [showNavbar, setShowNavbar] = useState(true);
  const [searchOpen, setSearchOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const wrapperRef = useRef(null);
  const searchInputRef = useRef(null);
  const debounceRef = useRef(null);
  const lastScrollY = useRef(0);

  const isHomePage = location.pathname === "/";
  const isSeriesPage = location.pathname.startsWith("/series");
  const isWatchlistPage = location.pathname.startsWith("/watchlist");
  const isComingSoonPage = location.pathname.startsWith("/coming-soon");
  const isFlatNavbarPage = isWatchlistPage || isComingSoonPage;
  const navbarSurfaceClass = isComingSoonPage ? "bg-[#08090c]" : "bg-netflix";
  const isDarkSurface =
    isHomePage ||
    isSeriesPage ||
    isComingSoonPage ||
    location.pathname.startsWith("/movie/") ||
    location.pathname.startsWith("/series/");

  const navItems = [
    { label: "Movies", to: "/", isActive: isHomePage },
    { label: "TV Shows", to: "/series", isActive: isSeriesPage },
    { label: "Coming Soon", to: "/coming-soon", isActive: isComingSoonPage },
    { label: "My List", to: "/watchlist", isActive: isWatchlistPage }
  ];

  const userName = localStorage.getItem("userName") || "My Profile";
  const initial = userName.trim().charAt(0).toUpperCase();
  const actionClass =
    "grid h-10 w-10 place-items-center rounded-full border border-transparent text-slate-600 transition hover:bg-slate-900/5 hover:text-slate-900 dark:text-white/70 dark:hover:bg-white/10 dark:hover:text-white";

  const closeSearch = () => {
    setSearchOpen(false);
    setSearchval("");
    setSuggestions([]);
    setShowSuggestions(false);
  };

  const handleSearch = () => {
    if (searchval.trim() !== "") {
      navigate(`/search?query=${encodeURIComponent(searchval)}`);
      closeSearch();
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") handleSearch();
    if (e.key === "Escape") closeSearch();
  };

  useEffect(() => {
    if (searchOpen) searchInputRef.current?.focus();
  }, [searchOpen]);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

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

  useEffect(() => {
    const onDoc = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setShowSuggestions(false);
        setShowNotifications(false);
        setMobileMenuOpen(false);
      }
    };
    const onKeyDown = (e) => {
      if (e.key === "Escape") setMobileMenuOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, []);

  useEffect(() => {
    const onScroll = () => {
      const currentScrollY = window.scrollY;
      if (currentScrollY <= 8) {
        setShowNavbar(true);
      } else {
        const delta = currentScrollY - lastScrollY.current;
        if (delta > 6) {
          setShowNavbar(false);
        } else if (delta < -6) {
          setShowNavbar(true);
        }
      }

      lastScrollY.current = currentScrollY;
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div
      ref={wrapperRef}
      className={`!fixed !inset-x-0 !top-0 p-2 z-50 transition-transform duration-300 ${
        showNavbar ? "translate-y-0" : "-translate-y-full"
      } ${isDarkSurface ? "dark" : ""} ${isFlatNavbarPage ? navbarSurfaceClass : ""}`}
    >
      <div
        className={`pointer-events-none absolute inset-x-0 top-0 bg-gradient-to-b from-[#08090c] via-[#08090c]/80 to-transparent ${
          isFlatNavbarPage ? "hidden" : isDarkSurface ? "" : "hidden dark:block"
        }`}
      />
      <div className="relative z-10 mx-auto flex w-full max-w-[1600px] items-center gap-4 px-3 py-1 md:px-6">
        <Link to="/" className="flex shrink-0 items-center gap-2.5" title="MovieDB Home">
          <span className="grid h-9 w-9 place-items-center rounded-lg bg-slate-900 text-xl font-black text-white dark:bg-white dark:text-[#0b0c0e]">
            M
          </span>
          <span className="display-title text-2xl tracking-wider text-slate-900 dark:text-white">MovieDB</span>
        </Link>

        <nav className="hidden items-center gap-5 text-sm font-semibold lg:flex">
          {navItems.map((item) => (
            <Link
              key={item.label}
              to={item.to}
              className={`transition-colors ${
                item.isActive
                  ? "text-slate-900 dark:text-white"
                  : "text-slate-500 hover:text-slate-900 dark:text-white/55 dark:hover:text-white"
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="ml-auto flex shrink-0 items-center gap-1">
          <button
            type="button"
            aria-label={mobileMenuOpen ? "Close navigation menu" : "Open navigation menu"}
            aria-expanded={mobileMenuOpen}
            aria-controls="mobile-navigation"
            title={mobileMenuOpen ? "Close menu" : "Open menu"}
            onClick={() => setMobileMenuOpen((value) => !value)}
            className={`lg:hidden ${actionClass}`}
          >
            {mobileMenuOpen ? <FaTimes /> : <FaBars />}
          </button>
          <button
            type="button"
            aria-label="Search"
            title="Search"
            onClick={() => (searchOpen ? closeSearch() : setSearchOpen(true))}
            className={actionClass}
          >
            {searchOpen ? <FaTimes /> : <FaSearch />}
          </button>
          <button
            type="button"
            aria-label="Notifications"
            title="Notifications"
            onClick={() => setShowNotifications((value) => !value)}
            className={actionClass}
          >
            <FaBell />
          </button>
          <ThemeToggle
            className="!border-transparent !bg-transparent !text-slate-600 hover:!bg-slate-900/5 hover:!text-slate-900 dark:!text-white/70 dark:hover:!bg-white/10 dark:hover:!text-white"
            title=""
          />
          <Link
            to="/profile"
            title="My Profile"
            aria-label="My Profile"
            className="ml-1 flex items-center gap-2 rounded-full border border-slate-200 bg-white/70 py-1.5 pl-1.5 pr-4 text-sm font-semibold text-slate-900 transition hover:border-slate-300 hover:bg-white dark:border-white/15 dark:bg-white/5 dark:text-white dark:hover:border-white/35 dark:hover:bg-white/10"
          >
            <span className="grid h-8 w-8 place-items-center rounded-full bg-slate-900 text-xs font-black text-white dark:bg-white dark:text-[#0b0c0e]">
              {initial}
            </span>
            <span className="hidden max-w-24 truncate sm:block">{userName}</span>
          </Link>
        </div>
      </div>

      {mobileMenuOpen && (
        <nav
          id="mobile-navigation"
          aria-label="Mobile navigation"
          className="absolute inset-x-2 top-full z-30 rounded-2xl border border-slate-200 bg-white/95 p-2 shadow-xl backdrop-blur-md dark:border-white/10 dark:bg-[#11151b]/95 dark:shadow-2xl lg:hidden"
        >
          {navItems.map((item) => (
            <Link
              key={item.label}
              to={item.to}
              aria-current={item.isActive ? "page" : undefined}
              onClick={() => setMobileMenuOpen(false)}
              className={`block rounded-xl px-4 py-3 text-sm font-semibold transition-colors ${
                item.isActive
                  ? "bg-slate-900 text-white dark:bg-white dark:text-[#0b0c0e]"
                  : "text-slate-600 hover:bg-slate-900/5 hover:text-slate-900 dark:text-white/70 dark:hover:bg-white/10 dark:hover:text-white"
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>
      )}

      {searchOpen && (
        <div className="relative border-t border-slate-200 bg-white/95 px-5 py-3 dark:border-white/5 dark:bg-[#08090c]/95 md:px-10">
          <div className="mx-auto flex max-w-[1600px] items-center gap-3">
            <FaSearch className="text-slate-400 dark:text-white/40" />
            <input
              ref={searchInputRef}
              type="text"
              placeholder="Search movies or series"
              className="h-9 w-full bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400 dark:text-white dark:placeholder:text-white/35"
              onChange={(e) => setSearchval(e.target.value)}
              onKeyDown={handleKeyDown}
              value={searchval}
              onFocus={() => {
                if (suggestions.length) setShowSuggestions(true);
              }}
            />
            <button type="button" aria-label="Close search" onClick={closeSearch} className="text-slate-500 hover:text-slate-900 dark:text-white/50 dark:hover:text-white">
              <FaTimes />
            </button>
          </div>

          {showSuggestions && (
            <div className="absolute inset-x-5 top-full z-50 mt-1 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl dark:border-white/10 dark:bg-[#11151b] dark:shadow-2xl md:inset-x-10">
              {loadingSuggest && <div className="p-3 text-sm text-slate-500 dark:text-white/60">Loading...</div>}
              {!loadingSuggest && suggestions.map((s) => (
                <div
                  key={`${s.media_type || "movie"}-${s.id}`}
                  onClick={() => {
                    navigate(s.media_type === "tv" ? `/series/${s.id}` : `/movie/${s.id}`);
                    closeSearch();
                  }}
                  className="flex cursor-pointer items-center gap-3 border-b border-slate-100 px-3 py-2 last:border-0 hover:bg-slate-50 dark:border-white/5 dark:hover:bg-white/5"
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
                    <div className="text-xs text-slate-500 dark:text-white/50">{s.release_date || s.first_air_date}</div>
                  </div>
                  <div className="ml-auto pr-1 text-sm text-slate-700 dark:text-white">
                    <FaStar className="mr-1 inline text-amber-400" />
                    {s.vote_average?.toFixed(1)}
                  </div>
                </div>
              ))}
              {!loadingSuggest && suggestions.length === 0 && (
                <div className="p-3 text-sm text-slate-500 dark:text-white/60">No suggestions</div>
              )}
            </div>
          )}
        </div>
      )}

      {showNotifications && (
        <div className="absolute right-8 top-full z-50 mt-1 w-64 rounded-xl border border-slate-200 bg-white p-4 text-sm text-slate-600 shadow-xl dark:border-white/10 dark:bg-[#11151b] dark:text-white/70 dark:shadow-2xl md:right-10">
          You are all caught up. New releases will appear here.
        </div>
      )}

    </div>
  );
};

export default Navbar;
