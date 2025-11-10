import React from "react";
import { Routes, Route, useLocation } from "react-router-dom";

import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import SearchPage from "./components/Searchpage";
import MovieDetails from "./components/MovieDetail";
import Home from "./pages/Home";

function App() {
  const location = useLocation();
  const isMovieDetailsPage = location.pathname.startsWith("/movie/");

  return (
    <>
      {!isMovieDetailsPage && <Navbar />}
      <div className="p-0">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/search" element={<SearchPage />} />
          <Route path="/movie/:id" element={<MovieDetails />} />
        </Routes>
      </div>
      {!isMovieDetailsPage && <Footer />}
    </>
  );
}

export default App;
