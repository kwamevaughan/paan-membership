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
    attachment_url: "",
    attachment_name: "",
    attachment_type: "",
    attachment_size: null,
    is_tender: false,
    tender_organization: "",
    tender_category: "",
    tender_issued: "",
    tender_closing: "",
    tender_access_link: "",
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
            "id, title, description, location, deadline, tier_restriction, service_type, industry, project_type, application_link, job_type, skills_required, estimated_duration, budget_range, remote_work, attachment_url, attachment_name, attachment_type, attachment_size, is_tender, tender_organization, tender_category, tender_issued, tender_closing, tender_access_link, created_at, updated_at"
          )
          .order("created_at", { ascending: false });

      if (opportunitiesError) throw opportunitiesError;
      console.log("[useOpportunities] Opportunities fetched:", opportunitiesData?.length || 0);

      setOpportunities(opportunitiesData || []);
    } catch (error) {
      console.error("[useOpportunities] Error fetching opportunities:", error);
      toast.error(`Error fetching opportunities: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    console.log("[useOpportunities] handleInputChange:", { name, value, type, checked });
    setFormData((prev) => {
      const newData = {
        ...prev,
        [name]: type === "checkbox" ? checked : value,
      };
      console.log("[useOpportunities] Updated form data:", newData);
      return newData;
    });
  };

  const handleSubmit = async (e, id = null) => {
    e.preventDefault();
    try {
      setLoading(true);
      console.log("[useOpportunities] Starting form submission...");

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

      // Tender validation
      if (formData.is_tender) {
        const requiredFields = [
          { field: 'tender_organization', name: 'Organization' },
          { field: 'tender_category', name: 'Category' },
          { field: 'tender_issued', name: 'Issued Date' },
          { field: 'tender_closing', name: 'Closing Date' },
          { field: 'tender_access_link', name: 'Access Link' }
        ];
        
        const missingFields = requiredFields.filter(({ field }) => {
          const value = formData[field];
          // For date fields, check if they have a value
          if (field === 'tender_issued' || field === 'tender_closing') {
            return !value || value === '';
          }
          // For text fields, check if they have a value after trimming
          return !value || (typeof value === 'string' && value.trim() === '');
        });
        
        if (missingFields.length > 0) {
          const fieldNames = missingFields.map(({ name }) => name).join(', ');
          throw new Error(`The following tender fields are required: ${fieldNames}`);
        }
      }

      const job_type = formData.job_type;

      // Debug logging
      console.log("[useOpportunities] Form data before payload:", {
        is_tender: formData.is_tender,
        tender_issued: formData.tender_issued,
        tender_closing: formData.tender_closing,
        tender_organization: formData.tender_organization,
        tender_category: formData.tender_category,
        tender_access_link: formData.tender_access_link
      });

      // Additional debugging for date fields
      console.log("[useOpportunities] Date field debugging:", {
        tender_issued_type: typeof formData.tender_issued,
        tender_issued_value: formData.tender_issued,
        tender_issued_empty: formData.tender_issued === '',
        tender_closing_type: typeof formData.tender_closing,
        tender_closing_value: formData.tender_closing,
        tender_closing_empty: formData.tender_closing === '',
      });

      const allowedIndustries = ["Tech", "Education", "Retail", "Health"];
      const allowedServiceTypes = ["Marketing", "Communications", "Tech", "Design"];

      const safeIndustry =
        allowedIndustries.includes(formData.industry) ? formData.industry : allowedIndustries[0];

      const safeServiceType =
        allowedServiceTypes.includes(formData.service_type) ? formData.service_type : allowedServiceTypes[0];

      const payload = {
        title: formData.is_tender 
          ? (formData.tender_organization ? formData.tender_organization : "Tender Opportunity")
          : (typeof formData.title === "string" ? formData.title : ""),
        description: typeof formData.description === "string" ? formData.description : "",
        location: formData.location || null,
        deadline:
          formData.is_tender
            ? (formData.tender_closing && formData.tender_closing !== '' ? formData.tender_closing : null)
            : (formData.deadline && formData.deadline !== '' ? formData.deadline : null),
        tier_restriction: formData.tier_restriction || null,
        service_type: job_type === "Agency" ? safeServiceType : null,
        industry: job_type === "Agency" ? safeIndustry : null,
        project_type: formData.project_type || null,
        application_link: formData.application_link || null,
        job_type: formData.job_type,
        skills_required: job_type === "Freelancer" ? formData.skills_required : [],
        estimated_duration: job_type === "Freelancer" ? formData.estimated_duration || null : null,
        budget_range: job_type === "Freelancer" ? formData.budget_range || null : null,
        remote_work: job_type === "Freelancer" ? formData.remote_work : false,
        attachment_url: formData.attachment_url || null,
        attachment_name: formData.attachment_name || null,
        attachment_type: formData.attachment_type || null,
        attachment_size: formData.attachment_size || null,
        is_tender: formData.is_tender || false,
        tender_organization: formData.is_tender ? (formData.tender_organization && formData.tender_organization.trim() !== '' ? formData.tender_organization.trim() : null) : null,
        tender_category: formData.is_tender ? (formData.tender_category && formData.tender_category.trim() !== '' ? formData.tender_category.trim() : null) : null,
        tender_issued: formData.is_tender ? (formData.tender_issued && formData.tender_issued !== '' ? formData.tender_issued : null) : null,
        tender_closing: formData.is_tender ? (formData.tender_closing && formData.tender_closing !== '' ? formData.tender_closing : null) : null,
        tender_access_link: formData.is_tender ? (formData.tender_access_link && formData.tender_access_link.trim() !== '' ? formData.tender_access_link.trim() : null) : null,
      };

      // Debug logging
      console.log("[useOpportunities] Payload being sent:", payload);

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
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (opp) => {
    console.log("[useOpportunities] handleEdit called with:", opp);
    
    // Determine if this is actually a tender opportunity by checking tender fields
    const isActuallyTender = opp.is_tender || 
      (opp.tender_organization && opp.tender_category && opp.tender_issued && opp.tender_closing);
    
    console.log("[useOpportunities] Detected as tender:", isActuallyTender, "based on:", {
      is_tender: opp.is_tender,
      has_organization: !!opp.tender_organization,
      has_category: !!opp.tender_category,
      has_issued: !!opp.tender_issued,
      has_closing: !!opp.tender_closing
    });
    
    const editData = {
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
      attachment_url: opp.attachment_url || "",
      attachment_name: opp.attachment_name || "",
      attachment_type: opp.attachment_type || "",
      attachment_size: opp.attachment_size || null,
      is_tender: isActuallyTender,
      tender_organization: opp.tender_organization || "",
      tender_category: opp.tender_category || "",
      tender_issued: opp.tender_issued
        ? new Date(opp.tender_issued).toISOString().split("T")[0]
        : "",
      tender_closing: opp.tender_closing
        ? new Date(opp.tender_closing).toISOString().split("T")[0]
        : "",
      tender_access_link: opp.tender_access_link || "",
    };
    console.log("[useOpportunities] Setting form data to:", editData);
    setFormData(editData);
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
      attachment_url: "",
      attachment_name: "",
      attachment_type: "",
      attachment_size: null,
      is_tender: false,
      tender_organization: "",
      tender_category: "",
      tender_issued: "",
      tender_closing: "",
      tender_access_link: "",
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
