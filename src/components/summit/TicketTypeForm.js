import React, { useState, useEffect } from "react";
import SimpleModal from "../SimpleModal";
import FormActions from "../forms/FormActions";
import { Icon } from "@iconify/react";

/**
 * TicketTypeForm Component
 * Form for creating and editing ticket types with JSONB features editor
 */
export function TicketTypeForm({
  isOpen,
  onClose,
  ticketType = null,
  onSubmit,
  mode = "light",
}) {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    original_price: "",
    currency: "USD",
    category: "",
    features: [],
    is_active: true,
  });

  const [newFeature, setNewFeature] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  // Populate form when editing
  useEffect(() => {
    if (ticketType) {
      setFormData({
        name: ticketType.name || "",
        description: ticketType.description || "",
        price: ticketType.price || "",
        original_price: ticketType.original_price || "",
        currency: ticketType.currency || "USD",
        category: ticketType.category || "",
        features: ticketType.features || [],
        is_active: ticketType.is_active !== undefined ? ticketType.is_active : true,
      });
    } else {
      // Reset form for new ticket type
      setFormData({
        name: "",
        description: "",
        price: "",
        original_price: "",
        currency: "USD",
        category: "",
        features: [],
        is_active: true,
      });
    }
    setErrors({});
  }, [ticketType, isOpen]);

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

  const handleAddFeature = () => {
    if (newFeature.trim()) {
      setFormData((prev) => ({
        ...prev,
        features: [...prev.features, newFeature.trim()],
      }));
      setNewFeature("");
    }
  };

  const handleRemoveFeature = (index) => {
    setFormData((prev) => ({
      ...prev,
      features: prev.features.filter((_, i) => i !== index),
    }));
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "Ticket name is required";
    }

    if (!formData.price || parseFloat(formData.price) <= 0) {
      newErrors.price = "Valid price is required";
    }

    if (!formData.category.trim()) {
      newErrors.category = "Category is required";
    }

    if (
      formData.original_price &&
      parseFloat(formData.original_price) < parseFloat(formData.price)
    ) {
      newErrors.original_price = "Original price must be greater than current price";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      await onSubmit(formData);
      onClose();
    } catch (error) {
      console.error("Error submitting form:", error);
      setErrors({ submit: error.message || "Failed to save ticket type" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const categories = [
    "Early Bird",
    "Regular",
    "VIP",
    "Student",
    "Group",
    "Corporate",
    "Speaker",
    "Sponsor",
  ];

  return (
    <SimpleModal
      isOpen={isOpen}
      onClose={onClose}
      title={ticketType ? "Edit Ticket Type" : "Create Ticket Type"}
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

        {/* Ticket Name */}
        <div>
          <label
            className={`block text-sm font-medium mb-2 ${
              mode === "dark" ? "text-gray-200" : "text-gray-700"
            }`}
          >
            Ticket Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            placeholder="e.g., Early Bird Pass"
            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none ${
              mode === "dark"
                ? "bg-gray-800 border-gray-600 text-white"
                : "bg-white border-gray-300 text-gray-900"
            } ${errors.name ? "border-red-500" : ""}`}
          />
          {errors.name && (
            <p className="mt-1 text-sm text-red-500">{errors.name}</p>
          )}
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
            rows={3}
            placeholder="Brief description of this ticket type"
            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none ${
              mode === "dark"
                ? "bg-gray-800 border-gray-600 text-white"
                : "bg-white border-gray-300 text-gray-900"
            }`}
          />
        </div>

        {/* Category */}
        <div>
          <label
            className={`block text-sm font-medium mb-2 ${
              mode === "dark" ? "text-gray-200" : "text-gray-700"
            }`}
          >
            Category <span className="text-red-500">*</span>
          </label>
          <select
            name="category"
            value={formData.category}
            onChange={handleInputChange}
            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none ${
              mode === "dark"
                ? "bg-gray-800 border-gray-600 text-white"
                : "bg-white border-gray-300 text-gray-900"
            } ${errors.category ? "border-red-500" : ""}`}
          >
            <option value="">Select a category</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
          {errors.category && (
            <p className="mt-1 text-sm text-red-500">{errors.category}</p>
          )}
        </div>

        {/* Pricing */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label
              className={`block text-sm font-medium mb-2 ${
                mode === "dark" ? "text-gray-200" : "text-gray-700"
              }`}
            >
              Currency
            </label>
            <select
              name="currency"
              value={formData.currency}
              onChange={handleInputChange}
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none ${
                mode === "dark"
                  ? "bg-gray-800 border-gray-600 text-white"
                  : "bg-white border-gray-300 text-gray-900"
              }`}
            >
              <option value="USD">USD</option>
              <option value="EUR">EUR</option>
              <option value="GBP">GBP</option>
              <option value="ZAR">ZAR</option>
              <option value="NGN">NGN</option>
            </select>
          </div>

          <div>
            <label
              className={`block text-sm font-medium mb-2 ${
                mode === "dark" ? "text-gray-200" : "text-gray-700"
              }`}
            >
              Price <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              name="price"
              value={formData.price}
              onChange={handleInputChange}
              placeholder="0.00"
              step="0.01"
              min="0"
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none ${
                mode === "dark"
                  ? "bg-gray-800 border-gray-600 text-white"
                  : "bg-white border-gray-300 text-gray-900"
              } ${errors.price ? "border-red-500" : ""}`}
            />
            {errors.price && (
              <p className="mt-1 text-sm text-red-500">{errors.price}</p>
            )}
          </div>

          <div>
            <label
              className={`block text-sm font-medium mb-2 ${
                mode === "dark" ? "text-gray-200" : "text-gray-700"
              }`}
            >
              Original Price
            </label>
            <input
              type="number"
              name="original_price"
              value={formData.original_price}
              onChange={handleInputChange}
              placeholder="0.00"
              step="0.01"
              min="0"
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none ${
                mode === "dark"
                  ? "bg-gray-800 border-gray-600 text-white"
                  : "bg-white border-gray-300 text-gray-900"
              } ${errors.original_price ? "border-red-500" : ""}`}
            />
            {errors.original_price && (
              <p className="mt-1 text-sm text-red-500">{errors.original_price}</p>
            )}
          </div>
        </div>

        {/* Features */}
        <div>
          <label
            className={`block text-sm font-medium mb-2 ${
              mode === "dark" ? "text-gray-200" : "text-gray-700"
            }`}
          >
            Features & Benefits
          </label>
          <div className="space-y-2">
            {/* Feature List */}
            {formData.features.length > 0 && (
              <div className="space-y-2 mb-3">
                {formData.features.map((feature, index) => (
                  <div
                    key={index}
                    className={`flex items-center justify-between p-3 rounded-lg ${
                      mode === "dark" ? "bg-gray-800" : "bg-gray-50"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Icon
                        icon="mdi:check-circle"
                        className="w-5 h-5 text-green-500"
                      />
                      <span>{feature}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveFeature(index)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <Icon icon="mdi:close" className="w-5 h-5" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Add Feature Input */}
            <div className="flex gap-2">
              <input
                type="text"
                value={newFeature}
                onChange={(e) => setNewFeature(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddFeature();
                  }
                }}
                placeholder="Add a feature (e.g., Access to all sessions)"
                className={`flex-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none ${
                  mode === "dark"
                    ? "bg-gray-800 border-gray-600 text-white"
                    : "bg-white border-gray-300 text-gray-900"
                }`}
              />
              <button
                type="button"
                onClick={handleAddFeature}
                className="px-4 py-2 bg-paan-blue text-white rounded-lg hover:bg-paan-blue/80 flex items-center gap-2"
              >
                <Icon icon="mdi:plus" className="w-5 h-5" />
                Add
              </button>
            </div>
          </div>
        </div>

        {/* Active Status */}
        <div className="flex items-center gap-3">
          <input
            type="checkbox"
            id="is_active"
            name="is_active"
            checked={formData.is_active}
            onChange={handleInputChange}
            className="w-5 h-5 text-paan-blue rounded focus:ring-2 focus:ring-paan-blue"
          />
          <label
            htmlFor="is_active"
            className={`text-sm font-medium ${
              mode === "dark" ? "text-gray-200" : "text-gray-700"
            }`}
          >
            Active (available for purchase)
          </label>
        </div>

        {/* Form Actions */}
        <FormActions
          onCancel={onClose}
          onSave={handleSubmit}
          loading={isSubmitting}
          mode={mode}
          saveText={ticketType ? "Update Ticket Type" : "Create Ticket Type"}
          saveIcon={ticketType ? "mdi:content-save" : "mdi:plus"}
        />
      </div>
    </SimpleModal>
  );
}
