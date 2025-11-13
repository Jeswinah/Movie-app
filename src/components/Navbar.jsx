import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { SiThemoviedatabase } from "react-icons/si";
import { FaHome, FaSearch,FaStar,FaSignOutAlt  } from "react-icons/fa";

const Navbar = ({ navTransparent = true ,setAuthentication}) => {
  const [searchval, setSearchval] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [loadingSuggest, setLoadingSuggest] = useState(false);
  const navigate = useNavigate();
  const wrapperRef = useRef(null);
  const debounceRef = useRef(null);

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
        const apiKey = import.meta.env.VITE_TMDB_API_KEY;
        const res = await fetch(
          `https://api.themoviedb.org/3/search/movie?api_key=${apiKey}&query=${encodeURIComponent(q)}&page=1`
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

  return (
    <div className="fixed top-0 left-0 right-0 z-50 flex justify-between items-center p-4 lg:px-20 bg-gradient-to-b from-black/80 to-transparent">
      <div className="logo" onClick={() => navigate('/')}>
        <h2 className="text-lg cursor-pointer font-bold flex items-center gap-2 text-white">
          <SiThemoviedatabase className="w-10 h-10" />
          <span className="hidden md:block  font-semibold bg-red-600 rounded-md px-2 text-white" >Movies</span>
        </h2>
      </div>

      <div className="flex items-center space-x-2 pl-3 w-full sm:w-auto max-w-md relative" ref={wrapperRef}>
        <input
          type="text"
          placeholder="Search a movie"
          className="bg-white/90 text-black rounded-2xl px-3 py-2 border outline-0 w-full max-w-xs"
          onChange={(e) => setSearchval(e.target.value)}
          onKeyDown={handleKeyDown}
          value={searchval}
          onFocus={() => { if (suggestions.length) setShowSuggestions(true); }}
        />
        <button
          className="bg-netflix-red btn-netflix rounded-2xl px-3 py-2 font-semibold text-white sm:w-auto"
          onClick={handleSearch}
        >
          <FaSearch className="h-5" />
        </button>
        
        <Link to="/" className="hover:text-blue-600 ml-2">
          {/* <FaHome className="w-6 h-6" /> */}
          <FaSignOutAlt  className="w-6 h-6" onClick={() => {
            setAuthentication(false);
            navigate('/login');
            localStorage.removeItem('username');
            localStorage.removeItem('isAuthenticated');
          }} 
          />     
        </Link>

        {/* Suggestions dropdown */}
        {showSuggestions && (
          <div className="absolute left-0 top-0 mt-14 w-full max-w-lg suggestion-card rounded-md overflow-hidden">
            {loadingSuggest && <div className="p-3 text-sm text-muted">Loading...</div>}
            {!loadingSuggest && suggestions.map((s) => (
              <div
                key={s.id}
                onClick={() => {
                  navigate(`/movie/${s.id}`);
                  setSearchval("");
                  setShowSuggestions(false);
                }}
                className="flex items-center gap-3 px-3 py-2 hover:bg-white/5 cursor-pointer"
              >
                <img
                  src={`https://image.tmdb.org/t/p/w92${s.poster_path || s.backdrop_path}`}
                  alt={s.title}
                  className="w-12 h-18 object-cover rounded-sm"
                />
                <div>
                  <div className="text-sm font-semibold">{s.title}</div>
                  <div className="text-xs text-muted">{s.release_date}</div>
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
  );
};

export default Navbar;
