// Vercel Serverless Function to proxy TMDB API requests
// This forwards requests from /api/tmdb/<path>?... to https://api.themoviedb.org/3/<path>?...&api_key=...
// This approach is more robust as it mirrors the TMDB API structure.

export default async function handler(req, res) {
  try {
    // The Vercel URL contains the full path, like /api/tmdb/movie/popular
    const path = req.url.replace(/^\/api\/tmdb/, "");
    const apiKey = process.env.VITE_TMDB_API_KEY;

    if (!apiKey) {
      return res.status(500).json({ error: "TMDB API key not configured on the server." });
    }

    // Build the full TMDB URL
    // The `path` will include the leading '/' and any query params from the original request
    const tmdbUrl = `https://api.themoviedb.org/3${path}`;
    
    // Add the api_key to the query string
    const urlObject = new URL(tmdbUrl);
    urlObject.searchParams.set("api_key", apiKey);

    const targetUrl = urlObject.toString();

    const response = await fetch(targetUrl, {
      method: req.method,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();

    // Set CORS headers to allow requests from any origin
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    return res.status(response.status).json(data);
  } catch (error) {
    return res.status(500).json({ error: 'Failed to fetch from TMDB', details: error.message });
  }
}

