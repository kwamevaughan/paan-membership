import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import SimpleModal from "../SimpleModal";
import FormActions from "../forms/FormActions";
import { Icon } from "@iconify/react";

// Dynamically import EditorComponent for client-side only
const EditorComponent = dynamic(() => import("../EditorComponent"), {
  ssr: false,
  loading: () => <p>Loading editor...</p>,
});

/**
 * BulkEmailModal Component
 * Modal for composing and sending bulk emails to purchasers/attendees
 */
export function BulkEmailModal({
  isOpen,
  onClose,
  recipients = [],
  onSend,
  mode = "light",
  templates = [],
}) {
  const [formData, setFormData] = useState({
    subject: "",
    body: "",
    template_id: "",
    filter_by: "all",
    ticket_types: [],
    payment_status: [],
  });

  const [filteredRecipients, setFilteredRecipients] = useState([]);
  const [isSending, setIsSending] = useState(false);
  const [errors, setErrors] = useState({});
  const [showPreview, setShowPreview] = useState(false);

  // Reset form when modal opens/closes
  useEffect(() => {
    if (!isOpen) {
      setFormData({
        subject: "",
        body: "",
        template_id: "",
        filter_by: "all",
        ticket_types: [],
        payment_status: [],
      });
      setErrors({});
      setShowPreview(false);
    }
  }, [isOpen]);

  // Filter recipients based on criteria
  useEffect(() => {
    let filtered = [...recipients];

    if (formData.filter_by === "paid") {
      filtered = filtered.filter(
        (r) => r.payment_status === "completed"
      );
    } else if (formData.filter_by === "pending") {
      filtered = filtered.filter(
        (r) => r.payment_status === "pending"
      );
    } else if (formData.filter_by === "visa") {
      filtered = filtered.filter((r) => r.visa_letter_needed === true);
    }

    if (formData.ticket_types.length > 0) {
      filtered = filtered.filter((r) =>
        formData.ticket_types.includes(r.ticket_type)
      );
    }

    if (formData.payment_status.length > 0) {
      filtered = filtered.filter((r) =>
        formData.payment_status.includes(r.payment_status)
      );
    }

    setFilteredRecipients(filtered);
  }, [recipients, formData.filter_by, formData.ticket_types, formData.payment_status]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear error for this field
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const handleTemplateSelect = (e) => {
    const templateId = e.target.value;
    const template = templates.find((t) => t.id === templateId);

    if (template) {
      setFormData((prev) => ({
        ...prev,
        template_id: templateId,
        subject: template.subject || prev.subject,
        body: template.body || prev.body,
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        template_id: "",
      }));
    }
  };

  const handleEditorChange = (content) => {
    setFormData((prev) => ({
      ...prev,
      body: content,
    }));
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.subject.trim()) {
      newErrors.subject = "Subject is required";
    }

    if (!formData.body.trim()) {
      newErrors.body = "Email body is required";
    }

    if (filteredRecipients.length === 0) {
      newErrors.recipients = "No recipients match the selected criteria";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSend = async () => {
    if (!validateForm()) return;

    setIsSending(true);
    try {
      await onSend({
        ...formData,
        recipients: filteredRecipients.map((r) => ({
          email: r.email,
          name: r.full_name,
        })),
      });
      onClose();
    } catch (error) {
      console.error("Error sending emails:", error);
      setErrors({ submit: error.message || "Failed to send emails" });
    } finally {
      setIsSending(false);
    }
  };

  // Get unique ticket types from recipients
  const uniqueTicketTypes = [
    ...new Set(recipients.map((r) => r.ticket_type).filter(Boolean)),
  ];

  return (
    <SimpleModal
      isOpen={isOpen}
      onClose={onClose}
      title="Send Bulk Email"
      mode={mode}
      width="max-w-4xl"
    >
      <div className="space-y-6">
        {/* Error Message */}
        {errors.submit && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {errors.submit}
          </div>
        )}

        {/* Recipient Count */}
        <div
          className={`p-4 rounded-lg border ${
            mode === "dark"
              ? "bg-blue-900/20 border-blue-800"
              : "bg-blue-50 border-blue-200"
          }`}
        >
          <div className="flex items-center gap-2">
            <Icon icon="mdi:account-multiple" className="w-5 h-5 text-blue-600" />
            <span className="font-medium">
              {filteredRecipients.length} recipient
              {filteredRecipients.length !== 1 ? "s" : ""} selected
            </span>
          </div>
          {errors.recipients && (
            <p className="mt-2 text-sm text-red-600">{errors.recipients}</p>
          )}
        </div>

        {/* Template Selector */}
        {templates.length > 0 && (
          <div>
            <label
              className={`block text-sm font-medium mb-2 ${
                mode === "dark" ? "text-gray-200" : "text-gray-700"
              }`}
            >
              Email Template (Optional)
            </label>
            <select
              value={formData.template_id}
              onChange={handleTemplateSelect}
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none ${
                mode === "dark"
                  ? "bg-gray-800 border-gray-600 text-white"
                  : "bg-white border-gray-300 text-gray-900"
              }`}
            >
              <option value="">Select a template</option>
              {templates.map((template) => (
                <option key={template.id} value={template.id}>
                  {template.name}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Recipient Filters */}
        <div>
          <label
            className={`block text-sm font-medium mb-2 ${
              mode === "dark" ? "text-gray-200" : "text-gray-700"
            }`}
          >
            Filter Recipients
          </label>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <select
              name="filter_by"
              value={formData.filter_by}
              onChange={handleInputChange}
              className={`px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none ${
                mode === "dark"
                  ? "bg-gray-800 border-gray-600 text-white"
                  : "bg-white border-gray-300 text-gray-900"
              }`}
            >
              <option value="all">All Recipients</option>
              <option value="paid">Paid Only</option>
              <option value="pending">Pending Payment</option>
              <option value="visa">Visa Letter Requests</option>
            </select>

            {uniqueTicketTypes.length > 0 && (
              <select
                name="ticket_types"
                multiple
                value={formData.ticket_types}
                onChange={(e) => {
                  const selected = Array.from(
                    e.target.selectedOptions,
                    (option) => option.value
                  );
                  setFormData((prev) => ({
                    ...prev,
                    ticket_types: selected,
                  }));
                }}
                className={`px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none ${
                  mode === "dark"
                    ? "bg-gray-800 border-gray-600 text-white"
                    : "bg-white border-gray-300 text-gray-900"
                }`}
              >
                <option value="">All Ticket Types</option>
                {uniqueTicketTypes.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            )}
          </div>
        </div>

        {/* Subject */}
        <div>
          <label
            className={`block text-sm font-medium mb-2 ${
              mode === "dark" ? "text-gray-200" : "text-gray-700"
            }`}
          >
            Subject <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="subject"
            value={formData.subject}
            onChange={handleInputChange}
            placeholder="Email subject line"
            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none ${
              mode === "dark"
                ? "bg-gray-800 border-gray-600 text-white"
                : "bg-white border-gray-300 text-gray-900"
            } ${errors.subject ? "border-red-500" : ""}`}
          />
          {errors.subject && (
            <p className="mt-1 text-sm text-red-500">{errors.subject}</p>
          )}
        </div>

        {/* Email Body */}
        <div>
          <label
            className={`block text-sm font-medium mb-2 ${
              mode === "dark" ? "text-gray-200" : "text-gray-700"
            }`}
          >
            Email Body <span className="text-red-500">*</span>
          </label>
          <div
            className={`border rounded-lg overflow-hidden ${
              mode === "dark" ? "border-gray-600" : "border-gray-300"
            } ${errors.body ? "border-red-500" : ""}`}
          >
            <EditorComponent
              key={`bulk-email-editor-${formData.template_id}`}
              initialValue={formData.body}
              onBlur={handleEditorChange}
              mode={mode}
            />
          </div>
          {errors.body && (
            <p className="mt-1 text-sm text-red-500">{errors.body}</p>
          )}
          <p className="mt-1 text-xs text-gray-500">
            Available variables: {"{name}"}, {"{email}"}, {"{ticket_type}"}
          </p>
        </div>

        {/* Preview Toggle */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setShowPreview(!showPreview)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg border ${
              mode === "dark"
                ? "border-gray-600 text-gray-300 hover:bg-gray-800"
                : "border-gray-300 text-gray-700 hover:bg-gray-50"
            }`}
          >
            <Icon
              icon={showPreview ? "mdi:eye-off" : "mdi:eye"}
              className="w-4 h-4"
            />
            {showPreview ? "Hide" : "Show"} Preview
          </button>
        </div>

        {/* Preview */}
        {showPreview && (
          <div
            className={`p-4 rounded-lg border ${
              mode === "dark"
                ? "bg-gray-800 border-gray-700"
                : "bg-gray-50 border-gray-200"
            }`}
          >
            <h4 className="text-sm font-semibold mb-3">Email Preview</h4>
            <div className="space-y-2">
              <div>
                <span className="text-xs text-gray-500">Subject:</span>
                <p className="font-medium">{formData.subject || "(No subject)"}</p>
              </div>
              <div>
                <span className="text-xs text-gray-500">Body:</span>
                <div
                  className="prose prose-sm max-w-none"
                  dangerouslySetInnerHTML={{ __html: formData.body }}
                />
              </div>
            </div>
          </div>
        )}

        {/* Form Actions */}
        <FormActions
          onCancel={onClose}
          onSave={handleSend}
          loading={isSending}
          mode={mode}
          saveText={
            isSending
              ? "Sending..."
              : `Send to ${filteredRecipients.length} recipient${
                  filteredRecipients.length !== 1 ? "s" : ""
                }`
          }
          saveIcon="mdi:send"
        />
      </div>
    </SimpleModal>
  );
}
