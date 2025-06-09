"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { supabase } from "@/lib/supabase";
import { Icon } from "@iconify/react";
import toast from "react-hot-toast";
import Select from "react-select";

const EditorComponent = dynamic(() => import("../components/EditorComponent"), { ssr: false });

export default function JobForm({ mode, onJobAdded }) {
  const [title, setTitle] = useState("");
  const [file, setFile] = useState(null);
  const [expiresOn, setExpiresOn] = useState("");
  const [description, setDescription] = useState("");
  const [employmentType, setEmploymentType] = useState("full_time");
  const [locationCity, setLocationCity] = useState("Nairobi");
  const [locationRegion, setLocationRegion] = useState("Nairobi County");
  const [locationCountry, setLocationCountry] = useState("Kenya");
  const [remote, setRemote] = useState(false);
  const [department, setDepartment] = useState("");
  const [jobType, setJobType] = useState(""); 
  const [step, setStep] = useState(1);
  const [countries, setCountries] = useState([]);
  const [countryOptions, setCountryOptions] = useState([]);

  const steps = [
    { id: 1, name: "Job Details" },
    { id: 2, name: "Job Logistics" },
  ];
  const totalSteps = steps.length;

  useEffect(() => {
    fetch("/assets/misc/countries.json")
      .then((res) => res.json())
      .then((data) => {
        setCountries(data);
        const options = data.map((country) => ({
          label: country.name,
          value: country.name,
        }));
        setCountryOptions(options);
      })
      .catch((err) => {
        console.error("Error fetching countries:", err);
        setCountryOptions([{ label: "Kenya", value: "Kenya" }]);
      });
  }, []);

  const validateStep = () => {
    if (step === 1) {
      if (!title.trim()) {
        toast.error("Job Title is required.");
        return false;
      }
      if (!employmentType) {
        toast.error("Employment Type is required.");
        return false;
      }
      if (!expiresOn) {
        toast.error("Expiration Date is required.");
        return false;
      }
      if (new Date(expiresOn) < new Date()) {
        toast.error("Expiration Date must be in the future.");
        return false;
      }
    } else if (step === 2) {
      if (
        !locationCity.trim() ||
        !locationRegion.trim() ||
        !locationCountry.trim()
      ) {
        toast.error("All Location fields are required.");
        return false;
      }
    }
    return true;
  };

  const handleNext = (e) => {
    e.preventDefault();
    if (validateStep() && step < totalSteps) {
      setStep(step + 1);
      toast.success(`Moved to "${steps[step].name}"`, { duration: 2000 });
    }
  };

  const handlePrevious = (e) => {
    e.preventDefault();
    if (step > 1) {
      setStep(step - 1);
      toast.success(`Returned to "${steps[step - 2].name}"`, {
        duration: 2000,
      });
    }
  };

  const handleSubmit = async () => {
    const toastId = toast.loading("Submitting job opening...");

    let fileUrl = null;
    let fileId = null;

    if (file) {
      const fileData = await fileToBase64(file);
      const fileType = file.name.split(".").pop().toLowerCase();
      const response = await fetch("/api/upload-job-file", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fileData: fileData.split(",")[1],
          fileType,
          opening: title,
        }),
      });
      const result = await response.json();
      if (!response.ok || result.error) {
        toast.error("Failed to upload file.", { id: toastId });
        return;
      }
      fileUrl = result.url;
      fileId = result.fileId;
    }

    const isDefaultDescription =
      description === "" || description === "<p><br></p>";
    const jobData = {
      title,
      description: isDefaultDescription ? null : description,
      file_url: fileUrl,
      file_id: fileId,
      expires_on: expiresOn,
      is_expired: false,
      employment_type: employmentType,
      location: {
        city: locationCity,
        region: locationRegion,
        country:
          countries.find((c) => c.name === locationCountry)?.code ||
          locationCountry,
      },
      remote,
        department: department || null,
      job_type: jobType,
      slug: title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, ""),
    };

    console.log("Job data to insert:", jobData);

    const { data, error } = await supabase
      .from("job_openings")
      .insert([jobData])
      .select()
      .single();
    if (error) {
      toast.error("Failed to submit job opening.", { id: toastId });
      console.error("Insert error:", error);
    } else {
      const jobUrl = `https://membership.paan.africa/jobs/${data.slug}`;
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
        toast.success("Job opening added and Google notified successfully!", {
          icon: "✅",
          id: toastId,
        });
      } catch (indexingError) {
        toast.success("Job opening added, but failed to notify Google.", {
          icon: "⚠️",
          id: toastId,
        });
        console.error("Indexing API error:", indexingError);
      }

      setTitle("");
      setDescription("");
      setFile(null);
      setExpiresOn("");
      setEmploymentType("full_time");
      setLocationCity("Nairobi");
      setLocationRegion("Nairobi County");
      setLocationCountry("Kenya");
      setRemote(false);
        setDepartment("");
        setJobType("");
      setStep(1);
      onJobAdded(data);
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

  const handleFileChange = (e) => setFile(e.target.files[0]);
  const handleRemoveFile = () => setFile(null);
  const handleReplaceFile = () =>
    document.getElementById("file-upload").click();
  const handleDateClick = (e) => {
    e.preventDefault();
    const input = e.currentTarget.querySelector("input[type='date']");
    input.showPicker();
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
        borderColor: "blue-400",
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
        ? "blue-400"
        : mode === "dark"
        ? "#374151"
        : "#F9FAFB",
      color: state.isSelected
        ? "#FFFFFF"
        : mode === "dark"
        ? "#F9FAFB"
        : "#231812",
      "&:hover": {
        backgroundColor: state.isSelected ? "blue-400" : "#FED7AA",
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

  return (
    <div
      className={`rounded-2xl ${
        mode === "dark"
          ? ""
          : ""
      } transition-all duration-300 hover:shadow-3xl`}
    >
      <div className="flex items-center mb-8">
        <div className={`p-3 rounded-xl ${
          mode === "dark" ? "bg-gray-700" : "bg-blue-50"
        }`}>
          <Icon
            icon="mdi:briefcase-plus"
            className="w-8 h-8 text-blue-400"
          />
        </div>
        <h3
          className={`text-2xl font-bold ml-4 ${
            mode === "dark" ? "text-white" : "text-[#231812]"
          }`}
        >
          Add New Job Opening
        </h3>
      </div>
      <form className="space-y-8">
        <div className="relative">
          <div className="w-full bg-gray-200/50 rounded-full h-2.5 mb-4 overflow-hidden">
            <div
              className="bg-gradient-to-r from-blue-400 to-blue-600 h-2.5 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${(step / totalSteps) * 100}%` }}
            />
          </div>
          <div className="text-center text-lg font-semibold text-gray-700 dark:text-gray-300">
            {steps[step - 1].name} <span className="text-blue-400">•</span> Step {step} of {totalSteps}
          </div>
        </div>

        {step === 1 && (
          <div className="space-y-8">
            <div className="transform transition-all duration-300 hover:scale-[1.01]">
              <label
                className={`block text-sm font-medium mb-2 ${
                  mode === "dark" ? "text-gray-300" : "text-[#231812]"
                }`}
              >
                Job Title <span className="text-red-500">*</span>
              </label>
              <div className="relative group">
                <Icon
                  icon="mdi:format-title"
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-blue-400 group-hover:text-blue-500 transition-colors duration-200"
                />
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className={`w-full pl-10 pr-4 py-3.5 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400/50 transition-all duration-200 ${
                    mode === "dark"
                      ? "bg-gray-700/50 border-gray-600 text-white hover:bg-gray-600/50"
                      : "bg-gray-50/50 border-gray-200 text-[#231812] hover:bg-gray-100/50"
                  }`}
                  placeholder="e.g., Comms and Projects Specialist"
                  required
                />
              </div>
            </div>
            <div className="transform transition-all duration-300 hover:scale-[1.01]">
              <label
                className={`block text-sm font-medium mb-2 ${
                  mode === "dark" ? "text-gray-300" : "text-[#231812]"
                }`}
              >
                Employment Type <span className="text-red-500">*</span>
              </label>
              <div className="relative group">
                <Icon
                  icon="mdi:briefcase"
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-blue-400 group-hover:text-blue-500 transition-colors duration-200"
                />
                <select
                  value={employmentType}
                  onChange={(e) => setEmploymentType(e.target.value)}
                  className={`w-full pl-10 pr-4 py-3.5 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400/50 transition-all duration-200 appearance-none ${
                    mode === "dark"
                      ? "bg-gray-700/50 border-gray-600 text-white hover:bg-gray-600/50"
                      : "bg-gray-50/50 border-gray-200 text-[#231812] hover:bg-gray-100/50"
                  }`}
                  required
                >
                  <option value="full_time">Full-Time</option>
                  <option value="part_time">Part-Time</option>
                  <option value="contractor">Contractor</option>
                  <option value="temporary">Temporary</option>
                  <option value="intern">Internship</option>
                </select>
                <Icon
                  icon="mdi:chevron-down"
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-blue-400 pointer-events-none"
                />
              </div>
            </div>
            <div className="transform transition-all duration-300 hover:scale-[1.01]">
              <label
                className={`block text-sm font-medium mb-2 ${
                  mode === "dark" ? "text-gray-300" : "text-[#231812]"
                }`}
              >
                Job Description (Optional)
              </label>
              <div className={`border-2 rounded-xl overflow-hidden transition-all duration-200 ${
                mode === "dark" ? "border-gray-600" : "border-gray-200"
              }`}>
                <EditorComponent
                  initialValue={description}
                  onBlur={(newContent) => setDescription(newContent)}
                  mode={mode}
                  holderId="jodit-editor-job-form"
                  className="w-full"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="transform transition-all duration-300 hover:scale-[1.01]">
                <label
                  className={`block text-sm font-medium mb-2 ${
                    mode === "dark" ? "text-gray-300" : "text-[#231812]"
                  }`}
                >
                  Upload Job Description (Optional)
                </label>
                <div className="relative group">
                  <Icon
                    icon="mdi:file-upload"
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-blue-400 group-hover:text-blue-500 transition-colors duration-200"
                  />
                  <input
                    id="file-upload"
                    type="file"
                    accept=".pdf,.docx"
                    onChange={handleFileChange}
                    className={`w-full pl-10 pr-4 py-3.5 border-2 rounded-xl transition-all duration-200 ${
                      mode === "dark"
                        ? "bg-gray-700/50 border-gray-600 text-gray-300 hover:bg-gray-600/50"
                        : "bg-gray-50/50 border-gray-200 text-[#231812] hover:bg-gray-100/50"
                    }`}
                  />
                </div>
                {file && (
                  <div
                    className={`mt-4 p-4 border-2 rounded-xl shadow-lg animate-fade-in ${
                      mode === "dark"
                        ? "bg-gray-800/50 border-gray-700 text-gray-300"
                        : "bg-gray-100/50 border-gray-200 text-gray-600"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="truncate flex-1 text-sm">
                        {file.name}
                      </span>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={handleRemoveFile}
                          className={`p-2 rounded-lg transition-all duration-200 hover:scale-110 ${
                            mode === "dark"
                              ? "bg-gray-700/50 text-red-500 hover:bg-gray-600/50"
                              : "bg-gray-200/50 text-red-500 hover:bg-gray-300/50"
                          }`}
                        >
                          <Icon icon="mdi:trash-can" width={24} height={24} />
                        </button>
                        <button
                          type="button"
                          onClick={handleReplaceFile}
                          className={`p-2 rounded-lg transition-all duration-200 hover:scale-110 ${
                            mode === "dark"
                              ? "bg-gray-700/50 text-blue-400 hover:bg-gray-600/50"
                              : "bg-gray-200/50 text-blue-400 hover:bg-gray-300/50"
                          }`}
                        >
                          <Icon icon="mdi:refresh" width={24} height={24} />
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              <div className="transform transition-all duration-300 hover:scale-[1.01]">
                <label
                  className={`block text-sm font-medium mb-2 ${
                    mode === "dark" ? "text-gray-300" : "text-[#231812]"
                  }`}
                >
                  Expiration <span className="text-red-500">*</span>
                </label>
                <div
                  className="relative flex items-center cursor-pointer group"
                  onClick={handleDateClick}
                >
                  <Icon
                    icon="mdi:calendar"
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-blue-400 group-hover:text-blue-500 transition-colors duration-200"
                  />
                  <input
                    type="date"
                    value={expiresOn}
                    onChange={(e) => setExpiresOn(e.target.value)}
                    min={today}
                    className={`w-full pl-10 pr-4 py-3.5 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400/50 transition-all duration-200 ${
                      mode === "dark"
                        ? "bg-gray-700/50 border-gray-600 text-white hover:bg-gray-600/50"
                        : "bg-gray-50/50 border-gray-200 text-[#231812] hover:bg-gray-100/50"
                    }`}
                    required
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-8">
            <div className="transform transition-all duration-300 hover:scale-[1.01]">
              <label
                className={`block text-sm font-medium mb-2 ${
                  mode === "dark" ? "text-gray-300" : "text-[#231812]"
                }`}
              >
                Department (Optional)
              </label>
              <div className="relative group">
                <Icon
                  icon="mdi:domain"
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-blue-400 group-hover:text-blue-500 transition-colors duration-200"
                />
                <input
                  type="text"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  className={`w-full pl-10 pr-4 py-3.5 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400/50 transition-all duration-200 ${
                    mode === "dark"
                      ? "bg-gray-700/50 border-gray-600 text-white hover:bg-gray-600/50"
                      : "bg-gray-50/50 border-gray-200 text-[#231812] hover:bg-gray-100/50"
                  }`}
                  placeholder="e.g., Business Development"
                />
              </div>
            </div>
            <div className="transform transition-all duration-300 hover:scale-[1.01]">
              <label
                className={`block text-sm font-medium mb-2 ${
                  mode === "dark" ? "text-gray-300" : "text-[#231812]"
                }`}
              >
                Job Type <span className="text-red-500">*</span>
              </label>
              <div className="relative group">
                <Icon
                  icon="mdi:account-group"
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-blue-400 group-hover:text-blue-500 transition-colors duration-200"
                />
                <select
                  value={jobType}
                  onChange={(e) => setJobType(e.target.value)}
                  className={`w-full pl-10 pr-4 py-3.5 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400/50 transition-all duration-200 appearance-none ${
                    mode === "dark"
                      ? "bg-gray-700/50 border-gray-600 text-white hover:bg-gray-600/50"
                      : "bg-gray-50/50 border-gray-200 text-[#231812] hover:bg-gray-100/50"
                  }`}
                  required
                >
                  <option value="" disabled>
                    Select Job Type
                  </option>
                  <option value="agencies">Agencies</option>
                  <option value="freelancers">Freelancers</option>
                </select>
                <Icon
                  icon="mdi:chevron-down"
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-blue-400 pointer-events-none"
                />
              </div>
            </div>
            <div className="transform transition-all duration-300 hover:scale-[1.01]">
              <label
                className={`block text-sm font-medium mb-2 ${
                  mode === "dark" ? "text-gray-300" : "text-[#231812]"
                }`}
              >
                Location <span className="text-red-500">*</span>
              </label>
              <div className="space-y-4">
                <div className="relative group">
                  <Icon
                    icon="mdi:map-marker"
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-blue-400 group-hover:text-blue-500 transition-colors duration-200"
                  />
                  <input
                    type="text"
                    value={locationCity}
                    onChange={(e) => setLocationCity(e.target.value)}
                    className={`w-full pl-10 pr-4 py-3.5 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400/50 transition-all duration-200 ${
                      mode === "dark"
                        ? "bg-gray-700/50 border-gray-600 text-white hover:bg-gray-600/50"
                        : "bg-gray-50/50 border-gray-200 text-[#231812] hover:bg-gray-100/50"
                    }`}
                    placeholder="City (e.g., Nairobi)"
                    required
                  />
                </div>
                <div className="relative group">
                  <Icon
                    icon="mdi:map"
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-blue-400 group-hover:text-blue-500 transition-colors duration-200"
                  />
                  <input
                    type="text"
                    value={locationRegion}
                    onChange={(e) => setLocationRegion(e.target.value)}
                    className={`w-full pl-10 pr-4 py-3.5 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400/50 transition-all duration-200 ${
                      mode === "dark"
                        ? "bg-gray-700/50 border-gray-600 text-white hover:bg-gray-600/50"
                        : "bg-gray-50/50 border-gray-200 text-[#231812] hover:bg-gray-100/50"
                    }`}
                    placeholder="Region (e.g., Nairobi County)"
                    required
                  />
                </div>
                <div className="relative group">
                  <Icon
                    icon="mdi:earth"
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-blue-400 group-hover:text-blue-500 transition-colors duration-200 z-10"
                  />
                  <Select
                    value={
                      locationCountry
                        ? { label: locationCountry, value: locationCountry }
                        : null
                    }
                    onChange={(selectedOption) =>
                      setLocationCountry(
                        selectedOption ? selectedOption.value : ""
                      )
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
            <div className="transform transition-all duration-300 hover:scale-[1.01]">
              <label
                className={`block text-sm font-medium mb-2 ${
                  mode === "dark" ? "text-gray-300" : "text-[#231812]"
                }`}
              >
                Is the Job Remote?
              </label>
              <div className="relative">
                <label className="flex items-center cursor-pointer group">
                  <div className={`relative w-12 h-6 rounded-full transition-colors duration-200 ${
                    remote 
                      ? "bg-blue-400" 
                      : mode === "dark" 
                        ? "bg-gray-600" 
                        : "bg-gray-300"
                  }`}>
                    <div className={`absolute left-1 top-1 w-4 h-4 rounded-full bg-white transform transition-transform duration-200 ${
                      remote ? "translate-x-6" : ""
                    }`} />
                  </div>
                  <span
                    className={`ml-3 text-sm ${
                      mode === "dark" ? "text-gray-300" : "text-[#231812]"
                    }`}
                  >
                    This is a remote position
                  </span>
                </label>
              </div>
            </div>
          </div>
        )}

        <div className="flex justify-between mt-8">
          <button
            type="button"
            onClick={handlePrevious}
            disabled={step === 1}
            className={`py-3 px-6 rounded-xl flex items-center gap-2 transition-all duration-200 ${
              step === 1
                ? "bg-gray-400/50 text-gray-600 cursor-not-allowed"
                : mode === "dark"
                ? "bg-gray-700/50 text-white hover:bg-gray-600/50"
                : "bg-gray-200/50 text-[#231812] hover:bg-gray-300/50"
            }`}
          >
            <Icon icon="mdi:arrow-left" width={20} height={20} />
            Previous
          </button>
          {step < totalSteps ? (
            <button
              type="button"
              onClick={handleNext}
              className="py-3 px-6 bg-gradient-to-r from-blue-400 to-blue-600 text-white rounded-xl hover:from-blue-500 hover:to-blue-700 transition-all duration-200 flex items-center gap-2 shadow-lg hover:shadow-xl"
            >
              Next
              <Icon icon="mdi:arrow-right" width={20} height={20} />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSubmit}
              className="py-3 px-6 bg-gradient-to-r from-blue-400 to-blue-600 text-white rounded-xl hover:from-blue-500 hover:to-blue-700 transition-all duration-200 flex items-center gap-2 shadow-lg hover:shadow-xl"
            >
              <Icon icon="mdi:plus" width={20} height={20} />
              Add Job Opening
            </button>
          )}
        </div>
      </form>
    </div>
  );
}