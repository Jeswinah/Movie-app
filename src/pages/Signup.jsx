import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import baseurl from '../config/api';

const Signup = ({ setAuthentication, setLoading }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (token) {
      setAuthentication(true);
      navigate('/');
    }
  }, [navigate, setAuthentication]);

  const showError = (message) => {
    setErrorMsg(message);
    setTimeout(() => {
      setErrorMsg('');
    }, 3000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!name.trim() || !email.trim() || !password.trim() || !confirmPassword.trim()) {
      showError('Please fill all fields');
      return;
    }

    if (password !== confirmPassword) {
      showError('Passwords do not match');
      return;
    }

    try {
      const response = await axios.post(`${baseurl}/signup`, {
        name,
        email,
        password
      });

      if (response.data?.token) {
        setLoading(true);
        localStorage.setItem('authToken', response.data.token);
        localStorage.setItem('userEmail', response.data.user?.email || email);
        localStorage.setItem('userName', response.data.user?.name || name);
        localStorage.setItem('isAuthenticated', 'true');
        setAuthentication(true);
        navigate('/');
        return;
      }

      showError('Signup failed. Please try again.');
    } catch (error) {
      const message = error.response?.data?.message || 'Signup failed. Please try again.';
      showError(message);
    }
  };

  return (
    <div className="relative max-h-screen overflow-hidden flex items-center justify-center px-3 py-6 sm:px-5 sm:py-10">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_15%,rgba(229,9,20,0.2),transparent_33%),radial-gradient(circle_at_80%_12%,rgba(243,191,74,0.1),transparent_34%),linear-gradient(180deg,#0b0b0b_0%,#0a1119_65%,#08090d_100%)]"></div>

      {errorMsg && (
        <div className="absolute top-0 sm:top-10 left-1/2 transform -translate-x-1/2 z-50 w-[92%] sm:w-auto">
          <div className="bg-red-600/95 rounded-lg shadow-xl px-4 sm:px-6 py-3 border border-red-400/60">
            <p className="text-white font-semibold text-sm sm:text-base text-center">{errorMsg}</p>
          </div>
        </div>
      )}

      <div className="relative z-10 max-h-[calc(100vh-2rem)] w-full max-w-lg rounded-2xl sm:rounded-3xl overflow-hidden border   border-white/15 shadow-[0_24px_70px_rgba(0,0,0,0.5)]">
        <div className="p-6 sm:p-8 md:p-10 lg:p-12">
          <div className="mb-8">
            <p className="display-title text-2xl tracking-wider text-[#f3bf4a]">MovieDB</p>
            <h3 className="text-3xl sm:text-4xl font-bold text-white ">Create Account</h3>
            <p className="text-white/70">Sign up to start exploring movies</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-white/80 mb-2">Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-1 md:py-3 border border-white/20 rounded-xl bg-white/10 text-white placeholder-white/45 focus:outline-none focus:border-red-400 focus:bg-white/15 transition-colors"
                placeholder="Enter your name"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-white/80 mb-2">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-1 md:py-3 border border-white/20 rounded-xl bg-white/10 text-white placeholder-white/45 focus:outline-none focus:border-red-400 focus:bg-white/15 transition-colors"
                placeholder="Enter your email"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-white/80 mb-2">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-1 md:py-3 border border-white/20 rounded-xl bg-white/10 text-white placeholder-white/45 focus:outline-none focus:border-red-400 focus:bg-white/15 transition-colors"
                placeholder="Create a password"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-white/80 mb-2">Confirm Password</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-4 py-1 md:py-3 border border-white/20 rounded-xl bg-white/10 text-white placeholder-white/45 focus:outline-none focus:border-red-400 focus:bg-white/15 transition-colors"
                placeholder="Confirm your password"
              />
            </div>

            <button
              type="submit"
              className="w-full  md:mt-4 md:py-3.5 py-1  px-6 hover:cursor-pointer bg-red-600 hover:bg-red-500 text-white font-bold text-base sm:text-lg rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200"
            >
              Sign Up
            </button>
          </form>

          <div className="md:mt-8 md:pt-6  border-white/15">
            <p className="text-center text-white/70 text-sm mb-3">
              Already have an account?{' '}
              <Link to="/login" className="font-semibold text-[#f3bf4a] hover:underline">
                Sign in
              </Link>
            </p>

          </div>
        </div>
      </div>
    </div>
  );
};

export default Signup;
