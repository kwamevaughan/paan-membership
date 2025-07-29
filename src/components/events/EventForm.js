import { useState, useEffect, useRef } from "react";
import { Icon } from "@iconify/react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import Image from "next/image";
import ImageLibrary from "../common/ImageLibrary";
import toast from "react-hot-toast";
import EditorComponent from "../EditorComponent";

export default function EventForm({
  formData,
  handleInputChange,
  submitForm,
  cancelForm,
  isEditing,
  tiers,
  mode,
  openImageLibrary,
}) {
  const eventTypes = ["Networking", "Workshop", "Conference", "Webinar", "Training", "Other"];
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
    event_type: "Networking",
    start_date: null,
    end_date: null,
    location: "",
    is_virtual: false,
    is_one_day: false,
    registration_link: "",
    tier_restriction: "Free Member",
    banner_image: "",
    article_image: "",
    featured_image_url: "",
    featured_image_upload: null,
    featured_image_library: null,
  });
  const [startDate, setStartDate] = useState(
    formData.start_date ? new Date(formData.start_date) : null
  );
  const [endDate, setEndDate] = useState(
    formData.end_date ? new Date(formData.end_date) : null
  );
  const [showImageLibrary, setShowImageLibrary] = useState(false);
  const [imageSource, setImageSource] = useState("upload");
  const [uploadedImage, setUploadedImage] = useState(null);
  const fileInputRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);

  const resetLocalForm = () => {
    setLocalFormData({
      title: "",
      description: "",
      event_type: "Networking",
      start_date: null,
      end_date: null,
      location: "",
      is_virtual: false,
      is_one_day: false,
      registration_link: "",
      tier_restriction: "Free Member",
      banner_image: "",
      article_image: "",
      featured_image_url: "",
      featured_image_upload: null,
      featured_image_library: null,
    });
    setStartDate(null);
    setEndDate(null);
    setUploadedImage(null);
    setImageSource("upload");
  };

  useEffect(() => {
    if (formData) {
      const startDateObj = formData.start_date
        ? new Date(formData.start_date)
        : null;
      const endDateObj = formData.end_date ? new Date(formData.end_date) : null;
      setLocalFormData({
        ...formData,
        start_date: startDateObj,
        end_date: endDateObj,
        banner_image: formData.banner_image || "",
      });
      setStartDate(startDateObj);
      setEndDate(endDateObj);
      if (formData.banner_image) {
        setImageSource("library");
      }
    } else {
      resetLocalForm();
    }
  }, [formData]);

  const handleLocalInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    const newValue = type === "checkbox" ? checked : value;

    // If is_one_day is checked, set end_date to start_date
    if (name === "is_one_day" && checked && startDate) {
      setEndDate(startDate);
      setLocalFormData((prev) => ({
        ...prev,
        [name]: newValue,
        end_date: startDate.toISOString(),
      }));
      handleInputChange({
        target: { name: "end_date", value: startDate.toISOString() },
      });
    } else {
      setLocalFormData((prev) => ({
        ...prev,
        [name]: newValue,
      }));
    }
    handleInputChange(e);
  };

  const handleImageUpload = async (file) => {
    if (!file) return;
    const loadingToast = toast.loading("Uploading image...");
    try {
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
      formData.append("folder", "/Events");

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

      handleInputChange({
        target: {
          name: "banner_image",
          value: uploadData.url,
        },
      });

      setLocalFormData((prev) => ({
        ...prev,
        banner_image: uploadData.url,
      }));

      URL.revokeObjectURL(previewUrl);
      toast.success("Image uploaded successfully", {
        id: loadingToast,
      });
    } catch (error) {
      toast.error(`Failed to upload image: ${error.message}`, {
        id: loadingToast,
      });
      setUploadedImage(null);
    }
  };

  const handleRemoveImage = () => {
    handleInputChange({
      target: {
        name: "banner_image",
        value: "",
      },
    });
    setUploadedImage(null);
    setImageSource("upload");
    setLocalFormData((prev) => ({
      ...prev,
      banner_image: "",
    }));
  };

  const handleStartDateChange = (date) => {
    setStartDate(date);
    if (date) {
      const updatedData = {
        ...localFormData,
        start_date: date.toISOString(),
      };
      // If it's a one-day event, update end_date as well
      if (localFormData.is_one_day) {
        setEndDate(date);
        updatedData.end_date = date.toISOString();
        handleInputChange({
          target: { name: "end_date", value: date.toISOString() },
        });
      }
      setLocalFormData(updatedData);
      handleInputChange({
        target: { name: "start_date", value: date.toISOString() },
      });
    } else {
      const updatedData = {
        ...localFormData,
        start_date: isEditing ? formData.start_date : null,
      };
      setLocalFormData(updatedData);
      handleInputChange({
        target: {
          name: "start_date",
          value: isEditing ? formData.start_date : null,
        },
      });
    }
  };

  const handleEndDateChange = (date) => {
    // Don't allow end date change if it's a one-day event
    if (localFormData.is_one_day) return;

    setEndDate(date);
    if (date) {
      const updatedData = {
        ...localFormData,
        end_date: date.toISOString(),
      };
      setLocalFormData(updatedData);
      handleInputChange({
        target: { name: "end_date", value: date.toISOString() },
      });
    } else {
      const updatedData = {
        ...localFormData,
        end_date: isEditing ? formData.end_date : null,
      };
      setLocalFormData(updatedData);
      handleInputChange({
        target: {
          name: "end_date",
          value: isEditing ? formData.end_date : null,
        },
      });
    }
  };

  const validateForm = (e) => {
    if (e && typeof e.preventDefault === "function") {
      e.preventDefault();
    }
    const newErrors = {};
    if (!localFormData.title) newErrors.title = "Title is required";
    
    // Ensure event_type has a valid value
    const eventType = localFormData.event_type || "Networking";
    if (!eventTypes.includes(eventType)) {
      newErrors.event_type = "Please select a valid event type";
    }

    if (!isEditing) {
      if (!startDate) newErrors.startDate = "Start date is required";
      if (!endDate) newErrors.endDate = "End date is required";
      if (startDate && endDate && startDate > endDate) {
        newErrors.dateRange = "End date must be after start date";
      }
    } else {
      const originalStartDate = formData.start_date
        ? new Date(formData.start_date)
        : null;
      const originalEndDate = formData.end_date
        ? new Date(formData.end_date)
        : null;
      const startDateChanged =
        startDate?.getTime() !== originalStartDate?.getTime();
      const endDateChanged = endDate?.getTime() !== originalEndDate?.getTime();

      if (startDateChanged || endDateChanged) {
        if (!startDate) newErrors.startDate = "Start date is required";
        if (!endDate) newErrors.endDate = "End date is required";
        if (startDate && endDate && startDate > endDate) {
          newErrors.dateRange = "End date must be after start date";
        }
      }
    }

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
          event_type: localFormData.event_type || "Networking",
          start_date: startDate ? startDate.toISOString() : formData.start_date,
          end_date: endDate ? endDate.toISOString() : formData.end_date,
          banner_image: localFormData.banner_image || formData.banner_image,
          description: localFormData.description || formData.description,
        }
      : {
          ...localFormData,
          event_type: localFormData.event_type || "Networking",
          start_date: startDate ? startDate.toISOString() : null,
          end_date: endDate ? endDate.toISOString() : null,
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

    submitForm(syntheticEvent);
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
      handleImageUpload(file);
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
            {/* Event Title */}
            <div>
              <label
                htmlFor="title"
                className="block text-sm font-semibold mb-2"
              >
                Event Title
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
                placeholder="Enter event title"
                aria-invalid={errors.title ? "true" : "false"}
                aria-describedby={errors.title ? "title-error" : undefined}
              />
              {errors.title && (
                <p id="title-error" className="text-red-500 text-xs mt-1">
                  {errors.title}
                </p>
              )}
            </div>

            {/* Event Type */}
            <div>
              <label
                htmlFor="event_type"
                className="block text-sm font-semibold mb-2"
              >
                Event Type
              </label>
              <select
                id="event_type"
                name="event_type"
                value={localFormData.event_type || "Networking"}
                onChange={handleLocalInputChange}
                className={`w-full px-4 py-3 rounded-lg border transition-all duration-200 focus:ring-2 focus:ring-blue-500 focus:outline-none ${
                  mode === "dark"
                    ? "bg-gray-700 border-gray-600 text-gray-200"
                    : "bg-white border-gray-300 text-gray-900"
                } ${errors.event_type ? "border-red-500" : ""}`}
                aria-invalid={errors.event_type ? "true" : "false"}
                aria-describedby={
                  errors.event_type ? "event_type-error" : undefined
                }
              >
                {eventTypes.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
              {errors.event_type && (
                <p id="event_type-error" className="text-red-500 text-xs mt-1">
                  {errors.event_type}
                </p>
              )}
            </div>

            {/* Event Date and Time Range */}
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold mb-2">
                Event Date and Time Range
              </label>
              <div className="flex items-center mb-4">
                <label className="flex items-center text-sm font-semibold">
                  <input
                    type="checkbox"
                    name="is_one_day"
                    checked={localFormData.is_one_day || false}
                    onChange={handleLocalInputChange}
                    className={`mr-2 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 ${
                      mode === "dark" ? "bg-gray-700" : "bg-white"
                    }`}
                  />
                  One Day Event
                </label>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="relative">
                  <DatePicker
                    selected={startDate}
                    onChange={handleStartDateChange}
                    selectsStart
                    startDate={startDate}
                    endDate={endDate}
                    showTimeSelect
                    dateFormat="MMMM d, yyyy h:mm aa"
                    className={`w-full pl-10 pr-4 py-3 rounded-lg border transition-all duration-200 focus:ring-2 focus:ring-blue-500 focus:outline-none ${
                      mode === "dark"
                        ? "bg-gray-700 border-gray-600 text-gray-200 placeholder-gray-400"
                        : "bg-white border-gray-300 text-gray-900 placeholder-gray-500"
                    } ${errors.startDate ? "border-red-500" : ""}`}
                    placeholderText="Select start date and time"
                    minDate={new Date()}
                    popperClassName="z-[99999]"
                    popperPlacement="bottom-start"
                    aria-invalid={errors.startDate ? "true" : "false"}
                    aria-describedby={
                      errors.startDate ? "startDate-error" : undefined
                    }
                  />
                  <Icon
                    icon="heroicons:calendar"
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400"
                  />
                  {errors.startDate && (
                    <p
                      id="startDate-error"
                      className="text-red-500 text-xs mt-1"
                    >
                      {errors.startDate}
                    </p>
                  )}
                </div>
                <div className="relative">
                  <DatePicker
                    selected={endDate}
                    onChange={handleEndDateChange}
                    selectsEnd
                    startDate={startDate}
                    endDate={endDate}
                    minDate={startDate}
                    showTimeSelect
                    dateFormat="MMMM d, yyyy h:mm aa"
                    className={`w-full pl-10 pr-4 py-3 rounded-lg border transition-all duration-200 focus:ring-2 focus:ring-blue-500 focus:outline-none ${
                      mode === "dark"
                        ? "bg-gray-700 border-gray-600 text-gray-200 placeholder-gray-400"
                        : "bg-white border-gray-300 text-gray-900 placeholder-gray-500"
                    } ${errors.endDate ? "border-red-500" : ""} ${
                      localFormData.is_one_day
                        ? "opacity-50 cursor-not-allowed"
                        : ""
                    }`}
                    placeholderText="Select end date and time"
                    popperClassName="z-[99999]"
                    popperPlacement="bottom-start"
                    aria-invalid={errors.endDate ? "true" : "false"}
                    aria-describedby={
                      errors.endDate ? "endDate-error" : undefined
                    }
                    disabled={localFormData.is_one_day}
                  />
                  <Icon
                    icon="heroicons:calendar"
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400"
                  />
                  {errors.endDate && (
                    <p id="endDate-error" className="text-red-500 text-xs mt-1">
                      {errors.endDate}
                    </p>
                  )}
                </div>
              </div>
              {errors.dateRange && (
                <p className="text-red-500 text-xs mt-1">{errors.dateRange}</p>
              )}
            </div>

            {/* Tier Restriction */}
            <div>
              <label
                htmlFor="tier_restriction"
                className="block text-sm font-semibold mb-2"
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

            {/* Location */}
            <div>
              <label
                htmlFor="location"
                className="block text-sm font-semibold mb-2"
              >
                Location
              </label>
              <div className="relative">
                <input
                  type="text"
                  id="location"
                  name="location"
                  value={localFormData.location || ""}
                  onChange={handleLocalInputChange}
                  className={`w-full pl-10 pr-4 py-3 rounded-lg border transition-all duration-200 focus:ring-2 focus:ring-blue-500 focus:outline-none ${
                    mode === "dark"
                      ? "bg-gray-700 border-gray-600 text-gray-200 placeholder-gray-400"
                      : "bg-white border-gray-300 text-gray-900 placeholder-gray-500"
                  }`}
                  placeholder="Enter location or 'Virtual'"
                />
                <Icon
                  icon="heroicons:map-pin"
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400"
                />
              </div>
            </div>

            {/* Registration Link */}
            <div>
              <label
                htmlFor="registration_link"
                className="block text-sm font-semibold mb-2"
              >
                Registration Link
              </label>
              <div className="relative">
                <input
                  type="url"
                  id="registration_link"
                  name="registration_link"
                  value={localFormData.registration_link || ""}
                  onChange={handleLocalInputChange}
                  className={`w-full pl-10 pr-4 py-3 rounded-lg border transition-all duration-200 focus:ring-2 focus:ring-blue-500 focus:outline-none ${
                    mode === "dark"
                      ? "bg-gray-700 border-gray-600 text-gray-200 placeholder-gray-400"
                      : "bg-white border-gray-300 text-gray-900 placeholder-gray-500"
                  }`}
                  placeholder="Enter registration link"
                />
                <Icon
                  icon="heroicons:link"
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400"
                />
              </div>
            </div>

            {/* Description */}
            <div className="md:col-span-2">
              <label
                htmlFor="description"
                className="block text-sm font-semibold mb-2"
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
                placeholder="Enter event description"
                height="200"
              />
            </div>

            {/* Virtual Event Checkbox */}
            <div className="md:col-span-2">
              <label className="flex items-center text-sm font-semibold">
                <input
                  type="checkbox"
                  name="is_virtual"
                  checked={localFormData.is_virtual || false}
                  onChange={handleLocalInputChange}
                  className={`mr-2 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 ${
                    mode === "dark" ? "bg-gray-700" : "bg-white"
                  }`}
                />
                Virtual Event
              </label>
            </div>

            {/* Event Banner */}
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold mb-2">
                Event Banner
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
                    onDrop={handleDrop}
                  >
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={(e) => {
                        if (e.target.files && e.target.files.length > 0) {
                          handleImageUpload(e.target.files[0]);
                        }
                      }}
                      className="hidden"
                      accept="image/*"
                    />
                    <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
                      Drag and drop an image here, or
                    </p>
                    <button
                      type="button"
                      onClick={() => fileInputRef.current.click()}
                      className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                    >
                      Choose Image
                    </button>
                  </div>
                )}
                {imageSource === "url" && (
                  <input
                    type="text"
                    id="banner_image_url"
                    name="banner_image_url"
                    value={localFormData.banner_image_url || ""}
                    onChange={handleLocalInputChange}
                    className={`w-full px-4 py-3 rounded-lg border transition-all duration-200 focus:ring-2 focus:ring-blue-500 focus:outline-none ${
                      mode === "dark"
                        ? "bg-gray-700 border-gray-600 text-gray-200 placeholder-gray-400"
                        : "bg-white border-gray-300 text-gray-900 placeholder-gray-500"
                    }`}
                    placeholder="Enter image URL"
                  />
                )}
                {imageSource === "library" && (
                  <button
                    type="button"
                    onClick={() => openImageLibrary({
                      onSelect: (selectedImage) => {
                        handleInputChange({
                          target: {
                            name: "banner_image",
                            value: selectedImage.url,
                          },
                        });
                        setLocalFormData((prev) => ({
                          ...prev,
                          banner_image: selectedImage.url,
                        }));
                        setImageSource("library");
                      },
                      onUpload: handleImageUpload,
                      folder: "/Events",
                    })}
                    className="w-full px-4 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-500 transition-colors"
                  >
                    Open Image Library
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Image Preview */}
          {(localFormData.banner_image || uploadedImage) && (
            <div className="relative aspect-video rounded-lg overflow-hidden mt-4 shadow-md">
              <Image
                src={uploadedImage || localFormData.banner_image}
                alt="Event Banner"
                fill
                className="object-cover"
                unoptimized={true}
              />
              <button
                type="button"
                onClick={handleRemoveImage}
                className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                aria-label="Remove image"
              >
                <Icon icon="heroicons:x-mark" className="w-4 h-4" />
              </button>
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
              {isEditing ? "Update Event" : "Create Event"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
