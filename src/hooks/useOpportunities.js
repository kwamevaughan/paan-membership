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
    tier: "",
    service_type: "",
    industry: "",
    project_type: "",
    application_link: "",
  });
  const [loading, setLoading] = useState(false);

  const fetchOpportunities = async () => {
    try {
      setLoading(true);
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

      const { data: opportunitiesData, error: opportunitiesError } =
        await supabase
          .from("business_opportunities")
          .select(
            "id, title, description, location, deadline, tier, service_type, industry, project_type, application_link, created_at, updated_at"
          )
          .order("created_at", { ascending: false });

      if (opportunitiesError) throw opportunitiesError;

      console.log(
        "[useOpportunities] Fetched opportunities:",
        opportunitiesData
      );
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
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
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
      const { title, deadline, tier, application_link } = formData;
      if (!title || !deadline || !tier || !application_link) {
        throw new Error(
          "Title, deadline, tier, and application link are required"
        );
      }

      // Validate deadline format
      if (isNaN(Date.parse(deadline))) {
        throw new Error("Invalid deadline format");
      }

      // Validate application_link
      if (!application_link.startsWith("http")) {
        throw new Error("Application link must be a valid URL");
      }

      if (id) {
        // Update existing opportunity
        const { error } = await supabase
          .from("business_opportunities")
          .update(formData)
          .eq("id", id);
        if (error) throw error;
        toast.success("Opportunity updated successfully!");
        setOpportunities((prev) =>
          prev.map((opp) => (opp.id === id ? { ...opp, ...formData } : opp))
        );
      } else {
        // Create new opportunity
        const { data, error } = await supabase
          .from("business_opportunities")
          .insert([formData])
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
      tier: opp.tier || "",
      service_type: opp.service_type || "",
      industry: opp.industry || "",
      project_type: opp.project_type || "",
      application_link: opp.application_link || "",
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
      tier: "",
      service_type: "",
      industry: "",
      project_type: "",
      application_link: "",
    });
  };

  useEffect(() => {
    fetchOpportunities();

    // Real-time subscription for opportunities
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
