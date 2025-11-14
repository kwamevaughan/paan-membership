import { useState, useEffect, useCallback } from "react";
import toast from "react-hot-toast";
import { supabase } from "@/lib/supabase";

/**
 * Custom hook for managing payment transactions
 * Handles fetching with pagination, filtering, and reconciliation
 */
export function usePaymentTransactions() {
  const [transactions, setTransactions] = useState([]);
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
    paymentMethod: null,
    searchTerm: "",
    purchaseId: null,
  });

  /**
   * Fetch payment transactions with current filters and pagination
   */
  const fetchTransactions = useCallback(async (options = {}) => {
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
        paymentMethod: options.paymentMethod !== undefined ? options.paymentMethod : filters.paymentMethod,
        searchTerm: options.searchTerm !== undefined ? options.searchTerm : filters.searchTerm,
        purchaseId: options.purchaseId !== undefined ? options.purchaseId : filters.purchaseId,
      };

      const offset = (queryOptions.page - 1) * queryOptions.limit;

      let query = supabase
        .from("payment_transactions")
        .select(
          `
          *,
          purchase:ticket_purchases(
            id,
            status,
            payment_status,
            final_amount,
            currency,
            purchaser:purchasers(
              id,
              full_name,
              email
            )
          )
        `,
          { count: "exact" }
        );

      // Apply filters
      if (queryOptions.purchaseId) {
        query = query.eq("purchase_id", queryOptions.purchaseId);
      }
      if (queryOptions.status) {
        query = query.eq("status", queryOptions.status);
      }
      if (queryOptions.paymentMethod) {
        query = query.eq("payment_method", queryOptions.paymentMethod);
      }
      if (queryOptions.searchTerm) {
        query = query.or(
          `paystack_reference.ilike.%${queryOptions.searchTerm}%,purchase.purchasers.full_name.ilike.%${queryOptions.searchTerm}%,purchase.purchasers.email.ilike.%${queryOptions.searchTerm}%`
        );
      }

      // Apply pagination and sorting
      query = query
        .order("created_at", { ascending: false })
        .range(offset, offset + queryOptions.limit - 1);

      const { data, error: queryError, count } = await query;

      if (queryError) throw queryError;

      setTransactions(data || []);
      setPagination({
        page: queryOptions.page,
        limit: queryOptions.limit,
        totalCount: count || 0,
        totalPages: Math.ceil((count || 0) / queryOptions.limit),
      });

      return {
        transactions: data || [],
        totalCount: count || 0,
      };
    } catch (err) {
      console.error("[usePaymentTransactions] Error fetching transactions:", err);
      setError(err.message);
      toast.error(`Error fetching transactions: ${err.message}`);
      return { transactions: [], totalCount: 0 };
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.limit, filters]);

  /**
   * Reconcile a bank transfer transaction
   */
  const reconcileTransaction = async (transactionId) => {
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

      // Update transaction status to completed
      const { data: transaction, error: transactionError } = await supabase
        .from("payment_transactions")
        .update({
          status: "completed",
          updated_at: new Date().toISOString(),
        })
        .eq("id", transactionId)
        .select()
        .single();

      if (transactionError) throw transactionError;

      // Update associated purchase payment status
      if (transaction.purchase_id) {
        const { error: purchaseError } = await supabase
          .from("ticket_purchases")
          .update({
            payment_status: "completed",
            status: "paid",
            paid_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          .eq("id", transaction.purchase_id);

        if (purchaseError) throw purchaseError;
      }

      // Update local state
      setTransactions((prev) =>
        prev.map((t) =>
          t.id === transactionId
            ? { ...t, status: "completed" }
            : t
        )
      );

      toast.success("Transaction reconciled successfully");
      return transaction;
    } catch (err) {
      console.error("[usePaymentTransactions] Error reconciling transaction:", err);
      setError(err.message);
      toast.error(`Error reconciling transaction: ${err.message}`);
      throw err;
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

  // Fetch transactions when filters or pagination changes
  useEffect(() => {
    fetchTransactions();
  }, [filters, pagination.page, pagination.limit]);

  // Real-time subscription for transactions
  useEffect(() => {
    const transactionsSubscription = supabase
      .channel("payment_transactions")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "payment_transactions" },
        () => fetchTransactions()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(transactionsSubscription);
    };
  }, [fetchTransactions]);

  return {
    transactions,
    loading,
    error,
    pagination,
    filters,
    fetchTransactions,
    reconcileTransaction,
    updateFilters,
    changePage,
    changeLimit,
  };
}

