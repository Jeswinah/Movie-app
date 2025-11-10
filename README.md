# Movie App

A React-based movie browsing application that uses The Movie Database (TMDB) API to display popular movies, search functionality, and movie streaming.

## Features

- Browse popular movies
- Search for movies
- Watch movies via embedded player
- Responsive design with Tailwind CSS

## Environment Variables

This project requires a TMDB API key to fetch movie data. You need to set up environment variables for the app to work properly.

### Local Development

1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

2. Add your TMDB API key to the `.env` file:
   ```
   VITE_TMDB_API_KEY=your_tmdb_api_key_here
   ```

3. Get your API key from [TMDB](https://www.themoviedb.org/settings/api)

### Vercel Deployment

**IMPORTANT:** Environment variables must be added in Vercel's dashboard for the deployed app to work.

1. Go to your Vercel project dashboard
2. Navigate to **Settings** → **Environment Variables**
3. Add the following variable:
   - **Name:** `VITE_TMDB_API_KEY`
   - **Value:** Your TMDB API key
   - **Environment:** Select all (Production, Preview, Development)
4. Click **Save**
5. **Redeploy** your application for changes to take effect

> **Note:** The app uses a serverless proxy (`/api/tmdb`) in production to bypass mobile carrier blocking of TMDB API. Vite requires environment variables exposed to the client to be prefixed with `VITE_`. Never commit your `.env` file to git.

### Troubleshooting Mobile Network Issues

If the app works on WiFi but not on mobile internet:
- The app now uses a Vercel serverless function to proxy TMDB requests
- This bypasses mobile carrier/ISP blocking of api.themoviedb.org
- Make sure you've added `VITE_TMDB_API_KEY` in Vercel's environment variables
- Redeploy after adding the environment variable

## Setup and Installation

1. Install dependencies:
   ```bash
   npm install
   ```

2. Set up environment variables (see above)

3. Run development server:
   ```bash
   npm run dev
   ```

4. Build for production:
   ```bash
   npm run build
   ```

## Tech Stack

- React
- Vite
- React Router
- Tailwind CSS
- TMDB API
- Axios

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.

