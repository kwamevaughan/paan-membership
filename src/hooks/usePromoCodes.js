import { useState, useEffect, useCallback } from "react";
import toast from "react-hot-toast";
import { supabase } from "@/lib/supabase";

/**
 * Custom hook for managing summit promo codes
 * Handles CRUD operations with pagination, filtering, and usage tracking
 */
export function usePromoCodes() {
  const [promoCodes, setPromoCodes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 50,
    totalCount: 0,
    totalPages: 0,
  });
  const [filters, setFilters] = useState({
    isActive: null,
    searchTerm: "",
  });

  /**
   * Fetch promo codes with current filters and pagination
   */
  const fetchPromoCodes = useCallback(async (options = {}) => {
    setLoading(true);
    setError(null);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // Merge options with current filters and pagination
      const queryOptions = {
        page: options.page || pagination.page,
        limit: options.limit || pagination.limit,
        isActive: options.isActive !== undefined ? options.isActive : filters.isActive,
        searchTerm: options.searchTerm !== undefined ? options.searchTerm : filters.searchTerm,
      };

      const offset = (queryOptions.page - 1) * queryOptions.limit;

      let query = supabase
        .from("promo_codes")
        .select("*", { count: "exact" });

      // Apply filters
      if (queryOptions.isActive !== null && queryOptions.isActive !== undefined) {
        query = query.eq("is_active", queryOptions.isActive);
      }
      if (queryOptions.searchTerm) {
        query = query.or(
          `code.ilike.%${queryOptions.searchTerm}%,description.ilike.%${queryOptions.searchTerm}%`
        );
      }

      // Apply pagination and sorting
      query = query
        .order("created_at", { ascending: false })
        .range(offset, offset + queryOptions.limit - 1);

      const { data, error: queryError, count } = await query;

      if (queryError) throw queryError;

      setPromoCodes(data || []);
      setPagination({
        page: queryOptions.page,
        limit: queryOptions.limit,
        totalCount: count || 0,
        totalPages: Math.ceil((count || 0) / queryOptions.limit),
      });

      return {
        promoCodes: data || [],
        totalCount: count || 0,
      };
    } catch (err) {
      console.error("[usePromoCodes] Error fetching promo codes:", err);
      setError(err.message);
      toast.error(`Error fetching promo codes: ${err.message}`);
      return { promoCodes: [], totalCount: 0 };
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.limit, filters]);

  /**
   * Fetch single promo code by ID
   */
  const fetchPromoCodeById = async (promoCodeId) => {
    setLoading(true);
    setError(null);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data, error: queryError } = await supabase
        .from("promo_codes")
        .select("*")
        .eq("id", promoCodeId)
        .single();

      if (queryError) throw queryError;

      return data;
    } catch (err) {
      console.error("[usePromoCodes] Error fetching promo code:", err);
      setError(err.message);
      toast.error(`Error fetching promo code: ${err.message}`);
      return null;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Get usage statistics for a promo code
   */
  const getUsageStats = async (promoCodeId) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // First, get the promo code to get its code string
      const { data: promoCode, error: promoError } = await supabase
        .from("promo_codes")
        .select("code")
        .eq("id", promoCodeId)
        .single();

      if (promoError || !promoCode) {
        throw new Error("Promo code not found");
      }

      // Count purchases using this promo code (promo_code stores the code string, not ID)
      const { data: purchases, error: purchaseError } = await supabase
        .from("ticket_purchases")
        .select("id, final_amount, discount_amount, created_at")
        .eq("promo_code", promoCode.code);

      if (purchaseError) throw purchaseError;

      const totalUsage = purchases?.length || 0;
      const totalDiscount = purchases?.reduce(
        (sum, p) => sum + parseFloat(p.discount_amount || 0),
        0
      ) || 0;

      return {
        totalUsage,
        totalDiscount,
        purchases: purchases || [],
      };
    } catch (err) {
      console.error("[usePromoCodes] Error fetching usage stats:", err);
      throw err;
    }
  };

  /**
   * Create a new promo code
   */
  const createPromoCode = async (promoCodeData) => {
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

      // Check if code already exists
      const { data: existing, error: checkError } = await supabase
        .from("promo_codes")
        .select("id")
        .eq("code", promoCodeData.code.toUpperCase())
        .single();

      if (existing) {
        throw new Error("A promo code with this code already exists");
      }

      const { data, error: insertError } = await supabase
        .from("promo_codes")
        .insert({
          ...promoCodeData,
          code: promoCodeData.code.toUpperCase(),
          used_count: 0,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (insertError) throw insertError;

      // Update local state
      setPromoCodes((prev) => [data, ...prev]);

      toast.success("Promo code created successfully");
      return data;
    } catch (err) {
      console.error("[usePromoCodes] Error creating promo code:", err);
      setError(err.message);
      toast.error(`Error creating promo code: ${err.message}`);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Update an existing promo code
   */
  const updatePromoCode = async (promoCodeId, updates) => {
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

      // If code is being updated, check for duplicates
      if (updates.code) {
        const { data: existing, error: checkError } = await supabase
          .from("promo_codes")
          .select("id")
          .eq("code", updates.code.toUpperCase())
          .neq("id", promoCodeId)
          .single();

        if (existing) {
          throw new Error("A promo code with this code already exists");
        }
      }

      const updateData = {
        ...updates,
        updated_at: new Date().toISOString(),
      };

      if (updateData.code) {
        updateData.code = updateData.code.toUpperCase();
      }

      const { data, error: updateError } = await supabase
        .from("promo_codes")
        .update(updateData)
        .eq("id", promoCodeId)
        .select()
        .single();

      if (updateError) throw updateError;

      // Update local state
      setPromoCodes((prev) =>
        prev.map((pc) => (pc.id === promoCodeId ? data : pc))
      );

      toast.success("Promo code updated successfully");
      return data;
    } catch (err) {
      console.error("[usePromoCodes] Error updating promo code:", err);
      setError(err.message);
      toast.error(`Error updating promo code: ${err.message}`);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Delete a promo code
   */
  const deletePromoCode = async (promoCodeId) => {
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

      // Get the promo code string first
      const { data: promoCode, error: promoError } = await supabase
        .from("promo_codes")
        .select("code")
        .eq("id", promoCodeId)
        .single();

      if (promoError || !promoCode) {
        throw new Error("Promo code not found");
      }

      // Check if promo code has been used (promo_code stores the code string, not ID)
      const { data: purchases, error: checkError } = await supabase
        .from("ticket_purchases")
        .select("id")
        .eq("promo_code", promoCode.code)
        .limit(1);

      if (checkError) throw checkError;

      if (purchases && purchases.length > 0) {
        throw new Error(
          "Cannot delete promo code that has been used. Deactivate it instead."
        );
      }

      const { error: deleteError } = await supabase
        .from("promo_codes")
        .delete()
        .eq("id", promoCodeId);

      if (deleteError) throw deleteError;

      // Update local state
      setPromoCodes((prev) => prev.filter((pc) => pc.id !== promoCodeId));

      toast.success("Promo code deleted successfully");
      return true;
    } catch (err) {
      console.error("[usePromoCodes] Error deleting promo code:", err);
      setError(err.message);
      toast.error(`Error deleting promo code: ${err.message}`);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Toggle active status of a promo code
   */
  const toggleActiveStatus = async (promoCodeId, isActive) => {
    return await updatePromoCode(promoCodeId, { is_active: isActive });
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

  // Fetch promo codes when filters or pagination changes
  useEffect(() => {
    fetchPromoCodes();
  }, [filters, pagination.page, pagination.limit]);

  // Real-time subscription for promo codes
  useEffect(() => {
    const promoCodesSubscription = supabase
      .channel("promo_codes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "promo_codes" },
        () => fetchPromoCodes()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(promoCodesSubscription);
    };
  }, [fetchPromoCodes]);

  return {
    promoCodes,
    loading,
    error,
    pagination,
    filters,
    fetchPromoCodes,
    fetchPromoCodeById,
    getUsageStats,
    createPromoCode,
    updatePromoCode,
    deletePromoCode,
    toggleActiveStatus,
    updateFilters,
    changePage,
    changeLimit,
  };
}
