import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { supabase } from "@/lib/supabase";

export const useOpportunities = () => {
  const [opportunities, setOpportunities] = useState([]);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    location: "",
    deadline: "",
    tier_restriction: "",
    service_type: "",
    industry: "",
    project_type: "",
    application_link: "",
    job_type: "Agency",
    skills_required: [],
    estimated_duration: "",
    budget_range: "",
    remote_work: false,
  });
  const [loading, setLoading] = useState(false);

  const fetchOpportunities = async () => {
    try {
      setLoading(true);
      console.log("[useOpportunities] Starting to fetch opportunities...");
      
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();
      if (userError || !user) throw new Error("User not authenticated");
      console.log("[useOpportunities] User authenticated:", user.id);

      const { data: hrUser, error: hrError } = await supabase
        .from("hr_users")
        .select("id")
        .eq("id", user.id)
        .single();
      if (hrError || !hrUser) throw new Error("User not authorized");
      console.log("[useOpportunities] HR user authorized:", hrUser.id);

      const { data: opportunitiesData, error: opportunitiesError } =
        await supabase
          .from("business_opportunities")
          .select(
            "id, title, description, location, deadline, tier_restriction, service_type, industry, project_type, application_link, job_type, skills_required, estimated_duration, budget_range, remote_work, created_at, updated_at"
          )
          .order("created_at", { ascending: false });

      if (opportunitiesError) throw opportunitiesError;
      console.log("[useOpportunities] Opportunities fetched:", opportunitiesData?.length || 0);

      setOpportunities(opportunitiesData || []);
    } catch (error) {
      console.error("[useOpportunities] Error fetching opportunities:", error);
      toast.error("Failed to load opportunities");
      setOpportunities([]);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e, id) => {
    e.preventDefault();
    try {
      if (!supabase) throw new Error("Supabase client is not initialized");
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();
      if (userError || !user) throw new Error("User not authenticated");

      const { data: hrUser, error: hrError } = await supabase
        .from("hr_users")
        .select("id")
        .eq("id", user.id)
        .single();
      if (hrError || !hrUser) throw new Error("User not authorized");

      // Validate formData
      const { title, deadline, job_type } = formData;
      if (!title || !deadline || !job_type) {
        throw new Error("Title, deadline, and job type are required");
      }

      // Validate deadline format
      if (isNaN(Date.parse(deadline))) {
        throw new Error("Invalid deadline format");
      }

      // Validate application_link if provided
      if (
        formData.application_link &&
        !formData.application_link.startsWith("http")
      ) {
        throw new Error("Application link must be a valid URL");
      }

      // Conditional validation for Agency
      if (job_type === "Agency") {
        if (!formData.tier_restriction) {
          throw new Error(
            "Membership tier is required for Agency opportunities"
          );
        }
        if (!formData.service_type || !formData.industry) {
          throw new Error(
            "Service type and industry are required for Agency opportunities"
          );
        }
      }

      const payload = {
        title: formData.title,
        description: formData.description || null,
        location: formData.location || null,
        deadline: formData.deadline,
        tier_restriction:
          job_type === "Agency" ? formData.tier_restriction : null,
        service_type: job_type === "Agency" ? formData.service_type : null,
        industry: job_type === "Agency" ? formData.industry : null,
        project_type: formData.project_type || null,
        application_link: formData.application_link || null,
        job_type: formData.job_type,
        skills_required:
          job_type === "Freelancer" ? formData.skills_required : [],
        estimated_duration:
          job_type === "Freelancer"
            ? formData.estimated_duration || null
            : null,
        budget_range:
          job_type === "Freelancer" ? formData.budget_range || null : null,
        remote_work: job_type === "Freelancer" ? formData.remote_work : false,
      };

      if (id) {
        // Update existing opportunity
        const { error } = await supabase
          .from("business_opportunities")
          .update(payload)
          .eq("id", id);
        if (error) throw error;
        toast.success("Opportunity updated successfully!");
        setOpportunities((prev) =>
          prev.map((opp) => (opp.id === id ? { ...opp, ...payload } : opp))
        );
      } else {
        // Create new opportunity
        const { data, error } = await supabase
          .from("business_opportunities")
          .insert([payload])
          .select()
          .single();
        if (error) throw error;
        toast.success("Opportunity created successfully!");
        setOpportunities((prev) => [...prev, data]);
      }
      resetForm();
    } catch (error) {
      console.error("[useOpportunities] Error in handleSubmit:", error);
      toast.error(`Error saving opportunity: ${error.message}`);
    }
  };

  const handleEdit = (opp) => {
    setFormData({
      title: opp.title || "",
      description: opp.description || "",
      location: opp.location || "",
      deadline: opp.deadline
        ? new Date(opp.deadline).toISOString().split("T")[0]
        : "",
      tier_restriction: opp.tier_restriction || "",
      service_type: opp.service_type || "",
      industry: opp.industry || "",
      project_type: opp.project_type || "",
      application_link: opp.application_link || "",
      job_type: opp.job_type || "Agency",
      skills_required: opp.skills_required || [],
      estimated_duration: opp.estimated_duration || "",
      budget_range: opp.budget_range || "",
      remote_work: opp.remote_work || false,
    });
  };

  const handleDelete = async (id) => {
    try {
      if (!supabase) throw new Error("Supabase client is not initialized");
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();
      if (userError || !user) throw new Error("User not authenticated");

      const { data: hrUser, error: hrError } = await supabase
        .from("hr_users")
        .select("id")
        .eq("id", user.id)
        .single();
      if (hrError || !hrUser) throw new Error("User not authorized");

      const { error } = await supabase
        .from("business_opportunities")
        .delete()
        .eq("id", id);
      if (error) throw error;
      toast.success("Opportunity deleted successfully!");
      setOpportunities((prev) => prev.filter((opp) => opp.id !== id));
    } catch (error) {
      console.error("[useOpportunities] Error in handleDelete:", error);
      toast.error(`Error deleting opportunity: ${error.message}`);
    }
  };

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      location: "",
      deadline: "",
      tier_restriction: "",
      service_type: "",
      industry: "",
      project_type: "",
      application_link: "",
      job_type: "Agency",
      skills_required: [],
      estimated_duration: "",
      budget_range: "",
      remote_work: false,
    });
  };

  // Fetch opportunities when the component mounts
  useEffect(() => {
    fetchOpportunities();
  }, []);

  // Real-time subscription for opportunities
  useEffect(() => {
    const opportunitiesSubscription = supabase
      .channel("business_opportunities")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "business_opportunities" },
        () => fetchOpportunities()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(opportunitiesSubscription);
    };
  }, []);

  return {
    opportunities,
    formData,
    loading,
    handleInputChange,
    handleSubmit,
    handleEdit,
    handleDelete,
    resetForm,
    fetchOpportunities,
  };
};
