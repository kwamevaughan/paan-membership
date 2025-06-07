import { createSupabaseServerClient } from "@/lib/supabaseServer";
import { fetchHRData } from "utils/hrData";

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

export async function getInterviewPageProps({ req, res, query }) {
  console.log("[getInterviewPageProps] Starting at", new Date().toISOString());

  const supabaseServer = createSupabaseServerClient(req, res);
  const decodedJobType = query.job_type
    ? decodeURIComponent(query.job_type).toLowerCase()
    : "freelancer";
  const normalizedJobType =
    decodedJobType === "agencies"
      ? "agency"
      : decodedJobType === "freelancers" || decodedJobType === "freelancer"
      ? "freelancer"
      : "freelancer";

  try {
    const { data: questions, error } = await supabaseServer
      .from("interview_questions")
      .select("*, max_answers")
      .order("id", { ascending: true });

    if (error) throw error;

    return {
      props: {
        initialQuestions: questions || [],
        job_type: normalizedJobType,
        opening: query.opening ? decodeURIComponent(query.opening) : "",
        opening_id: query.opening_id
          ? decodeURIComponent(query.opening_id)
          : "",
      },
    };
  } catch (error) {
    console.error("[getInterviewPageProps] Error fetching questions:", error);
    return {
      props: {
        initialQuestions: [],
        job_type: normalizedJobType,
        opening: query.opening ? decodeURIComponent(query.opening) : "",
        opening_id: query.opening_id
          ? decodeURIComponent(query.opening_id)
          : "",
      },
    };
  }
}

export async function getAgenciesPageStaticProps() {
  console.log(
    "[getAgenciesPageStaticProps] Starting at",
    new Date().toISOString()
  );

  const supabaseServer = createSupabaseServerClient();

  try {
    const { data, error } = await supabaseServer
      .from("job_openings")
      .select("id, title, job_type")
      .eq("job_type", "agencies")
      .gt("expires_on", new Date().toISOString());

    if (error) throw error;

    return {
      props: {
        initialOpenings: data || [],
      },
      revalidate: 600, // Revalidate every 10 minutes
    };
  } catch (error) {
    console.error(
      "[getAgenciesPageStaticProps] Error fetching openings:",
      error
    );
    return {
      props: {
        initialOpenings: [],
      },
      revalidate: 600,
    };
  }
}

export async function getFreelancersPageStaticProps() {
  console.log(
    "[getFreelancersPageStaticProps] Starting at",
    new Date().toISOString()
  );

  const supabaseServer = createSupabaseServerClient();

  try {
    const { data, error } = await supabaseServer
      .from("job_openings")
      .select("id, title, job_type")
      .eq("job_type", "freelancers")
      .gt("expires_on", new Date().toISOString());

    if (error) throw error;

    return {
      props: {
        initialOpenings: data || [],
      },
      revalidate: 600, // Revalidate every 10 minutes
    };
  } catch (error) {
    console.error(
      "[getFreelancersPageStaticProps] Error fetching openings:",
      error
    );
    return {
      props: {
        initialOpenings: [],
      },
      revalidate: 600,
    };
  }
}

export async function getInterviewQuestionsProps({ req, res }) {
  console.log("[getInterviewQuestionsProps] Starting at", new Date().toISOString());

  // Authenticate and authorize
  const authResult = await withAuth(req, res);
  if (authResult.redirect) {
    return authResult;
  }

  const { supabaseServer } = authResult;

  try {
    const { data: questions, error: questionsError } = await supabaseServer
      .from("interview_questions")
      .select(
        "id, text, description, options, is_multi_select, other_option_text, is_open_ended, is_country_select, order, category, max_answers, depends_on_question_id, depends_on_answer, max_words, skippable, text_input_option, text_input_max_answers, structured_answers, has_links, job_type, category:question_categories(name)"
      )
      .order("order", { ascending: true });

    if (questionsError) throw questionsError;

    const { data: categories, error: catError } = await supabaseServer
      .from("question_categories")
      .select("id, name, job_type, is_mandatory")
      .order("created_at", { ascending: false });

    if (catError) throw catError;

    return {
      props: {
        initialQuestions: questions || [],
        initialCategories: categories || [],
        breadcrumbs: [
          { label: "Dashboard", href: "/admin" },
          { label: "Interview Questions" },
        ],
      },
    };
  } catch (error) {
    console.error("[getInterviewQuestionsProps] Error:", error.message);
    return {
      redirect: {
        destination: "/hr/login",
        permanent: false,
      },
    };
  }
}

