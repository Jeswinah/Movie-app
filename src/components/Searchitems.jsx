import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const Searchitems = () => {
  const [searchval, setSearchval] = useState("");
  const navigate = useNavigate();

  const Handlesearch = () => {
    if (searchval.trim() !== "") {
      navigate(`/search/${encodeURIComponent(searchval)}`);
      setSearchval("");
    }
  };

  // For Search on Enter key press
  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      Handlesearch();
    }
  };

  return (
    <div>
      <div className="search w-full flex justify-center">
        <div className="w-full sm:w-4/6 lg:w-2/6 my-5 sm:my-8 flex items-center space-x-2 mx-3">
          <input
            type="text"
            placeholder="Search a movie"
            className=" rounded-2xl px-3 py-2 border text-blue w-full"
            onChange={(e) => setSearchval(e.target.value)}
            onKeyDown={handleKeyDown}
            value={searchval}
          />
          <button
            className="bg-gray-700 rounded-2xl px-3 py-2 font-semibold text-white"
            onClick={Handlesearch}
          >
            Search
          </button>
        </div>
      </div>
    </div>
  );
};

export default Searchitems;
