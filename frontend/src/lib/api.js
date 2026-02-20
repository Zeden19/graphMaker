const rawBase = import.meta.env.VITE_API_URL ?? "";
const base = rawBase.replace(/\/$/, "");

export const apiUrl = (path = "") => {
  if (!path) return base;
  if (path.startsWith("http://") || path.startsWith("https://")) return path;
  if (!base) return path;
  if (path.startsWith("/")) return `${base}${path}`;
  return `${base}/${path}`;
};