export async function getApplicantsProps({ req, res }) {
  console.log("[getApplicantsProps] Starting at", new Date().toISOString());

  // Authenticate and authorize
  const authResult = await withAuth(req, res);
  if (authResult.redirect) {
    return authResult;
  }

  const { supabaseServer } = authResult;

  try {
    console.time("fetchHRData");
    const data = await fetchHRData({
      supabaseClient: supabaseServer,
      fetchCandidates: true,
      fetchQuestions: true,
    });
    console.timeEnd("fetchHRData");

    return {
      props: {
        initialCandidates: data.initialCandidates || [],
        initialQuestions: data.initialQuestions || [],
        breadcrumbs: [
          { label: "Dashboard", href: "/admin" },
          { label: "Applicants" },
        ],
      },
    };
  } catch (error) {
    console.error("[getApplicantsProps] Error:", error.message);
    return {
      redirect: {
        destination: "/hr/login",
        permanent: false,
      },
    };
  }
}

export async function getAdminMarketIntelProps({ req, res }) {
  console.log("[getAdminMarketIntelProps] Starting at", new Date().toISOString());

  // Authenticate and authorize
  const authResult = await withAuth(req, res);
  if (authResult.redirect) {
    return authResult;
  }

  const { supabaseServer } = authResult;

  try {
    // Fetch candidates
    const { data: candidatesData, error: candidatesError } = await supabaseServer
      .from("candidates")
      .select("id, auth_user_id, primaryContactName");

    if (candidatesError) {
      console.error(
        "[getAdminMarketIntelProps] Candidates Error:",
        candidatesError.message
      );
      throw new Error(`Failed to fetch candidates: ${candidatesError.message}`);
    }

    const candidatesMap = candidatesData.reduce((acc, candidate) => {
      if (candidate.auth_user_id) {
        acc[candidate.auth_user_id] = candidate.primaryContactName || "Unknown";
      }
      return acc;
    }, {});

    return {
      props: {
        initialCandidates: candidatesMap,
        breadcrumbs: [
          { label: "HR Dashboard", href: "/hr/dashboard" },
          { label: "Market Intel" },
        ],
      },
    };
  } catch (error) {
    console.error("[getAdminMarketIntelProps] Error:", error.message);
    return {
      redirect: {
        destination: "/hr/login",
        permanent: false,
      },
    };
  }
}

export async function getAdminBlogProps({ req, res }) {
  console.log("[getAdminBlogProps] Starting at", new Date().toISOString());

  // Authenticate and authorize
  const authResult = await withAuth(req, res);
  if (authResult.redirect) {
    return authResult;
  }

  const { supabaseServer } = authResult;

  try {
    // Fetch blogs
    const { data: blogsData, error: blogsError } = await supabaseServer
      .from("blogs")
      .select("*")
      .order("created_at", { ascending: false });

    if (blogsError) {
      console.error(
        "[getAdminBlogProps] Blogs Error:",
        blogsError.message
      );
      throw new Error(`Failed to fetch blogs: ${blogsError.message}`);
    }

    // Get unique categories and tags
    const categories = [...new Set(blogsData.map(blog => blog.article_category))].filter(Boolean);
    const tags = [...new Set(blogsData.flatMap(blog => blog.article_tags || []))].filter(Boolean);

    return {
      props: {
        initialBlogs: blogsData || [],
        categories: ["All", ...categories],
        tags: tags,
        breadcrumbs: [
          { label: "Dashboard", href: "/admin" },
          { label: "Blog" },
        ],
      },
    };
  } catch (error) {
    console.error("[getAdminBlogProps] Error:", error.message);
    return {
      redirect: {
        destination: "/hr/login",
        permanent: false,
      },
    };
  }
}
