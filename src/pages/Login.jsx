import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { Link, useNavigate } from 'react-router-dom'
import baseurl from '../config/api'
import { tmdbImageUrl } from '../config/tmdbImage'

const Login = ({ setAuthentication, setLoading }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const navigate = useNavigate();
    const [errorMsg, setErrorMsg] = useState("");
  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (token) {
      setAuthentication(true);
      navigate('/');
    }
  }, [navigate, setAuthentication]);
    
  const handleSubmit = (e) => {
    e.preventDefault()
    if(email.trim() === "" || password.trim() === ""){
      setErrorMsg("Enter an email and password");
       setTimeout(() => {  setErrorMsg(""); }, 3000);
      return;
    }

    axios.post(`${baseurl}/login`, { email, password })
      .then(response => {
        if(response.data?.token){
        setLoading(true);
        setAuthentication(true);
        localStorage.setItem('authToken', response.data.token);
        localStorage.setItem('userEmail', response.data.user?.email || email);
        localStorage.setItem('userName', response.data.user?.name || '');
        localStorage.setItem('isAuthenticated', 'true');
        navigate('/');}
        else{
          setAuthentication (false);
          setErrorMsg("Invalid credentials");
          setTimeout(() => {  setErrorMsg(""); }, 3000);
          
        }
      })
      .catch(error => {
        console.error('Login failed:', error);
        setAuthentication(false);
        const message = error.response?.data?.message || "Login failed. Please try again.";
        setErrorMsg(message);
        setTimeout(() => {  setErrorMsg(""); }, 3000);
      });

  };

  return (
    <div className="relative max-h-screen flex items-center justify-center px-3 py-6 sm:px-5 sm:py-10">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_20%,rgba(229,9,20,0.22),transparent_35%),radial-gradient(circle_at_85%_10%,rgba(243,191,74,0.08),transparent_30%),linear-gradient(180deg,#0b0b0b_0%,#0a1119_65%,#08090d_100%)]"></div>

      {errorMsg && (
        <div className='absolute top-6 sm:top-10 left-1/2 transform -translate-x-1/2 z-50 w-[92%] sm:w-auto'>
          <div className='bg-red-600/95 rounded-lg shadow-xl px-4 sm:px-6 py-3 border border-red-400/60'>
            <p className="text-white font-semibold text-sm sm:text-base text-center">{errorMsg}</p>
          </div>
        </div>
      )}

      <div className="relative z-10 w-full max-w-5xl rounded-2xl sm:rounded-3xl overflow-hidden border border-white/15 shadow-[0_24px_70px_rgba(0,0,0,0.5)]">
        <div className="grid md:grid-cols-2 bg-black/35 backdrop-blur-md">
          <div className="hidden md:grid grid-cols-4 grid-rows-3 gap-0 overflow-hidden">
            <img src={tmdbImageUrl("/tZRypLd2SU3Eeqg5tD5cwkk5CdL.jpg", "w342")} alt="Image" className='w-full h-full object-cover' decoding="async"/>
            <img src={tmdbImageUrl("/xPNDRM50a58uvv1il2GVZrtWjkZ.jpg", "w342")} alt="Image" className='w-full h-full object-cover' decoding="async"/>
            <img src={tmdbImageUrl("/semFxuYx6HcrkZzslgAkBqfJvZk.jpg", "w342")} alt="Image" className='w-full h-full object-cover' decoding="async"/>
            <img src={tmdbImageUrl("/g4JtvGlQO7DByTI6frUobqvSL3R.jpg", "w342")} alt="Image" className='w-full h-full object-cover' decoding="async"/>
            <img src={tmdbImageUrl("/bOGkgRGdhrBYJSLpXaxhXVstddV.jpg", "w342")} alt="Image" className='w-full h-full object-cover' decoding="async"/>
            <img src={tmdbImageUrl("/cm8TNGBGG0aBfWj0LgrESHv8tir.jpg", "w342")} alt="Image" className='w-full h-full object-cover' decoding="async"/>
            <img src={tmdbImageUrl("/wYf4Eq3c4iOa856tEwh3GHruHZW.jpg", "w342")} alt="Image" className='w-full h-full object-cover' decoding="async"/>
            <img src={tmdbImageUrl("/qVdrYN8qu7xUtsdEFeGiIVIaYd.jpg", "w342")} alt="Image" className='w-full h-full object-cover' decoding="async"/>
            <img src={tmdbImageUrl("/3V4kLQg0kSqPLctI5ziYWabAZYF.jpg", "w342")} alt="Image" className='w-full h-full object-cover' decoding="async"/>
            <img src={tmdbImageUrl("/yDHYTfA3R0jFYba16jBB1ef8oIt.jpg", "w342")} alt="Image" className='w-full h-full object-cover' decoding="async"/>
            <img src={tmdbImageUrl("/zGLHX92Gk96O1DJvLil7ObJTbaL.jpg", "w342")} alt="Image" className='w-full h-full object-cover' decoding="async"/>
            <img src={tmdbImageUrl("/kKgQzkUCnQmeTPkyIwHly2t6ZFI.jpg", "w342")} alt="Image" className='w-full h-full object-cover' decoding="async"/>
          </div>

          <div className="p-6 sm:p-8 md:p-10 lg:p-12 bg-[#0f141a]/88 flex flex-col justify-center">
            <div className="mb-8 sm:mb-10">
              <p className="display-title text-2xl tracking-wider text-[#f3bf4a]">MovieDB</p>
              <h3 className="text-3xl sm:text-4xl font-extrabold text-white mb-2">Welcome Back</h3>
              <p className="text-white/70 text-sm sm:text-base">Sign in to continue your watchlist</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5 sm:space-y-6">
              <div>
                <label className="block text-sm font-semibold text-white/80 mb-2">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 border border-white/20 rounded-xl bg-white/10 text-white placeholder-white/45 focus:outline-none focus:border-red-400 focus:bg-white/15 transition-colors"
                  placeholder="Enter your email"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-white/80 mb-2">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 border border-white/20 rounded-xl bg-white/10 text-white placeholder-white/45 focus:outline-none focus:border-red-400 focus:bg-white/15 transition-colors"
                  placeholder="Enter your password"
                />
              </div>

              <button
                type="submit"
                className="w-full mt-4 sm:mt-6 py-3.5 sm:py-4 px-6 hover:cursor-pointer bg-red-600 hover:bg-red-500 text-white font-bold text-base sm:text-lg rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200"
              >
                Sign In
              </button>
            </form>

            <div className="mt-8 sm:mt-10 pt-6 border-t border-white/15">
              <p className="text-center text-white/70 text-sm mb-3">
                New here?{' '}
                <Link to="/signup" className="font-semibold text-[#f3bf4a] hover:underline">
                  Create an account
                </Link>
              </p>
              <p className="text-center text-white/45 text-xs sm:text-sm">
                {new Date().toDateString()}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Login