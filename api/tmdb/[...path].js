// Vercel Serverless Function - Catch-all for /api/tmdb/*
export default async function handler(req, res) {
  const apiKey = process.env.VITE_TMDB_API_KEY;

  if (!apiKey) {
    return res.status(500).json({ error: "API key not configured" });
  }

  const { path } = req.query;
  const pathSegments = Array.isArray(path) ? path.join('/') : path || '';
  
  if (!pathSegments) {
    return res.status(400).json({ error: 'Invalid path' });
  }

  const tmdbUrl = `https://api.themoviedb.org/3/${pathSegments}`;
  const url = new URL(tmdbUrl);
  url.searchParams.set("api_key", apiKey);
  
  Object.keys(req.query).forEach(key => {
    if (key !== 'path') {
      url.searchParams.set(key, req.query[key]);
    }
  });

  try {
    const response = await fetch(url.toString());
    const data = await response.json();
    return res.status(200).json(data);
  } catch (error) {
    return res.status(500).json({ error: 'Failed to fetch' });
  }
}
