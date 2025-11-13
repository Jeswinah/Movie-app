// Vercel Edge Function for TMDB API proxy
export const config = {
  runtime: 'edge',
};

export default async function handler(req) {
  const apiKey = process.env.VITE_TMDB_API_KEY;
  
  if (!apiKey) {
    return new Response(JSON.stringify({ error: 'API key not configured' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  const url = new URL(req.url);
  const path = url.pathname.replace('/api/tmdb', '');
  
  const tmdbUrl = `https://api.themoviedb.org/3${path}${url.search}`;
  const finalUrl = new URL(tmdbUrl);
  finalUrl.searchParams.set('api_key', apiKey);

  try {
    const response = await fetch(finalUrl.toString());
    const data = await response.json();
    
    return new Response(JSON.stringify(data), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, s-maxage=3600'
      }
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Failed to fetch' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
