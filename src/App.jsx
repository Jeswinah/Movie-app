import React from "react";
import { Routes, Route } from "react-router-dom";

import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import SearchPage from "./components/Searchpage";
import MovieDetails from "./components/MovieDetail";
import Home from "./pages/Home";

function App() {
  return (
    <>
      <Navbar />
      <div className=" p-0 ">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/search" element={<SearchPage />} />
          <Route path="/movie/:id" element={<MovieDetails />} />
        </Routes>
      </div>
      <Footer />
    </>
  );
}

export default App;
