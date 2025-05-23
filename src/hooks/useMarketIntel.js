import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { supabase } from "@/lib/supabase";

export function useMarketIntel(candidatesMap = {}) {
  const [marketIntel, setMarketIntel] = useState([]);
  const [formData, setFormData] = useState({
    id: null,
    title: "",
    description: "",
    tier_restriction: "All",
    url: "",
    icon_url: "",
    region: "Global",
    type: "Report",
    downloadable: false,
    chart_data: "",
    file_path: "",
  });
  const [loading, setLoading] = useState(false);
  const [sortBy, setSortBy] = useState({
    field: "created_at",
    direction: "desc",
  });
  const [filters, setFilters] = useState({
    tier: "All",
    region: "All",
    type: "All",
    downloadable: "All",
    search: "",
  });

  const fetchMarketIntel = async () => {
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

      let query = supabase
        .from("market_intel")
        .select(
          "id, title, description, tier_restriction, url, icon_url, created_at, updated_at, region, type, downloadable, chart_data, file_path"
        );

      // Apply filters
      if (filters.tier !== "All")
        query = query.eq("tier_restriction", filters.tier);
      if (filters.region !== "All") query = query.eq("region", filters.region);
      if (filters.type !== "All") query = query.eq("type", filters.type);
      if (filters.downloadable !== "All")
        query = query.eq("downloadable", filters.downloadable === "Yes");
      if (filters.search) {
        query = query.or(
          `title.ilike.%${filters.search}%,description.ilike.%${filters.search}%`
        );
      }

      // Apply sorting
      query = query.order(sortBy.field, {
        ascending: sortBy.direction === "asc",
      });

      const { data: marketIntelData, error: marketIntelError } = await query;
      if (marketIntelError)
        throw new Error(
          `Failed to fetch market intel: ${marketIntelError.message}`
        );

      const { data: feedbackData, error: feedbackError } = await supabase
        .from("market_intel_feedback")
        .select("id, market_intel_id, user_id, rating, comment, created_at");
      if (feedbackError)
        throw new Error(`Failed to fetch feedback: ${feedbackError.message}`);

      const feedbackByIntel = feedbackData.reduce((acc, fb) => {
        acc[fb.market_intel_id] = acc[fb.market_intel_id] || [];
        acc[fb.market_intel_id].push({
          ...fb,
          primaryContactName: candidatesMap[fb.user_id] || "Unknown",
        });
        return acc;
      }, {});

      const enrichedMarketIntel = marketIntelData.map((intel) => {
        const feedback = feedbackByIntel[intel.id] || [];
        const averageRating =
          feedback.length > 0
            ? feedback.reduce((sum, fb) => sum + (fb.rating || 0), 0) /
              feedback.length
            : 0;
        return {
          ...intel,
          averageRating: Number(averageRating) || 0,
          feedbackCount: feedback.length,
          feedback,
        };
      });

      setMarketIntel(enrichedMarketIntel);
    } catch (err) {
      console.error("[useMarketIntel] Error:", err.message);
      toast.error("Failed to load market intel");
      setMarketIntel([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMarketIntel();

    // Real-time subscriptions
    const marketIntelSubscription = supabase
      .channel("market_intel")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "market_intel" },
        () => fetchMarketIntel()
      )
      .subscribe();

    const feedbackSubscription = supabase
      .channel("market_intel_feedback")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "market_intel_feedback" },
        () => fetchMarketIntel()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(marketIntelSubscription);
      supabase.removeChannel(feedbackSubscription);
    };
  }, [sortBy, filters]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e, selectedFile = null) => {
    e.preventDefault();
    if (!formData.title) {
      toast.error("Title is required");
      return;
    }
    setLoading(true);

    try {
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

      let filePath = formData.file_path;

      if (selectedFile) {
        const fileName = `${Date.now()}_${selectedFile.name}`;
        const { error: uploadError } = await supabase.storage
          .from("market-intel")
          .upload(fileName, selectedFile);
        if (uploadError)
          throw new Error(`File upload failed: ${uploadError.message}`);
        if (formData.id && formData.file_path) {
          await supabase.storage
            .from("market-intel")
            .remove([formData.file_path]);
        }
        filePath = fileName;
      }

      const intelData = {
        title: formData.title,
        description: formData.description,
        tier_restriction: formData.tier_restriction,
        url: formData.url || null,
        icon_url: formData.icon_url || null,
        region: formData.region,
        type: formData.type,
        downloadable: formData.downloadable,
        chart_data: formData.chart_data || null,
        file_path: filePath || null,
      };

      if (formData.id) {
        const { error: updateError } = await supabase
          .from("market_intel")
          .update(intelData)
          .eq("id", formData.id);
        if (updateError)
          throw new Error(`Update failed: ${updateError.message}`);
        toast.success("Market intel updated successfully");
        setMarketIntel((prev) =>
          prev.map((intel) =>
            intel.id === formData.id ? { ...intel, ...intelData } : intel
          )
        );
      } else {
        const { data, error: insertError } = await supabase
          .from("market_intel")
          .insert(intelData)
          .select()
          .single();
        if (insertError)
          throw new Error(`Insert failed: ${insertError.message}`);
        toast.success("Market intel created successfully");
        setMarketIntel((prev) => [
          {
            ...data,
            averageRating: 0,
            feedbackCount: 0,
            feedback: [],
          },
          ...prev,
        ]);
      }

      resetForm();
    } catch (err) {
      console.error("[useMarketIntel] Submit error:", err.message);
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (intel) => {
    setFormData({
      id: intel.id,
      title: intel.title,
      description: intel.description || "",
      tier_restriction: intel.tier_restriction,
      url: intel.url || "",
      icon_url: intel.icon_url || "",
      region: intel.region || "Global",
      type: intel.type || "Report",
      downloadable: intel.downloadable || false,
      chart_data: intel.chart_data || "",
      file_path: intel.file_path || "",
    });
  };

  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this market intel entry?"
    );
    if (!confirmed) return;

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

      const marketIntelItem = marketIntel.find((r) => r.id === id);
      if (marketIntelItem?.file_path) {
        await supabase.storage
          .from("market-intel")
          .remove([marketIntelItem.file_path]);
      }

      const { error } = await supabase
        .from("market_intel")
        .delete()
        .eq("id", id);
      if (error) throw new Error(`Delete failed: ${error.message}`);

      toast.success("Market intel deleted successfully");
      setMarketIntel((prev) => prev.filter((intel) => intel.id !== id));
    } catch (err) {
      console.error("[useMarketIntel] Delete error:", err.message);
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      id: null,
      title: "",
      description: "",
      tier_restriction: "All",
      url: "",
      icon_url: "",
      region: "Global",
      type: "Report",
      downloadable: false,
      chart_data: "",
      file_path: "",
    });
  };

  const updateSort = (field) => {
    setSortBy((prev) => ({
      field,
      direction:
        prev.field === field && prev.direction === "asc" ? "desc" : "asc",
    }));
  };

  const updateFilters = (newFilters) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
  };

  const getPDFUrl = async (filePath) => {
    if (!filePath) return null;
    try {
      const { data } = await supabase.storage
        .from("market-intel")
        .createSignedUrl(filePath, 3600);
      return data?.signedUrl || null;
    } catch (error) {
      console.error("[useMarketIntel] Error getting PDF URL:", error);
      return null;
    }
  };

  return {
    marketIntel,
    formData,
    loading,
    sortBy,
    filters,
    handleInputChange,
    handleSubmit,
    handleEdit,
    handleDelete,
    resetForm,
    updateSort,
    updateFilters,
    getPDFUrl,
  };
}
