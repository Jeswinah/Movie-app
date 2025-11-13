import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'

const Login = ({ setAuthentication }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();
    const [errorMsg, setErrorMsg] = useState("");
    const img="https://image.tmdb.org/t/p/original/1RgPyOhN4DRs225BGTlHJqCudII.jpg"
    
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
    console.log('Login attempt:', { username, password });
    axios.post('https://movie-backend-kr04.onrender.com/login', { username, password })
      .then(response => {
        const Auth = response.data.message;
        if(Auth==='ok'){
        setAuthentication(true);
        // Store credentials in localStorage
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
    
      className="h-screen flex flex-col items-center justify-center  px-4 overflow-hidden bg-cover bg-center bg-no-repeat"
      style={{
        backgroundImage: img ? `linear-gradient(rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.7)), url(${img}) ` : 'none',
        backgroundColor: 'var(--netflix-bg)'
      }}
    ><div className='er bg-white bg-opacity-50 font-bold backdrop-blur rounded-lg shadow-2xl absolute top-10 '>{errorMsg && <div className='p-5'><h2><span className="text-red-500">{errorMsg}</span></h2></div>}</div>
      
      <div className="w-full max-w-md">
        <div className="bg-black bg-opacity-50 backdrop-blur rounded-lg shadow-2xl p-8 ">
          <h1 className="text-3xl font-semibold font-mono text-white text-center mb-8">Admin Login</h1>
          
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