import { useState, useEffect, useCallback } from "react";
import toast from "react-hot-toast";
import { supabase } from "@/lib/supabase";
import debounce from "lodash/debounce";

export function useUpdates(initialUpdates = []) {
  const [updates, setUpdates] = useState(initialUpdates);
  const [formData, setFormData] = useState({
    id: null,
    title: "",
    description: "",
    category: "Governance",
    cta_text: "",
    cta_url: "",
    tier_restriction: "All",
    tags: "",
  });
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  // Debounced fetchUpdates
  const fetchUpdates = useCallback(async (query, category) => {
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

      let supabaseQuery = supabase
        .from("updates")
        .select(
          "id, title, description, category, cta_text, cta_url, tier_restriction, tags, created_at, updated_at"
        )
        .order("created_at", { ascending: false });

      if (category !== "All") {
        supabaseQuery = supabaseQuery.eq("category", category);
      }

      if (query) {
        supabaseQuery = supabaseQuery
          .ilike("title", `%${query}%`)
          .or(`description.ilike.%${query}%`);
      }

      const { data: updatesData, error: updatesError } = await supabaseQuery;
      if (updatesError) throw updatesError;

      console.log("[useUpdates] Fetched updates:", updatesData);
      setUpdates(updatesData || []);
    } catch (error) {
      console.error("[useUpdates] Error fetching updates:", error);
      toast.error("Failed to load updates");
      setUpdates([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Debounce the search handler
  const debouncedFetchUpdates = useCallback(
    debounce((query, category) => {
      fetchUpdates(query, category);
    }, 300),
    [fetchUpdates]
  );

  // Fetch updates when filters change
  useEffect(() => {
    debouncedFetchUpdates(searchQuery, selectedCategory);
  }, [searchQuery, selectedCategory, debouncedFetchUpdates]);

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Process tags input into an array
  const processTags = (tagsInput) => {
    if (!tagsInput) return [];
    return tagsInput
      .split(",")
      .map((tag) => tag.trim())
      .filter((tag) => tag.length > 0);
  };

  // Handle form submission
  const handleSubmit = async (e, handleCancel) => {
    e.preventDefault();
    try {
      setLoading(true);
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();
      if (userError || !user) throw new Error("User not authenticated");

      const {
        id,
        title,
        description,
        category,
        cta_text,
        cta_url,
        tier_restriction,
        tags,
      } = formData;
      if (!title || !category) {
        throw new Error("Title and category are required");
      }

      // Validate tier_restriction
      const validTiers = ["Founding", "Full", "Associate", "All"];
      if (!validTiers.includes(tier_restriction)) {
        throw new Error(
          `Invalid tier_restriction. Must be one of: ${validTiers.join(", ")}`
        );
      }

      // Process tags
      const tagsArray = processTags(tags);

      if (id) {
        // Update existing update
        const { error: updateError } = await supabase
          .from("updates")
          .update({
            title,
            description,
            category,
            cta_text: cta_text || null,
            cta_url: cta_url || null,
            tier_restriction,
            tags: tagsArray,
            updated_at: new Date().toISOString(),
          })
          .eq("id", id);
        if (updateError) throw updateError;
        toast.success("Update modified!");
        setUpdates((prev) =>
          prev.map((update) =>
            update.id === id
              ? {
                  ...update,
                  title,
                  description,
                  category,
                  cta_text,
                  cta_url,
                  tier_restriction,
                  tags: tagsArray,
                  updated_at: new Date().toISOString(),
                }
              : update
          )
        );
      } else {
        // Create new update
        const { data: newUpdate, error: insertError } = await supabase
          .from("updates")
          .insert([
            {
              title,
              description,
              category,
              cta_text: cta_text || null,
              cta_url: cta_url || null,
              tier_restriction,
              tags: tagsArray,
            },
          ])
          .select()
          .single();
        if (insertError) throw insertError;
        toast.success("Update created!");
        setUpdates((prev) => [newUpdate, ...prev]);
      }

      // Reset form and close it
      setFormData({
        id: null,
        title: "",
        description: "",
        category: "Governance",
        cta_text: "",
        cta_url: "",
        tier_restriction: "All",
        tags: "",
      });
      handleCancel(); // Close the form
    } catch (error) {
      console.error("[useUpdates] Error submitting update:", error);
      toast.error(error.message || "Failed to save update");
    } finally {
      setLoading(false);
    }
  };

  // Handle edit
  const handleEdit = (update) => {
    setFormData({
      id: update.id,
      title: update.title,
      description: update.description || "",
      category: update.category,
      cta_text: update.cta_text || "",
      cta_url: update.cta_url || "",
      tier_restriction: update.tier_restriction || "All",
      tags: Array.isArray(update.tags) ? update.tags.join(", ") : "",
    });
  };

  // Handle delete
  const handleDelete = async (updateId) => {
    try {
      setLoading(true);
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();
      if (userError || !user) throw new Error("User not authenticated");

      const { error: deleteError } = await supabase
        .from("updates")
        .delete()
        .eq("id", updateId);
      if (deleteError) throw deleteError;

      setUpdates((prev) => prev.filter((update) => update.id !== updateId));
      toast.success("Update deleted!");
    } catch (error) {
      console.error("[useUpdates] Error deleting update:", error);
      toast.error("Failed to delete update");
    } finally {
      setLoading(false);
    }
  };

  // Handle search
  const handleSearch = (query) => {
    setSearchQuery(query);
  };

  // Handle category filter
  const handleCategoryFilter = (category) => {
    setSelectedCategory(category);
  };

  return {
    updates,
    formData,
    loading,
    handleInputChange,
    handleSubmit,
    handleEdit,
    handleDelete,
    handleSearch,
    handleCategoryFilter,
    selectedCategory,
    searchQuery,
  };
}
