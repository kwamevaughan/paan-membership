import React, { useState, useEffect } from "react";
import SimpleModal from "../SimpleModal";
import FormActions from "../forms/FormActions";
import { Icon } from "@iconify/react";

/**
 * PromoCodeForm Component
 * Form for creating and editing promo codes with validation
 */
export function PromoCodeForm({
  isOpen,
  onClose,
  promoCode = null,
  onSubmit,
  ticketTypes = [],
  mode = "light",
}) {
  const [formData, setFormData] = useState({
    code: "",
    description: "",
    discount_type: "percentage",
    discount_value: "",
    valid_from: "",
    valid_until: "",
    usage_limit: "",
    applicable_ticket_types: [],
    is_active: true,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  // Populate form when editing
  useEffect(() => {
    if (promoCode) {
      setFormData({
        code: promoCode.code || "",
        description: promoCode.description || "",
        discount_type: promoCode.discount_type || "percentage",
        discount_value: promoCode.discount_value || "",
        valid_from: promoCode.valid_from
          ? new Date(promoCode.valid_from).toISOString().split("T")[0]
          : "",
        valid_until: promoCode.valid_until
          ? new Date(promoCode.valid_until).toISOString().split("T")[0]
          : "",
        usage_limit: promoCode.usage_limit || "",
        applicable_ticket_types: promoCode.applicable_ticket_types || [],
        is_active: promoCode.is_active !== undefined ? promoCode.is_active : true,
      });
    } else {
      // Reset form for new promo code
      setFormData({
        code: "",
        description: "",
        discount_type: "percentage",
        discount_value: "",
        valid_from: "",
        valid_until: "",
        usage_limit: "",
        applicable_ticket_types: [],
        is_active: true,
      });
    }
    setErrors({});
  }, [promoCode, isOpen]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
    // Clear error for this field
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const handleTicketTypeToggle = (ticketTypeId) => {
    setFormData((prev) => {
      const isSelected = prev.applicable_ticket_types.includes(ticketTypeId);
      return {
        ...prev,
        applicable_ticket_types: isSelected
          ? prev.applicable_ticket_types.filter((id) => id !== ticketTypeId)
          : [...prev.applicable_ticket_types, ticketTypeId],
      };
    });
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.code.trim()) {
      newErrors.code = "Promo code is required";
    } else if (!/^[A-Z0-9_-]+$/.test(formData.code.toUpperCase())) {
      newErrors.code = "Code must contain only letters, numbers, hyphens, and underscores";
    }

    if (!formData.discount_value || parseFloat(formData.discount_value) <= 0) {
      newErrors.discount_value = "Valid discount value is required";
    }

    if (
      formData.discount_type === "percentage" &&
      parseFloat(formData.discount_value) > 100
    ) {
      newErrors.discount_value = "Percentage discount cannot exceed 100%";
    }

    if (!formData.valid_from) {
      newErrors.valid_from = "Start date is required";
    }

    if (formData.valid_until && formData.valid_from) {
      const startDate = new Date(formData.valid_from);
      const endDate = new Date(formData.valid_until);
      if (endDate < startDate) {
        newErrors.valid_until = "End date must be after start date";
      }
    }

    if (formData.usage_limit && parseInt(formData.usage_limit) < 1) {
      newErrors.usage_limit = "Usage limit must be at least 1";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      await onSubmit({
        ...formData,
        code: formData.code.toUpperCase(),
      });
      onClose();
    } catch (error) {
      console.error("Error submitting form:", error);
      setErrors({ submit: error.message || "Failed to save promo code" });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SimpleModal
      isOpen={isOpen}
      onClose={onClose}
      title={promoCode ? "Edit Promo Code" : "Create Promo Code"}
      mode={mode}
      width="max-w-2xl"
    >
      <div className="space-y-6">
        {/* Error Message */}
        {errors.submit && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {errors.submit}
          </div>
        )}

        {/* Promo Code */}
        <div>
          <label
            className={`block text-sm font-medium mb-2 ${
              mode === "dark" ? "text-gray-200" : "text-gray-700"
            }`}
          >
            Promo Code <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="code"
            value={formData.code}
            onChange={handleInputChange}
            placeholder="e.g., EARLYBIRD2024"
            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none uppercase ${
              mode === "dark"
                ? "bg-gray-800 border-gray-600 text-white"
                : "bg-white border-gray-300 text-gray-900"
            } ${errors.code ? "border-red-500" : ""}`}
          />
          {errors.code && (
            <p className="mt-1 text-sm text-red-500">{errors.code}</p>
          )}
          <p className="mt-1 text-xs text-gray-500">
            Use uppercase letters, numbers, hyphens, and underscores only
          </p>
        </div>

        {/* Description */}
        <div>
          <label
            className={`block text-sm font-medium mb-2 ${
              mode === "dark" ? "text-gray-200" : "text-gray-700"
            }`}
          >
            Description
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            rows={2}
            placeholder="Brief description of this promo code"
            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none ${
              mode === "dark"
                ? "bg-gray-800 border-gray-600 text-white"
                : "bg-white border-gray-300 text-gray-900"
            }`}
          />
        </div>

        {/* Discount Configuration */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label
              className={`block text-sm font-medium mb-2 ${
                mode === "dark" ? "text-gray-200" : "text-gray-700"
              }`}
            >
              Discount Type <span className="text-red-500">*</span>
            </label>
            <select
              name="discount_type"
              value={formData.discount_type}
              onChange={handleInputChange}
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none ${
                mode === "dark"
                  ? "bg-gray-800 border-gray-600 text-white"
                  : "bg-white border-gray-300 text-gray-900"
              }`}
            >
              <option value="percentage">Percentage (%)</option>
              <option value="fixed">Fixed Amount</option>
            </select>
          </div>

          <div>
            <label
              className={`block text-sm font-medium mb-2 ${
                mode === "dark" ? "text-gray-200" : "text-gray-700"
              }`}
            >
              Discount Value <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type="number"
                name="discount_value"
                value={formData.discount_value}
                onChange={handleInputChange}
                placeholder={formData.discount_type === "percentage" ? "10" : "50.00"}
                step={formData.discount_type === "percentage" ? "1" : "0.01"}
                min="0"
                max={formData.discount_type === "percentage" ? "100" : undefined}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none ${
                  mode === "dark"
                    ? "bg-gray-800 border-gray-600 text-white"
                    : "bg-white border-gray-300 text-gray-900"
                } ${errors.discount_value ? "border-red-500" : ""}`}
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">
                {formData.discount_type === "percentage" ? "%" : "$"}
              </span>
            </div>
            {errors.discount_value && (
              <p className="mt-1 text-sm text-red-500">{errors.discount_value}</p>
            )}
          </div>
        </div>

        {/* Validity Period */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label
              className={`block text-sm font-medium mb-2 ${
                mode === "dark" ? "text-gray-200" : "text-gray-700"
              }`}
            >
              Valid From <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              name="valid_from"
              value={formData.valid_from}
              onChange={handleInputChange}
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none ${
                mode === "dark"
                  ? "bg-gray-800 border-gray-600 text-white"
                  : "bg-white border-gray-300 text-gray-900"
              } ${errors.valid_from ? "border-red-500" : ""}`}
            />
            {errors.valid_from && (
              <p className="mt-1 text-sm text-red-500">{errors.valid_from}</p>
            )}
          </div>

          <div>
            <label
              className={`block text-sm font-medium mb-2 ${
                mode === "dark" ? "text-gray-200" : "text-gray-700"
              }`}
            >
              Valid Until
            </label>
            <input
              type="date"
              name="valid_until"
              value={formData.valid_until}
              onChange={handleInputChange}
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none ${
                mode === "dark"
                  ? "bg-gray-800 border-gray-600 text-white"
                  : "bg-white border-gray-300 text-gray-900"
              } ${errors.valid_until ? "border-red-500" : ""}`}
            />
            {errors.valid_until && (
              <p className="mt-1 text-sm text-red-500">{errors.valid_until}</p>
            )}
            <p className="mt-1 text-xs text-gray-500">
              Leave empty for no expiration
            </p>
          </div>
        </div>

        {/* Usage Limit */}
        <div>
          <label
            className={`block text-sm font-medium mb-2 ${
              mode === "dark" ? "text-gray-200" : "text-gray-700"
            }`}
          >
            Usage Limit
          </label>
          <input
            type="number"
            name="usage_limit"
            value={formData.usage_limit}
            onChange={handleInputChange}
            placeholder="Leave empty for unlimited"
            min="1"
            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none ${
              mode === "dark"
                ? "bg-gray-800 border-gray-600 text-white"
                : "bg-white border-gray-300 text-gray-900"
            } ${errors.usage_limit ? "border-red-500" : ""}`}
          />
          {errors.usage_limit && (
            <p className="mt-1 text-sm text-red-500">{errors.usage_limit}</p>
          )}
          <p className="mt-1 text-xs text-gray-500">
            Maximum number of times this code can be used
          </p>
        </div>

        {/* Applicable Ticket Types */}
        {ticketTypes.length > 0 && (
          <div>
            <label
              className={`block text-sm font-medium mb-2 ${
                mode === "dark" ? "text-gray-200" : "text-gray-700"
              }`}
            >
              Applicable Ticket Types
            </label>
            <div
              className={`p-4 border rounded-lg space-y-2 max-h-48 overflow-y-auto ${
                mode === "dark"
                  ? "bg-gray-800 border-gray-600"
                  : "bg-gray-50 border-gray-300"
              }`}
            >
              <div className="flex items-center gap-3 mb-3">
                <input
                  type="checkbox"
                  id="select_all"
                  checked={
                    formData.applicable_ticket_types.length === ticketTypes.length
                  }
                  onChange={(e) => {
                    if (e.target.checked) {
                      setFormData((prev) => ({
                        ...prev,
                        applicable_ticket_types: ticketTypes.map((t) => t.id),
                      }));
                    } else {
                      setFormData((prev) => ({
                        ...prev,
                        applicable_ticket_types: [],
                      }));
                    }
                  }}
                  className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                />
                <label
                  htmlFor="select_all"
                  className={`text-sm font-medium ${
                    mode === "dark" ? "text-gray-200" : "text-gray-700"
                  }`}
                >
                  Select All
                </label>
              </div>
              {ticketTypes.map((ticketType) => (
                <div key={ticketType.id} className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id={`ticket_${ticketType.id}`}
                    checked={formData.applicable_ticket_types.includes(
                      ticketType.id
                    )}
                    onChange={() => handleTicketTypeToggle(ticketType.id)}
                    className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                  />
                  <label
                    htmlFor={`ticket_${ticketType.id}`}
                    className={`text-sm flex-1 ${
                      mode === "dark" ? "text-gray-300" : "text-gray-700"
                    }`}
                  >
                    {ticketType.name} - {ticketType.currency}{" "}
                    {parseFloat(ticketType.price).toLocaleString()}
                  </label>
                </div>
              ))}
            </div>
            <p className="mt-1 text-xs text-gray-500">
              Leave empty to apply to all ticket types
            </p>
          </div>
        )}

        {/* Active Status */}
        <div className="flex items-center gap-3">
          <input
            type="checkbox"
            id="is_active"
            name="is_active"
            checked={formData.is_active}
            onChange={handleInputChange}
            className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
          />
          <label
            htmlFor="is_active"
            className={`text-sm font-medium ${
              mode === "dark" ? "text-gray-200" : "text-gray-700"
            }`}
          >
            Active (available for use)
          </label>
        </div>

        {/* Form Actions */}
        <FormActions
          onCancel={onClose}
          onSave={handleSubmit}
          loading={isSubmitting}
          mode={mode}
          saveText={promoCode ? "Update Promo Code" : "Create Promo Code"}
          saveIcon={promoCode ? "mdi:content-save" : "mdi:plus"}
        />
      </div>
    </SimpleModal>
  );
}
