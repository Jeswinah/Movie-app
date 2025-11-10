// Vercel Serverless Function to proxy TMDB API requests
// This bypasses mobile carrier blocking

export default async function handler(req, res) {
  const { endpoint, query } = req.query;
  
  // Get API key from environment variable
  const apiKey = process.env.VITE_TMDB_API_KEY;
  
  if (!apiKey) {
    return res.status(500).json({ error: 'API key not configured' });
  }

  try {
    const url = `https://api.themoviedb.org/3${endpoint}?api_key=${apiKey}${query ? `&${query}` : ''}`;
    
    const response = await fetch(url);
    const data = await response.json();
    
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    
    return res.status(response.status).json(data);
  } catch (error) {
    return res.status(500).json({ error: 'Failed to fetch from TMDB', details: error.message });
  }
}
