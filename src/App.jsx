import React, { useState } from "react";
import { Routes, Route, useLocation } from "react-router-dom";

import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import SearchPage from "./components/Searchpage";
import MovieDetails from "./components/MovieDetail";
import Home from "./pages/Home";

function App() {
  // state lifted to App so children can toggle navbar transparency
  // default to transparent to match the Netflix-style overlay navbar
  const [navTransparent, setNavTransparent] = useState(true);
  const location = useLocation();
  
  // Check if current route is movie streaming page
  const isMoviePage = location.pathname.startsWith('/movie/');

  return (
    <>
      {!isMoviePage && <Navbar navTransparent={navTransparent} />}
      {/* add top padding so fixed navbar doesn't overlap page content */}
      <div className={isMoviePage ? "" : "pt-16 p-0"}>
        <Routes>
          <Route path="/" element={<Home setNavbarTransparent={setNavTransparent} />} />
          <Route path="/search" element={<SearchPage setNavbarTransparent={setNavTransparent} />} />
          <Route path="/movie/:id" element={<MovieDetails setNavbarTransparent={setNavTransparent} />} />
        </Routes>
      </div>
      {!isMoviePage && <Footer />}
    </>
  );
}

export default App;
