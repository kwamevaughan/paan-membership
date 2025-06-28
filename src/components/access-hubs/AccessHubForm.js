import { useState, useEffect, useRef } from "react";
import { Icon } from "@iconify/react";
import Image from "next/image";
import Select from "react-select";
import ImageLibrary from "../common/ImageLibrary";
import toast from "react-hot-toast";
import EditorComponent from "../EditorComponent";
import countriesData from "../../../public/assets/misc/countries.json";

export default function AccessHubForm({
  formData,
  handleInputChange,
  submitForm,
  cancelForm,
  isEditing,
  tiers,
  mode,
  showImageLibrary,
  setShowImageLibrary,
  setImageLibraryCallback,
}) {
  const spaceTypes = ["Boardroom", "Meeting Room", "Conference Room", "Co-working Space"];
  const validTiers = [
    "Associate Member",
    "Full Member",
    "Gold Member",
    "Free Member",
  ];
  const [errors, setErrors] = useState({});
  const [localFormData, setLocalFormData] = useState({
    title: "",
    description: "",
    space_type: "Boardroom",
    city: "",
    country: "",
    is_available: true,
    pricing_per_day: 0,
    amenities: [],
    images: [],
    capacity: 0,
    tier_restriction: "Free Member",
  });
  const [imageSource, setImageSource] = useState("upload");
  const [uploadedImage, setUploadedImage] = useState(null);
  const fileInputRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);

  const resetLocalForm = () => {
    setLocalFormData({
      title: "",
      description: "",
      space_type: "Boardroom",
      city: "",
      country: "",
      is_available: true,
      pricing_per_day: 0,
      amenities: [],
      images: [],
      capacity: 0,
      tier_restriction: "Free Member",
    });
    setUploadedImage(null);
    setImageSource("upload");
  };

  useEffect(() => {
    if (formData) {
      setLocalFormData({
        ...formData,
        images: formData.images || [],
        amenities: formData.amenities || [],
      });
      if (formData.images && formData.images.length > 0) {
        setImageSource("library");
      }
    } else {
      // For new access hub creation, ensure we reset to default values
      // and don't let external changes override our defaults
      const defaultFormData = {
        title: "",
        description: "",
        space_type: "Boardroom",
        city: "",
        country: "",
        is_available: true,
        pricing_per_day: 0,
        amenities: [],
        images: [],
        capacity: 0,
        tier_restriction: "Free Member",
      };
      setLocalFormData(defaultFormData);
      setUploadedImage(null);
      setImageSource("upload");
    }
  }, [formData]);

  // Debug log to see what's happening with is_available
  useEffect(() => {
    console.log('localFormData.is_available:', localFormData.is_available);
  }, [localFormData.is_available]);

  const handleLocalInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    const newValue = type === "checkbox" ? checked : value;

    setLocalFormData((prev) => ({
      ...prev,
      [name]: newValue,
    }));
    handleInputChange(e);
  };

  const handleAmenitiesChange = (e) => {
    const { value, checked } = e.target;
    setLocalFormData((prev) => {
      const updatedAmenities = checked
        ? [...prev.amenities, value]
        : prev.amenities.filter((amenity) => amenity !== value);
      
      const updatedData = {
        ...prev,
        amenities: updatedAmenities,
      };
      
      handleInputChange({
        target: { name: "amenities", value: updatedAmenities },
      });
      
      return updatedData;
    });
  };

  const handleImageUpload = async (files) => {
    if (!files || files.length === 0) return;
    const loadingToast = toast.loading("Uploading image(s)...");
    try {
      let newImageUrls = [];
      for (const file of files) {
        const previewUrl = URL.createObjectURL(file);
        setUploadedImage(previewUrl);
        const response = await fetch("/api/imagekit/auth");
        if (!response.ok) throw new Error("Failed to get upload token");
        const authData = await response.json();
        if (!authData?.token) throw new Error("Failed to get upload token");

        const formData = new FormData();
        formData.append("file", file);
        formData.append("fileName", file.name);
        formData.append("token", authData.token);
        formData.append("signature", authData.signature);
        formData.append("expire", authData.expire);
        formData.append("publicKey", authData.publicKey);
        formData.append("folder", "/AccessHubs");

        const uploadResponse = await fetch(
          "https://upload.imagekit.io/api/v1/files/upload",
          {
            method: "POST",
            body: formData,
          }
        );

        if (!uploadResponse.ok) {
          const errorData = await uploadResponse.json();
          throw new Error(errorData.message || "Upload failed");
        }

        const uploadData = await uploadResponse.json();
        if (!uploadData.url) {
          throw new Error("No URL returned from ImageKit");
        }
        newImageUrls.push(uploadData.url);
        URL.revokeObjectURL(previewUrl);
      }
      // Append new images to the array
      const updatedImages = [...(localFormData.images || []), ...newImageUrls];
      handleInputChange({
        target: {
          name: "images",
          value: updatedImages,
        },
      });
      setLocalFormData((prev) => ({
        ...prev,
        images: updatedImages,
      }));
      toast.success("Image(s) uploaded successfully", {
        id: loadingToast,
      });
    } catch (error) {
      toast.error(`Failed to upload image: ${error.message}`, {
        id: loadingToast,
      });
      setUploadedImage(null);
    }
  };

  const handleAddImageUrl = () => {
    const url = (document.getElementById("image-url-input")?.value || "").trim();
    if (url) {
      const updatedImages = [...(localFormData.images || []), url];
      handleInputChange({
        target: {
          name: "images",
          value: updatedImages,
        },
      });
      setLocalFormData((prev) => ({
        ...prev,
        images: updatedImages,
      }));
      document.getElementById("image-url-input").value = "";
    }
  };

  const handleRemoveImage = (index) => {
    const updatedImages = (localFormData.images || []).filter((_, i) => i !== index);
    handleInputChange({
      target: {
        name: "images",
        value: updatedImages,
      },
    });
    setLocalFormData((prev) => ({
      ...prev,
      images: updatedImages,
    }));
    if (updatedImages.length === 0) setImageSource("upload");
  };

  const validateForm = (e) => {
    if (e && typeof e.preventDefault === "function") {
      e.preventDefault();
    }
    const newErrors = {};
    if (!localFormData.title) newErrors.title = "Title is required";
    if (!spaceTypes.includes(localFormData.space_type))
      newErrors.space_type = "Please select a valid space type";
    if (!localFormData.city) newErrors.city = "City is required";
    if (!localFormData.country) newErrors.country = "Country is required";
    if (localFormData.capacity <= 0) newErrors.capacity = "Capacity must be greater than 0";
    if (localFormData.pricing_per_day < 0) newErrors.pricing_per_day = "Pricing cannot be negative";
    if (!validTiers.includes(localFormData.tier_restriction))
      newErrors.tier_restriction = "Please select a valid tier restriction";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const updatedFormData = isEditing
      ? {
          ...formData,
          ...localFormData,
          id: formData.id,
          images: localFormData.images || formData.images,
          description: localFormData.description || formData.description,
        }
      : {
          ...localFormData,
        };

    Object.entries(updatedFormData).forEach(([name, value]) => {
      handleInputChange({
        target: { name, value },
      });
    });

    const syntheticEvent = {
      preventDefault: () => {},
      target: {
        formData: updatedFormData,
      },
    };

    // Submit the form
    submitForm(syntheticEvent);
    
    // Reset form after submission if not in editing mode
    if (!isEditing) {
      // Clear errors
      setErrors({});
      // Reset form to default values
      resetLocalForm();
    }
  };

  const handleCancel = () => {
    resetLocalForm();
    cancelForm();
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) {
      handleImageUpload(e.dataTransfer.files);
    }
  };

  return (
    <div
      className={`max-w-4xl mx-auto ${
        mode === "dark" ? "text-gray-200" : "text-gray-900"
      }`}
    >
      <div className={`mt-4 ${mode === "dark" ? "bg-gray-800" : ""}`}>
        <form onSubmit={validateForm} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Access Hub Title */}
            <div>
              <label
                htmlFor="title"
                className="block text-sm font-medium mb-2"
              >
                Access Hub Title
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={localFormData.title || ""}
                onChange={handleLocalInputChange}
                className={`w-full px-4 py-3 rounded-lg border transition-all duration-200 focus:ring-2 focus:ring-blue-500 focus:outline-none ${
                  mode === "dark"
                    ? "bg-gray-700 border-gray-600 text-gray-200 placeholder-gray-400"
                    : "bg-white border-gray-300 text-gray-900 placeholder-gray-500"
                } ${errors.title ? "border-red-500" : ""}`}
                placeholder="Enter access hub title"
                aria-invalid={errors.title ? "true" : "false"}
                aria-describedby={errors.title ? "title-error" : undefined}
              />
              {errors.title && (
                <p id="title-error" className="text-red-500 text-xs mt-1">
                  {errors.title}
                </p>
              )}
            </div>

            {/* Space Type */}
            <div>
              <label
                htmlFor="space_type"
                className="block text-sm font-medium mb-2"
              >
                Space Type
              </label>
              <select
                id="space_type"
                name="space_type"
                value={localFormData.space_type || "Boardroom"}
                onChange={handleLocalInputChange}
                className={`w-full px-4 py-3 rounded-lg border transition-all duration-200 focus:ring-2 focus:ring-blue-500 focus:outline-none ${
                  mode === "dark"
                    ? "bg-gray-700 border-gray-600 text-gray-200"
                    : "bg-white border-gray-300 text-gray-900"
                } ${errors.space_type ? "border-red-500" : ""}`}
                aria-invalid={errors.space_type ? "true" : "false"}
                aria-describedby={
                  errors.space_type ? "space_type-error" : undefined
                }
              >
                {spaceTypes.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
              {errors.space_type && (
                <p id="space_type-error" className="text-red-500 text-xs mt-1">
                  {errors.space_type}
                </p>
              )}
            </div>

            {/* City */}
            <div>
              <label
                htmlFor="city"
                className="block text-sm font-medium mb-2"
              >
                City
              </label>
              <input
                type="text"
                id="city"
                name="city"
                value={localFormData.city || ""}
                onChange={handleLocalInputChange}
                className={`w-full px-4 py-3 rounded-lg border transition-all duration-200 focus:ring-2 focus:ring-blue-500 focus:outline-none ${
                  mode === "dark"
                    ? "bg-gray-700 border-gray-600 text-gray-200 placeholder-gray-400"
                    : "bg-white border-gray-300 text-gray-900 placeholder-gray-500"
                }`}
                placeholder="Enter city"
              />
            </div>

            {/* Country */}
            <div>
              <label
                htmlFor="country"
                className="block text-sm font-medium mb-2"
              >
                Country
              </label>
              <Select
                id="country"
                name="country"
                value={countriesData.find(country => country.name === localFormData.country) || null}
                onChange={(selectedOption) => {
                  const newValue = selectedOption ? selectedOption.name : "";
                  setLocalFormData((prev) => ({
                    ...prev,
                    country: newValue,
                  }));
                  handleInputChange({
                    target: { name: "country", value: newValue },
                  });
                }}
                options={countriesData}
                getOptionLabel={(option) => `${option.flag} ${option.name}`}
                getOptionValue={(option) => option.name}
                isClearable
                isSearchable
                placeholder="Select a country..."
                className={`${errors.country ? "border-red-500" : ""}`}
                classNamePrefix="react-select"
                styles={{
                  control: (provided, state) => ({
                    ...provided,
                    backgroundColor: mode === "dark" ? "#374151" : "#ffffff",
                    borderColor: state.isFocused 
                      ? "#3b82f6" 
                      : errors.country 
                        ? "#ef4444" 
                        : mode === "dark" ? "#4b5563" : "#d1d5db",
                    boxShadow: state.isFocused ? "0 0 0 1px #3b82f6" : "none",
                    "&:hover": {
                      borderColor: state.isFocused 
                        ? "#3b82f6" 
                        : errors.country 
                          ? "#ef4444" 
                          : mode === "dark" ? "#6b7280" : "#9ca3af"
                    }
                  }),
                  menu: (provided) => ({
                    ...provided,
                    backgroundColor: mode === "dark" ? "#374151" : "#ffffff",
                    border: `1px solid ${mode === "dark" ? "#4b5563" : "#d1d5db"}`,
                  }),
                  option: (provided, state) => ({
                    ...provided,
                    backgroundColor: state.isFocused 
                      ? mode === "dark" ? "#4b5563" : "#f3f4f6" 
                      : "transparent",
                    color: mode === "dark" ? "#e5e7eb" : "#111827",
                    "&:hover": {
                      backgroundColor: mode === "dark" ? "#4b5563" : "#f3f4f6"
                    }
                  }),
                  singleValue: (provided) => ({
                    ...provided,
                    color: mode === "dark" ? "#e5e7eb" : "#111827",
                  }),
                  input: (provided) => ({
                    ...provided,
                    color: mode === "dark" ? "#e5e7eb" : "#111827",
                  }),
                  placeholder: (provided) => ({
                    ...provided,
                    color: mode === "dark" ? "#9ca3af" : "#6b7280",
                  }),
                }}
              />
              {errors.country && (
                <p id="country-error" className="text-red-500 text-xs mt-1">
                  {errors.country}
                </p>
              )}
            </div>

            {/* Tier Restriction */}
            <div>
              <label
                htmlFor="tier_restriction"
                className="block text-sm font-medium mb-2"
              >
                Tier Restriction
              </label>
              <select
                id="tier_restriction"
                name="tier_restriction"
                value={localFormData.tier_restriction || "Free Member"}
                onChange={handleLocalInputChange}
                className={`w-full px-4 py-3 rounded-lg border transition-all duration-200 focus:ring-2 focus:ring-blue-500 focus:outline-none ${
                  mode === "dark"
                    ? "bg-gray-700 border-gray-600 text-gray-200"
                    : "bg-white border-gray-300 text-gray-900"
                } ${errors.tier_restriction ? "border-red-500" : ""}`}
                aria-invalid={errors.tier_restriction ? "true" : "false"}
                aria-describedby={
                  errors.tier_restriction ? "tier_restriction-error" : undefined
                }
              >
                {validTiers.map((tier) => (
                  <option key={tier} value={tier}>
                    {tier}
                  </option>
                ))}
              </select>
              {errors.tier_restriction && (
                <p
                  id="tier_restriction-error"
                  className="text-red-500 text-xs mt-1"
                >
                  {errors.tier_restriction}
                </p>
              )}
            </div>

            {/* Description */}
            <div className="md:col-span-2">
              <label
                htmlFor="description"
                className="block text-sm font-medium mb-2"
              >
                Description
              </label>
              <EditorComponent
                initialValue={localFormData.description || ""}
                onChange={(value) => {
                  setLocalFormData((prev) => ({
                    ...prev,
                    description: value,
                  }));
                  handleInputChange({
                    target: {
                      name: "description",
                      value: value,
                    },
                  });
                }}
                onBlur={(value) => {
                  setLocalFormData((prev) => ({
                    ...prev,
                    description: value,
                  }));
                  handleInputChange({
                    target: {
                      name: "description",
                      value: value,
                    },
                  });
                }}
                mode={mode}
                placeholder="Enter access hub description"
                height="200"
              />
            </div>

            {/* Capacity */}
            <div>
              <label
                htmlFor="capacity"
                className="block text-sm font-medium mb-2"
              >
                Capacity
              </label>
              <input
                type="number"
                id="capacity"
                name="capacity"
                min="1"
                value={localFormData.capacity || 0}
                onChange={handleLocalInputChange}
                className={`w-full px-4 py-3 rounded-lg border transition-all duration-200 focus:ring-2 focus:ring-blue-500 focus:outline-none ${
                  mode === "dark"
                    ? "bg-gray-700 border-gray-600 text-gray-200 placeholder-gray-400"
                    : "bg-white border-gray-300 text-gray-900 placeholder-gray-500"
                } ${errors.capacity ? "border-red-500" : ""}`}
                placeholder="Enter capacity"
                aria-invalid={errors.capacity ? "true" : "false"}
                aria-describedby={errors.capacity ? "capacity-error" : undefined}
              />
              {errors.capacity && (
                <p id="capacity-error" className="text-red-500 text-xs mt-1">
                  {errors.capacity}
                </p>
              )}
            </div>

            {/* Pricing Per Day */}
            <div>
              <label
                htmlFor="pricing_per_day"
                className="block text-sm font-medium mb-2"
              >
                Pricing Per Day
              </label>
              <div className="relative">
                <input
                  type="number"
                  id="pricing_per_day"
                  name="pricing_per_day"
                  min="0"
                  step="0.01"
                  value={localFormData.pricing_per_day || 0}
                  onChange={handleLocalInputChange}
                  className={`w-full pl-8 pr-4 py-3 rounded-lg border transition-all duration-200 focus:ring-2 focus:ring-blue-500 focus:outline-none ${
                    mode === "dark"
                      ? "bg-gray-700 border-gray-600 text-gray-200 placeholder-gray-400"
                      : "bg-white border-gray-300 text-gray-900 placeholder-gray-500"
                  } ${errors.pricing_per_day ? "border-red-500" : ""}`}
                  placeholder="0.00"
                  aria-invalid={errors.pricing_per_day ? "true" : "false"}
                  aria-describedby={errors.pricing_per_day ? "pricing-error" : undefined}
                />
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                  $
                </span>
              </div>
              {errors.pricing_per_day && (
                <p id="pricing-error" className="text-red-500 text-xs mt-1">
                  {errors.pricing_per_day}
                </p>
              )}
            </div>

            {/* Amenities */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-2">
                Amenities
              </label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {[
                  "Wi-Fi",
                  "Projector",
                  "Whiteboard",
                  "Coffee/Tea",
                  "Catering",
                  "Parking",
                  "Accessibility",
                  "Security",
                  "Cleaning Service",
                  "Technical Support",
                  "Furniture",
                  "Climate Control"
                ].map((amenity) => (
                  <label key={amenity} className="flex items-center text-sm">
                    <input
                      type="checkbox"
                      value={amenity}
                      checked={localFormData.amenities?.includes(amenity) || false}
                      onChange={handleAmenitiesChange}
                      className={`mr-2 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 ${
                        mode === "dark" ? "bg-gray-700" : "bg-white"
                      }`}
                    />
                    {amenity}
                  </label>
                ))}
              </div>
            </div>

            {/* Available Checkbox */}
            <div className="md:col-span-2">
              <label className="flex items-center text-sm font-medium">
                <input
                  type="checkbox"
                  name="is_available"
                  checked={!isEditing && localFormData.is_available === undefined ? true : (localFormData.is_available === true)}
                  onChange={handleLocalInputChange}
                  className={`mr-2 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 ${
                    mode === "dark" ? "bg-gray-700" : "bg-white"
                  }`}
                />
                Available for Booking
              </label>
            </div>

            {/* Access Hub Images */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-2">
                Access Hub Images
              </label>
              <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-4">
                <div className="flex border-b border-gray-200 dark:border-gray-600 mb-4">
                  {["upload", "url", "library"].map((source) => (
                    <button
                      key={source}
                      type="button"
                      onClick={() => setImageSource(source)}
                      className={`flex-1 px-4 py-2 text-sm font-medium transition-colors ${
                        imageSource === source
                          ? "border-b-2 border-blue-600 text-blue-600 dark:text-blue-400"
                          : "text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100"
                      }`}
                    >
                      {source.charAt(0).toUpperCase() + source.slice(1)}
                    </button>
                  ))}
                </div>
                {imageSource === "upload" && (
                  <div
                    className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                      isDragging
                        ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                        : "border-gray-300 dark:border-gray-600"
                    }`}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={(e) => {
                      e.preventDefault();
                      setIsDragging(false);
                      if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
                        handleImageUpload(e.dataTransfer.files);
                      }
                    }}
                  >
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={(e) => {
                        if (e.target.files && e.target.files.length > 0) {
                          handleImageUpload(e.target.files);
                        }
                      }}
                      className="hidden"
                      accept="image/*"
                      multiple
                    />
                    <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
                      Drag and drop image(s) here, or
                    </p>
                    <button
                      type="button"
                      onClick={() => fileInputRef.current.click()}
                      className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                    >
                      Choose Image(s)
                    </button>
                  </div>
                )}
                {imageSource === "url" && (
                  <div className="flex gap-2">
                    <input
                      type="text"
                      id="image-url-input"
                      name="image-url-input"
                      className={`w-full px-4 py-3 rounded-lg border transition-all duration-200 focus:ring-2 focus:ring-blue-500 focus:outline-none ${
                        mode === "dark"
                          ? "bg-gray-700 border-gray-600 text-gray-200 placeholder-gray-400"
                          : "bg-white border-gray-300 text-gray-900 placeholder-gray-500"
                      }`}
                      placeholder="Enter image URL"
                    />
                    <button
                      type="button"
                      onClick={handleAddImageUrl}
                      className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                    >
                      Add
                    </button>
                  </div>
                )}
                {imageSource === "library" && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setImageLibraryCallback((selectedImage) => {
                        if (!selectedImage || !selectedImage.url) return;
                        const updatedImages = [...(localFormData.images || []), selectedImage.url];
                        handleInputChange({
                          target: {
                            name: "images",
                            value: updatedImages,
                          },
                        });
                        setLocalFormData((prev) => ({
                          ...prev,
                          images: updatedImages,
                        }));
                        setImageSource("library");
                      });
                      setShowImageLibrary(true);
                    }}
                    className="w-full px-4 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-500 transition-colors"
                  >
                    Open Image Library
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Image Preview */}
          {localFormData.images && localFormData.images.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-4">
              {localFormData.images.map((img, idx) => (
                <div key={idx} className="relative aspect-video rounded-lg overflow-hidden shadow-md">
                  <Image
                    src={img}
                    alt={`Access Hub Banner ${idx + 1}`}
                    fill
                    className="object-cover"
                    unoptimized={true}
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveImage(idx)}
                    className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                    aria-label="Remove image"
                  >
                    <Icon icon="heroicons:x-mark" className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Form Actions */}
          <div className="flex justify-end gap-4 mt-6">
            <button
              type="button"
              onClick={handleCancel}
              className={`px-6 py-3 rounded-lg border transition-colors ${
                mode === "dark"
                  ? "border-gray-600 text-gray-200 hover:bg-gray-700"
                  : "border-gray-300 text-gray-900 hover:bg-gray-100"
              }`}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-3 rounded-lg bg-gradient-to-r from-blue-400 to-blue-600 text-white hover:from-blue-700 hover:to-blue-700 transition-all"
            >
              {isEditing ? "Update Access Hub" : "Create Access Hub"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
