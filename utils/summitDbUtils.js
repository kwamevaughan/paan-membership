import { createSupabaseServerClient } from "@/lib/supabaseServer";

/**
 * Summit Database Utilities
 * Helper functions for summit ticket management queries
 */

// ============================================================================
// PURCHASE QUERIES
// ============================================================================

/**
 * Fetch all ticket purchases with pagination and filters
 * @param {Object} supabaseServer - Supabase server client
 * @param {Object} options - Query options
 * @returns {Promise<Object>} Purchases data with pagination info
 */
export async function fetchPurchases(supabaseServer, options = {}) {
  const {
    page = 1,
    limit = 50,
    status,
    paymentStatus,
    dateFrom,
    dateTo,
    ticketType,
    searchTerm,
  } = options;

  const offset = (page - 1) * limit;

  try {
    let query = supabaseServer
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
    if (status) {
      query = query.eq("status", status);
    }
    if (paymentStatus) {
      query = query.eq("payment_status", paymentStatus);
    }
    if (dateFrom) {
      query = query.gte("created_at", dateFrom);
    }
    if (dateTo) {
      query = query.lte("created_at", dateTo);
    }

    // Apply pagination
    query = query
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    const { data, error, count } = await query;

    if (error) throw error;

    return {
      purchases: data || [],
      totalCount: count || 0,
      page,
      limit,
      totalPages: Math.ceil((count || 0) / limit),
    };
  } catch (error) {
    console.error("[fetchPurchases] Error:", error);
    throw error;
  }
}

/**
 * Fetch single purchase with full details
 * @param {Object} supabaseServer - Supabase server client
 * @param {string} purchaseId - Purchase ID
 * @returns {Promise<Object>} Complete purchase details
 */
export async function fetchPurchaseById(supabaseServer, purchaseId) {
  try {
    const { data: purchase, error: purchaseError } = await supabaseServer
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

    if (purchaseError) throw purchaseError;

    return purchase;
  } catch (error) {
    console.error("[fetchPurchaseById] Error:", error);
    throw error;
  }
}

// ============================================================================
// TICKET TYPE QUERIES
// ============================================================================

/**
 * Fetch all ticket types
 * @param {Object} supabaseServer - Supabase server client
 * @param {boolean} activeOnly - Fetch only active ticket types
 * @returns {Promise<Array>} Ticket types
 */
export async function fetchTicketTypes(supabaseServer, activeOnly = false) {
  try {
    let query = supabaseServer
      .from("ticket_types")
      .select("*")
      .order("category")
      .order("price");

    if (activeOnly) {
      query = query.eq("is_active", true);
    }

    const { data, error } = await query;

    if (error) throw error;

    return data || [];
  } catch (error) {
    console.error("[fetchTicketTypes] Error:", error);
    throw error;
  }
}

/**
 * Fetch single ticket type by ID
 * @param {Object} supabaseServer - Supabase server client
 * @param {string} ticketTypeId - Ticket type ID
 * @returns {Promise<Object>} Ticket type
 */
export async function fetchTicketTypeById(supabaseServer, ticketTypeId) {
  try {
    const { data, error } = await supabaseServer
      .from("ticket_types")
      .select("*")
      .eq("id", ticketTypeId)
      .single();

    if (error) throw error;

    return data;
  } catch (error) {
    console.error("[fetchTicketTypeById] Error:", error);
    throw error;
  }
}

// ============================================================================
// PROMO CODE QUERIES
// ============================================================================

/**
 * Fetch all promo codes
 * @param {Object} supabaseServer - Supabase server client
 * @param {boolean} activeOnly - Fetch only active promo codes
 * @returns {Promise<Array>} Promo codes
 */
export async function fetchPromoCodes(supabaseServer, activeOnly = false) {
  try {
    let query = supabaseServer
      .from("promo_codes")
      .select("*")
      .order("created_at", { ascending: false });

    if (activeOnly) {
      query = query.eq("is_active", true);
    }

    const { data, error } = await query;

    if (error) throw error;

    return data || [];
  } catch (error) {
    console.error("[fetchPromoCodes] Error:", error);
    throw error;
  }
}

/**
 * Fetch single promo code by ID
 * @param {Object} supabaseServer - Supabase server client
 * @param {string} promoCodeId - Promo code ID
 * @returns {Promise<Object>} Promo code
 */
export async function fetchPromoCodeById(supabaseServer, promoCodeId) {
  try {
    const { data, error } = await supabaseServer
      .from("promo_codes")
      .select("*")
      .eq("id", promoCodeId)
      .single();

    if (error) throw error;

    return data;
  } catch (error) {
    console.error("[fetchPromoCodeById] Error:", error);
    throw error;
  }
}

