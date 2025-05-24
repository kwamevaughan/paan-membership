// useSubscribers.js
import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { supabase } from "@/lib/supabase";

export function useSubscribers(initialSubscribers = []) {
  const [subscribers, setSubscribers] = useState(initialSubscribers);
  const [loading, setLoading] = useState(false);

  const fetchSubscribers = async () => {
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

      const { data: subscribersData, error: subscribersError } = await supabase
        .from("newsletter_subscriptions")
        .select("*")
        .order("created_at", { ascending: false });

      if (subscribersError) throw subscribersError;

      setSubscribers(subscribersData || []);
    } catch (error) {
      console.error("[useSubscribers] Error fetching subscribers:", error);
      toast.error("Failed to load subscribers");
      setSubscribers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubscribers();
  }, []);

  return {
    subscribers,
    setSubscribers, // Expose setSubscribers for external updates if needed
    loading,
    fetchSubscribers, // Expose fetchSubscribers for manual refresh
  };
}
