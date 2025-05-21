import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { supabase } from "@/lib/supabase";

export function useEvents(initialEvents = []) {
  const [events, setEvents] = useState(initialEvents);
  const [pendingRegistrations, setPendingRegistrations] = useState([]);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    event_type: "Networking",
    date: "",
    location: "",
    is_virtual: false,
    registration_link: "",
    tier_restriction: "Founding",
  });
  const [loading, setLoading] = useState(false);

  const fetchPendingRegistrations = async () => {
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

      const { data: registrations, error: regError } = await supabase
        .from("event_registrations")
        .select(
          `
          id,
          event_id,
          user_id,
          registered_at,
          status,
          events (
            title
          ),
          candidates (
            primaryContactEmail
          )
        `
        )
        .eq("status", "pending")
        .order("registered_at", { ascending: false });

      if (regError) throw regError;

      const formattedRegistrations = registrations.map((reg) => ({
        id: reg.id,
        event_id: reg.event_id,
        user_id: reg.user_id,
        event_title: reg.events?.title || "Unknown Event",
        user_email: reg.candidates?.primaryContactEmail || "Unknown",
        registered_at: reg.registered_at,
        status: reg.status,
      }));

      console.log("[useEvents] Pending registrations:", formattedRegistrations);
      setPendingRegistrations(formattedRegistrations || []);
    } catch (error) {
      console.error("[useEvents] Error fetching pending registrations:", error);
      toast.error("Failed to load pending registrations");
      setPendingRegistrations([]);
    } finally {
      setLoading(false);
    }
  };

  const handleRegistrationAction = async (registrationId, action) => {
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

      const newStatus = action === "approve" ? "confirmed" : "cancelled";
      console.log("[useEvents] Updating registration:", {
        registrationId,
        newStatus,
      });

      const { error: updateError } = await supabase
        .from("event_registrations")
        .update({ status: newStatus })
        .eq("id", registrationId);

      if (updateError) throw updateError;

      console.log(
        "[useEvents] Registration updated successfully:",
        registrationId
      );
      // Refresh registrations
      await fetchPendingRegistrations();
    } catch (error) {
      console.error("[useEvents] Error handling registration action:", error);
      throw error; // Let component handle the error
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
    const { id, ...eventData } = formData;

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
      ];
      if (!validEventTypes.includes(eventData.event_type)) {
        throw new Error(
          `Invalid event_type. Must be one of: ${validEventTypes.join(", ")}`
        );
      }

      // Validate tier_restriction
      const validTiers = ["Founding", "Full", "Associate", "All"];
      if (!validTiers.includes(eventData.tier_restriction)) {
        throw new Error(
          `Invalid tier_restriction. Must be one of: ${validTiers.join(", ")}`
        );
      }

      if (id) {
        // Update existing event
        const { error } = await supabase
          .from("events")
          .update(eventData)
          .eq("id", id);
        if (error) throw error;
        toast.success("Event updated successfully!");
        setEvents((prev) =>
          prev.map((event) => (event.id === id ? { id, ...eventData } : event))
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
      }
      setFormData({
        title: "",
        description: "",
        event_type: "Networking",
        date: "",
        location: "",
        is_virtual: false,
        registration_link: "",
        tier_restriction: "Founding",
      });
    } catch (error) {
      console.error("[useEvents] Error in handleSubmit:", error);
      toast.error(`Error saving event: ${error.message}`);
    }
  };

  const handleEdit = (event) => {
    setFormData({
      id: event.id,
      title: event.title || "",
      description: event.description || "",
      event_type: event.event_type || "Networking",
      date: event.date ? new Date(event.date).toISOString().slice(0, 16) : "",
      location: event.location || "",
      is_virtual: event.is_virtual || false,
      registration_link: event.registration_link || "",
      tier_restriction: event.tier_restriction || "Founding",
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

  useEffect(() => {
    fetchPendingRegistrations();
  }, []);

  return {
    events,
    pendingRegistrations,
    formData,
    loading,
    handleInputChange,
    handleSubmit,
    handleEdit,
    handleDelete,
    handleRegistrationAction,
  };
}
