// Streamlined form component for creating/editing masterclasses
import { useState, useEffect } from "react";
import Image from "next/image";
import { Icon } from "@iconify/react";
import toast from "react-hot-toast";
import {
  useMasterclassCategories,
  useMasterclassInstructors,
} from "@/hooks/useMasterclasses";

export default function MasterclassForm({
  initialData = null,
  onSubmit,
  onCancel,
  loading = false,
  mode = "light",
  onOpenImageLibrary,
}) {
  const { categories } = useMasterclassCategories();
  const { instructors } = useMasterclassInstructors();

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    short_description: "",
    category_id: "",
    instructor_id: "",
    start_date: "",
    end_date: "",
    duration_minutes: 90,
    timezone: "GMT",
    member_price: "",
    member_original_price: "",
    non_member_price: "",
    non_member_original_price: "",
    currency: "USD",
    max_seats: 100,
    min_enrollment: 5,
    image_url: "",
    agenda: "",
    learning_objectives: [],
    status: "draft",
    level: "all",
    format: "live",
    is_featured: false,
    is_free: false,
  });

  const [errors, setErrors] = useState({});
  const [newObjective, setNewObjective] = useState("");
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  useEffect(() => {
    if (initialData) {
      setFormData({
        ...initialData,
        start_date: initialData.start_date
          ? new Date(initialData.start_date).toISOString().slice(0, 16)
          : "",
        end_date: initialData.end_date
          ? new Date(initialData.end_date).toISOString().slice(0, 16)
          : "",
        learning_objectives: initialData.learning_objectives || [],
      });
    }
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleArrayAdd = (arrayName, value, setter) => {
    if (value.trim()) {
      setFormData((prev) => ({
        ...prev,
        [arrayName]: [...prev[arrayName], value.trim()],
      }));
      setter("");
    }
  };

  const handleArrayRemove = (arrayName, index) => {
    setFormData((prev) => ({
      ...prev,
      [arrayName]: prev[arrayName].filter((_, i) => i !== index),
    }));
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.title.trim()) newErrors.title = "Title is required";
    if (!formData.description.trim())
      newErrors.description = "Description is required";
    if (!formData.start_date) newErrors.start_date = "Start date is required";
    if (!formData.end_date) newErrors.end_date = "End date is required";
    if (!formData.member_price)
      newErrors.member_price = "Member price is required";
    if (!formData.non_member_price)
      newErrors.non_member_price = "Non-member price is required";

    // Validate dates
    if (formData.start_date && formData.end_date) {
      const startDate = new Date(formData.start_date);
      const endDate = new Date(formData.end_date);
      if (endDate <= startDate) {
        newErrors.end_date = "End date must be after start date";
      }
    }

    // Validate prices
    if (formData.member_price && isNaN(parseFloat(formData.member_price))) {
      newErrors.member_price = "Must be a valid number";
    }
    if (
      formData.non_member_price &&
      isNaN(parseFloat(formData.non_member_price))
    ) {
      newErrors.non_member_price = "Must be a valid number";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      // Convert string prices to numbers
      const submitData = {
        ...formData,
        member_price: parseFloat(formData.member_price),
        member_original_price: formData.member_original_price
          ? parseFloat(formData.member_original_price)
          : null,
        non_member_price: parseFloat(formData.non_member_price),
        non_member_original_price: formData.non_member_original_price
          ? parseFloat(formData.non_member_original_price)
          : null,
        max_seats: parseInt(formData.max_seats),
        min_enrollment: parseInt(formData.min_enrollment),
        duration_minutes: parseInt(formData.duration_minutes),
      };
      onSubmit(submitData);
    }
  };

  const handleImageUpload = async (file) => {
    if (!file) return;

    const loadingToast = toast.loading("Uploading image...");
    setUploading(true);
    setUploadProgress(0);

    try {
      // Get authentication token for ImageKit
      const response = await fetch("/api/imagekit/auth");
      if (!response.ok) throw new Error("Failed to get upload token");
      const authData = await response.json();

      if (!authData?.token) throw new Error("Failed to get upload token");

      // Create form data for upload
      const uploadFormData = new FormData();
      uploadFormData.append("file", file);
      uploadFormData.append("fileName", file.name);
      uploadFormData.append("token", authData.token);
      uploadFormData.append("signature", authData.signature);
      uploadFormData.append("expire", authData.expire);
      uploadFormData.append("publicKey", authData.publicKey);
      uploadFormData.append("folder", "/Masterclass");

      // Upload to ImageKit with progress tracking
      const xhr = new XMLHttpRequest();
      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          const progress = Math.round((event.loaded * 100) / event.total);
          setUploadProgress(progress);
        }
      };

      const uploadData = await new Promise((resolve, reject) => {
        xhr.open(
          "POST",
          "https://upload.imagekit.io/api/v1/files/upload",
          true
        );
        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            resolve(JSON.parse(xhr.responseText));
          } else {
            reject(new Error(`Upload failed with status ${xhr.status}`));
          }
        };
        xhr.onerror = () => reject(new Error("Network error"));
        xhr.send(uploadFormData);
      });

      // Update form data with the uploaded image URL
      setFormData((prev) => ({
        ...prev,
        image_url: uploadData.url,
      }));

      toast.success("Image uploaded successfully", {
        id: loadingToast,
      });
    } catch (error) {
      console.error("Error uploading image:", error);
      toast.error("Failed to upload image", {
        id: loadingToast,
      });
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const inputClass = `w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
    mode === "dark"
      ? "bg-gray-800 border-gray-600 text-white placeholder-gray-400"
      : "bg-white/50 border-gray-300 text-gray-900"
  }`;

  const labelClass = `block text-sm font-medium mb-1 ${
    mode === "dark" ? "text-gray-300" : "text-gray-700"
  }`;

  const sectionClass = `p-6 rounded-lg shadow-sm ${
    mode === "dark" ? "bg-gray-800" : "bg-white/50"
  }`;

  const headingClass = `text-lg font-medium mb-4 ${
    mode === "dark" ? "text-white" : "text-gray-900"
  }`;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Basic Information */}
      <div className={sectionClass}>
        <h3 className={headingClass}>Basic Information</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="md:col-span-2">
            <label className={labelClass}>Title *</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              className={`${inputClass} ${
                errors.title ? "border-red-300" : ""
              }`}
              placeholder="Enter masterclass title"
            />
            {errors.title && (
              <p className="mt-1 text-sm text-red-600">{errors.title}</p>
            )}
          </div>

          <div>
            <label className={labelClass}>Category</label>
            <select
              name="category_id"
              value={formData.category_id}
              onChange={handleChange}
              className={inputClass}
            >
              <option value="">Select a category</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className={labelClass}>Instructor</label>
            <select
              name="instructor_id"
              value={formData.instructor_id}
              onChange={handleChange}
              className={inputClass}
            >
              <option value="">Select an instructor</option>
              {instructors.map((instructor) => (
                <option key={instructor.id} value={instructor.id}>
                  {instructor.name}
                </option>
              ))}
            </select>
          </div>

          <div className="md:col-span-2">
            <label className={labelClass}>Description *</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={3}
              className={`${inputClass} ${
                errors.description ? "border-red-300" : ""
              }`}
              placeholder="Enter detailed description"
            />
            {errors.description && (
              <p className="mt-1 text-sm text-red-600">{errors.description}</p>
            )}
          </div>

          <div className="md:col-span-2">
            <label className={labelClass}>Short Description</label>
            <textarea
              name="short_description"
              value={formData.short_description}
              onChange={handleChange}
              rows={2}
              className={inputClass}
              placeholder="Brief description for cards and previews"
            />
          </div>
        </div>
      </div>

      {/* Schedule & Format */}
      <div className={sectionClass}>
        <h3 className={headingClass}>Schedule & Format</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className={labelClass}>Start Date & Time *</label>
            <input
              type="datetime-local"
              name="start_date"
              value={formData.start_date}
              onChange={handleChange}
              className={`${inputClass} ${
                errors.start_date ? "border-red-300" : ""
              }`}
            />
            {errors.start_date && (
              <p className="mt-1 text-sm text-red-600">{errors.start_date}</p>
            )}
          </div>

          <div>
            <label className={labelClass}>End Date & Time *</label>
            <input
              type="datetime-local"
              name="end_date"
              value={formData.end_date}
              onChange={handleChange}
              className={`${inputClass} ${
                errors.end_date ? "border-red-300" : ""
              }`}
            />
            {errors.end_date && (
              <p className="mt-1 text-sm text-red-600">{errors.end_date}</p>
            )}
          </div>

          <div>
            <label className={labelClass}>Duration (minutes)</label>
            <input
              type="number"
              name="duration_minutes"
              value={formData.duration_minutes}
              onChange={handleChange}
              min="30"
              max="480"
              className={inputClass}
            />
          </div>

          <div>
            <label className={labelClass}>Format</label>
            <select
              name="format"
              value={formData.format}
              onChange={handleChange}
              className={inputClass}
            >
              <option value="live">Live</option>
              <option value="recorded">Recorded</option>
              <option value="hybrid">Hybrid</option>
            </select>
          </div>
        </div>
      </div>

      {/* Pricing */}
      <div className={sectionClass}>
        <h3 className={headingClass}>Pricing</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className={labelClass}>Member Price * (USD)</label>
            <input
              type="number"
              name="member_price"
              value={formData.member_price}
              onChange={handleChange}
              step="0.01"
              min="0"
              className={`${inputClass} ${
                errors.member_price ? "border-red-300" : ""
              }`}
              placeholder="0.00"
            />
            {errors.member_price && (
              <p className="mt-1 text-sm text-red-600">{errors.member_price}</p>
            )}
          </div>

          <div>
            <label className={labelClass}>Non-Member Price * (USD)</label>
            <input
              type="number"
              name="non_member_price"
              value={formData.non_member_price}
              onChange={handleChange}
              step="0.01"
              min="0"
              className={`${inputClass} ${
                errors.non_member_price ? "border-red-300" : ""
              }`}
              placeholder="0.00"
            />
            {errors.non_member_price && (
              <p className="mt-1 text-sm text-red-600">
                {errors.non_member_price}
              </p>
            )}
          </div>

          <div>
            <label className={labelClass}>Member Original Price (USD)</label>
            <input
              type="number"
              name="member_original_price"
              value={formData.member_original_price}
              onChange={handleChange}
              step="0.01"
              min="0"
              className={inputClass}
              placeholder="0.00"
            />
          </div>

          <div>
            <label className={labelClass}>
              Non-Member Original Price (USD)
            </label>
            <input
              type="number"
              name="non_member_original_price"
              value={formData.non_member_original_price}
              onChange={handleChange}
              step="0.01"
              min="0"
              className={inputClass}
              placeholder="0.00"
            />
          </div>

          <div className="md:col-span-2">
            <label className="flex items-center">
              <input
                type="checkbox"
                name="is_free"
                checked={formData.is_free}
                onChange={handleChange}
                className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
              />
              <span
                className={`ml-2 text-sm ${
                  mode === "dark" ? "text-gray-300" : "text-gray-700"
                }`}
              >
                This is a free masterclass
              </span>
            </label>
          </div>
        </div>
      </div>

      {/* Capacity & Settings */}
      <div className={sectionClass}>
        <h3 className={headingClass}>Capacity & Settings</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className={labelClass}>Maximum Seats</label>
            <input
              type="number"
              name="max_seats"
              value={formData.max_seats}
              onChange={handleChange}
              min="1"
              max="1000"
              className={inputClass}
            />
          </div>

          <div>
            <label className={labelClass}>Status</label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              className={inputClass}
            >
              <option value="draft">Draft</option>
              <option value="published">Published</option>
              <option value="cancelled">Cancelled</option>
              <option value="completed">Completed</option>
            </select>
          </div>

          <div className="md:col-span-2">
            <label className="flex items-center">
              <input
                type="checkbox"
                name="is_featured"
                checked={formData.is_featured}
                onChange={handleChange}
                className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
              />
              <span
                className={`ml-2 text-sm ${
                  mode === "dark" ? "text-gray-300" : "text-gray-700"
                }`}
              >
                Feature this masterclass
              </span>
            </label>
          </div>
        </div>
      </div>

      {/* Media & Content */}
      <div className={sectionClass}>
        <h3 className={headingClass}>Media & Content</h3>

        <div className="space-y-4">
          <div>
            <label className={labelClass}>Masterclass Image</label>

            {/* Image Upload Area */}
            <div
              className={`border-2 border-dashed rounded-lg p-6 text-center ${
                mode === "dark"
                  ? "border-gray-600 bg-gray-800"
                  : "border-gray-300 bg-gray-50"
              }`}
            >
              {formData.image_url ? (
                <div className="space-y-4">
                  <div className="relative inline-block">
                    <div className="relative w-48 h-32 rounded-lg overflow-hidden">
                      <Image
                        src={formData.image_url}
                        alt="Masterclass preview"
                        fill
                        className="object-cover"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() =>
                        setFormData((prev) => ({ ...prev, image_url: "" }))
                      }
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                    >
                      <Icon icon="heroicons:x-mark" className="w-4 h-4" />
                    </button>
                  </div>
                  <p
                    className={`text-sm ${
                      mode === "dark" ? "text-gray-400" : "text-gray-600"
                    }`}
                  >
                    Image uploaded successfully
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {uploading ? (
                    <div className="space-y-2">
                      <Icon
                        icon="heroicons:arrow-path"
                        className="w-8 h-8 animate-spin mx-auto text-blue-500"
                      />
                      <p
                        className={`text-sm ${
                          mode === "dark" ? "text-gray-400" : "text-gray-600"
                        }`}
                      >
                        Uploading... {uploadProgress}%
                      </p>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${uploadProgress}%` }}
                        ></div>
                      </div>
                    </div>
                  ) : (
                    <>
                      <Icon
                        icon="heroicons:photo"
                        className="w-12 h-12 mx-auto text-gray-400"
                      />
                      <div className="flex gap-2 justify-center">
                        <label className="cursor-pointer">
                          <span className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 inline-block">
                            Upload Image
                          </span>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => {
                              const file = e.target.files[0];
                              if (file) handleImageUpload(file);
                            }}
                            className="hidden"
                          />
                        </label>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            if (onOpenImageLibrary) {
                              onOpenImageLibrary((selectedImage) => {
                                setFormData((prev) => ({
                                  ...prev,
                                  image_url: selectedImage.url,
                                }));
                              });
                            }
                          }}
                          className={`px-4 py-2 rounded-lg border ${
                            mode === "dark"
                              ? "border-gray-600 text-gray-300 hover:bg-gray-700"
                              : "border-gray-300 text-gray-700 hover:bg-gray-50"
                          }`}
                        >
                          Media Library
                        </button>
                      </div>
                      <p
                        className={`text-sm ${
                          mode === "dark" ? "text-gray-400" : "text-gray-600"
                        }`}
                      >
                        Upload a new image or choose from media library
                      </p>
                    </>
                  )}
                </div>
              )}
            </div>

            {/* Manual URL Input (fallback) */}
            <div className="mt-4">
              <label className={`${labelClass} text-xs`}>
                Or enter image URL manually
              </label>
              <input
                type="url"
                name="image_url"
                value={formData.image_url}
                onChange={handleChange}
                className={inputClass}
                placeholder="https://example.com/image.jpg"
              />
            </div>
          </div>

          <div>
            <label className={labelClass}>Agenda</label>
            <textarea
              name="agenda"
              value={formData.agenda}
              onChange={handleChange}
              rows={3}
              className={inputClass}
              placeholder="Detailed agenda for the masterclass"
            />
          </div>
        </div>
      </div>

      {/* Learning Objectives */}
      <div className={sectionClass}>
        <h3 className={headingClass}>Learning Objectives</h3>

        <div className="space-y-4">
          <div className="flex gap-2">
            <input
              type="text"
              value={newObjective}
              onChange={(e) => setNewObjective(e.target.value)}
              className={inputClass}
              placeholder="Add a learning objective"
              onKeyPress={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleArrayAdd(
                    "learning_objectives",
                    newObjective,
                    setNewObjective
                  );
                }
              }}
            />
            <button
              type="button"
              onClick={() =>
                handleArrayAdd(
                  "learning_objectives",
                  newObjective,
                  setNewObjective
                )
              }
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Add
            </button>
          </div>

          {formData.learning_objectives.length > 0 && (
            <div className="space-y-2">
              {formData.learning_objectives.map((objective, index) => (
                <div
                  key={index}
                  className={`flex items-center justify-between p-2 rounded ${
                    mode === "dark" ? "bg-gray-700" : "bg-gray-50"
                  }`}
                >
                  <span
                    className={`text-sm ${
                      mode === "dark" ? "text-gray-300" : "text-gray-700"
                    }`}
                  >
                    {objective}
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      handleArrayRemove("learning_objectives", index)
                    }
                    className="text-red-600 hover:text-red-800"
                  >
                    <Icon icon="heroicons:x-mark" className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Form Actions */}
      <div className="flex items-center justify-end space-x-4 pt-6">
        <button
          type="button"
          onClick={onCancel}
          className={`px-6 py-2 border rounded-md hover:bg-opacity-50 ${
            mode === "dark"
              ? "border-gray-600 text-gray-300 hover:bg-gray-700"
              : "border-gray-300 text-gray-700 hover:bg-gray-50"
          }`}
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading}
          className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
        >
          {loading && (
            <Icon
              icon="heroicons:arrow-path"
              className="w-4 h-4 mr-2 animate-spin"
            />
          )}
          {initialData ? "Update Masterclass" : "Create Masterclass"}
        </button>
      </div>
    </form>
  );
}
