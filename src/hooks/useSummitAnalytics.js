import { useState, useEffect, useCallback } from "react";
import toast from "react-hot-toast";
import { supabase } from "@/lib/supabase";

/**
 * Custom hook for fetching summit analytics
 * Handles revenue, ticket sales, geographic data, and promo code usage
 */
export function useSummitAnalytics() {
  const [analytics, setAnalytics] = useState({
    revenue: {},
    ticketSales: {},
    geographic: {},
    summary: {},
    promoCodes: [],
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [dateRange, setDateRange] = useState("all");

  /**
   * Calculate date range based on preset
   */
  const getDateRange = (preset) => {
    const now = new Date();
    let startDate = null;
    let endDate = now.toISOString();

    switch (preset) {
      case "today":
        startDate = new Date(now.setHours(0, 0, 0, 0)).toISOString();
        break;
      case "week":
        startDate = new Date(now.setDate(now.getDate() - 7)).toISOString();
        break;
      case "month":
        startDate = new Date(now.setDate(now.getDate() - 30)).toISOString();
        break;
      case "quarter":
        startDate = new Date(now.setDate(now.getDate() - 90)).toISOString();
        break;
      case "year":
        startDate = new Date(now.setFullYear(now.getFullYear() - 1)).toISOString();
        break;
      case "all":
      default:
        startDate = null;
        break;
    }

    return { startDate, endDate };
  };

  /**
   * Fetch analytics data
   */
  const fetchAnalytics = useCallback(async (preset = "all") => {
    setLoading(true);
    setError(null);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { startDate, endDate } = getDateRange(preset);

      // Build base query for purchases
      let purchasesQuery = supabase
        .from("ticket_purchases")
        .select(
          `
          id,
          final_amount,
          currency,
          status,
          payment_status,
          discount_amount,
          created_at,
          paid_at,
          items:purchase_items(
            ticket_type_id,
            quantity,
            ticket_name,
            ticket_type:ticket_types(name, category)
          ),
          purchaser:purchasers(country, organization)
        `
        );

      if (startDate) {
        purchasesQuery = purchasesQuery.gte("created_at", startDate);
      }
      if (endDate) {
        purchasesQuery = purchasesQuery.lte("created_at", endDate);
      }

      const { data: purchases, error: purchasesError } = await purchasesQuery;

      if (purchasesError) throw purchasesError;

      // Calculate revenue metrics
      const completedPurchases = purchases.filter(
        (p) => p.payment_status === "completed"
      );

      const totalRevenue = completedPurchases.reduce(
        (sum, p) => sum + parseFloat(p.final_amount || 0),
        0
      );

      const totalDiscounts = completedPurchases.reduce(
        (sum, p) => sum + parseFloat(p.discount_amount || 0),
        0
      );

      const totalTransactions = completedPurchases.length;
      const averageTransactionValue = totalTransactions > 0
        ? totalRevenue / totalTransactions
        : 0;

      // Calculate ticket sales by type
      const ticketSalesByType = {};
      completedPurchases.forEach((purchase) => {
        purchase.items?.forEach((item) => {
          const ticketName = item.ticket_name || item.ticket_type?.name || "Unknown";
          if (!ticketSalesByType[ticketName]) {
            ticketSalesByType[ticketName] = {
              name: ticketName,
              quantity: 0,
              revenue: 0,
            };
          }
          ticketSalesByType[ticketName].quantity += item.quantity || 0;
          ticketSalesByType[ticketName].revenue +=
            parseFloat(item.total_price || 0);
        });
      });

      // Calculate geographic distribution
      const geographicData = {};
      completedPurchases.forEach((purchase) => {
        const country = purchase.purchaser?.country || "Unknown";
        if (!geographicData[country]) {
          geographicData[country] = {
            country,
            purchases: 0,
            revenue: 0,
            attendees: 0,
          };
        }
        geographicData[country].purchases += 1;
        geographicData[country].revenue += parseFloat(purchase.final_amount || 0);
        // Count attendees from purchase items
        purchase.items?.forEach((item) => {
          geographicData[country].attendees += item.quantity || 0;
        });
      });

      // Get promo code usage
      const { data: promoCodes, error: promoCodesError } = await supabase
        .from("promo_codes")
        .select("id, code, used_count, discount_value, discount_type");

      if (promoCodesError) {
        console.warn("Error fetching promo codes:", promoCodesError);
      }

      // Calculate summary stats
      const pendingPurchases = purchases.filter(
        (p) => p.payment_status === "pending"
      ).length;

      const failedPurchases = purchases.filter(
        (p) => p.payment_status === "failed"
      ).length;

      const refundedPurchases = purchases.filter(
        (p) => p.status === "refunded"
      ).length;

      const totalTicketsSold = Object.values(ticketSalesByType).reduce(
        (sum, type) => sum + type.quantity,
        0
      );

      setAnalytics({
        revenue: {
          total: totalRevenue,
          discounts: totalDiscounts,
          averageTransaction: averageTransactionValue,
          currency: "USD", // Default, could be dynamic
        },
        ticketSales: {
          byType: Object.values(ticketSalesByType),
          total: totalTicketsSold,
        },
        geographic: {
          byCountry: Object.values(geographicData),
        },
        summary: {
          totalPurchases: purchases.length,
          completedPurchases: totalTransactions,
          pendingPurchases,
          failedPurchases,
          refundedPurchases,
          totalTicketsSold,
        },
        promoCodes: promoCodes || [],
      });

      return {
        revenue: {
          total: totalRevenue,
          discounts: totalDiscounts,
          averageTransaction: averageTransactionValue,
        },
        ticketSales: {
          byType: Object.values(ticketSalesByType),
          total: totalTicketsSold,
        },
        geographic: {
          byCountry: Object.values(geographicData),
        },
        summary: {
          totalPurchases: purchases.length,
          completedPurchases: totalTransactions,
          pendingPurchases,
          failedPurchases,
          refundedPurchases,
          totalTicketsSold,
        },
        promoCodes: promoCodes || [],
      };
    } catch (err) {
      console.error("[useSummitAnalytics] Error fetching analytics:", err);
      setError(err.message);
      toast.error(`Error fetching analytics: ${err.message}`);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Update date range and refetch
   */
  const updateDateRange = (preset) => {
    setDateRange(preset);
    fetchAnalytics(preset);
  };

  // Fetch analytics on mount
  useEffect(() => {
    fetchAnalytics(dateRange);
  }, []);

  return {
    analytics,
    loading,
    error,
    dateRange,
    fetchAnalytics,
    updateDateRange,
  };
}