/**
 * Validate promo code
 * @param {Object} supabaseServer - Supabase server client
 * @param {string} code - Promo code string
 * @returns {Promise<Object>} Validation result
 */
export async function validatePromoCode(supabaseServer, code) {
  try {
    const { data, error } = await supabaseServer
      .from("promo_codes")
      .select("*")
      .eq("code", code.toUpperCase())
      .eq("is_active", true)
      .single();

    if (error) {
      return {
        valid: false,
        message: "Invalid promo code",
      };
    }

    const now = new Date();
    const validFrom = new Date(data.valid_from);
    const validUntil = data.valid_until ? new Date(data.valid_until) : null;

    // Check validity period
    if (now < validFrom) {
      return {
        valid: false,
        message: "Promo code is not yet active",
      };
    }

    if (validUntil && now > validUntil) {
      return {
        valid: false,
        message: "Promo code has expired",
      };
    }

    // Check usage limit
    if (data.usage_limit && data.used_count >= data.usage_limit) {
      return {
        valid: false,
        message: "Promo code usage limit reached",
      };
    }

    return {
      valid: true,
      promoCode: data,
    };
  } catch (error) {
    console.error("[validatePromoCode] Error:", error);
    return {
      valid: false,
      message: "Error validating promo code",
    };
  }
}

// ============================================================================
// ATTENDEE QUERIES
// ============================================================================

/**
 * Fetch all attendees with filters
 * @param {Object} supabaseServer - Supabase server client
 * @param {Object} options - Query options
 * @returns {Promise<Object>} Attendees data with pagination
 */
export async function fetchAttendees(supabaseServer, options = {}) {
  const {
    page = 1,
    limit = 100,
    ticketType,
    organization,
    searchTerm,
  } = options;

  const offset = (page - 1) * limit;

  try {
    let query = supabaseServer
      .from("attendees")
      .select(
        `
        *,
        purchase:ticket_purchases(
          id,
          status,
          payment_status,
          created_at
        ),
        purchaser:purchasers(
          full_name,
          email,
          organization,
          country,
          visa_letter_needed
        )
      `,
        { count: "exact" }
      );

    // Apply filters
    if (ticketType) {
      query = query.eq("ticket_type", ticketType);
    }
    if (organization) {
      query = query.ilike("organization", `%${organization}%`);
    }
    if (searchTerm) {
      query = query.or(
        `full_name.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%`
      );
    }

    // Apply pagination
    query = query
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    const { data, error, count } = await query;

    if (error) throw error;

    return {
      attendees: data || [],
      totalCount: count || 0,
      page,
      limit,
      totalPages: Math.ceil((count || 0) / limit),
    };
  } catch (error) {
    console.error("[fetchAttendees] Error:", error);
    throw error;
  }
}

// ============================================================================
// PAYMENT TRANSACTION QUERIES
// ============================================================================

/**
 * Fetch payment transactions with filters
 * @param {Object} supabaseServer - Supabase server client
 * @param {Object} options - Query options
 * @returns {Promise<Object>} Payment transactions with pagination
 */
export async function fetchPaymentTransactions(supabaseServer, options = {}) {
  const { page = 1, limit = 50, status, paymentMethod } = options;

  const offset = (page - 1) * limit;

  try {
    let query = supabaseServer
      .from("payment_transactions")
      .select(
        `
        *,
        purchase:ticket_purchases(
          id,
          purchaser:purchasers(full_name, email)
        )
      `,
        { count: "exact" }
      );

    // Apply filters
    if (status) {
      query = query.eq("status", status);
    }
    if (paymentMethod) {
      query = query.eq("payment_method", paymentMethod);
    }

    // Apply pagination
    query = query
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    const { data, error, count } = await query;

    if (error) throw error;

    return {
      transactions: data || [],
      totalCount: count || 0,
      page,
      limit,
      totalPages: Math.ceil((count || 0) / limit),
    };
  } catch (error) {
    console.error("[fetchPaymentTransactions] Error:", error);
    throw error;
  }
}

// ============================================================================
// ANALYTICS QUERIES
// ============================================================================

/**
 * Fetch revenue analytics
 * @param {Object} supabaseServer - Supabase server client
 * @param {Object} options - Query options
 * @returns {Promise<Object>} Revenue analytics data
 */
