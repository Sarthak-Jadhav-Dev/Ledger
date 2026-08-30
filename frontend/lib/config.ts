/**
 * Single source of truth for all environment-driven URLs in the frontend.
 *
 * Set these in your .env (or .env.local) file:
 *   NEXT_PUBLIC_BACKEND_URL  — base URL of the backend API  (e.g. http://localhost:8000)
 *   NEXT_PUBLIC_APP_URL      — public URL of this frontend   (e.g. http://localhost:3000)
 *
 * Both are exposed to the browser via the NEXT_PUBLIC_ prefix.
 */

export const BACKEND_URL: string =
  process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:8000";

export const APP_URL: string =
  process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
