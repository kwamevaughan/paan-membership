import { useState, useEffect, useCallback } from "react";
import toast from "react-hot-toast";
import { supabase } from "@/lib/supabase";

/**
 * Custom hook for managing summit ticket types
 * Handles CRUD operations with pagination and filtering
 */
export function useTicketTypes() {
  const [ticketTypes, setTicketTypes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 50,
    totalCount: 0,
    totalPages: 0,
  });
  const [filters, setFilters] = useState({
    category: null,
    isActive: null,
    searchTerm: "",
  });

  /**
   * Fetch ticket types with current filters and pagination
   */
  const fetchTicketTypes = useCallback(async (options = {}) => {
    setLoading(true);
    setError(null);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // Merge options with current filters and pagination
      const queryOptions = {
        page: options.page || pagination.page,
        limit: options.limit || pagination.limit,
        category: options.category !== undefined ? options.category : filters.category,
        isActive: options.isActive !== undefined ? options.isActive : filters.isActive,
        searchTerm: options.searchTerm !== undefined ? options.searchTerm : filters.searchTerm,
      };

      const offset = (queryOptions.page - 1) * queryOptions.limit;

      let query = supabase
        .from("ticket_types")
        .select("*", { count: "exact" });

      // Apply filters
      if (queryOptions.category) {
        query = query.eq("category", queryOptions.category);
      }
      if (queryOptions.isActive !== null && queryOptions.isActive !== undefined) {
        query = query.eq("is_active", queryOptions.isActive);
      }
      if (queryOptions.searchTerm) {
        query = query.or(
          `name.ilike.%${queryOptions.searchTerm}%,description.ilike.%${queryOptions.searchTerm}%`
        );
      }

      // Apply pagination and sorting
      query = query
        .order("created_at", { ascending: false })
        .range(offset, offset + queryOptions.limit - 1);

      const { data, error: queryError, count } = await query;

      if (queryError) throw queryError;

      setTicketTypes(data || []);
      setPagination({
        page: queryOptions.page,
        limit: queryOptions.limit,
        totalCount: count || 0,
        totalPages: Math.ceil((count || 0) / queryOptions.limit),
      });

      return {
        ticketTypes: data || [],
        totalCount: count || 0,
      };
    } catch (err) {
      console.error("[useTicketTypes] Error fetching ticket types:", err);
      setError(err.message);
      toast.error(`Error fetching ticket types: ${err.message}`);
      return { ticketTypes: [], totalCount: 0 };
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.limit, filters]);

  /**
   * Fetch single ticket type by ID
   */
  const fetchTicketTypeById = async (ticketTypeId) => {
    setLoading(true);
    setError(null);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data, error: queryError } = await supabase
        .from("ticket_types")
        .select("*")
        .eq("id", ticketTypeId)
        .single();

      if (queryError) throw queryError;

      return data;
    } catch (err) {
      console.error("[useTicketTypes] Error fetching ticket type:", err);
      setError(err.message);
      toast.error(`Error fetching ticket type: ${err.message}`);
      return null;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Create a new ticket type
   */
  const createTicketType = async (ticketTypeData) => {
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

      const { data, error: insertError } = await supabase
        .from("ticket_types")
        .insert({
          ...ticketTypeData,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (insertError) throw insertError;

      // Update local state
      setTicketTypes((prev) => [data, ...prev]);

      toast.success("Ticket type created successfully");
      return data;
    } catch (err) {
      console.error("[useTicketTypes] Error creating ticket type:", err);
      setError(err.message);
      toast.error(`Error creating ticket type: ${err.message}`);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Update an existing ticket type
   */
  const updateTicketType = async (ticketTypeId, updates) => {
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
        .from("ticket_types")
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq("id", ticketTypeId)
        .select()
        .single();

      if (updateError) throw updateError;

      // Update local state
      setTicketTypes((prev) =>
        prev.map((tt) => (tt.id === ticketTypeId ? data : tt))
      );

      toast.success("Ticket type updated successfully");
      return data;
    } catch (err) {
      console.error("[useTicketTypes] Error updating ticket type:", err);
      setError(err.message);
      toast.error(`Error updating ticket type: ${err.message}`);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Delete a ticket type
   */
  const deleteTicketType = async (ticketTypeId) => {
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

      // Check if ticket type is used in any purchases
      const { data: purchaseItems, error: checkError } = await supabase
        .from("purchase_items")
        .select("id")
        .eq("ticket_type_id", ticketTypeId)
        .limit(1);

      if (checkError) throw checkError;

      if (purchaseItems && purchaseItems.length > 0) {
        throw new Error(
          "Cannot delete ticket type that has been used in purchases. Deactivate it instead."
        );
      }

      const { error: deleteError } = await supabase
        .from("ticket_types")
        .delete()
        .eq("id", ticketTypeId);

      if (deleteError) throw deleteError;

      // Update local state
      setTicketTypes((prev) => prev.filter((tt) => tt.id !== ticketTypeId));

      toast.success("Ticket type deleted successfully");
      return true;
    } catch (err) {
      console.error("[useTicketTypes] Error deleting ticket type:", err);
      setError(err.message);
      toast.error(`Error deleting ticket type: ${err.message}`);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Toggle active status of a ticket type
   */
  const toggleActiveStatus = async (ticketTypeId, isActive) => {
    return await updateTicketType(ticketTypeId, { is_active: isActive });
  };

  /**
   * Update filters
   */
  const updateFilters = (newFilters) => {
    setFilters((prev) => ({
      ...prev,
      ...newFilters,
    }));
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

  // Fetch ticket types when filters or pagination changes
  useEffect(() => {
    fetchTicketTypes();
  }, [filters, pagination.page, pagination.limit]);

  // Real-time subscription for ticket types
  useEffect(() => {
    const ticketTypesSubscription = supabase
      .channel("ticket_types")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "ticket_types" },
        () => fetchTicketTypes()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(ticketTypesSubscription);
    };
  }, [fetchTicketTypes]);

  return {
    ticketTypes,
    loading,
    error,
    pagination,
    filters,
    fetchTicketTypes,
    fetchTicketTypeById,
    createTicketType,
    updateTicketType,
    deleteTicketType,
    toggleActiveStatus,
    updateFilters,
    changePage,
    changeLimit,
  };
}
