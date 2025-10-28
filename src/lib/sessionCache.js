import { supabase } from "@/lib/supabase";

let cachedSession = null;
let cachedAt = 0;
let inFlight = null;

// Cache the session briefly to avoid many parallel refresh requests
const SESSION_TTL_MS = 60 * 1000; // 60 seconds

export async function getSessionCached() {
  const now = Date.now();
  if (cachedSession && now - cachedAt < SESSION_TTL_MS) {
    return cachedSession;
  }

  if (inFlight) {
    return inFlight;
  }

  inFlight = supabase.auth
    .getSession()
    .then(({ data, error }) => {
      if (error) throw error;
      cachedSession = data?.session || null;
      cachedAt = Date.now();
      return cachedSession;
    })
    .finally(() => {
      inFlight = null;
    });

  return inFlight;
}

export async function getUserCached() {
  const session = await getSessionCached();
  return session?.user ?? null;
}

export function clearSessionCache() {
  cachedSession = null;
  cachedAt = 0;
}

// Keep cache in sync with auth changes
// Any sign-in/out/token refresh that changes the session should clear the cache
if (typeof window !== "undefined") {
  const { data } = supabase.auth.onAuthStateChange((_event, session) => {
    cachedSession = session ?? null;
    cachedAt = Date.now();
  });
  // It is okay if consumer never unsubscribes here since this is a module singleton
  // and we want it for the app lifetime.
  // data.subscription is intentionally not cleaned up.
}

