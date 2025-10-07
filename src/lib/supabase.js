// lib/supabase.js
import { createPagesBrowserClient } from "@supabase/auth-helpers-nextjs";
import { createClient } from "@supabase/supabase-js";

const supabase = createPagesBrowserClient();

// Service role client for admin operations (server-side only)
const supabaseAdmin = typeof window === 'undefined' && process.env.SUPABASE_SERVICE_ROLE_KEY 
  ? createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )
  : null;

console.log(
  "[supabase] Client initialized with cookie name:",
  "sb-" + process.env.NEXT_PUBLIC_SUPABASE_PROJECT_ID + "-auth-token"
);

export { supabase, supabaseAdmin };
