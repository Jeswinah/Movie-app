import React, { useState, useEffect } from "react";
import { Routes, Route, useLocation } from "react-router-dom";

import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import SearchPage from "./components/Searchpage";
import MovieDetails from "./components/MovieDetail";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import authApi from "./config/authApi";
import Series from "./pages/Series";


function App() {
    const [loading, setLoading] = useState(true);

  const [authentication, setAuthentication] = useState(() => {
    return Boolean(localStorage.getItem('authToken'));
  });
  const location = useLocation();

  useEffect(() => {
    let isMounted = true;

    const verifySession = async () => {
      const token = localStorage.getItem("authToken");
      if (!token) {
        if (isMounted) setAuthentication(false);
        return;
      }

      try {
        await authApi.get("/profile");
        if (isMounted) setAuthentication(true);
      } catch (error) {
        localStorage.removeItem("authToken");
        localStorage.removeItem("userEmail");
        localStorage.removeItem("userName");
        localStorage.removeItem("isAuthenticated");
        if (isMounted) setAuthentication(false);
      }
    };

    verifySession();

    return () => {
      isMounted = false;
    };
  }, []);

  const isDetailPage =
    location.pathname.startsWith('/movie/') ||
    location.pathname.startsWith('/series/');

  return (
    <>
      {authentication  && !isDetailPage && !loading && <Navbar setAuthentication={setAuthentication} />}
      <div className={isDetailPage || !authentication  || loading? "" : "pt-16 p-0" }>
        <Routes>
          <Route path="/login" element={<Login setAuthentication={setAuthentication} setLoading={setLoading} />} />
          <Route path="/signup" element={<Signup setAuthentication={setAuthentication} setLoading={setLoading} />} />
          {authentication ? (
            <>
              <Route path="/" element={<Home loading={loading} setLoading={setLoading} />} />
              <Route path="/series" element={<Series />} />
              <Route path="/search" element={<SearchPage />} />
              <Route path="/movie/:id" element={<MovieDetails />} />
              <Route path="/series/:id" element={<MovieDetails />} />
            </>
          ) : (
            <Route path="*" element={<Login setAuthentication={setAuthentication} setLoading={setLoading} />} />
          )}
        </Routes>
      </div>
      {authentication &&  !isDetailPage && !loading &&  <Footer />}
    </>
  );
}

export default App;
