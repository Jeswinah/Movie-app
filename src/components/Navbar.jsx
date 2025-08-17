import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { SiThemoviedatabase } from "react-icons/si";
import { FaHome, FaSearch } from "react-icons/fa";

const Navbar = () => {
  const [searchval, setSearchval] = useState("");
  const navigate = useNavigate();

  const handleSearch = () => {
    if (searchval.trim() !== "") {
      // Navigate to /search with query as URL param
      navigate(`/search?query=${encodeURIComponent(searchval)}`);
      setSearchval("");
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  return (
    <div className="flex justify-between items-center p-4  lg:px-20 bg-gray-900 text-white">
      <div className="logo">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <SiThemoviedatabase className="w-10 h-10" />
          <span className="hidden md:block">Movies</span>
        </h2>
      </div>

      <div className="flex items-center space-x-2 pl-3 w-full sm:w-auto max-w-md">
        
        <input
          type="text"
          placeholder="Search a movie"
          className="bg-gray-100 text-black border-gray-400 rounded-2xl px-3 py-2 border outline-0 w-full max-w-xs"
          onChange={(e) => setSearchval(e.target.value)}
          onKeyDown={handleKeyDown}
          value={searchval}
        />
        <button
          className="bg-gray-700 rounded-2xl px-3 py-2 font-semibold text-white sm:w-auto"
          onClick={handleSearch}
        >
          <FaSearch className="h-6"/>
        </button>
        <Link to="/" className="hover:text-blue-600 ">
          <FaHome className="w-6 h-8"/>
        </Link>
      </div>
    </div>
  );
};

export default Navbar;
