import { createSupabaseServerClient } from "@/lib/supabaseServer";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const supabase = createSupabaseServerClient(req, res);

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

    const { ticketType, organization, searchTerm } = req.query;

    let query = supabase
      .from("attendees")
      .select(
        `
        *,
        purchase:ticket_purchases(
          id,
          status,
          payment_status,
          created_at,
          final_amount
        ),
        purchaser:purchasers(
          full_name,
          email,
          organization,
          country,
          visa_letter_needed,
          passport_name,
          nationality
        )
      `
      );

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

    query = query.order("created_at", { ascending: false });

    const { data, error } = await query;

    if (error) {
      console.error("[API] Error fetching attendees for export:", error);
      return res.status(500).json({ error: "Failed to fetch attendees" });
    }

    const csvHeaders = [
      "Name",
      "Email",
      "Role",
      "Organization",
      "Ticket Type",
      "Purchaser Name",
      "Purchaser Email",
      "Country",
      "Visa Letter",
      "Passport Name",
      "Nationality",
      "Payment Status",
      "Registration Date",
    ];

    const csvRows = data.map((attendee) => [
      attendee.full_name || "",
      attendee.email || "",
      attendee.role || "",
      attendee.organization || "",
      attendee.ticket_type || "",
      attendee.purchaser?.full_name || "",
      attendee.purchaser?.email || "",
      attendee.purchaser?.country || "",
      attendee.purchaser?.visa_letter_needed ? "Yes" : "No",
      attendee.purchaser?.passport_name || "",
      attendee.purchaser?.nationality || "",
      attendee.purchase?.payment_status || "",
      attendee.created_at
        ? new Date(attendee.created_at).toISOString().split("T")[0]
        : "",
    ]);

    const csvContent = [
      csvHeaders.join(","),
      ...csvRows.map((row) =>
        row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(",")
      ),
    ].join("\n");

    const filename = `summit-attendees-${new Date().toISOString().split("T")[0]}.csv`;
    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);

    return res.status(200).send(csvContent);
  } catch (error) {
    console.error("[API] Error in attendees export endpoint:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}
