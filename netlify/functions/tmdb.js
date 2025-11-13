// Netlify Serverless Function to proxy TMDB API requests
exports.handler = async (event, context) => {
  const apiKey = process.env.VITE_TMDB_API_KEY;

  if (!apiKey) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "API key not configured" })
    };
  }

  // Extract path after /api/tmdb/
  const path = event.path.replace('/.netlify/functions/tmdb', '');
  const queryParams = event.queryStringParameters || {};
  
  // Build TMDB URL
  const tmdbUrl = new URL(`https://api.themoviedb.org/3${path}`);
  tmdbUrl.searchParams.set("api_key", apiKey);
  
  // Add any additional query parameters
  Object.keys(queryParams).forEach(key => {
    tmdbUrl.searchParams.set(key, queryParams[key]);
  });

  try {
    const response = await fetch(tmdbUrl.toString());
    const data = await response.json();
    
    return {
      statusCode: response.status,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to fetch from TMDB' })
    };
  }
};
