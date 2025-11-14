import { useState, useEffect, useCallback } from "react";
import toast from "react-hot-toast";
import { supabase } from "@/lib/supabase";

/**
 * Custom hook for managing summit ticket purchases
 * Handles fetch, update, and refund operations with pagination and filtering
 */
export function usePurchases() {
  const [purchases, setPurchases] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 50,
    totalCount: 0,
    totalPages: 0,
  });
  const [filters, setFilters] = useState({
    status: null,
    paymentStatus: null,
    dateFrom: null,
    dateTo: null,
    ticketType: null,
    searchTerm: "",
  });

  /**
   * Fetch purchases with current filters and pagination
   */
  const fetchPurchases = useCallback(async (options = {}) => {
    setLoading(true);
    setError(null);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // Merge options with current filters and pagination
      const queryOptions = {
        page: options.page || pagination.page,
        limit: options.limit || pagination.limit,
        status: options.status !== undefined ? options.status : filters.status,
        paymentStatus: options.paymentStatus !== undefined ? options.paymentStatus : filters.paymentStatus,
        dateFrom: options.dateFrom !== undefined ? options.dateFrom : filters.dateFrom,
        dateTo: options.dateTo !== undefined ? options.dateTo : filters.dateTo,
        ticketType: options.ticketType !== undefined ? options.ticketType : filters.ticketType,
        searchTerm: options.searchTerm !== undefined ? options.searchTerm : filters.searchTerm,
      };

      const offset = (queryOptions.page - 1) * queryOptions.limit;

      let query = supabase
        .from("ticket_purchases")
        .select(
          `
          id,
          total_amount,
          currency,
          status,
          payment_method,
          payment_status,
          payment_reference,
          promo_code,
          discount_amount,
          final_amount,
          created_at,
          updated_at,
          paid_at,
          purchaser:purchasers(
            id,
            full_name,
            email,
            phone,
            organization,
            country
          )
        `,
          { count: "exact" }
        );

      // Apply filters
      if (queryOptions.status) {
        query = query.eq("status", queryOptions.status);
      }
      if (queryOptions.paymentStatus) {
        query = query.eq("payment_status", queryOptions.paymentStatus);
      }
      if (queryOptions.dateFrom) {
        query = query.gte("created_at", queryOptions.dateFrom);
      }
      if (queryOptions.dateTo) {
        query = query.lte("created_at", queryOptions.dateTo);
      }
      if (queryOptions.searchTerm) {
        // Search in purchaser name, email, or payment reference
        query = query.or(
          `payment_reference.ilike.%${queryOptions.searchTerm}%,purchasers.full_name.ilike.%${queryOptions.searchTerm}%,purchasers.email.ilike.%${queryOptions.searchTerm}%`
        );
      }

      // Apply pagination and sorting
      query = query
        .order("created_at", { ascending: false })
        .range(offset, offset + queryOptions.limit - 1);

      const { data, error: queryError, count } = await query;

      if (queryError) throw queryError;

      setPurchases(data || []);
      setPagination({
        page: queryOptions.page,
        limit: queryOptions.limit,
        totalCount: count || 0,
        totalPages: Math.ceil((count || 0) / queryOptions.limit),
      });

      return {
        purchases: data || [],
        totalCount: count || 0,
      };
    } catch (err) {
      console.error("[usePurchases] Error fetching purchases:", err);
      setError(err.message);
      toast.error(`Error fetching purchases: ${err.message}`);
      return { purchases: [], totalCount: 0 };
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.limit, filters]);

  /**
   * Fetch single purchase by ID with full details
   */
  const fetchPurchaseById = async (purchaseId) => {
    setLoading(true);
    setError(null);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data, error: queryError } = await supabase
        .from("ticket_purchases")
        .select(
          `
          *,
          purchaser:purchasers(*),
          items:purchase_items(
            id,
            ticket_type_id,
            ticket_name,
            quantity,
            unit_price,
            total_price,
            ticket_type:ticket_types(name, category, features)
          ),
          attendees:attendees(*),
          transactions:payment_transactions(*)
        `
        )
        .eq("id", purchaseId)
        .single();

      if (queryError) throw queryError;

      return data;
    } catch (err) {
      console.error("[usePurchases] Error fetching purchase:", err);
      setError(err.message);
      toast.error(`Error fetching purchase details: ${err.message}`);
      return null;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Update purchase status
   */
  const updatePurchaseStatus = async (purchaseId, newStatus) => {
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

      const { error: updateError } = await supabase
        .from("ticket_purchases")
        .update({
          status: newStatus,
          updated_at: new Date().toISOString(),
        })
        .eq("id", purchaseId);

      if (updateError) throw updateError;

      // Update local state
      setPurchases((prev) =>
        prev.map((purchase) =>
          purchase.id === purchaseId
            ? { ...purchase, status: newStatus, updated_at: new Date().toISOString() }
            : purchase
        )
      );

      toast.success("Purchase status updated successfully");
      return true;
    } catch (err) {
      console.error("[usePurchases] Error updating status:", err);
      setError(err.message);
      toast.error(`Error updating purchase status: ${err.message}`);
      return false;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Process refund for a purchase
   */
  const processRefund = async (purchaseId, reason = "") => {
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

      // Fetch purchase details
      const { data: purchase, error: fetchError } = await supabase
        .from("ticket_purchases")
        .select("*")
        .eq("id", purchaseId)
        .single();

      if (fetchError) throw fetchError;

      // Validate refund eligibility
      if (purchase.status === "refunded") {
        throw new Error("Purchase has already been refunded");
      }

      if (purchase.payment_status !== "completed") {
        throw new Error("Cannot refund a purchase that hasn't been completed");
      }

      // Check if purchase is older than 30 days
      const purchaseDate = new Date(purchase.created_at);
      const daysSincePurchase = Math.floor(
        (new Date() - purchaseDate) / (1000 * 60 * 60 * 24)
      );

      if (daysSincePurchase > 30) {
        throw new Error("Cannot refund purchases older than 30 days");
      }

      // Create refund transaction record
      const { error: transactionError } = await supabase
        .from("payment_transactions")
        .insert({
          purchase_id: purchaseId,
          amount: -Math.abs(purchase.final_amount),
          status: "completed",
          payment_method: "refund",
          paystack_reference: `REFUND-${purchase.payment_reference}`,
          gateway_response: {
            type: "refund",
            reason: reason,
            refunded_at: new Date().toISOString(),
            refunded_by: user.id,
          },
        });

      if (transactionError) throw transactionError;

      // Update purchase status
      const { error: updateError } = await supabase
        .from("ticket_purchases")
        .update({
          status: "refunded",
          payment_status: "refunded",
          updated_at: new Date().toISOString(),
        })
        .eq("id", purchaseId);

      if (updateError) throw updateError;

      // Update local state
      setPurchases((prev) =>
        prev.map((p) =>
          p.id === purchaseId
            ? {
                ...p,
                status: "refunded",
                payment_status: "refunded",
                updated_at: new Date().toISOString(),
              }
            : p
        )
      );

      toast.success("Refund processed successfully");
      return true;
    } catch (err) {
      console.error("[usePurchases] Error processing refund:", err);
      setError(err.message);
      toast.error(`Error processing refund: ${err.message}`);
      return false;
    } finally {
      setLoading(false);
    }
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

  // Fetch purchases when filters or pagination changes
  useEffect(() => {
    fetchPurchases();
  }, [filters, pagination.page, pagination.limit]);

  // Real-time subscription for purchases
  useEffect(() => {
    const purchasesSubscription = supabase
      .channel("ticket_purchases")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "ticket_purchases" },
        () => fetchPurchases()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(purchasesSubscription);
    };
  }, [fetchPurchases]);

  return {
    purchases,
    loading,
    error,
    pagination,
    filters,
    fetchPurchases,
    fetchPurchaseById,
    updatePurchaseStatus,
    processRefund,
    updateFilters,
    changePage,
    changeLimit,
  };
}
