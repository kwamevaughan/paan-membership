import { useState, useEffect, useCallback } from "react";
import toast from "react-hot-toast";
import { supabase } from "@/lib/supabase";

export function useEvents() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [registrations, setRegistrations] = useState([]);
  const [isLoadingRegistrations, setIsLoadingRegistrations] = useState(false);
  const [filterOptions, setFilterOptions] = useState({
    eventTypes: [],
    tiers: [],
    locations: []
  });
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    event_type: "Networking",
    start_date: null,
    end_date: null,
    location: "",
    is_virtual: false,
    registration_link: "",
    tier_restriction: "Free Member",
    banner_image: "",
  });
  const [filterTerm, setFilterTerm] = useState("");
  const [sortOrder, setSortOrder] = useState("newest");
  const [showFilters, setShowFilters] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedTier, setSelectedTier] = useState("All");
  const [selectedType, setSelectedType] = useState("All");
  const [selectedRegion, setSelectedRegion] = useState("All");
  const [selectedEventType, setSelectedEventType] = useState("All");
  const [selectedDateRange, setSelectedDateRange] = useState("All");
  const [selectedLocation, setSelectedLocation] = useState("All");
  const [selectedVirtual, setSelectedVirtual] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(12);
  const [selectedIds, setSelectedIds] = useState([]);

  const fetchEvents = useCallback(async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("events")
        .select(`
          id,
          title,
          description,
          event_type,
          start_date,
          end_date,
          location,
          is_virtual,
          registration_link,
          tier_restriction,
          created_at,
          updated_at,
          banner_image
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;
      console.log('[useEvents] Fetched events:', data);
      setEvents(data || []);
      return data || [];
    } catch (error) {
      console.error("[useEvents] Error fetching events:", error);
      setError(error.message);
      setEvents([]);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchRegistrations = useCallback(async () => {
    setIsLoadingRegistrations(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("event_registrations")
        .select(`
          id,
          event_id,
          user_id,
          status,
          registered_at,
          events (
            id,
            title,
            description,
            start_date,
            end_date,
            location,
            tier_restriction
          ),
          candidates (
            primaryContactName,
            primaryContactEmail,
            primaryContactPhone,
            primaryContactLinkedin,
            agencyName,
            headquartersLocation
          )
        `)
        .order("registered_at", { ascending: false });

      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }

      const formattedRegistrations = (data || []).map(reg => {
        return {
          id: reg.id,
          event_id: reg.event_id,
          user_id: reg.user_id,
          status: reg.status,
          registered_at: reg.registered_at,
          event_title: reg.events?.title,
          event_description: reg.events?.description,
          event_start_date: reg.events?.start_date,
          event_end_date: reg.events?.end_date,
          event_location: reg.events?.location,
          tier_restriction: reg.events?.tier_restriction,
          candidate_name: reg.candidates?.primaryContactName,
          candidate_email: reg.candidates?.primaryContactEmail,
          candidate_phone: reg.candidates?.primaryContactPhone,
          candidate_linkedin: reg.candidates?.primaryContactLinkedin,
          agency_name: reg.candidates?.agencyName,
          headquarters_location: reg.candidates?.headquartersLocation
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
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { error } = await supabase
        .from("event_registrations")
        .update({ status: action === "approve" ? "confirmed" : "cancelled" })
        .eq("id", registrationId);

      if (error) throw error;

      // Update local state
      setRegistrations(prev => 
        prev.map(reg => 
          reg.id === registrationId 
            ? { ...reg, status: action === "approve" ? "confirmed" : "cancelled" }
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
    const { id, ...eventData } = formDataToSubmit;

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

      // Validate event_type
      const validEventTypes = [
        "Networking",
        "Workshop",
        "Conference",
        "Webinar",
        "Training",
        "Other",
      ];
      
      // Ensure event_type has a valid value
      const eventType = eventData.event_type || "Networking";
      if (!validEventTypes.includes(eventType)) {
        throw new Error(
          `Invalid event_type. Must be one of: ${validEventTypes.join(", ")}`
        );
      }
      
      // Update the eventData with the validated event_type
      eventData.event_type = eventType;

      // Validate tier_restriction
      const validTiers = ["Associate Member", "Full Member", "Gold Member", "Free Member"];
      
      // Ensure tier_restriction has a valid value
      const tierRestriction = eventData.tier_restriction || "Free Member";
      if (!validTiers.includes(tierRestriction)) {
        throw new Error(
          `Invalid tier_restriction. Must be one of: ${validTiers.join(", ")}`
        );
      }
      
      // Update the eventData with the validated tier_restriction
      eventData.tier_restriction = tierRestriction;

      // For new events, validate that dates are provided
      if (!id && (!eventData.start_date || !eventData.end_date)) {
        throw new Error("Start date and end date are required");
      }

      // For updates, only validate dates if they're being changed
      if (id) {
        const existingEvent = events.find(event => event.id === id);
        if (!existingEvent) {
          throw new Error("Event not found");
        }

        // Only validate dates if they're being changed
        const startDateChanged = eventData.start_date !== existingEvent.start_date;
        const endDateChanged = eventData.end_date !== existingEvent.end_date;

        if (startDateChanged || endDateChanged) {
          if (!eventData.start_date || !eventData.end_date) {
            throw new Error("Start date and end date are required");
          }
          if (new Date(eventData.start_date) > new Date(eventData.end_date)) {
            throw new Error("End date must be after start date");
          }
        }

        // For updates, merge with existing data to preserve unchanged fields
        const updatedEventData = {
          ...existingEvent,
          ...eventData,
          id: existingEvent.id // Ensure ID is preserved
        };

        // Update existing event
        const { error } = await supabase
          .from("events")
          .update(updatedEventData)
          .eq("id", id);
        if (error) throw error;
        toast.success("Event updated successfully!");
        setEvents((prev) =>
          prev.map((event) => (event.id === id ? updatedEventData : event))
        );
      } else {
        // Create new event
        const { data, error } = await supabase
          .from("events")
          .insert([eventData])
          .select()
          .single();
        if (error) throw error;
        toast.success("Event created successfully!");
        setEvents((prev) => [...prev, data]);

        // Only reset form data when creating a new event
        setFormData({
          title: "",
          description: "",
          event_type: "Networking",
          start_date: null,
          end_date: null,
          location: "",
          is_virtual: false,
          registration_link: "",
          tier_restriction: "Free Member",
          banner_image: "",
        });
      }

      return true;
    } catch (error) {
      console.error("[useEvents] Error in handleSubmit:", error);
      toast.error(`Error saving event: ${error.message}`);
      return false;
    }
  };

  const handleEdit = (event) => {
    console.log('[useEvents] handleEdit called with event:', {
      id: event.id,
      title: event.title,
      banner_image: event.banner_image,
      has_banner: !!event.banner_image
    });
    
    setFormData({
      id: event.id,
      title: event.title || "",
      description: event.description || "",
      event_type: event.event_type || "Networking",
      start_date: event.start_date ? new Date(event.start_date).toISOString().slice(0, 16) : "",
      end_date: event.end_date ? new Date(event.end_date).toISOString().slice(0, 16) : "",
      location: event.location || "",
      is_virtual: event.is_virtual || false,
      registration_link: event.registration_link || "",
      tier_restriction: event.tier_restriction || "Free Member",
      banner_image: event.banner_image || "",
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

      const { error } = await supabase.from("events").delete().eq("id", id);
      if (error) throw error;
      toast.success("Event deleted successfully!");
      setEvents((prev) => prev.filter((event) => event.id !== id));
    } catch (error) {
      console.error("[useEvents] Error in handleDelete:", error);
      toast.error(`Error deleting event: ${error.message}`);
    }
  };

  const fetchFilterOptions = useCallback(async () => {
    try {
      const { data: events, error } = await supabase
        .from("events")
        .select("event_type, tier_restriction, location");

      if (error) throw error;

      // Extract unique values
      const eventTypes = [...new Set(events.map(event => event.event_type))].filter(Boolean);
      const tiers = [...new Set(events.map(event => event.tier_restriction))].filter(Boolean);
      const locations = [...new Set(events.map(event => event.location))].filter(Boolean);

      setFilterOptions({
        eventTypes,
        tiers,
        locations
      });
    } catch (error) {
      console.error("Error fetching filter options:", error);
      toast.error("Failed to load filter options");
    }
  }, []);

  const filteredEvents = events?.filter((event) => {
    

    // Apply filters only if they are not set to "all" (case-insensitive)
    const matchesType = selectedType?.toLowerCase() === "all" || event.event_type === selectedType;
    const matchesTier = selectedTier?.toLowerCase() === "all" || event.tier_restriction === selectedTier;
    const matchesRegion = selectedRegion?.toLowerCase() === "all" || event.location === selectedRegion;

    const result = matchesType && matchesTier && matchesRegion;
    return result;
  }) || [];

  

  useEffect(() => {
    fetchEvents();
    fetchRegistrations();
    fetchFilterOptions();

    // Real-time subscriptions
    const eventsSubscription = supabase
      .channel("events")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "events" },
        () => {
          fetchEvents();
          fetchFilterOptions();
        }
      )
      .subscribe();

    const registrationsSubscription = supabase
      .channel("event_registrations")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "event_registrations" },
        () => fetchRegistrations()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(eventsSubscription);
      supabase.removeChannel(registrationsSubscription);
    };
  }, [fetchEvents, fetchRegistrations, fetchFilterOptions]);

  return {
    events,
    loading,
    error,
    registrations,
    isLoadingRegistrations,
    formData,
    filterOptions,
    fetchEvents,
    fetchRegistrations,
    handleRegistrationAction,
    handleInputChange,
    handleSubmit,
    handleEdit,
    handleDelete,
  };
}
