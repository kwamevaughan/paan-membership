import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { format, isToday, isYesterday, parseISO } from "date-fns";

export function useTimeline(categoryFilter = "all") {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(false);

  // Generic function to map database records to activities
  const mapToActivity = useCallback((record, type, tierField, category) => {
    const createdAt = parseISO(record.created_at);
    const date = isToday(createdAt)
      ? "Today"
      : isYesterday(createdAt)
      ? "Yesterday"
      : format(createdAt, "MMM d");
    const time = format(createdAt, "h:mm a");

    // Define URL based on category
    const urlMap = {
      "Business Opportunities": `/admin/opportunities`,
      Events: `/admin/events`,
      Updates: `/admin/updates`,
      Resources: `/admin/resources`,
      Offers: `/admin/offers`,
    };

    return {
      id: record.id,
      time,
      date,
      rawDate: record.created_at, // Store raw ISO date string
      type,
      description: `New ${type.replace(/_/g, " ")} posted for ${
        record[tierField]
      }: ${record.title}.`,
      category,
      url: urlMap[category],
    };
  }, []);

  // Fetch all data from Supabase
  const fetchActivities = useCallback(async () => {
    setLoading(true);
    try {
      // Authenticate user
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

      // Define table configurations
      const tables = [
        {
          name: "business_opportunities",
          select:
            "id, title, description, location, deadline, tier, service_type, industry, project_type, application_link, created_at, updated_at",
          order: { field: "created_at", ascending: false },
          type: "business_opportunities",
          tierField: "tier",
          category: "Business Opportunities",
        },
        {
          name: "events",
          select:
            "id, title, description, event_type, date, location, is_virtual, registration_link, tier_restriction, created_at, updated_at",
          order: { field: "date", ascending: true },
          type: "events",
          tierField: "tier_restriction",
          category: "Events",
        },
        {
          name: "updates",
          select:
            "id, title, description, category, cta_text, cta_url, tier_restriction, tags, created_at, updated_at",
          order: { field: "created_at", ascending: false },
          type: "updates",
          tierField: "tier_restriction",
          category: "Updates",
        },
        {
          name: "resources",
          select:
            "id, title, description, resource_type, tier_restriction, url, created_at, updated_at, file_path, video_url",
          order: { field: "created_at", ascending: false },
          type: "resources",
          tierField: "tier_restriction",
          category: "Resources",
        },
        {
          name: "offers",
          select:
            "id, title, description, tier_restriction, url, icon_url, created_at, updated_at",
          order: { field: "created_at", ascending: false },
          type: "offers",
          tierField: "tier_restriction",
          category: "Offers",
        },
      ];

      // Fetch all tables concurrently
      const fetchPromises = tables.map(({ name, select, order }) =>
        supabase
          .from(name)
          .select(select)
          .order(order.field, { ascending: order.ascending })
      );

      const results = await Promise.all(fetchPromises);

      // Process results
      const allActivities = tables.reduce((acc, table, index) => {
        const { data, error } = results[index];
        if (error)
          throw new Error(`Failed to fetch ${table.name}: ${error.message}`);
        const mapped = data.map((record) =>
          mapToActivity(record, table.type, table.tierField, table.category)
        );
        return [...acc, ...mapped];
      }, []);

      // Filter by category
      const filteredActivities = allActivities.filter(
        (activity) =>
          categoryFilter === "all" || activity.category === categoryFilter
      );

      setActivities(filteredActivities);
    } catch (error) {
      console.error("[useTimeline] Error:", error.message);
      setActivities([]);
    } finally {
      setLoading(false);
    }
  }, [categoryFilter, mapToActivity]);

  useEffect(() => {
    fetchActivities();

    // Set up real-time subscriptions
    const subscriptions = [
      {
        channel: "realtime-opportunities",
        table: "business_opportunities",
      },
      {
        channel: "realtime-events",
        table: "events",
      },
      {
        channel: "realtime-updates",
        table: "updates",
      },
      {
        channel: "realtime-resources",
        table: "resources",
      },
      {
        channel: "realtime-offers",
        table: "offers",
      },
    ].map(({ channel, table }) =>
      supabase
        .channel(channel)
        .on(
          "postgres_changes",
          {
            event: "INSERT",
            schema: "public",
            table,
          },
          () => fetchActivities()
        )
        .subscribe()
    );

    return () => {
      subscriptions.forEach((subscription) =>
        supabase.removeChannel(subscription)
      );
    };
  }, [fetchActivities]);

  return { activities, loading };
}
