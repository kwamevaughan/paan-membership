/**
 * Audit logging utility for tracking sensitive operations
 */

/**
 * Log an audit event
 * @param {object} supabase - Supabase client
 * @param {string} userId - User ID performing the action
 * @param {string} action - Action performed (e.g., 'refund', 'status_change', 'reconcile')
 * @param {string} entityType - Type of entity (e.g., 'purchase', 'payment', 'ticket_type')
 * @param {string} entityId - ID of the entity
 * @param {object} changes - Object containing old and new values
 * @param {object} metadata - Additional metadata
 */
export async function logAudit(
  supabase,
  userId,
  action,
  entityType,
  entityId,
  changes = {},
  metadata = {}
) {
  try {
    const { error } = await supabase.from("audit_logs").insert({
      user_id: userId,
      action,
      entity_type: entityType,
      entity_id: entityId,
      changes,
      metadata,
      ip_address: metadata.ip_address || null,
      user_agent: metadata.user_agent || null,
    });

    if (error) {
      console.error("Failed to log audit event:", error);
      // Don't throw - audit logging should not break the main operation
    }
  } catch (error) {
    console.error("Error in audit logging:", error);
  }
}

/**
 * Log a refund operation
 */
export async function logRefund(
  supabase,
  userId,
  purchaseId,
  refundData,
  metadata = {}
) {
  return logAudit(
    supabase,
    userId,
    "refund",
    "purchase",
    purchaseId,
    {
      amount: refundData.amount,
      reason: refundData.reason,
      status: refundData.status,
    },
    metadata
  );
}

/**
 * Log a status change
 */
export async function logStatusChange(
  supabase,
  userId,
  entityType,
  entityId,
  oldStatus,
  newStatus,
  metadata = {}
) {
  return logAudit(
    supabase,
    userId,
    "status_change",
    entityType,
    entityId,
    {
      old_status: oldStatus,
      new_status: newStatus,
    },
    metadata
  );
}

/**
 * Log a payment reconciliation
 */
export async function logReconciliation(
  supabase,
  userId,
  paymentId,
  reconciliationData,
  metadata = {}
) {
  return logAudit(
    supabase,
    userId,
    "reconcile",
    "payment",
    paymentId,
    {
      old_status: reconciliationData.old_status,
      new_status: reconciliationData.new_status,
      notes: reconciliationData.notes,
    },
    metadata
  );
}

/**
 * Log a create operation
 */
export async function logCreate(
  supabase,
  userId,
  entityType,
  entityId,
  entityData,
  metadata = {}
) {
  return logAudit(
    supabase,
    userId,
    "create",
    entityType,
    entityId,
    {
      data: entityData,
    },
    metadata
  );
}

/**
 * Log an update operation
 */
export async function logUpdate(
  supabase,
  userId,
  entityType,
  entityId,
  oldData,
  newData,
  metadata = {}
) {
  return logAudit(
    supabase,
    userId,
    "update",
    entityType,
    entityId,
    {
      old_data: oldData,
      new_data: newData,
    },
    metadata
  );
}

/**
 * Log a delete operation
 */
export async function logDelete(
  supabase,
  userId,
  entityType,
  entityId,
  entityData,
  metadata = {}
) {
  return logAudit(
    supabase,
    userId,
    "delete",
    entityType,
    entityId,
    {
      data: entityData,
    },
    metadata
  );
}

/**
 * Log bulk email send
 */
export async function logBulkEmail(
  supabase,
  userId,
  recipientCount,
  emailData,
  metadata = {}
) {
  return logAudit(
    supabase,
    userId,
    "bulk_email",
    "email",
    null,
    {
      recipient_count: recipientCount,
      subject: emailData.subject,
      filters: emailData.filters,
    },
    metadata
  );
}

/**
 * Log export operation
 */
export async function logExport(
  supabase,
  userId,
  exportType,
  recordCount,
  metadata = {}
) {
  return logAudit(
    supabase,
    userId,
    "export",
    exportType,
    null,
    {
      record_count: recordCount,
      format: metadata.format || "csv",
    },
    metadata
  );
}

/**
 * Get audit log summary for an entity
 */
export async function getAuditHistory(supabase, entityType, entityId) {
  try {
    const { data, error } = await supabase
      .from("audit_logs")
      .select(
        `
        *,
        user:hr_users(id, name, email)
      `
      )
      .eq("entity_type", entityType)
      .eq("entity_id", entityId)
      .order("created_at", { ascending: false })
      .limit(50);

    if (error) {
      throw error;
    }

    return data;
  } catch (error) {
    console.error("Error fetching audit history:", error);
    return [];
  }
}

/**
 * Format audit log for display
 */
export function formatAuditLog(log) {
  const actionLabels = {
    create: "Created",
    update: "Updated",
    delete: "Deleted",
    refund: "Refunded",
    status_change: "Changed Status",
    reconcile: "Reconciled",
    bulk_email: "Sent Bulk Email",
    export: "Exported Data",
  };

  const entityLabels = {
    purchase: "Purchase",
    payment: "Payment",
    ticket_type: "Ticket Type",
    promo_code: "Promo Code",
    attendee: "Attendee",
    email: "Email",
  };

  return {
    action: actionLabels[log.action] || log.action,
    entity: entityLabels[log.entity_type] || log.entity_type,
    user: log.user?.name || "Unknown User",
    timestamp: new Date(log.created_at).toLocaleString(),
    changes: log.changes,
    metadata: log.metadata,
  };
}
