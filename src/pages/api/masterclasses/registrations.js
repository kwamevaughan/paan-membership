// API endpoint for masterclass registrations management
import { supabase, supabaseAdmin } from "@/lib/supabase";

export default async function handler(req, res) {
  const { method } = req;

  try {
    switch (method) {
      case "GET":
        return await getRegistrations(req, res);
      case "POST":
        return await createRegistration(req, res);
      case "PUT":
        return await updateRegistration(req, res);
      default:
        res.setHeader("Allow", ["GET", "POST", "PUT"]);
        return res.status(405).json({ error: `Method ${method} Not Allowed` });
    }
  } catch (error) {
    console.error("Registrations API error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}

async function getRegistrations(req, res) {
  const {
    masterclass_id,
    user_id,
    payment_status,
    attendance_status,
    page = 1,
    limit = 20,
    search,
  } = req.query;

  // Use admin client for broader access to registrations
  const client = supabaseAdmin || supabase;

  let query = client.from("masterclass_registrations").select(`
      *,
      masterclass:masterclasses(id, title, start_date, end_date, image_url),
      payments:masterclass_payments(id, amount, status, payment_method, created_at)
    `);

  // Apply filters
  if (masterclass_id) {
    query = query.eq("masterclass_id", masterclass_id);
  }

  if (user_id) {
    query = query.eq("user_id", user_id);
  }

  if (payment_status) {
    query = query.eq("payment_status", payment_status);
  }

  if (attendance_status) {
    query = query.eq("attendance_status", attendance_status);
  }

  if (search) {
    query = query.or(
      `customer_name.ilike.%${search}%, customer_email.ilike.%${search}%, customer_organization.ilike.%${search}%`
    );
  }

  // Pagination
  const offset = (parseInt(page) - 1) * parseInt(limit);
  query = query.range(offset, offset + parseInt(limit) - 1);

  // Order by creation date
  query = query.order("created_at", { ascending: false });

  const { data, error, count } = await query;

  if (error) {
    console.error("Error fetching registrations:", error);
    return res.status(400).json({ error: error.message });
  }

  return res.status(200).json({
    data,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total: count,
      totalPages: Math.ceil(count / parseInt(limit)),
    },
  });
}

async function createRegistration(req, res) {
  const {
    masterclass_id,
    user_id,
    seats_booked = 1,
    customer_name,
    customer_email,
    customer_phone,
    customer_organization,
    is_member_pricing = false,
    payment_reference,
    registration_source = "web",
    notes,
    ticket_reference,
  } = req.body;

  // Validation
  if (!masterclass_id || !customer_email) {
    return res.status(400).json({
      error: "Missing required fields: masterclass_id, customer_email",
    });
  }

  // Check if this is an admin operation
  const isAdminOperation = registration_source === "admin";
  const client = isAdminOperation && supabaseAdmin ? supabaseAdmin : supabase;

  // Get masterclass details for pricing
  const { data: masterclass, error: masterclassError } = await client
    .from("masterclasses")
    .select(
      "member_price, non_member_price, available_seats, currency, max_seats"
    )
    .eq("id", masterclass_id)
    .single();

  if (masterclassError || !masterclass) {
    return res.status(404).json({ error: "Masterclass not found" });
  }

  // Check seat availability
  if (masterclass.available_seats < seats_booked) {
    return res.status(400).json({
      error: `Only ${masterclass.available_seats} seats available`,
    });
  }

  // Calculate total amount
  const price_per_seat = is_member_pricing
    ? masterclass.member_price
    : masterclass.non_member_price;
  const total_amount = price_per_seat * seats_booked;

  // Generate ticket reference if not provided
  const finalTicketReference =
    ticket_reference ||
    `TICKET-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;

  // Start transaction
  const { data, error } = await client
    .from("masterclass_registrations")
    .insert({
      masterclass_id,
      user_id,
      seats_booked,
      total_amount,
      currency: masterclass.currency,
      is_member_pricing,
      customer_name,
      customer_email,
      customer_phone,
      customer_organization,
      payment_reference,
      registration_source,
      notes,
      ticket_reference: finalTicketReference,
    })
    .select()
    .single();

  if (error) {
    console.error("Error creating registration:", error);
    return res.status(400).json({ error: error.message });
  }

  // Update available seats
  const { error: updateError } = await client
    .from("masterclasses")
    .update({
      available_seats: masterclass.available_seats - seats_booked,
    })
    .eq("id", masterclass_id);

  if (updateError) {
    console.error("Error updating available seats:", updateError);
    // Note: In production, you'd want to rollback the registration here
  }

  return res.status(201).json({ data });
}

async function updateRegistration(req, res) {
  const {
    id,
    payment_status,
    attendance_status,
    payment_date,
    refund_date,
    ticket_reference,
    reissued_at,
    completion_status,
    certificate_issued,
    certificate_url,
    notes,
  } = req.body;

  if (!id) {
    return res.status(400).json({
      error: "Missing required field: id",
    });
  }

  // Use admin client for admin operations
  const client = supabaseAdmin || supabase;

  const updateData = {};

  if (payment_status) updateData.payment_status = payment_status;
  if (attendance_status) updateData.attendance_status = attendance_status;
  if (payment_date) updateData.payment_date = payment_date;
  if (refund_date) updateData.refund_date = refund_date;
  if (ticket_reference) updateData.ticket_reference = ticket_reference;
  if (reissued_at) updateData.reissued_at = reissued_at;
  if (completion_status) updateData.completion_status = completion_status;
  if (certificate_issued !== undefined)
    updateData.certificate_issued = certificate_issued;
  if (certificate_url) updateData.certificate_url = certificate_url;
  if (notes) updateData.notes = notes;

  // Always update the updated_at timestamp
  updateData.updated_at = new Date().toISOString();

  // Get current registration data to check for status changes
  const { data: currentRegistration } = await client
    .from("masterclass_registrations")
    .select("attendance_status, seats_booked, masterclass_id")
    .eq("id", id)
    .single();

  const { data, error } = await client
    .from("masterclass_registrations")
    .update(updateData)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("Error updating registration:", error);
    return res.status(400).json({ error: error.message });
  }

  // Update available seats if attendance status changed to/from cancelled
  if (attendance_status && currentRegistration) {
    const wasActive = currentRegistration.attendance_status !== 'cancelled';
    const isNowActive = attendance_status !== 'cancelled';
    
    if (wasActive !== isNowActive) {
      // Get current masterclass data
      const { data: masterclass } = await client
        .from("masterclasses")
        .select("available_seats")
        .eq("id", currentRegistration.masterclass_id)
        .single();
      
      if (masterclass) {
        const seatChange = isNowActive ? -currentRegistration.seats_booked : currentRegistration.seats_booked;
        const newAvailableSeats = Math.max(0, masterclass.available_seats + seatChange);
        
        await client
          .from("masterclasses")
          .update({ available_seats: newAvailableSeats })
          .eq("id", currentRegistration.masterclass_id);
      }
    }
  }

  return res.status(200).json({ data });
}
