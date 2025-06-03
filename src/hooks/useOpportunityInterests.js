import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

export const useOpportunityInterests = (opportunityId) => {
  const [interestedUsers, setInterestedUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!opportunityId) return;

    const fetchInterestedUsers = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from("opportunity_interests")
          .select(
            `
            id,
            created_at,
            user_id,
            candidates!opportunity_interests_user_id_fkey(
              primaryContactName,
              primaryContactEmail,
              selected_tier,
              job_type
            )
          `
          )
          .eq("opportunity_id", opportunityId);

        if (error) throw error;

        const users = data.map((interest) => ({
          id: interest.user_id,
          name: interest.candidates?.primaryContactName || "Unknown",
          email: interest.candidates?.primaryContactEmail || "N/A",
          tier: interest.candidates?.selected_tier || "Free Member",
          job_type: interest.candidates?.job_type || "N/A",
          expressed_at: interest.created_at,
        }));

        setInterestedUsers(users);
      } catch (err) {
        console.error("Error fetching interested users:", err);
        setError(err.message || "Failed to load interested users.");
      } finally {
        setLoading(false);
      }
    };

    fetchInterestedUsers();
  }, [opportunityId]);

  return { interestedUsers, loading, error };
};
