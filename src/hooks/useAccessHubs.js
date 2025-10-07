import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { supabase } from "@/lib/supabase";

export function useAccessHubs() {
  const [accessHubs, setAccessHubs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [registrations, setRegistrations] = useState([]);
  const [isLoadingRegistrations, setIsLoadingRegistrations] = useState(false);
  const [filterOptions, setFilterOptions] = useState({
    spaceTypes: [],
    tiers: [],
    locations: [],
  });
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    space_type: "Boardroom",
    city: "",
    country: "",
    is_available: false,
    pricing_per_day: 0,
    pricing_boardroom: 15,
    pricing_coworking: 20,
    pricing_meeting: 10,
    pricing_virtual: 200,
    pricing_unit: "USD",
    amenities: [],
    images: [],
    capacity: 0,
    tier_restriction: "Free Member",
  });
  const [filterTerm, setFilterTerm] = useState("");
  const [sortOrder, setSortOrder] = useState("newest");
  const [showFilters, setShowFilters] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedTier, setSelectedTier] = useState("All");
  const [selectedType, setSelectedType] = useState("All");
  const [selectedRegion, setSelectedRegion] = useState("All");
  const [selectedDateRange, setSelectedDateRange] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(12);
  const [selectedIds, setSelectedIds] = useState([]);

  const fetchAccessHubs = useCallback(async () => {
    setLoading(true);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("access_hubs")
        .select(
          `
          id,
          title,
          description,
          city,
          country,
          is_available,
          space_type,
          pricing_per_day,
          pricing_boardroom,
          pricing_coworking,
          pricing_meeting,
          pricing_virtual,
          pricing_unit,
          amenities,
          images,
          capacity,
          tier_restriction,
          created_at,
          updated_at
        `
        )
        .order("created_at", { ascending: false });

      if (error) throw error;
      console.log("[useAccessHubs] Fetched access hubs:", data);
      setAccessHubs(data || []);
      return data || [];
    } catch (error) {
      console.error("[useAccessHubs] Error fetching access hubs:", error);
      setError(error.message);
      setAccessHubs([]);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchRegistrations = useCallback(async () => {
    setIsLoadingRegistrations(true);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("access_hub_registrations")
        .select(
          `
          id,
          access_hub_id,
          user_id,
          status,
          registered_at,
          access_hubs (
            id,
            title,
            description,
            city,
            country,
            space_type,
            pricing_per_day,
            capacity,
            tier_restriction,
            is_available,
            amenities,
            images
          ),
          candidates (
            primaryContactName,
            primaryContactEmail,
            primaryContactPhone,
            primaryContactLinkedin,
            agencyName,
            headquartersLocation
          )
        `
        )
        .order("registered_at", { ascending: false });

      if (error) {
        console.error("Supabase error:", error);
        throw error;
      }

      const formattedRegistrations = (data || []).map((reg) => {
        return {
          id: reg.id,
          access_hub_id: reg.access_hub_id,
          user_id: reg.user_id,
          status: reg.status,
          registered_at: reg.registered_at,
          access_hub_name: reg.access_hubs?.title,
          access_hub_description: reg.access_hubs?.description,
          access_hub_city: reg.access_hubs?.city,
          access_hub_country: reg.access_hubs?.country,
          access_hub_space_type: reg.access_hubs?.space_type,
          access_hub_pricing_per_day: reg.access_hubs?.pricing_per_day,
          access_hub_capacity: reg.access_hubs?.capacity,
          access_hub_tier_restriction: reg.access_hubs?.tier_restriction,
          candidate_name: reg.candidates?.primaryContactName,
          candidate_email: reg.candidates?.primaryContactEmail,
          candidate_phone: reg.candidates?.primaryContactPhone,
          candidate_linkedin: reg.candidates?.primaryContactLinkedin,
          agency_name: reg.candidates?.agencyName,
          headquarters_location: reg.candidates?.headquartersLocation,
        };
      });

      setRegistrations(formattedRegistrations);
      return formattedRegistrations;
    } catch (error) {
      console.error("Error fetching registrations:", error);
      setRegistrations([]);
      return [];
    } finally {
      setIsLoadingRegistrations(false);
    }
  }, []);

  const handleRegistrationAction = async (registrationId, action) => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { error } = await supabase
        .from("access_hub_registrations")
        .update({ status: action === "approve" ? "confirmed" : "cancelled" })
        .eq("id", registrationId);

      if (error) throw error;

      // Update local state
      setRegistrations((prev) =>
        prev.map((reg) =>
          reg.id === registrationId
            ? {
                ...reg,
                status: action === "approve" ? "confirmed" : "cancelled",
              }
            : reg
        )
      );

      return true;
    } catch (error) {
      console.error("Error handling registration action:", error);
      throw error;
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formDataToSubmit = e.target?.formData || formData;
    const { id, ...accessHubData } = formDataToSubmit;

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

      // For new access hubs, validate required fields
      if (!id) {
        if (!accessHubData.title) {
          throw new Error("Title is required");
        }
        if (!accessHubData.city) {
          throw new Error("City is required");
        }
        if (!accessHubData.country) {
          throw new Error("Country is required");
        }
        if (accessHubData.capacity <= 0) {
          throw new Error("Capacity must be greater than 0");
        }
        if (accessHubData.pricing_per_day < 0) {
          throw new Error("Pricing cannot be negative");
        }
      }

      // For updates, only validate fields if they're being changed
      if (id) {
        const existingAccessHub = accessHubs.find((accessHub) => accessHub.id === id);
        if (!existingAccessHub) {
          throw new Error("Access hub not found");
        }

        // Validate required fields if they're being changed
        if (accessHubData.title !== existingAccessHub.title && !accessHubData.title) {
          throw new Error("Title is required");
        }
        if (accessHubData.city !== existingAccessHub.city && !accessHubData.city) {
          throw new Error("City is required");
        }
        if (accessHubData.country !== existingAccessHub.country && !accessHubData.country) {
          throw new Error("Country is required");
        }
        if (accessHubData.capacity !== existingAccessHub.capacity && accessHubData.capacity <= 0) {
          throw new Error("Capacity must be greater than 0");
        }
        if (accessHubData.pricing_per_day !== existingAccessHub.pricing_per_day && accessHubData.pricing_per_day < 0) {
          throw new Error("Pricing cannot be negative");
        }

        // For updates, merge with existing data to preserve unchanged fields
        const updatedAccessHubData = {
          ...existingAccessHub,
          ...accessHubData,
          id: existingAccessHub.id, // Ensure ID is preserved
        };

        // Update existing access hub
        const { error } = await supabase
          .from("access_hubs")
          .update(updatedAccessHubData)
          .eq("id", id);
        if (error) throw error;
        toast.success("Access hub updated successfully!");
        setAccessHubs((prev) =>
          prev.map((accessHub) => (accessHub.id === id ? updatedAccessHubData : accessHub))
        );
      } else {
        // Create new access hub
        const { data, error } = await supabase
          .from("access_hubs")
          .insert([accessHubData])
          .select()
          .single();
        if (error) throw error;
        toast.success("Access hub created successfully!");
        setAccessHubs((prev) => [...prev, data]);

        // Only reset form data when creating a new access hub
        setFormData({
          title: "",
          description: "",
          space_type: "Boardroom",
          city: "",
          country: "",
          is_available: false,
          pricing_per_day: 0,
          amenities: [],
          images: [],
          capacity: 0,
          tier_restriction: "Free Member",
        });
      }

      return true;
    } catch (error) {
      console.error("[useAccessHubs] Error in handleSubmit:", error);
      toast.error(`Error saving access hub: ${error.message}`);
      return false;
    }
  };

  const handleEdit = (accessHub) => {
    console.log("[useAccessHubs] handleEdit called with access hub:", {
      id: accessHub.id,
      title: accessHub.title,
    });

    setFormData({
      id: accessHub.id,
      title: accessHub.title || "",
      description: accessHub.description || "",
      space_type: accessHub.space_type || "Boardroom",
      city: accessHub.city || "",
      country: accessHub.country || "",
      is_available: accessHub.is_available || false,
      pricing_per_day: accessHub.pricing_per_day || 0,
      amenities: accessHub.amenities || [],
      images: accessHub.images || [],
      capacity: accessHub.capacity || 0,
      tier_restriction: accessHub.tier_restriction || "Free Member",
    });
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

      const { error } = await supabase.from("access_hubs").delete().eq("id", id);
      if (error) throw error;
      toast.success("Access hub deleted successfully!");
      setAccessHubs((prev) => prev.filter((accessHub) => accessHub.id !== id));
    } catch (error) {
      console.error("[useAccessHubs] Error in handleDelete:", error);
      toast.error(`Error deleting access hub: ${error.message}`);
    }
  };

  const fetchFilterOptions = async () => {
    try {
      const { data: accessHubs, error } = await supabase
        .from("access_hubs")
        .select("space_type, tier_restriction, city, country");

      if (error) throw error;

      // Extract unique values
      const spaceTypes = [
        ...new Set(accessHubs.map((accessHub) => accessHub.space_type)),
      ].filter(Boolean);
      const tiers = [
        ...new Set(accessHubs.map((accessHub) => accessHub.tier_restriction)),
      ].filter(Boolean);
      const locations = [
        ...new Set(accessHubs.map((accessHub) => accessHub.city)),
      ].filter(Boolean);

      setFilterOptions({
        spaceTypes,
        tiers,
        locations,
      });
    } catch (error) {
      console.error("Error fetching filter options:", error);
      toast.error("Failed to load filter options");
    }
  };

  const filteredAccessHubs =
    accessHubs?.filter((accessHub) => {
      // Apply filters only if they are not set to "all" (case-insensitive)
      const matchesType =
        selectedType?.toLowerCase() === "all" ||
        accessHub.space_type === selectedType;
      const matchesTier =
        selectedTier?.toLowerCase() === "all" ||
        accessHub.tier_restriction === selectedTier;
      const matchesRegion =
        selectedRegion?.toLowerCase() === "all" ||
        accessHub.city === selectedRegion;

      const result = matchesType && matchesTier && matchesRegion;
      return result;
    }) || [];

  useEffect(() => {
    fetchAccessHubs();
    fetchRegistrations();
    fetchFilterOptions();

    // Real-time subscriptions
    const accessHubsSubscription = supabase
      .channel("access_hubs")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "access_hubs" },
        () => {
          fetchAccessHubs();
          fetchFilterOptions();
        }
      )
      .subscribe();

    const registrationsSubscription = supabase
      .channel("access_hub_registrations")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "access_hub_registrations" },
        () => fetchRegistrations()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(accessHubsSubscription);
      supabase.removeChannel(registrationsSubscription);
    };
  }, [fetchRegistrations]);

  return {
    accessHubs,
    loading,
    error,
    registrations,
    isLoadingRegistrations,
    formData,
    filterOptions,
    fetchAccessHubs,
    fetchRegistrations,
    handleRegistrationAction,
    handleInputChange,
    handleSubmit,
    handleEdit,
    handleDelete,
  };
}
