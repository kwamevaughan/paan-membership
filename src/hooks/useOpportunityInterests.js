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

export const useTotalOpportunityInterests = () => {
  const [totalInterests, setTotalInterests] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTotalInterests = async () => {
      setLoading(true);
      try {
        const { count, error } = await supabase
          .from("opportunity_interests")
          .select("*", { count: "exact", head: true });

        if (error) throw error;

        setTotalInterests(count || 0);
      } catch (err) {
        console.error("Error fetching total interests:", err);
        setError(err.message || "Failed to load total interests.");
      } finally {
        setLoading(false);
      }
    };

    fetchTotalInterests();
  }, []);

  return { totalInterests, loading, error };
};

export const useAllOpportunityInterests = () => {
  const [allInterestedUsers, setAllInterestedUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAllInterestedUsers = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from("opportunity_interests")
          .select(
            `
            id,
            created_at,
            user_id,
            opportunity_id,
            candidates!opportunity_interests_user_id_fkey(
              primaryContactName,
              primaryContactEmail,
              selected_tier,
              job_type
            ),
            business_opportunities!opportunity_interests_opportunity_id_fkey(
              tender_title,
              gig_title,
              organization_name,
              job_type
            )
          `
          )
          .order('created_at', { ascending: false });

        if (error) throw error;

        const users = data.map((interest) => ({
          id: interest.user_id,
          name: interest.candidates?.primaryContactName || "Unknown",
          email: interest.candidates?.primaryContactEmail || "N/A",
          tier: interest.candidates?.selected_tier || "Free Member",
          job_type: interest.candidates?.job_type || "N/A",
          expressed_at: interest.created_at,
          opportunity_id: interest.opportunity_id,
          opportunity_title:
            interest.business_opportunities?.tender_title ||
            interest.business_opportunities?.gig_title ||
            interest.business_opportunities?.organization_name ||
            "Unknown Opportunity",
          opportunity_type: interest.business_opportunities?.job_type || "Opportunity",
        }));

        setAllInterestedUsers(users);
      } catch (err) {
        console.error("Error fetching all interested users:", err);
        setError(err.message || "Failed to load all interested users.");
      } finally {
        setLoading(false);
      }
    };

    fetchAllInterestedUsers();
  }, []);

  return { allInterestedUsers, loading, error };
};
