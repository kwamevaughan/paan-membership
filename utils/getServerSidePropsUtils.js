import { createSupabaseServerClient } from "@/lib/supabaseServer";

export async function withAuth(req, res, options = {}) {
  const { redirectTo = "/hr/login" } = options;
  console.log(
    `[withAuth] Starting session check at ${new Date().toISOString()}`
  );

  try {
    const supabaseServer = createSupabaseServerClient(req, res);

    // Check session
    const {
      data: { session },
      error: sessionError,
    } = await supabaseServer.auth.getSession();

    console.log("[withAuth] Session Response:", {
      session: session ? "present" : null,
      sessionError: sessionError ? sessionError.message : null,
    });

    if (sessionError || !session) {
      console.log("[withAuth] No valid Supabase session, redirecting to login");
      return {
        redirect: {
          destination: redirectTo,
          permanent: false,
        },
      };
    }

    // Verify user is in hr_users
    const { data: hrUser, error: hrUserError } = await supabaseServer
      .from("hr_users")
      .select("id")
      .eq("id", session.user.id)
      .single();

    console.log("[withAuth] HR User Check:", {
      hrUser,
      hrUserError: hrUserError ? hrUserError.message : null,
    });

    if (hrUserError || !hrUser) {
      console.error(
        "[withAuth] HR User Error:",
        hrUserError?.message || "User not in hr_users"
      );
      await supabaseServer.auth.signOut();
      return {
        redirect: {
          destination: redirectTo,
          permanent: false,
        },
      };
    }

    return { session, supabaseServer };
  } catch (error) {
    console.error("[withAuth] Error:", error.message);
    return {
      redirect: {
        destination: redirectTo,
        permanent: false,
      },
    };
  }
}

export async function getAdminBusinessOpportunitiesProps({ req, res }) {
  console.log(
    "[getAdminBusinessOpportunitiesProps] Starting at",
    new Date().toISOString()
  );

  // Authenticate and authorize
  const authResult = await withAuth(req, res);
  if (authResult.redirect) {
    return authResult;
  }

  const { supabaseServer } = authResult;

  try {
    // Fetch tiers
    const { data: tiersData, error: tiersError } = await supabaseServer
      .from("candidates")
      .select("selected_tier")
      .neq("selected_tier", null);

    if (tiersError) {
      console.error(
        "[getAdminBusinessOpportunitiesProps] Tiers Error:",
        tiersError.message
      );
      throw new Error(`Failed to fetch tiers: ${tiersError.message}`);
    }

    // Get unique, sorted tiers
    const tiers = [
      ...new Set(
        tiersData
          .map((item) => item.selected_tier)
          .filter(
            (tier) => tier && typeof tier === "string" && tier.trim() !== ""
          )
      ),
    ].sort();


    return {
      props: {
        tiers,
        breadcrumbs: [
          { label: "Dashboard", href: "/admin" },
          { label: "Business Opportunities" },
        ],
      },
    };
  } catch (error) {
    console.error("[getAdminBusinessOpportunitiesProps] Error:", error.message);
    return {
      redirect: {
        destination: "/hr/login",
        permanent: false,
      },
    };
  }
}

export async function getAdminUpdatesProps({ req, res }) {
  console.log("[getAdminUpdatesProps] Starting at", new Date().toISOString());

  // Authenticate and authorize
  const authResult = await withAuth(req, res);
  if (authResult.redirect) {
    return authResult;
  }

  const { supabaseServer } = authResult;

  try {
    // Fetch updates
    const { data: updatesData, error: updatesError } = await supabaseServer
      .from("updates")
      .select(
        "id, title, description, category, cta_text, cta_url, tier_restriction, tags, created_at, updated_at"
      )
      .order("created_at", { ascending: false });

    if (updatesError) {
      console.error(
        "[getAdminUpdatesProps] Updates Error:",
        updatesError.message
      );
      throw new Error(`Failed to fetch updates: ${updatesError.message}`);
    }


    return {
      props: {
        initialUpdates: updatesData || [],
        breadcrumbs: [
          { label: "Dashboard", href: "/admin" },
          { label: "Updates" },
        ],
      },
    };
  } catch (error) {
    console.error("[getAdminUpdatesProps] Error:", error.message);
    return {
      redirect: {
        destination: "/hr/login",
        permanent: false,
      },
    };
  }
}
