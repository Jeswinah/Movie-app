import API_BASE_URL from "./api";

const DEFAULT_SIZE = "w342";

export const tmdbImageUrl = (path, size = DEFAULT_SIZE) => {
  if (!path) return "";

  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  const safeSize = size || DEFAULT_SIZE;

  return `${API_BASE_URL}/api/tmdb-image?size=${encodeURIComponent(safeSize)}&path=${encodeURIComponent(normalizedPath)}`;
};
