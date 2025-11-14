import { useState, useEffect, useCallback, useRef } from "react";
import toast from "react-hot-toast";
import { supabase } from "@/lib/supabase";

/**
 * Custom hook for managing summit attendees
 * Handles fetching with pagination, filtering, and search
 */
export function useAttendees() {
  const [attendees, setAttendees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 50,
    totalCount: 0,
    totalPages: 0,
  });
  const [filters, setFilters] = useState({
    ticketType: null,
    visaLetterNeeded: null,
    paymentStatus: null,
    searchTerm: "",
    purchaseId: null,
  });

  // Use ref to always have the latest filters
  const filtersRef = useRef(filters);
  useEffect(() => {
    filtersRef.current = filters;
  }, [filters]);

  /**
   * Fetch attendees with current filters and pagination
   */
  const fetchAttendees = useCallback(async (options = {}) => {
    setLoading(true);
    setError(null);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // Use ref to get the latest filters
      const currentFilters = filtersRef.current;

      // Merge options with current filters and pagination
      const queryOptions = {
        page: options.page || pagination.page,
        limit: options.limit || pagination.limit,
        ticketType: options.ticketType !== undefined ? options.ticketType : currentFilters.ticketType,
        visaLetterNeeded: options.visaLetterNeeded !== undefined ? options.visaLetterNeeded : currentFilters.visaLetterNeeded,
        paymentStatus: options.paymentStatus !== undefined ? options.paymentStatus : currentFilters.paymentStatus,
        searchTerm: options.searchTerm !== undefined ? options.searchTerm : currentFilters.searchTerm,
        purchaseId: options.purchaseId !== undefined ? options.purchaseId : currentFilters.purchaseId,
      };

      console.log('🔍 [useAttendees] fetchAttendees called');
      console.log('   Options passed:', options);
      console.log('   Current filters from ref:', currentFilters);
      console.log('   Final queryOptions:', queryOptions);

      const offset = (queryOptions.page - 1) * queryOptions.limit;

      let query = supabase
        .from("attendees")
        .select(
          `
          *,
          purchaser:purchasers(
            id,
            full_name,
            email,
            phone,
            organization,
            country,
            visa_letter_needed
          ),
          purchase:ticket_purchases(
            id,
            status,
            payment_status,
            final_amount,
            created_at
          )
        `,
          { count: "exact" }
        );

      // Apply filters
      if (queryOptions.purchaseId) {
        console.log('   ✅ Applying purchaseId filter:', queryOptions.purchaseId);
        query = query.eq("purchase_id", queryOptions.purchaseId);
      } else {
        console.log('   ⚠️  No purchaseId filter applied');
      }
      if (queryOptions.ticketType) {
        query = query.eq("ticket_type", queryOptions.ticketType);
      }
      if (queryOptions.visaLetterNeeded !== null && queryOptions.visaLetterNeeded !== undefined) {
        // Filter by visa letter needed through purchaser relationship
        // This requires a join, so we'll filter after fetching
      }
      if (queryOptions.searchTerm) {
        query = query.or(
          `full_name.ilike.%${queryOptions.searchTerm}%,email.ilike.%${queryOptions.searchTerm}%,organization.ilike.%${queryOptions.searchTerm}%`
        );
      }

      // Apply pagination and sorting
      query = query
        .order("created_at", { ascending: false })
        .range(offset, offset + queryOptions.limit - 1);

      const { data, error: queryError, count } = await query;

      if (queryError) throw queryError;

      console.log('   📊 Query results:', {
        count: data?.length || 0,
        totalCount: count,
        firstAttendee: data?.[0]?.full_name,
      });

      // Apply additional filters that require post-processing
      let filteredData = data || [];

      if (queryOptions.visaLetterNeeded !== null && queryOptions.visaLetterNeeded !== undefined) {
        filteredData = filteredData.filter(
          (attendee) => attendee.purchaser?.visa_letter_needed === queryOptions.visaLetterNeeded
        );
      }

      if (queryOptions.paymentStatus) {
        filteredData = filteredData.filter(
          (attendee) => attendee.purchase?.payment_status === queryOptions.paymentStatus
        );
      }

      setAttendees(filteredData);
      setPagination({
        page: queryOptions.page,
        limit: queryOptions.limit,
        totalCount: count || filteredData.length,
        totalPages: Math.ceil((count || filteredData.length) / queryOptions.limit),
      });

      return {
        attendees: filteredData,
        totalCount: count || filteredData.length,
      };
    } catch (err) {
      console.error("[useAttendees] Error fetching attendees:", err);
      setError(err.message);
      toast.error(`Error fetching attendees: ${err.message}`);
      return { attendees: [], totalCount: 0 };
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.limit]);

  /**
   * Fetch single attendee by ID
   */
  const fetchAttendeeById = async (attendeeId) => {
    setLoading(true);
    setError(null);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data, error: queryError } = await supabase
        .from("attendees")
        .select(
          `
          *,
          purchaser:purchasers(*),
          purchase:ticket_purchases(
            *,
            items:purchase_items(*)
          )
        `
        )
        .eq("id", attendeeId)
        .single();

      if (queryError) throw queryError;

      return data;
    } catch (err) {
      console.error("[useAttendees] Error fetching attendee:", err);
      setError(err.message);
      toast.error(`Error fetching attendee: ${err.message}`);
      return null;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Update attendee information
   */
  const updateAttendee = async (attendeeId, updates) => {
    setLoading(true);
    setError(null);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // Verify admin authorization
      const { data: hrUser, error: hrError } = await supabase
        .from("hr_users")
        .select("id")
        .eq("id", user.id)
        .single();

      if (hrError || !hrUser) throw new Error("User not authorized");

      const { data, error: updateError } = await supabase
        .from("attendees")
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq("id", attendeeId)
        .select()
        .single();

      if (updateError) throw updateError;

      // Update local state
      setAttendees((prev) =>
        prev.map((a) => (a.id === attendeeId ? { ...a, ...data } : a))
      );

      toast.success("Attendee updated successfully");
      return data;
    } catch (err) {
      console.error("[useAttendees] Error updating attendee:", err);
      setError(err.message);
      toast.error(`Error updating attendee: ${err.message}`);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Export attendees to CSV
   */
  const exportAttendees = async (selectedAttendees = null, exportType = "default") => {
    try {
      const attendeesToExport = selectedAttendees || attendees;

      if (exportType === "visa") {
        // Filter to only visa letter requests
        const visaAttendees = attendeesToExport.filter(
          (a) => a.purchaser?.visa_letter_needed
        );

        if (visaAttendees.length === 0) {
          toast.error("No attendees with visa letter requests to export");
          return;
        }

        // Generate CSV for visa letters
        const csvHeaders = [
          "Full Name",
          "Email",
          "Organization",
          "Country",
          "Ticket Type",
          "Passport Name",
          "Nationality",
        ];

        const csvRows = visaAttendees.map((attendee) => [
          attendee.full_name || "",
          attendee.email || "",
          attendee.organization || "",
          attendee.purchaser?.country || "",
          attendee.ticket_type || "",
          attendee.purchaser?.passport_name || "",
          attendee.purchaser?.nationality || "",
        ]);

        const csvContent = [
          csvHeaders.join(","),
          ...csvRows.map((row) => row.map((cell) => `"${cell}"`).join(",")),
        ].join("\n");

        const blob = new Blob([csvContent], { type: "text/csv" });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `visa-letters-${new Date().toISOString().split("T")[0]}.csv`;
        a.click();
        window.URL.revokeObjectURL(url);

        toast.success(`Exported ${visaAttendees.length} visa letter requests`);
        return;
      }

      // Default export
      const csvHeaders = [
        "Full Name",
        "Email",
        "Role",
        "Organization",
        "Ticket Type",
        "Purchaser",
        "Country",
        "Payment Status",
        "Registered Date",
      ];

      const csvRows = attendeesToExport.map((attendee) => [
        attendee.full_name || "",
        attendee.email || "",
        attendee.role || "",
        attendee.organization || "",
        attendee.ticket_type || "",
        attendee.purchaser?.full_name || "",
        attendee.purchaser?.country || "",
        attendee.purchase?.payment_status || "",
        new Date(attendee.created_at).toLocaleDateString(),
      ]);

      const csvContent = [
        csvHeaders.join(","),
        ...csvRows.map((row) => row.map((cell) => `"${cell}"`).join(",")),
      ].join("\n");

      const blob = new Blob([csvContent], { type: "text/csv" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `attendees-${new Date().toISOString().split("T")[0]}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);

      toast.success(`Exported ${attendeesToExport.length} attendees`);
    } catch (err) {
      console.error("[useAttendees] Error exporting attendees:", err);
      toast.error(`Error exporting attendees: ${err.message}`);
    }
  };

  /**
   * Update filters
   */
  const updateFilters = (newFilters) => {
    console.log('🔄 [useAttendees] updateFilters called with:', newFilters);
    setFilters((prev) => {
      const updated = {
        ...prev,
        ...newFilters,
      };
      console.log('   Previous filters:', prev);
      console.log('   Updated filters:', updated);
      return updated;
    });
    // Reset to page 1 when filters change
    setPagination((prev) => ({
      ...prev,
      page: 1,
    }));
  };

  /**
   * Change page
   */
  const changePage = (newPage) => {
    setPagination((prev) => ({
      ...prev,
      page: newPage,
    }));
  };

  /**
   * Change items per page
   */
  const changeLimit = (newLimit) => {
    setPagination((prev) => ({
      ...prev,
      limit: newLimit,
      page: 1, // Reset to first page
    }));
  };

  // Fetch attendees when filters or pagination changes
  useEffect(() => {
    console.log('⚡ [useAttendees] useEffect triggered, calling fetchAttendees with current filters');
    fetchAttendees();
  }, [filters, pagination.page, pagination.limit, fetchAttendees]);

  // Real-time subscription for attendees
  useEffect(() => {
    const attendeesSubscription = supabase
      .channel("attendees")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "attendees" },
        () => fetchAttendees()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(attendeesSubscription);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    attendees,
    loading,
    error,
    pagination,
    filters,
    fetchAttendees,
    fetchAttendeeById,
    updateAttendee,
    exportAttendees,
    updateFilters,
    changePage,
    changeLimit,
  };
}
