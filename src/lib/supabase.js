// lib/supabase.js
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// console.log("Supabase URL (client):", supabaseUrl);
// console.log("Supabase Anon Key (client):", supabaseKey);

if (!supabaseUrl || !supabaseKey) {
    throw new Error("Supabase configuration missing: Ensure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are set in .env.local");
}

export const supabase = createClient(supabaseUrl, supabaseKey);