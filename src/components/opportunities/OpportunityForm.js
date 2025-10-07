import { useState, useEffect } from "react";
import { Icon } from "@iconify/react";
import { supabase } from "@/lib/supabase";
import ItemActionModal from "@/components/ItemActionModal";
import TenderFormSection from "./TenderFormSection";
import RegularFormSection from "./RegularFormSection";
import FormActions from "./FormActions";
import { toast } from "react-hot-toast";

export default function OpportunityForm({
  formData,
  handleInputChange,
  submitForm,
  cancelForm,
  isEditing,
  tiers,
  mode,
  handleBulkSubmit,
  modalTitle,
  modalButtonText,
}) {
  const [jobType, setJobType] = useState(formData.job_type || "Agency");
  const [projectTypes, setProjectTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notifyMembers, setNotifyMembers] = useState(false);
  const [showNotificationConfirm, setShowNotificationConfirm] = useState(false);
  const [memberCount, setMemberCount] = useState(0);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [isTender, setIsTender] = useState(formData.is_tender || false);

  useEffect(() => {
    async function fetchProjectTypes() {
      if (jobType !== "Agency") {
        setProjectTypes([]);
        setLoading(false);
        return;
      }
      setLoading(true);
      const { data, error } = await supabase
        .from("project_types")
        .select("name")
        .eq("job_type", "Agency")
        .order("name", { ascending: true });
      if (error) {
        console.error("[OpportunityForm] Error fetching project types:", error);
        setProjectTypes([]);
      } else {
        setProjectTypes(data.map((item) => item.name));
      }
      setLoading(false);
    }
    fetchProjectTypes();
  }, [jobType]);

  // Add effect to fetch member count when tier changes
  useEffect(() => {
    if (formData.tier_restriction) {
      fetchMemberCount(formData.tier_restriction);
    }
  }, [formData.tier_restriction]);

  // Initialize uploaded file from form data if editing
  useEffect(() => {
    if (isEditing && formData.attachment_url) {
      setUploadedFile({
        url: formData.attachment_url,
        name: formData.attachment_name || "Uploaded Document",
        fileType: formData.attachment_type || "application/pdf",
        fileSize: formData.attachment_size || 0,
      });
    }
  }, [isEditing, formData.attachment_url, formData.attachment_name, formData.attachment_size, formData.attachment_type]);

  // Add tender fields to form state if not present
  useEffect(() => {
    if (formData.is_tender === undefined) {
      handleInputChange({ target: { name: "is_tender", value: false } });
    }
  }, [formData.is_tender, handleInputChange]);

  // Sync isTender state with formData.is_tender
  useEffect(() => {
    console.log("[OpportunityForm] formData.is_tender changed:", formData.is_tender);
    if (formData.is_tender !== undefined) {
      const newTenderState = Boolean(formData.is_tender);
      console.log("[OpportunityForm] Setting isTender to:", newTenderState);
      setIsTender(newTenderState);
    }
  }, [formData.is_tender]);

  const fetchMemberCount = async (tier) => {
    try {
      const response = await fetch(`/api/members/count?tier=${encodeURIComponent(tier)}`);
      if (!response.ok) {
        throw new Error('Failed to fetch member count');
      }
      const data = await response.json();
      setMemberCount(data.count);
    } catch (error) {
      console.error('Error fetching member count:', error);
      setMemberCount(0);
    }
  };

  const handleJobTypeChange = (e) => {
    const newJobType = e.target.value;
    setJobType(newJobType);
    handleInputChange({ target: { name: "job_type", value: newJobType } });
    if (newJobType === "Freelancer") {
      handleInputChange({ target: { name: "tier_restriction", value: "" } });
      handleInputChange({ target: { name: "project_type", value: "" } });
    }
  };

  const handleSkillsChange = (e) => {
    const skills = Array.from(e.target.selectedOptions).map(
      (option) => option.value
    );
    handleInputChange({ target: { name: "skills_required", value: skills } });
  };

  const handleCheckboxChange = (e) => {
    handleInputChange({
      target: { name: e.target.name, value: e.target.checked },
    });
  };

  // Handle file upload
  const handleFileUpload = (fileData) => {
    handleInputChange({
      target: { name: "attachment_url", value: fileData.url }
    });
    handleInputChange({
      target: { name: "attachment_name", value: fileData.name }
    });
    handleInputChange({
      target: { name: "attachment_type", value: fileData.fileType }
    });
    handleInputChange({
      target: { name: "attachment_size", value: fileData.fileSize }
    });
  };

  // Handle notification toggle
  const handleNotificationToggle = (e) => {
    if (e.target.checked) {
      setShowNotificationConfirm(true);
    } else {
      setNotifyMembers(false);
      handleInputChange({
        target: { name: "notify_members", value: false },
      });
    }
  };

  // Handle notification confirmation
  const handleNotificationConfirm = () => {
    setNotifyMembers(true);
    handleInputChange({
      target: { 
        name: "notify_members", 
        value: true 
      }
    });
    setShowNotificationConfirm(false);
  };

  // Handle notification cancel
  const handleNotificationCancel = () => {
    setNotifyMembers(false);
    handleInputChange({
      target: { 
        name: "notify_members", 
        value: false 
      }
    });
    setShowNotificationConfirm(false);
  };

  const isFreelancer = jobType === "Freelancer";

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    
    // If notifications are enabled, send them in the background
    if (notifyMembers) {
      // Don't await this - let it run in background
      fetch('/api/opportunities/notify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: formData.title,
          description: formData.description,
          tier_restriction: formData.tier_restriction,
          job_type: formData.job_type,
          project_type: formData.project_type,
          skills_required: formData.skills_required,
          location: formData.location,
          deadline: formData.deadline,
          budget: formData.budget,
          category: formData.category,
          tags: formData.tags
        }),
      }).catch(error => {
        console.error('Error sending notifications:', error);
        toast.error('Opportunity saved but notifications failed to send');
      });
    }

    // Submit the form
    submitForm(e);
  };

  return (
    <>
      <form onSubmit={handleFormSubmit}>
        {/* Opportunity Type Selection */}
        <div className="mb-6">
          <label className={`block text-sm font-medium ${mode === "dark" ? "text-gray-300" : "text-gray-700"} mb-3`}>
            Opportunity Type <span className="text-rose-500">*</span>
              </label>
              <div className="flex space-x-6">
                <label className="flex items-center">
                  <input
                    type="radio"
                name="opportunity_type"
                value="regular"
                checked={!isTender}
                onChange={() => {
                  setIsTender(false);
                  handleInputChange({ target: { name: "is_tender", value: false } });
                }}
                    className={`h-4 w-4 text-indigo-600 border-gray-300 focus:ring-indigo-500 ${
                  mode === "dark" ? "bg-gray-800 border-gray-600 focus:ring-indigo-400" : ""
                    }`}
                    required
                  />
              <span className={`ml-2 text-sm ${mode === "dark" ? "text-gray-300" : "text-gray-700"}`}>
                Regular Opportunity
                  </span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                name="opportunity_type"
                value="tender"
                checked={isTender}
                onChange={() => {
                  setIsTender(true);
                  handleInputChange({ target: { name: "is_tender", value: true } });
                }}
                    className={`h-4 w-4 text-indigo-600 border-gray-300 focus:ring-indigo-500 ${
                  mode === "dark" ? "bg-gray-800 border-gray-600 focus:ring-indigo-400" : ""
                    }`}
                  />
              <span className={`ml-2 text-sm ${mode === "dark" ? "text-gray-300" : "text-gray-700"}`}>
                Tender Opportunity
                  </span>
                </label>
              </div>
            </div>

        {/* Form Sections */}
        {isTender ? (
          <TenderFormSection
            formData={formData}
            handleInputChange={handleInputChange}
            mode={mode}
            uploadedFile={uploadedFile}
            setUploadedFile={setUploadedFile}
            handleFileUpload={handleFileUpload}
            tiers={tiers}
            handleBulkSubmit={handleBulkSubmit}
          />
        ) : (
          <RegularFormSection
            formData={formData}
            handleInputChange={handleInputChange}
                mode={mode}
            jobType={jobType}
            setJobType={setJobType}
            handleJobTypeChange={handleJobTypeChange}
            handleSkillsChange={handleSkillsChange}
            handleCheckboxChange={handleCheckboxChange}
            handleFileUpload={handleFileUpload}
                uploadedFile={uploadedFile}
                setUploadedFile={setUploadedFile}
            loading={loading}
            projectTypes={projectTypes}
            tiers={tiers}
            memberCount={memberCount}
            notifyMembers={notifyMembers}
            handleNotificationToggle={handleNotificationToggle}
            isEditing={isEditing}
            isFreelancer={isFreelancer}
          />
        )}

        {/* Form Actions */}
        <FormActions
          cancelForm={cancelForm}
          mode={mode}
          loading={loading}
          isEditing={isEditing}
          isFreelancer={isFreelancer}
          buttonText={modalButtonText}
        />
      </form>

      {/* Notification Confirmation Modal */}
      <ItemActionModal
        isOpen={showNotificationConfirm}
        onClose={handleNotificationCancel}
        title={modalTitle || "Confirm Member Notification"}
        mode={mode}
      >
        <div className="space-y-6">
          <p className={`text-sm ${mode === "dark" ? "text-gray-300" : "text-gray-600"}`}>
            Are you sure you want to notify all members in the selected tier about this opportunity? This will send an email notification to all eligible members.
          </p>
          <div className="flex justify-end space-x-4">
            <button
              onClick={handleNotificationCancel}
              className={`px-6 py-3 text-sm font-medium rounded-xl border transition-all duration-200 flex items-center shadow-sm ${
                mode === "dark"
                  ? "border-gray-600 text-gray-200 bg-gray-800 hover:bg-gray-700"
                  : "border-gray-200 text-gray-700 bg-white hover:bg-gray-50"
              }`}
            >
              <Icon icon="heroicons:x-mark" className="h-4 w-4 mr-2" />
              Cancel
            </button>
            <button
              onClick={handleNotificationConfirm}
              className={`px-6 py-3 text-sm font-medium rounded-xl text-white bg-indigo-600 hover:bg-indigo-700 transition-all duration-200 flex items-center shadow-sm ${
                mode === "dark" ? "shadow-white/10" : "shadow-gray-200"
              }`}
            >
              <Icon icon="heroicons:bell" className="h-4 w-4 mr-2" />
              Notify Members
            </button>
          </div>
        </div>
      </ItemActionModal>
    </>
  );
}