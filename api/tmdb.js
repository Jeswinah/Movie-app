// Vercel Serverless Function to proxy TMDB API requests
export default async function handler(req, res) {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    return res.status(200).end();
  }

  const apiKey = process.env.VITE_TMDB_API_KEY;

  if (!apiKey) {
    return res.status(500).json({ error: "API key not configured" });
  }

  // Extract the path - handle both /api/tmdb/... and direct function calls
  let path = req.url || '';
  path = path.replace(/^\/api\/tmdb/, '');
  
  // If path is empty or just /, default to checking query
  if (!path || path === '/') {
    return res.status(400).json({ error: 'Invalid path' });
  }

  const tmdbUrl = `https://api.themoviedb.org/3${path}`;
  const url = new URL(tmdbUrl);
  url.searchParams.set("api_key", apiKey);

  try {
    const response = await fetch(url.toString());
    
    if (!response.ok) {
      const errorData = await response.text();
      return res.status(response.status).json({ 
        error: 'TMDB API error', 
        status: response.status,
        details: errorData 
      });
    }

    const data = await response.json();
    
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Content-Type', 'application/json');
    return res.status(200).json(data);
  } catch (error) {
    return res.status(500).json({ 
      error: 'Failed to fetch from TMDB',
      message: error.message 
    });
  }
}

