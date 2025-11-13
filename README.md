# Movie App

A Netflix-style movie streaming app built with React, Vite, and TMDB API.

## Features

- 🎬 Browse popular movies
- 🔍 Search for movies with live suggestions
- 📱 Responsive Netflix-style UI
- ▶️ Stream movies in fullscreen
- 🎨 Beautiful animations and transitions

## Setup

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file in the root directory:
   ```
   VITE_TMDB_API_KEY=your_tmdb_api_key_here
   ```
   Get your API key from [TMDB](https://www.themoviedb.org/settings/api)

4. Run development server:
   ```bash
   npm run dev
   ```

## Deployment on Netlify

1. Push your code to GitHub
2. Import project in Netlify
3. Add environment variable in Netlify:
   - Key: `VITE_TMDB_API_KEY`
   - Value: Your TMDB API key
4. Deploy

The API routes will be automatically handled by Netlify serverless functions.

## Deployment on Vercel

1. Push your code to GitHub
2. Import project in Vercel
3. Add environment variable:
   - Key: `VITE_TMDB_API_KEY`
   - Value: Your TMDB API key
4. Deploy

The API routes will be automatically handled by Vercel serverless functions.

## Tech Stack

- React 19
- Vite
- Tailwind CSS
- React Router
- TMDB API
- Vercel (Deployment)
