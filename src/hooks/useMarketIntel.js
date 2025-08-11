import { useState, useEffect, useCallback, useRef } from "react";
import { debounce } from "lodash";
import toast from "react-hot-toast";
import { supabase } from "@/lib/supabase";

export function useMarketIntel(candidatesMap = {}) {
  const [marketIntel, setMarketIntel] = useState([]);
  const [filteredIntel, setFilteredIntel] = useState([]);
  const [formData, setFormData] = useState({
    id: null,
    title: "",
    description: "",
    tier_restriction: "Associate Member",
    type: "Report",
    file: null,
    file_path: "",
  });
  const [loading, setLoading] = useState(false);
  const [sortBy, setSortBy] = useState("newest");
  const [filters, setFilters] = useState({
    tier: "All",
    type: "All",
    search: "",
  });

  const isFetching = useRef(false);
  const isInitialMount = useRef(true);

  const fetchMarketIntel = useCallback(async () => {
    if (isFetching.current) return;

    try {
      isFetching.current = true;
      setLoading(true);
      console.log("[useMarketIntel] Starting fetch...");

      // Get current user
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      console.log("[useMarketIntel] User auth check:", { user, userError });
      
      if (userError || !user) {
        console.error("[useMarketIntel] User not authenticated");
        toast.error("Please log in to view market intel");
        return;
      }

      // Check if user is an HR user
      const { data: hrUser, error: hrError } = await supabase
        .from("hr_users")
        .select("*")
        .eq("id", user.id)
        .single();

      console.log("[useMarketIntel] HR user check:", { hrUser, hrError });

      if (hrError) {
        console.error("[useMarketIntel] HR user check error:", hrError);
        toast.error("Error checking HR user status");
        return;
      }

      if (!hrUser) {
        console.error("[useMarketIntel] Not authorized as HR user");
        toast.error("You must be an HR user to view market intel");
        return;
      }

      let query = supabase
        .from("market_intel")
        .select("*")
        .order("created_at", { ascending: false });

      const { data, error } = await query;
      console.log("[useMarketIntel] Market intel query result:", { data, error });

      if (error) {
        console.error("[useMarketIntel] Error fetching data:", error);
        throw error;
      }

      if (!data || data.length === 0) {
        console.log("[useMarketIntel] No market intel data found");
        setMarketIntel([]);
        setFilteredIntel([]);
        return;
      }

      // Enrich market intel data with feedback
      const enrichedData = await Promise.all(
        data.map(async (intel) => {
          const { data: feedback } = await supabase
            .from("market_intel_feedback")
            .select("*")
            .eq("market_intel_id", intel.id);

          return {
            ...intel,
            feedback: feedback || [],
            feedback_count: feedback?.length || 0,
            average_rating:
              feedback?.reduce((acc, curr) => acc + curr.rating, 0) / (feedback?.length || 1) || 0,
          };
        })
      );

      setMarketIntel(enrichedData);
      setFilteredIntel(enrichedData);
    } catch (error) {
      console.error("[useMarketIntel] Error:", error);
      toast.error("Failed to load market intel");
      setMarketIntel([]);
      setFilteredIntel([]);
    } finally {
      setLoading(false);
      isFetching.current = false;
    }
  }, []);

  // Initial fetch
  useEffect(() => {
    fetchMarketIntel();
  }, [fetchMarketIntel]);

  // Filter data when filters change
  useEffect(() => {
    if (!marketIntel.length) return;

    const filtered = marketIntel.filter(intel => {
      const matchesTier = filters.tier === "All" || intel.tier_restriction === filters.tier;
      const matchesType = filters.type === "All" || intel.type === filters.type;
      
      const searchTerm = filters.search.toLowerCase();
      const matchesSearch = !searchTerm || 
        intel.title.toLowerCase().includes(searchTerm) ||
        intel.description.toLowerCase().includes(searchTerm);

      return matchesTier && matchesType && matchesSearch;
    });

    console.log('[useMarketIntel] Filtered data:', {
      totalItems: marketIntel.length,
      filteredItems: filtered.length,
      filters
    });

    setFilteredIntel(filtered);
  }, [filters, marketIntel]);

  // Update filters
  const updateFilters = useCallback((newFilters) => {
    console.log('[useMarketIntel] Updating filters:', {
      currentFilters: filters,
      newFilters
    });
    setFilters(prev => ({
      ...prev,
      ...newFilters
    }));
  }, [filters]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const resetForm = () => {
    setFormData({
      id: null,
      title: "",
      description: "",
      tier_restriction: "Associate Member",
      type: "Report",
      file: null,
      file_path: "",
    });
  };

  const handleEdit = async (intel) => {
    try {
      setFormData(intel);
      return true;
    } catch (error) {
      console.error("Error editing market intel:", error);
      toast.error("Failed to edit market intel");
      return false;
    }
  };

  const handleDelete = async (id) => {
    try {
      const { error } = await supabase
        .from("market_intel")
        .delete()
        .eq("id", id);
      
      if (error) throw error;
      
      toast.success("Market intel deleted successfully");
      fetchMarketIntel();
      return true;
    } catch (error) {
      console.error("Error deleting market intel:", error);
      toast.error("Failed to delete market intel");
      return false;
    }
  };

  const handleSubmit = async (e) => {
    if (e && e.preventDefault) {
      e.preventDefault();
    }
    try {
      console.log("Form submission started with data:", formData);
      const { id, file, ...data } = formData;
      
      // Handle file upload to ImageKit if there's a new file
      if (file) {
        console.log("Uploading file to ImageKit:", file.name);
        const uploadFormData = new FormData();
        uploadFormData.append('file', file);
        uploadFormData.append('fileName', `${Date.now()}_${file.name}`);
        uploadFormData.append('folder', '/Reports');
        
        const uploadResponse = await fetch('/api/imagekit/upload-file', {
          method: 'POST',
          body: uploadFormData,
        });
        
        if (!uploadResponse.ok) {
          const errorText = await uploadResponse.text();
          console.error("Upload failed:", errorText);
          throw new Error(`Failed to upload file: ${uploadResponse.status} ${errorText}`);
        }
        
        const uploadResult = await uploadResponse.json();
        console.log("Upload successful:", uploadResult);
        data.file_path = uploadResult.url;
      }
      
      console.log("Final data to be saved:", data);
      
      if (id) {
        // Update existing market intel
        const { error } = await supabase
          .from("market_intel")
          .update(data)
          .eq("id", id);
        
        if (error) throw error;
        toast.success("Market intel updated successfully");
      } else {
        // Create new market intel
        const { error } = await supabase
          .from("market_intel")
          .insert([data]);
        
        if (error) throw error;
        toast.success("Market intel created successfully");
      }
      
      fetchMarketIntel();
      resetForm();
      return true;
    } catch (error) {
      console.error("Error submitting market intel:", error);
      toast.error("Failed to submit market intel");
      return false;
    }
  };

  const getPDFUrl = async (filePath) => {
    try {
      const { data, error } = await supabase.storage
        .from("market-intel")
        .createSignedUrl(filePath, 3600);
      if (error) throw error;
      return data.signedUrl;
    } catch (error) {
      console.error("Error getting PDF URL:", error);
      return null;
    }
  };

  return {
    marketIntel: filteredIntel,
    formData,
    setFormData,
    loading,
    sortBy,
    setSortBy,
    filters,
    updateFilters,
    handleInputChange,
    handleEdit,
    handleDelete,
    handleSubmit,
    fetchMarketIntel,
    resetForm,
    getPDFUrl,
  };
}
