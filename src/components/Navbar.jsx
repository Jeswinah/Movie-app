import React, { useState, useEffect, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { SiThemoviedatabase } from "react-icons/si";
import { FaSearch,FaStar,FaSignOutAlt  } from "react-icons/fa";
import API_BASE_URL from "../config/api";

const Navbar = ({ setAuthentication }) => {
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
  const isMoviesPage = !isSeriesPage;

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
      } catch (err) {
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

  return (
    <div className="fixed top-0 left-0 right-0 z-50 px-4 py-3 lg:px-20 glass-shell">
      <div className="w-full flex justify-between items-center">
        <div className="md:flex gap-20">
        <div className="logo" onClick={() => navigate('/')}>
          <h2 className="text-lg cursor-pointer font-bold flex items-center gap-2 text-white">
            <SiThemoviedatabase className="w-10 h-10 text-[#ffffff] drop-shadow-lg" />
            <span className="hidden md:block display-title text-3xl leading-none tracking-wider text-red-700" >MovieDB</span>
          </h2>
        </div>

        <div className="hidden md:flex items-left gap-2 text-white font-semibold bg-white/5 border border-white/10 rounded-full px-2 py-1">
          <Link
            to="/"
            className={`${isMoviesPage ? " text-yellow-500" : "text-white/85"} hover:text-red-500 hover:bg-white/10 transition-colors px-3 py-1 rounded-full`}
          >
            Home
          </Link>
          <Link
            to="/series"
            className={`${isSeriesPage ? " text-yellow-500" : "text-white/85"} hover:text-red-500 hover:bg-white/10 transition-colors px-3 py-1 rounded-full`}
          >
            Series
          </Link>
        </div>
        </div>

        <div className="pl-3 w-full sm:w-auto max-w-md relative" ref={wrapperRef}>
        <div className="flex items-center space-x-2">
          <input
            type="text"
            placeholder="Search movies or series"
            className="bg-white/90 text-black rounded-2xl px-3 py-2 border border-white/30 outline-0 w-full max-w-xs shadow-lg"
            onChange={(e) => setSearchval(e.target.value)}
            onKeyDown={handleKeyDown}
            value={searchval}
            onFocus={() => { if (suggestions.length) setShowSuggestions(true); }}
          />
          <button
            className="bg-netflix-red btn-netflix rounded-2xl px-3 py-2 font-semibold text-white sm:w-auto shadow-md hover:brightness-110 transition"
            onClick={handleSearch}
          >
            <FaSearch className="h-5" />
          </button>

          <Link to="/" className="hover:text-red-400 ml-2">
            <FaSignOutAlt  className="w-6 h-6" onClick={() => {
              setAuthentication(false);
              navigate('/login');
              localStorage.removeItem('authToken');
              localStorage.removeItem('userEmail');
              localStorage.removeItem('userName');
              localStorage.removeItem('isAuthenticated');
            }} 
            />    
          </Link>
        </div>

        {/* Suggestions dropdown */}
        {showSuggestions && (
          <div className="absolute left-0 top-full mt-2 w-full max-w-lg suggestion-card rounded-md overflow-hidden">
            {loadingSuggest && <div className="p-3 text-sm text-muted">Loading...</div>}
            {!loadingSuggest && suggestions.map((s) => (
              <div
                key={`${s.media_type || "movie"}-${s.id}`}
                onClick={() => {
                  navigate(s.media_type === "tv" ? `/series/${s.id}` : `/movie/${s.id}`);
                  setSearchval("");
                  setShowSuggestions(false);
                }}
                className="flex items-center gap-3 px-3 py-2 hover:bg-white/5 cursor-pointer"
              >
                <img
                  src={`https://image.tmdb.org/t/p/w92${s.poster_path || s.backdrop_path}`}
                  alt={s.title || s.name}
                  className="w-12 h-18 object-cover rounded-sm"
                />
                <div>
                  <div className="text-sm font-semibold">{s.title || s.name}</div>
                  <div className="text-xs text-muted">{s.release_date || s.first_air_date}</div>
                </div>
                <div className="text-sm absolute right-2 pt-2"><FaStar className="inline mr-1 text-yellow-400" />{s.vote_average.toFixed(1)}</div>
              </div>
            ))}
            {!loadingSuggest && suggestions.length === 0 && (
              <div className="p-3 text-sm text-muted">No suggestions</div>
            )}
          </div>
        )}
      </div>
      </div>

      <div
        className={`md:hidden absolute left-0 right-0 top-full px-4 pt-2 transition-all duration-300 ${
          showMobileTabs ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-2 pointer-events-none"
        }`}
      >
        <div className="mx-auto w-fit flex items-center gap-2 text-white font-semibold bg-[#0f141a]/95 border border-white/10 rounded-full px-2 py-1 shadow-lg">
          <Link
            to="/"
            className={`${isMoviesPage ? "bg-red-600 text-white" : "text-white/85"} hover:text-red-500 hover:bg-white/10 transition-colors px-3 py-1 rounded-full`}
          >
            Movies
          </Link>
          <Link
            to="/series"
            className={`${isSeriesPage ? "bg-red-600 text-white" : "text-white/85"} hover:text-red-500 hover:bg-white/10 transition-colors px-3 py-1 rounded-full`}
          >
            Series
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Navbar;
