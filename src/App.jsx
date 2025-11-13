import React, { useState } from "react";
import { Routes, Route, useLocation } from "react-router-dom";

import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import SearchPage from "./components/Searchpage";
import MovieDetails from "./components/MovieDetail";
import Home from "./pages/Home";
import Login from "./pages/Login";

function App() {
  const [navTransparent, setNavTransparent] = useState(true);
  const [authentication, setAuthentication] = useState(false);
  const location = useLocation();

  const isMoviePage = location.pathname.startsWith('/movie/');

  return (
    <>
      {authentication &&  !isMoviePage && <Navbar navTransparent={navTransparent} setAuthentication={setAuthentication} />}
      <div className={isMoviePage || !authentication ? "" : "pt-16 p-0" }>
        <Routes>
          <Route path="/login" element={<Login setAuthentication={setAuthentication} />} />
          {authentication ? (
            <>
              <Route path="/" element={<Home setNavbarTransparent={setNavTransparent} />} />
              <Route path="/search" element={<SearchPage setNavbarTransparent={setNavTransparent} />} />
              <Route path="/movie/:id" element={<MovieDetails setNavbarTransparent={setNavTransparent} />} />
            </>
          ) : (
            <Route path="*" element={<Login setAuthentication={setAuthentication} />} />
          )}
        </Routes>
      </div>
      {authentication &&  !isMoviePage && <Footer />}
    </>
  );
}

export default App;
