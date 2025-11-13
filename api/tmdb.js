// Vercel Serverless Function to proxy TMDB API requests
export default async function handler(req, res) {
  const apiKey = process.env.VITE_TMDB_API_KEY;

  if (!apiKey) {
    return res.status(500).json({ error: "API key not configured" });
  }

  const path = req.url.replace(/^\/api\/tmdb/, "");
  const tmdbUrl = `https://api.themoviedb.org/3${path}`;
  const url = new URL(tmdbUrl);
  url.searchParams.set("api_key", apiKey);

  try {
    const response = await fetch(url.toString());
    const data = await response.json();
    
    res.setHeader('Access-Control-Allow-Origin', '*');
    return res.status(response.status).json(data);
  } catch (error) {
    return res.status(500).json({ error: 'Failed to fetch from TMDB' });
  }
}

