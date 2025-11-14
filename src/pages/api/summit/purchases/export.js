import { createSupabaseServerClient } from "@/lib/supabaseServer";

/**
 * GET /api/summit/purchases/export
 * Exports purchases to CSV format with current filters applied
 */
export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const supabase = createSupabaseServerClient(req, res);

    // Verify admin authorization
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const { data: hrUser, error: hrError } = await supabase
      .from("hr_users")
      .select("id")
      .eq("id", user.id)
      .single();

    if (hrError || !hrUser) {
      return res.status(403).json({ error: "Forbidden - Admin access required" });
    }

    // Extract query parameters (same filters as list endpoint)
    const {
      status,
      paymentStatus,
      dateFrom,
      dateTo,
      ticketType,
      searchTerm,
    } = req.query;

    // Build query (no pagination for export)
    let query = supabase
      .from("ticket_purchases")
      .select(
        `
        id,
        payment_reference,
        total_amount,
        discount_amount,
        final_amount,
        currency,
        status,
        payment_method,
        payment_status,
        promo_code,
        created_at,
        paid_at,
        purchaser:purchasers(
          full_name,
          email,
          phone,
          organization,
          country,
          visa_letter_needed
        )
      `
      );

    // Apply same filters as list endpoint
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
    if (searchTerm) {
      query = query.or(`payment_reference.ilike.%${searchTerm}%`);
    }

    query = query.order("created_at", { ascending: false });

    const { data, error } = await query;

    if (error) {
      console.error("[API] Error fetching purchases for export:", error);
      return res.status(500).json({ error: "Failed to fetch purchases" });
    }

    // Convert to CSV format
    const csvHeaders = [
      "Purchase ID",
      "Reference",
      "Purchaser Name",
      "Purchaser Email",
      "Organization",
      "Country",
      "Total Amount",
      "Discount",
      "Final Amount",
      "Currency",
      "Status",
      "Payment Status",
      "Payment Method",
      "Promo Code",
      "Visa Letter",
      "Purchase Date",
      "Paid Date",
    ];

    const csvRows = data.map((purchase) => [
      purchase.id,
      purchase.payment_reference || "",
      purchase.purchaser?.full_name || "",
      purchase.purchaser?.email || "",
      purchase.purchaser?.organization || "",
      purchase.purchaser?.country || "",
      purchase.total_amount || 0,
      purchase.discount_amount || 0,
      purchase.final_amount || 0,
      purchase.currency || "USD",
      purchase.status || "",
      purchase.payment_status || "",
      purchase.payment_method || "",
      purchase.promo_code || "",
      purchase.purchaser?.visa_letter_needed ? "Yes" : "No",
      purchase.created_at
        ? new Date(purchase.created_at).toISOString().split("T")[0]
        : "",
      purchase.paid_at
        ? new Date(purchase.paid_at).toISOString().split("T")[0]
        : "",
    ]);

    // Build CSV string
    const csvContent = [
      csvHeaders.join(","),
      ...csvRows.map((row) =>
        row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(",")
      ),
    ].join("\n");

    // Set headers for file download
    const filename = `summit-purchases-${new Date().toISOString().split("T")[0]}.csv`;
    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);

    return res.status(200).send(csvContent);
  } catch (error) {
    console.error("[API] Error in purchases export endpoint:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}