export async function fetchRevenueAnalytics(supabaseServer, options = {}) {
  const { dateFrom, dateTo } = options;

  try {
    let query = supabaseServer
      .from("ticket_purchases")
      .select("final_amount, created_at, status, payment_status")
      .eq("payment_status", "completed");

    if (dateFrom) {
      query = query.gte("created_at", dateFrom);
    }
    if (dateTo) {
      query = query.lte("created_at", dateTo);
    }

    const { data, error } = await query;

    if (error) throw error;

    // Calculate total revenue
    const totalRevenue = data.reduce(
      (sum, purchase) => sum + parseFloat(purchase.final_amount),
      0
    );

    return {
      totalRevenue,
      purchaseCount: data.length,
      purchases: data,
    };
  } catch (error) {
    console.error("[fetchRevenueAnalytics] Error:", error);
    throw error;
  }
}

/**
 * Fetch ticket sales by type
 * @param {Object} supabaseServer - Supabase server client
 * @param {Object} options - Query options
 * @returns {Promise<Array>} Ticket sales by type
 */
export async function fetchTicketSalesByType(supabaseServer, options = {}) {
  const { dateFrom, dateTo } = options;

  try {
    let query = supabaseServer
      .from("purchase_items")
      .select(
        `
        ticket_name,
        quantity,
        total_price,
        purchase:ticket_purchases!inner(
          payment_status,
          created_at
        )
      `
      )
      .eq("purchase.payment_status", "completed");

    if (dateFrom) {
      query = query.gte("purchase.created_at", dateFrom);
    }
    if (dateTo) {
      query = query.lte("purchase.created_at", dateTo);
    }

    const { data, error } = await query;

    if (error) throw error;

    // Aggregate by ticket type
    const aggregated = data.reduce((acc, item) => {
      const existing = acc.find((a) => a.ticketName === item.ticket_name);
      if (existing) {
        existing.quantity += item.quantity;
        existing.revenue += parseFloat(item.total_price);
      } else {
        acc.push({
          ticketName: item.ticket_name,
          quantity: item.quantity,
          revenue: parseFloat(item.total_price),
        });
      }
      return acc;
    }, []);

    return aggregated;
  } catch (error) {
    console.error("[fetchTicketSalesByType] Error:", error);
    throw error;
  }
}

/**
 * Fetch geographic distribution
 * @param {Object} supabaseServer - Supabase server client
 * @returns {Promise<Array>} Geographic distribution data
 */
export async function fetchGeographicDistribution(supabaseServer) {
  try {
    const { data, error } = await supabaseServer
      .from("purchasers")
      .select(
        `
        country,
        ticket_purchases!inner(
          payment_status
        )
      `
      )
      .eq("ticket_purchases.payment_status", "completed");

    if (error) throw error;

    // Aggregate by country
    const aggregated = data.reduce((acc, purchaser) => {
      const existing = acc.find((a) => a.country === purchaser.country);
      if (existing) {
        existing.count += 1;
      } else {
        acc.push({
          country: purchaser.country,
          count: 1,
        });
      }
      return acc;
    }, []);

    return aggregated.sort((a, b) => b.count - a.count);
  } catch (error) {
    console.error("[fetchGeographicDistribution] Error:", error);
    throw error;
  }
}

/**
 * Fetch summary statistics
 * @param {Object} supabaseServer - Supabase server client
 * @param {Object} options - Query options
 * @returns {Promise<Object>} Summary statistics
 */
export async function fetchSummaryStatistics(supabaseServer, options = {}) {
  const { dateFrom, dateTo } = options;

  try {
    // Fetch completed purchases
    let purchaseQuery = supabaseServer
      .from("ticket_purchases")
      .select("final_amount, discount_amount, payment_status")
      .eq("payment_status", "completed");

    if (dateFrom) {
      purchaseQuery = purchaseQuery.gte("created_at", dateFrom);
    }
    if (dateTo) {
      purchaseQuery = purchaseQuery.lte("created_at", dateTo);
    }

    const { data: purchases, error: purchaseError } = await purchaseQuery;
    if (purchaseError) throw purchaseError;

    // Fetch ticket count
    let itemQuery = supabaseServer
      .from("purchase_items")
      .select(
        `
        quantity,
        purchase:ticket_purchases!inner(payment_status)
      `
      )
      .eq("purchase.payment_status", "completed");

    const { data: items, error: itemError } = await itemQuery;
    if (itemError) throw itemError;

    const totalRevenue = purchases.reduce(
      (sum, p) => sum + parseFloat(p.final_amount),
      0
    );
    const totalDiscount = purchases.reduce(
      (sum, p) => sum + parseFloat(p.discount_amount || 0),
      0
    );
    const totalTickets = items.reduce((sum, i) => sum + i.quantity, 0);
    const averagePrice = totalTickets > 0 ? totalRevenue / totalTickets : 0;

    return {
      totalRevenue,
      totalDiscount,
      totalTickets,
      totalPurchases: purchases.length,
      averagePrice,
    };
  } catch (error) {
    console.error("[fetchSummaryStatistics] Error:", error);
    throw error;
  }
}
