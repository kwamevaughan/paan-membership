"use client";
// TODO: Refactor into smaller components (e.g., TextInput, useJobEditor) for maintainability
import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { supabase } from "@/lib/supabase";
import { Icon } from "@iconify/react";
import toast from "react-hot-toast";
import Select from "react-select";

const EditorComponent = dynamic(() => import("../components/EditorComponent"), {
  ssr: false,
});

export default function EditJobModal({
  isOpen,
  job,
  onClose,
  onSave,
  mode,
  onPreview,
}) {
  const [editJob, setEditJob] = useState({});
  const [countries, setCountries] = useState([]);
  const [countryOptions, setCountryOptions] = useState([]);

  useEffect(() => {
    const fetchJobData = async () => {
      if (!job || !job.id) {
        console.log("No valid job prop provided:", job);
        return;
      }

      console.log("Received job prop:", job);
      let jobData = { ...job };

      if (!job.title || !job.expires_on) {
        console.log("Fetching fresh job data from Supabase for ID:", job.id);
        const { data, error } = await supabase
          .from("job_openings")
          .select("*")
          .eq("id", job.id)
          .single();
        if (error) {
          console.error("Error fetching job:", error);
          toast.error("Failed to load job data.");
          return;
        }
        jobData = data;
        console.log("Fetched job data:", jobData);
      }

      if (jobData.expires_on) {
        const date = new Date(jobData.expires_on);
        if (!isNaN(date.getTime())) {
          jobData.expires_on = date.toISOString().split("T")[0];
        } else if (/^\d{2}\/\d{2}\/\d{4}$/.test(jobData.expires_on)) {
          const [day, month, year] = jobData.expires_on.split("/");
          const parsedDate = new Date(`${year}-${month}-${day}`);
          if (!isNaN(parsedDate.getTime())) {
            jobData.expires_on = parsedDate.toISOString().split("T")[0];
            console.log(
              `Parsed DD/MM/YYYY: ${jobData.expires_on} -> ${parsedDate}`
            );
          } else {
            console.warn(
              "Invalid expires_on value after DD/MM/YYYY parse:",
              jobData.expires_on
            );
            jobData.expires_on = "";
          }
        } else {
          console.warn("Invalid expires_on value:", jobData.expires_on);
          jobData.expires_on = "";
        }
      } else {
        console.log("expires_on is null or undefined, setting to empty string");
        jobData.expires_on = "";
      }

      // Ensure job_type has a default if not present
      jobData.job_type = jobData.job_type || "agencies";

      console.log("Setting editJob:", jobData);
      setEditJob(jobData);
    };

    const fetchCountries = async () => {
      try {
        const res = await fetch("/assets/misc/countries.json");
        const data = await res.json();
        setCountries(data);
        const options = data.map((country) => ({
          label: country.name,
          value: country.name,
        }));
        setCountryOptions(options);
      } catch (err) {
        console.error("Error fetching countries:", err);
        setCountryOptions([{ label: "Kenya", value: "Kenya" }]);
      }
    };

    if (isOpen) {
      fetchJobData();
      fetchCountries();
    } else {
      setEditJob({});
      setCountries([]);
      setCountryOptions([]);
    }
  }, [isOpen, job]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const toastId = toast.loading("Updating job opening...");

    let fileUrl = editJob.file_url;
    let fileId = editJob.file_id;

    if (editJob.newFile) {
      const fileData = await fileToBase64(editJob.newFile);
      const fileType = editJob.newFile.name.split(".").pop().toLowerCase();
      const response = await fetch("/api/upload-job-file", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fileData: fileData.split(",")[1],
          fileType,
          opening: editJob.title,
        }),
      });
      const result = await response.json();
      if (!response.ok || result.error) {
        toast.error("Failed to upload new file.", { id: toastId });
        return;
      }
      fileUrl = result.url;
      fileId = result.fileId;
    } else if (editJob.removeFile) {
      fileUrl = null;
      fileId = null;
    }

    const isDefaultDescription =
      editJob.description === "" || editJob.description === "<p><br></p>";
    const updatedJobData = {
      title: editJob.title,
      description: isDefaultDescription ? null : editJob.description,
      file_url: fileUrl,
      file_id: fileId,
      expires_on: editJob.expires_on,
      is_expired: editJob.expires_on
        ? new Date(editJob.expires_on) < new Date()
        : false,
      employment_type: editJob.employment_type || "full_time",
      job_type: editJob.job_type || "agencies", // Include job_type
      location: {
        city: editJob.location?.city || "",
        region: editJob.location?.region || "",
        country:
          countries.find((c) => c.name === editJob.location?.country)?.code ||
          editJob.location?.country ||
          "",
      },
      remote: editJob.remote || false,
      department: editJob.department || null,
      slug: editJob.slug, // Ensure slug is preserved
    };
    console.log("Updated job data:", updatedJobData);

    const { error } = await supabase
      .from("job_openings")
      .update(updatedJobData)
      .eq("id", editJob.id);

    if (error) {
      toast.error("Failed to update job opening.", { id: toastId });
      console.error("Update error details:", error);
    } else {
      const jobUrl = `https://membership.paan.africa/jobs/${editJob.slug}`;
      try {
        const response = await fetch("/api/notify-google", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ url: jobUrl }),
        });
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Failed to notify Google");
        }
        toast.success("Job opening updated and Google notified successfully!", {
          icon: "✅",
          id: toastId,
        });
      } catch (indexingError) {
        toast.success("Job opening updated, but failed to notify Google.", {
          icon: "⚠️",
          id: toastId,
        });
        console.error("Indexing API error:", indexingError);
      }

      setEditJob({
        ...editJob,
        title: "",
        description: "",
        file_url: null,
        file_id: null,
        expires_on: "",
        employment_type: "FULL_TIME",
        job_type: "agencies", // Reset job_type
        location: { city: "", region: "", country: "" },
        remote: false,
        department: null,
        newFile: null,
        removeFile: false,
      });
      onSave(updatedJobData);
    }
  };

  const fileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });
  };

  const handleDateClick = (e) => {
    e.preventDefault();
    const input = e.currentTarget.querySelector("input[type='date']");
    input.showPicker();
  };

  const handlePreviewClick = (e, url) => {
    e.preventDefault();
    e.stopPropagation();
    if (url) {
      onPreview(url);
    } else {
      toast.error("No file available to preview.");
    }
  };

  const today = new Date().toISOString().split("T")[0];

  const customStyles = {
    control: (provided) => ({
      ...provided,
      backgroundColor: mode === "dark" ? "#374151" : "#F9FAFB",
      borderColor: mode === "dark" ? "#4B5563" : "#D1D5DB",
      color: mode === "dark" ? "#F9FAFB" : "#231812",
      padding: "0.5rem",
      paddingLeft: "2.5rem",
      borderRadius: "0.5rem",
      boxShadow: "none",
      "&:hover": {
        borderColor: "#F05D23",
      },
    }),
    menu: (provided) => ({
      ...provided,
      backgroundColor: mode === "dark" ? "#374151" : "#F9FAFB",
      color: mode === "dark" ? "#F9FAFB" : "#231812",
    }),
    option: (provided, state) => ({
      ...provided,
      backgroundColor: state.isSelected
        ? "#F05D23"
        : mode === "dark"
        ? "#374151"
        : "#F9FAFB",
      color: state.isSelected
        ? "#FFFFFF"
        : mode === "dark"
        ? "#F9FAFB"
        : "#231812",
      "&:hover": {
        backgroundColor: state.isSelected ? "#F05D23" : "#FED7AA",
        color: state.isSelected ? "#FFFFFF" : "#231812",
      },
    }),
    singleValue: (provided) => ({
      ...provided,
      color: mode === "dark" ? "#F9FAFB" : "#231812",
    }),
    input: (provided) => ({
      ...provided,
      color: mode === "dark" ? "#F9FAFB" : "#231812",
    }),
    placeholder: (provided) => ({
      ...provided,
      color: mode === "dark" ? "#9CA3AF" : "#6B7280",
    }),
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50">
      <div
        className={`rounded-xl shadow-2xl transform transition-all duration-300 animate-fade-in w-full max-w-3xl mx-4 flex flex-col max-h-[90vh] overflow-hidden ${
          mode === "dark" ? "bg-gray-800 text-white" : "bg-white text-[#231812]"
        }`}
      >
        <div className="bg-gradient-to-r from-[#f05d23] to-[#d94f1e] rounded-t-xl p-4 flex items-center justify-between">
          <div className="flex items-center">
            <Icon icon="mdi:briefcase" className="w-8 h-8 text-white mr-3" />
            <h2 className="text-2xl font-bold text-white">Edit Job Opening</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-white hover:text-gray-200 transition duration-200"
          >
            <Icon icon="mdi:close" width={24} height={24} />
          </button>
        </div>
        <div className="flex-1 p-6 overflow-y-auto">
          <form
            onSubmit={handleSubmit}
            className="space-y-6 h-full flex flex-col"
          >
            <div>
              <label
                className={`block text-sm font-medium mb-2 ${
                  mode === "dark" ? "text-gray-200" : "text-[#231812]"
                }`}
              >
                Job Title <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Icon
                  icon="mdi:format-title"
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#f05d23]"
                />
                <input
                  type="text"
                  value={editJob.title || ""}
                  onChange={(e) =>
                    setEditJob((prev) => ({ ...prev, title: e.target.value }))
                  }
                  className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#f05d23] ${
                    mode === "dark"
                      ? "bg-gray-700 text-gray-200 border-gray-600"
                      : "bg-gray-50 text-[#231812] border-gray-300"
                  }`}
                  placeholder="e.g., Comms and Projects Specialist"
                  required
                />
              </div>
            </div>
            <div>
              <label
                className={`block text-sm font-medium mb-2 ${
                  mode === "dark" ? "text-gray-200" : "text-[#231812]"
                }`}
              >
                Employment Type <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Icon
                  icon="mdi:briefcase"
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#f05d23]"
                />
                <select
                  value={editJob.employment_type || "full_time"}
                  onChange={(e) =>
                    setEditJob((prev) => ({
                      ...prev,
                      employment_type: e.target.value,
                    }))
                  }
                  className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#f05d23] ${
                    mode === "dark"
                      ? "bg-gray-700 text-gray-200 border-gray-600"
                      : "bg-gray-50 text-[#231812] border-gray-300"
                  }`}
                  required
                >
                  <option value="full_time">Full-Time</option>
                  <option value="part_time">Part-Time</option>
                  <option value="contractor">Contractor</option>
                  <option value="temporary">Temporary</option>
                  <option value="intern">Internship</option>
                </select>
              </div>
            </div>
            <div>
              <label
                className={`block text-sm font-medium mb-2 ${
                  mode === "dark" ? "text-gray-200" : "text-[#231812]"
                }`}
              >
                Job Type <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Icon
                  icon="mdi:account-group"
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#f05d23]"
                />
                <select
                  value={editJob.job_type || "agencies"}
                  onChange={(e) =>
                    setEditJob((prev) => ({
                      ...prev,
                      job_type: e.target.value,
                    }))
                  }
                  className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#f05d23] ${
                    mode === "dark"
                      ? "bg-gray-700 text-gray-200 border-gray-600"
                      : "bg-gray-50 text-[#231812] border-gray-300"
                  }`}
                  required
                >
                  <option value="agencies">Agencies</option>
                  <option value="freelancers">Freelancers</option>
                </select>
              </div>
            </div>
            <div className="flex flex-col">
              <label
                className={`block text-sm font-medium mb-2 ${
                  mode === "dark" ? "text-gray-200" : "text-[#231812]"
                }`}
              >
                Description (Optional)
              </label>
              <EditorComponent
                initialValue={editJob.description || ""}
                onBlur={(newContent) =>
                  setEditJob((prev) => ({ ...prev, description: newContent }))
                }
                mode={mode}
                holderId="jodit-editor-edit-modal"
                className="w-full rounded-lg shadow-inner transition-shadow duration-200 hover:shadow-md"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label
                  className={`block text-sm font-medium mb-2 ${
                    mode === "dark" ? "text-gray-200" : "text-[#231812]"
                  }`}
                >
                  Job Description File (DOCX/PDF, Optional)
                </label>
                <div className="relative">
                  <Icon
                    icon="mdi:file-upload"
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#f05d23]"
                  />
                  <input
                    type="file"
                    accept=".pdf,.docx"
                    onChange={(e) =>
                      setEditJob((prev) => ({
                        ...prev,
                        newFile: e.target.files[0],
                        removeFile: false,
                      }))
                    }
                    className={`w-full pl-10 pr-4 py-3 border rounded-lg ${
                      mode === "dark"
                        ? "bg-gray-700 text-gray-200 border-gray-600"
                        : "bg-gray-50 text-[#231812] border-gray-300"
                    }`}
                  />
                </div>
                {(editJob.file_url || editJob.newFile) &&
                  !editJob.removeFile && (
                    <div
                      className={`mt-4 p-4 border rounded-lg shadow-md ${
                        mode === "dark"
                          ? "bg-gray-800 border-gray-700 text-gray-300"
                          : "bg-gray-100 border-gray-200 text-gray-600"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="truncate flex-1 text-sm">
                          {editJob.newFile
                            ? editJob.newFile.name
                            : `Job Description - ${editJob.title}`}
                        </span>
                        <div className="flex items-center gap-2">
                          {editJob.file_url && !editJob.newFile && (
                            <button
                              type="button"
                              onClick={(e) =>
                                handlePreviewClick(e, editJob.file_url)
                              }
                              className={`p-2 rounded-full ${
                                mode === "dark"
                                  ? "bg-gray-700 text-[#f05d23] hover:bg-gray-600"
                                  : "bg-gray-200 text-[#f05d23] hover:bg-gray-300"
                              } transition duration-200`}
                              title="View file"
                            >
                              <Icon icon="mdi:eye" width={24} height={24} />
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setEditJob((prev) => ({
                                ...prev,
                                removeFile: !prev.newFile,
                                newFile: null,
                              }));
                            }}
                            className={`p-2 rounded-full ${
                              mode === "dark"
                                ? "bg-gray-700 text-red-500 hover:bg-gray-600"
                                : "bg-gray-200 text-red-500 hover:bg-gray-300"
                            } transition duration-200`}
                            title="Remove file"
                          >
                            <Icon icon="mdi:trash-can" width={24} height={24} />
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                {editJob.removeFile && (
                  <p className="mt-4 text-sm text-red-500">
                    File will be removed on save.
                  </p>
                )}
              </div>
              <div>
                <label
                  className={`block text-sm font-medium mb-2 ${
                    mode === "dark" ? "text-gray-200" : "text-[#231812]"
                  }`}
                >
                  Expires On <span className="text-red-500">*</span>
                </label>
                <div
                  className="relative flex items-center cursor-pointer"
                  onClick={handleDateClick}
                >
                  <Icon
                    icon="mdi:calendar"
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#f05d23]"
                  />
                  <input
                    type="date"
                    value={editJob.expires_on || ""}
                    onChange={(e) =>
                      setEditJob((prev) => ({
                        ...prev,
                        expires_on: e.target.value,
                      }))
                    }
                    min={today}
                    className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#f05d23] ${
                      mode === "dark"
                        ? "bg-gray-700 text-gray-200 border-gray-600"
                        : "bg-gray-50 text-[#231812] border-gray-300"
                    }`}
                    required
                  />
                </div>
              </div>
            </div>
            <div>
              <label
                className={`block text-sm font-medium mb-2 ${
                  mode === "dark" ? "text-gray-200" : "text-[#231812]"
                }`}
              >
                Department (Optional)
              </label>
              <div className="relative">
                <Icon
                  icon="mdi:domain"
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#f05d23]"
                />
                <input
                  type="text"
                  value={editJob.department || ""}
                  onChange={(e) =>
                    setEditJob((prev) => ({
                      ...prev,
                      department: e.target.value,
                    }))
                  }
                  className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#f05d23] ${
                    mode === "dark"
                      ? "bg-gray-700 text-gray-200 border-gray-600"
                      : "bg-gray-50 text-[#231812] border-gray-300"
                  }`}
                  placeholder="e.g., Business Development"
                />
              </div>
            </div>
            <div>
              <label
                className={`block text-sm font-medium mb-2 ${
                  mode === "dark" ? "text-gray-200" : "text-[#231812]"
                }`}
              >
                Location <span className="text-red-500">*</span>
              </label>
              <div className="space-y-4">
                <div className="relative">
                  <Icon
                    icon="mdi:map-marker"
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#f05d23]"
                  />
                  <input
                    type="text"
                    value={editJob.location?.city || ""}
                    onChange={(e) =>
                      setEditJob((prev) => ({
                        ...prev,
                        location: { ...prev.location, city: e.target.value },
                      }))
                    }
                    className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#f05d23] ${
                      mode === "dark"
                        ? "bg-gray-700 text-gray-200 border-gray-600"
                        : "bg-gray-50 text-[#231812] border-gray-300"
                    }`}
                    placeholder="City (e.g., Nairobi)"
                    required
                  />
                </div>
                <div className="relative">
                  <Icon
                    icon="mdi:map"
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#f05d23]"
                  />
                  <input
                    type="text"
                    value={editJob.location?.region || ""}
                    onChange={(e) =>
                      setEditJob((prev) => ({
                        ...prev,
                        location: { ...prev.location, region: e.target.value },
                      }))
                    }
                    className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#f05d23] ${
                      mode === "dark"
                        ? "bg-gray-700 text-gray-200 border-gray-600"
                        : "bg-gray-50 text-[#231812] border-gray-300"
                    }`}
                    placeholder="Region (e.g., Nairobi County)"
                    required
                  />
                </div>
                <div className="relative">
                  <Icon
                    icon="mdi:earth"
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#f05d23] z-10"
                  />
                  <Select
                    value={
                      editJob.location?.country
                        ? {
                            label: editJob.location.country,
                            value: editJob.location.country,
                          }
                        : null
                    }
                    onChange={(selectedOption) =>
                      setEditJob((prev) => ({
                        ...prev,
                        location: {
                          ...prev.location,
                          country: selectedOption ? selectedOption.value : "",
                        },
                      }))
                    }
                    options={countryOptions}
                    placeholder="Select or type country"
                    isSearchable
                    isClearable
                    styles={customStyles}
                    className="w-full"
                    classNamePrefix="react-select"
                  />
                </div>
              </div>
            </div>
            <div>
              <label
                className={`block text-sm font-medium mb-2 ${
                  mode === "dark" ? "text-gray-200" : "text-[#231812]"
                }`}
              >
                Is the Job Remote?
              </label>
              <div className="relative">
                <label className="flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editJob.remote || false}
                    onChange={(e) =>
                      setEditJob((prev) => ({
                        ...prev,
                        remote: e.target.checked,
                      }))
                    }
                    className="w-5 h-5 text-[#f05d23] border-gray-300 rounded focus:ring-[#f05d23] mr-2"
                  />
                  <span
                    className={`text-sm ${
                      mode === "dark" ? "text-gray-200" : "text-[#231812]"
                    }`}
                  >
                    This is a remote position
                  </span>
                </label>
              </div>
            </div>
            <div className="flex gap-4">
              <button
                type="button"
                onClick={onClose}
                className={`flex-1 py-2 rounded-full transition duration-200 flex items-center justify-center gap-2 shadow-md ${
                  mode === "dark"
                    ? "bg-gray-600 text-white hover:bg-gray-500"
                    : "bg-gray-200 text-[#231812] hover:bg-gray-300"
                }`}
              >
                <Icon icon="mdi:close" width={20} height={20} />
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 py-2 bg-[#f05d23] text-white rounded-full hover:bg-[#d94f1e] transition duration-200 flex items-center justify-center gap-2 shadow-md"
              >
                <Icon icon="mdi:content-save" width={20} height={20} />
                Save
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
