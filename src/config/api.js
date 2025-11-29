// API Configuration
const API_BASE_URL = import.meta.env.VITE_MODE === 'production' 
  ? 'https://movie-backend-kr04.onrender.com'
  : 'http://localhost:5000';

export default API_BASE_URL;
