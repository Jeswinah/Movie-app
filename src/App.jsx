import React, { useState, useEffect } from "react";
import { Routes, Route, useLocation } from "react-router-dom";

import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import SearchPage from "./components/Searchpage";
import MovieDetails from "./components/MovieDetail";
import Home from "./pages/Home";
import Login from "./pages/Login";


function App() {
    const [loading, setLoading] = useState(true);

  const [authentication, setAuthentication] = useState(() => {
    return localStorage.getItem('isAuthenticated') === 'true';
  });
  const location = useLocation();

  useEffect(() => {
    const isAuth = localStorage.getItem('isAuthenticated') === 'true';
    setAuthentication(isAuth);
  }, []);

  const isMoviePage = location.pathname.startsWith('/movie/');

  return (
    <>
      {authentication  && !isMoviePage && !loading && <Navbar setAuthentication={setAuthentication} />}
      <div className={isMoviePage || !authentication  || loading? "" : "pt-16 p-0" }>
        <Routes>
          <Route path="/login" element={<Login setAuthentication={setAuthentication} />} />
          {authentication ? (
            <>
              <Route path="/" element={<Home loading={loading} setLoading={setLoading} />} />
              <Route path="/search" element={<SearchPage />} />
              <Route path="/movie/:id" element={<MovieDetails />} />
            </>
          ) : (
            <Route path="*" element={<Login setAuthentication={setAuthentication} />} />
          )}
        </Routes>
      </div>
      {authentication &&  !isMoviePage && !loading &&  <Footer />}
    </>
  );
}

export default App;
