import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'
import baseurl from '../config/api'

const Login = ({ setAuthentication }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const navigate = useNavigate();
    const [errorMsg, setErrorMsg] = useState("");
    const img="https://image.tmdb.org/t/p/original/bOGkgRGdhrBYJSLpXaxhXVstddV.jpg"
    const poster="https://image.tmdb.org/t/p/w500/tZRypLd2SU3Eeqg5tD5cwkk5CdL.jpg"
  useEffect(() => {
    const isAuth = localStorage.getItem('isAuthenticated') === 'true';
    if (isAuth) {
      setAuthentication(true);
      navigate('/');
    }
  }, [navigate, setAuthentication]);
    
  const handleSubmit = (e) => {
    e.preventDefault()
    if(username =="" || password ==""){
      setErrorMsg("Enter a Username and Password");
       setTimeout(() => {  setErrorMsg(""); }, 3000);
      return;
    }

    axios.post(`${baseurl}/login`, { username, password })
      .then(response => {
        const Auth = response.data.message;
        if(Auth==='ok'){
        setAuthentication(true);
        localStorage.setItem('username', username);
        localStorage.setItem('isAuthenticated', 'true');
        navigate('/');}
        else{
          setAuthentication (false);
          setErrorMsg("Invalid Credentials");
          setTimeout(() => {  setErrorMsg(""); }, 3000);
          
        }
      })
      .catch(error => {
        console.error('Login failed:', error);
        setAuthentication(false);
        setErrorMsg("Login failed. Please try again.");
        setTimeout(() => {  setErrorMsg(""); }, 3000);
      });

  };

  return (
    <div 
      className="h-screen flex flex-col items-center justify-center px-4 overflow-hidden relative"
    >
      <div 
        className="absolute inset-0 bg-cover bg-center"
        style={{backgroundImage:`url(${img})`}}
      ></div>
      <div className="absolute inset-0 bg-black/90"></div>
      
      {/* Content */}
      <div className='er bg-white bg-opacity-50 font-bold backdrop-blur rounded-lg shadow-2xl absolute top-10 z-10'>{errorMsg && <div className='p-5'><h2><span className="text-red-500">{errorMsg}</span></h2></div>}</div>
      
      <div className="w-full mx-4 md:max-w-3/6 h-5/6 flex rounded-xl relative z-10 border-3 border-gray-800 shadow-2xl overflow-hidden">
        <div className="img md:w-3/6 ">
          <img src={poster} alt="Image" className='hidden md:block h-full bg-contain rounded-tl-2xl rounded-bl-2xl w-full opacity-80'/>
        </div>
        <div className="bg-black w-full md:w-3/6 rounded-tr-2xl rounded-br-2xl shadow-2xl p-8 flex flex-col justify-evenly">
          <h1 className="text-4xl font-semibold  text-white text-center mb-8">Welcome Back</h1>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <input
                type="text"
                name="username"
                id="username"
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-4 py-3 bg-gray-700 text-white rounded-md border border-gray-600 focus:outline-none focus:border-netflix-red focus:ring-1 focus:ring-netflix-red placeholder-gray-400"
              />
            </div>

            <div>
              <input
                type="password"
                name="password"
                id="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                
                className="w-full px-4 py-3 bg-gray-700 text-white rounded-md border border-gray-600 focus:outline-none focus:border-netflix-red focus:ring-1 focus:ring-netflix-red placeholder-gray-400"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-red-600 text-white font-semibold py-3 rounded-md hover:bg-red-700 transition-colors duration-300 shadow-lg"
            >
              Sign In
            </button>
          </form>

          <div className="mt-3 text-center">
            <p className=" text-sm text-gray-400">
                { new Date().toDateString()}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Login