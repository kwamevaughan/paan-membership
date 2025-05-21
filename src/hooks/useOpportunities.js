import { useState } from "react";
import toast from "react-hot-toast";
import { supabase } from "@/lib/supabase";

export const useOpportunities = (initialOpportunities) => {
  const [opportunities, setOpportunities] = useState(
    initialOpportunities || []
  );
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
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);

  console.log("[useOpportunities] Initialized:", {
    opportunities: opportunities?.length || 0,
    sampleOpportunities: opportunities?.slice(0, 2) || [],
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (!supabase) {
        throw new Error("Supabase client is not initialized");
      }
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

      if (isEditing) {
        const { error } = await supabase
          .from("business_opportunities")
          .update(formData)
          .eq("id", editingId);
        if (error) throw error;
        toast.success("Opportunity updated successfully!");
        setOpportunities((prev) =>
          prev.map((opp) =>
            opp.id === editingId ? { ...opp, ...formData } : opp
          )
        );
      } else {
        const { data, error } = await supabase
          .from("business_opportunities")
          .insert([formData])
          .select();
        if (error) throw error;
        toast.success("Opportunity created successfully!");
        setOpportunities((prev) => [...prev, data[0]]);
      }
      resetForm();
    } catch (error) {
      console.error("Error in handleSubmit:", error);
      toast.error("Error saving opportunity: " + error.message);
    }
  };

  const handleEdit = (opp) => {
    setFormData(opp);
    setIsEditing(true);
    setEditingId(opp.id);
  };

  const handleDelete = async (id) => {
    try {
      if (!supabase) {
        throw new Error("Supabase client is not initialized");
      }
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
      console.error("Error in handleDelete:", error);
      toast.error("Error deleting opportunity: " + error.message);
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
    setIsEditing(false);
    setEditingId(null);
  };

  return {
    opportunities,
    formData,
    isEditing,
    handleInputChange,
    handleSubmit,
    handleEdit,
    handleDelete,
  };
};
