import React, { useState, useEffect } from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";

import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import SearchPage from "./components/Searchpage";
import MovieDetails from "./components/MovieDetail";
import Home from "./pages/Home";
import Login from "./pages/Login";
import authApi from "./config/authApi";
import Series from "./pages/Series";
import Watchlist from "./pages/Watchlist";
import ComingSoon from "./pages/ComingSoon";
import Profile from "./pages/Profile";
import ChatbotWidget from "./components/ChatbotWidget";
import ThemeToggle from "./components/ThemeToggle";


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
      } catch {
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
  const isHomePage = location.pathname === "/";
  const isSeriesPage = location.pathname === "/series";
  const isWatchlistPage = location.pathname.startsWith("/watchlist");

  return (
    <>
      {authentication && !loading && <Navbar setAuthentication={setAuthentication} />}
      <div
        className={`${isDetailPage || isHomePage || isSeriesPage || !authentication || loading ? "" : "pt-16 p-0"} ${
          isWatchlistPage ? "bg-netflix" : ""
        }`}
      >
        <Routes>
          <Route path="/login" element={<Login setAuthentication={setAuthentication} setLoading={setLoading} />} />
          <Route path="/signup" element={<Navigate to="/login" replace />} />
          {authentication ? (
            <>
              <Route path="/" element={<Home loading={loading} setLoading={setLoading} />} />
              <Route path="/series" element={<Series />} />
              <Route path="/watchlist" element={<Watchlist />} />
              <Route path="/coming-soon" element={<ComingSoon />} />
              <Route path="/profile" element={<Profile setAuthentication={setAuthentication} />} />
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
      {authentication && !isDetailPage && !loading && <ChatbotWidget />}
      {!authentication && <ThemeToggle floating />}
    </>
  );
}

export default App;
