// lib/supabase.js
import { createPagesBrowserClient } from "@supabase/auth-helpers-nextjs";

const supabase = createPagesBrowserClient();

console.log(
  "[supabase] Client initialized with cookie name:",
  "sb-" + process.env.NEXT_PUBLIC_SUPABASE_PROJECT_ID + "-auth-token"
);

export { supabase };
