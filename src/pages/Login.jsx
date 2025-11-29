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
    <div className="min-h-screen flex items-center justify-center p-4 bg-white">
      {/* Background pattern */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-700 to-gray-600">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='0.03'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
        }}></div>
      </div>

      {/* Error notification */}
      {errorMsg && (
        <div className='absolute top-10 left-1/2 transform -translate-x-1/2 z-50 '>
          <div className='bg-red-600 rounded-lg shadow-xl px-6 py-3 border border-red-700'>
            <p className="text-white font-semibold">⚠ {errorMsg}</p>
          </div>
        </div>
      )}
      
      {/* Login Card */}
      <div className="relative z-10 w-full max-w-5xl  bg-black/20 opacity-90 rounded-2xl shadow-2xl overflow-hidden">
        <div className="grid md:grid-cols-2">
          <div className="side1 grid grid-cols-4 grid-rows-3 gap-0 overflow-hidden  hover:cursor-pointer" >
            <img src="https://image.tmdb.org/t/p/w500/tZRypLd2SU3Eeqg5tD5cwkk5CdL.jpg" alt="Image" className='w-full h-full object-cover'/>
            <img src="https://image.tmdb.org/t/p/original/xPNDRM50a58uvv1il2GVZrtWjkZ.jpg" alt="Image" className='w-full h-full object-cover'/>
            <img src="https://image.tmdb.org/t/p/w500/semFxuYx6HcrkZzslgAkBqfJvZk.jpg" alt="Image" className='w-full h-full object-cover'/>
            <img src="https://image.tmdb.org/t/p/w500/g4JtvGlQO7DByTI6frUobqvSL3R.jpg" alt="Image" className='w-full h-full object-cover'/>
            <img src="https://image.tmdb.org/t/p/original/bOGkgRGdhrBYJSLpXaxhXVstddV.jpg" alt="Image" className='w-full h-full object-cover'/>
            <img src="https://image.tmdb.org/t/p/w500/cm8TNGBGG0aBfWj0LgrESHv8tir.jpg" alt="Image" className='w-full h-full object-cover'/>
            <img src="https://image.tmdb.org/t/p/w500/wYf4Eq3c4iOa856tEwh3GHruHZW.jpg" alt="Image" className='w-full h-full object-cover'/>
            <img src="https://image.tmdb.org/t/p/w500/qVdrYN8qu7xUtsdEFeGiIVIaYd.jpg" alt="Image" className='w-full h-full object-cover'/>
            <img src="https://image.tmdb.org/t/p/w500/3V4kLQg0kSqPLctI5ziYWabAZYF.jpg" alt="Image" className='w-full h-full object-cover'/>
            <img src="https://image.tmdb.org/t/p/w500/yDHYTfA3R0jFYba16jBB1ef8oIt.jpg" alt="Image" className='w-full h-full object-cover'/>
            <img src="https://image.tmdb.org/t/p/w500/zGLHX92Gk96O1DJvLil7ObJTbaL.jpg" alt="Image" className='w-full h-full object-cover'/>
            <img src="https://image.tmdb.org/t/p/w500/kKgQzkUCnQmeTPkyIwHly2t6ZFI.jpg" alt="Image" className='w-full h-full object-cover'/>
          </div>
        
          <div className="p-12 bg-white  flex flex-col justify-center">
            <div className="mb-10">
              <h3 className="text-3xl font-bold text-gray-900 mb-2">Welcome Back</h3>
              <p className="text-gray-600">Sign in to continue to your account</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Username</label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:border-black transition-colors"
                  placeholder="Enter your username"
                />
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:border-black transition-colors"
                  placeholder="Enter your password"
                />
              </div>

              <button
                type="submit"
                className="w-full mt-6 py-4 px-6 hover:cursor-pointer bg-black hover:bg-gray-800 text-white font-bold text-lg rounded-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200"
              >
                Sign In →
              </button>
            </form>

            <div className="mt-10 pt-6 border-t border-gray-200">
              <p className="text-center text-gray-500 text-sm">
                {new Date().toDateString()}
              </p>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes slide-down {
          from { transform: translateX(-50%) translateY(-100%); opacity: 0; }
          to { transform: translateX(-50%) translateY(0); opacity: 1; }
        }
        .animate-slide-down {
          animation: slide-down 0.3s ease-out;
        }
      `}</style>
    </div>
  )
}

export default Login