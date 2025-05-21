import { createPagesServerClient } from "@supabase/auth-helpers-nextjs";

export function createSupabaseServerClient(req, res) {
  return createPagesServerClient({ req, res });
}
