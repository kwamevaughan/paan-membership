import { createSupabaseServerClient } from "@/lib/supabaseServer";
import { fetchHRData } from "utils/hrData";

// Common error handler for database operations
const handleDBError = (error, context) => {
  console.error(`[${context}] Error:`, error.message);
  return {
    redirect: {
      destination: "/hr/login",
      permanent: false,
    },
  };
};

// Common props structure with breadcrumbs
const createProps = (data, breadcrumbs) => ({
  props: {
    ...data,
    breadcrumbs: breadcrumbs || [
      { label: "Dashboard", href: "/admin" },
      { label: "Overview" },
    ],
  },
});

// Common function to fetch HR user data
const fetchHRUser = async (supabaseServer, userId) => {
  const { data: hrUser, error: hrUserError } = await supabaseServer
    .from("hr_users")
    .select("id, name")
    .eq("id", userId)
    .single();

  if (hrUserError || !hrUser) {
    throw new Error(hrUserError?.message || "User not in hr_users");
  }

  return hrUser;
};

// Common function to fetch candidates map
const fetchCandidatesMap = async (supabaseServer) => {
  const { data: candidatesData, error: candidatesError } = await supabaseServer
    .from("candidates")
    .select("id, auth_user_id, primaryContactName");

  if (candidatesError) {
    throw new Error(`Failed to fetch candidates: ${candidatesError.message}`);
  }

  return candidatesData.reduce((acc, candidate) => {
    if (candidate.auth_user_id) {
      acc[candidate.auth_user_id] = candidate.primaryContactName || "Unknown";
    }
    return acc;
  }, {});
};

// Common function to fetch tiers
const fetchTiers = async (supabaseServer) => {
  const { data: tiers, error: tiersError } = await supabaseServer
    .from("tiers")
    .select("*")
    .order("id");

  if (tiersError) {
    throw new Error(`Failed to fetch tiers: ${tiersError.message}`);
  }

  return tiers || [];
};

export async function withAuth(req, res, options = {}) {
  const { redirectTo = "/hr/login" } = options;
  console.log(
    `[withAuth] Starting session check at ${new Date().toISOString()}`
  );

  try {
    const supabaseServer = createSupabaseServerClient(req, res);

    const {
      data: { session },
      error: sessionError,
    } = await supabaseServer.auth.getSession();

    if (sessionError || !session) {
      return {
        redirect: {
          destination: redirectTo,
          permanent: false,
        },
      };
    }

    const hrUser = await fetchHRUser(supabaseServer, session.user.id);
    return { session, supabaseServer, hrUser };
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

export async function getHROverviewProps({ req, res }) {
  console.log("[getHROverviewProps] Starting at", new Date().toISOString());

  try {
    const authResult = await withAuth(req, res);
    if (authResult.redirect) return authResult;

    const { supabaseServer, hrUser } = authResult;

    console.time("fetchHRData");
    const data = await fetchHRData({
      supabaseClient: supabaseServer,
      fetchCandidates: true,
      fetchQuestions: true,
    });
    console.timeEnd("fetchHRData");

    return createProps({
      initialCandidates: data.initialCandidates || [],
      initialJobOpenings: data.initialJobOpenings || [],
      initialQuestions: data.initialQuestions || [],
      userName: hrUser.name,
    });
  } catch (error) {
    return handleDBError(error, "getHROverviewProps");
  }
}

export async function getAdminBusinessOpportunitiesProps({ req, res }) {
  console.log("[getAdminBusinessOpportunitiesProps] Starting at", new Date().toISOString());

  try {
    const authResult = await withAuth(req, res);
    if (authResult.redirect) return authResult;

    // Define the available tiers
    const tiers = ["Gold Member", "Full Member", "Associate Member", "Free Member"];

    return createProps(
      { tiers },
      [
        { label: "Dashboard", href: "/admin" },
        { label: "Business Opportunities" },
      ]
    );
  } catch (error) {
    return handleDBError(error, "getAdminBusinessOpportunitiesProps");
  }
}

export async function getAdminBusinessUpdatesProps({ req, res }) {
  console.log("[getAdminBusinessUpdatesProps] Starting at", new Date().toISOString());

  try {
    const authResult = await withAuth(req, res);
    if (authResult.redirect) return authResult;

    const { supabaseServer } = authResult;

    const { data: updatesData, error: updatesError } = await supabaseServer
      .from("updates")
      .select(
        "id, title, description, category, cta_text, cta_url, tier_restriction, tags, created_at, updated_at"
      )
      .order("created_at", { ascending: false });

    if (updatesError) {
      throw new Error(`Failed to fetch updates: ${updatesError.message}`);
    }

    return createProps(
      { initialUpdates: updatesData || [] },
      [
        { label: "Dashboard", href: "/admin" },
        { label: "Updates" },
      ]
    );
  } catch (error) {
    return handleDBError(error, "getAdminBusinessUpdatesProps");
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

    return createProps({
      initialQuestions: questions || [],
      job_type: normalizedJobType,
      opening: query.opening ? decodeURIComponent(query.opening) : "",
      opening_id: query.opening_id ? decodeURIComponent(query.opening_id) : "",
    });
  } catch (error) {
    return handleDBError(error, "getInterviewPageProps");
  }
}

export async function getAgenciesPageStaticProps() {
  console.log("[getAgenciesPageStaticProps] Starting at", new Date().toISOString());

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
      revalidate: 600,
    };
  } catch (error) {
    return handleDBError(error, "getAgenciesPageStaticProps");
  }
}

export async function getFreelancersPageStaticProps() {
  console.log("[getFreelancersPageStaticProps] Starting at", new Date().toISOString());

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
      revalidate: 600,
    };
  } catch (error) {
    return handleDBError(error, "getFreelancersPageStaticProps");
  }
}

export async function getInterviewQuestionsProps({ req, res }) {
  console.log("[getInterviewQuestionsProps] Starting at", new Date().toISOString());

  try {
    const authResult = await withAuth(req, res);
    if (authResult.redirect) return authResult;

    const { supabaseServer } = authResult;

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

    return createProps(
      {
        initialQuestions: questions || [],
        initialCategories: categories || [],
      },
      [
        { label: "Dashboard", href: "/admin" },
        { label: "Interview Questions" },
      ]
    );
  } catch (error) {
    return handleDBError(error, "getInterviewQuestionsProps");
  }
}

export async function getApplicantsProps({ req, res }) {
  console.log("[getApplicantsProps] Starting at", new Date().toISOString());

  try {
    const authResult = await withAuth(req, res);
    if (authResult.redirect) return authResult;

    const { supabaseServer } = authResult;

    console.time("fetchHRData");
    const data = await fetchHRData({
      supabaseClient: supabaseServer,
      fetchCandidates: true,
      fetchQuestions: true,
    });
    console.timeEnd("fetchHRData");

    return createProps(
      {
        initialCandidates: data.initialCandidates || [],
        initialQuestions: data.initialQuestions || [],
      },
      [
        { label: "Dashboard", href: "/admin" },
        { label: "Applicants" },
      ]
    );
  } catch (error) {
    return handleDBError(error, "getApplicantsProps");
  }
}

export async function getAdminMarketIntelProps({ req, res }) {
  console.log("[getAdminMarketIntelProps] Starting at", new Date().toISOString());

  try {
    const authResult = await withAuth(req, res);
    if (authResult.redirect) return authResult;

    const { supabaseServer } = authResult;
    const candidatesMap = await fetchCandidatesMap(supabaseServer);

    return createProps(
      { initialCandidates: candidatesMap },
      [
        { label: "HR Dashboard", href: "/hr/dashboard" },
        { label: "Market Intel" },
      ]
    );
  } catch (error) {
    return handleDBError(error, "getAdminMarketIntelProps");
  }
}

export async function getAdminBlogProps({ req, res }) {
  console.log("[getAdminBlogProps] Starting at", new Date().toISOString());

  try {
    const authResult = await withAuth(req, res);
    if (authResult.redirect) return authResult;

    const { supabaseServer, hrUser } = authResult;

    const { data: blogs, error: blogsError } = await supabaseServer
      .from("blogs")
      .select(`
        *,
        author_details:hr_users(name, username),
        category:blog_categories(name),
        tags:blog_post_tags(
          tag:blog_tags(name)
        )
      `)
      .order("created_at", { ascending: false });

    if (blogsError) throw blogsError;

    const transformedBlogs = blogs.map((blog) => ({
      ...blog,
      article_category: blog.category?.name || null,
      article_tags: blog.tags?.map((t) => t.tag.name) || [],
      author: blog.author_details?.name || blog.author_details?.username || "PAAN Admin"
    }));

    const { data: categoriesData, error: categoriesError } = await supabaseServer
      .from("blog_categories")
      .select("id, name, slug")
      .order("name");

    if (categoriesError) throw categoriesError;

    const { data: tagsData, error: tagsError } = await supabaseServer
      .from("blog_tags")
      .select("id, name, slug")
      .order("name");

    if (tagsError) throw tagsError;

    return createProps(
      {
        initialBlogs: transformedBlogs || [],
        categories: categoriesData || [],
        tags: tagsData || [],
        hrUser,
      },
      [
        { label: "Dashboard", href: "/admin" },
        { label: "Blog" },
      ]
    );
  } catch (error) {
    return handleDBError(error, "getAdminBlogProps");
  }
}

export async function getAdminEventsProps({ req, res }) {
  console.log("[getAdminEventsProps] Starting at", new Date().toISOString());

  try {
    const authResult = await withAuth(req, res, { redirectTo: "/hr/login" });
    if (authResult.redirect) return authResult;

    return createProps({});
  } catch (error) {
    return handleDBError(error, "getAdminEventsProps");
  }
}

export async function getAdminResourcesProps({ req, res }) {
  console.log("[getAdminResourcesProps] Starting at", new Date().toISOString());

  try {
    const authResult = await withAuth(req, res, { redirectTo: "/hr/login" });
    if (authResult.redirect) return authResult;

    return createProps({});
  } catch (error) {
    return handleDBError(error, "getAdminResourcesProps");
  }
}

export async function getAdminOffersProps({ req, res }) {
  console.log("[getAdminOffersProps] Starting at", new Date().toISOString());

  try {
    const authResult = await withAuth(req, res);
    if (authResult.redirect) return authResult;

    const { supabaseServer } = authResult;
    const candidatesMap = await fetchCandidatesMap(supabaseServer);

    return createProps(
      { initialCandidates: candidatesMap },
      [
        { label: "Dashboard", href: "/admin" },
        { label: "Offers" },
      ]
    );
  } catch (error) {
    return handleDBError(error, "getAdminOffersProps");
  }
}
