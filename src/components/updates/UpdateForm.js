import { Icon } from "@iconify/react";
import ItemActionModal from "../ItemActionModal";
import dynamic from "next/dynamic";
import { useState, useEffect } from "react";

// Dynamically import EditorComponent for client-side only
const EditorComponent = dynamic(() => import("../EditorComponent"), {
  ssr: false,
  loading: () => <p>Loading editor...</p>,
});

export default function UpdatesForm({
  showForm,
  mode,
  formData,
  handleInputChange,
  handleSubmit,
  handleCancel,
  loading,
  categories,
  memberCount = 0,
}) {
  const [showCTA, setShowCTA] = useState(false);
  const [notifyMembers, setNotifyMembers] = useState(false);
  const [isMac, setIsMac] = useState(false);
  const [showNotificationConfirm, setShowNotificationConfirm] = useState(false);
  const validTiers = ["Associate Member", "Full Member", "Gold Member", "Free Member"];
  const tagOptions = [
    "Governance",
    "Member Spotlights",
    "Global Partnerships",
    "Regional Growth",
  ];

  // Initialize showCTA based on formData when component mounts or formData changes
  useEffect(() => {
    setShowCTA(!!formData.cta_text || !!formData.cta_url);
  }, [formData.cta_text, formData.cta_url]);

  // Check if user is on Mac (client-side only)
  useEffect(() => {
    setIsMac(navigator.platform.includes('Mac'));
  }, []);

  // Handle multi-select change for tags
  const handleTagsChange = (e) => {
    const selectedOptions = Array.from(e.target.selectedOptions).map(
      (option) => option.value
    );
    handleInputChange({
      target: { name: "tags", value: selectedOptions.join(", ") },
    });
  };

  // Handle editor content change
  const handleEditorChange = (newContent) => {
    handleInputChange({
      target: { name: "description", value: newContent },
    });
  };

  // Handle CTA toggle
  const handleCTAToggle = (e) => {
    setShowCTA(e.target.checked);
    if (!e.target.checked) {
      // Clear CTA fields when disabled
      handleInputChange({
        target: { name: "cta_text", value: "" },
      });
      handleInputChange({
        target: { name: "cta_url", value: "" },
      });
    }
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

  // Format URL to ensure https:// prefix
  const formatUrl = (url) => {
    if (!url) return "";
    // Remove any existing protocol
    url = url.replace(/^(https?:\/\/)?(www\.)?/, "");
    // Add https:// prefix
    return `https://${url}`;
  };

  // Handle URL input change
  const handleUrlChange = (e) => {
    const formattedUrl = formatUrl(e.target.value);
    handleInputChange({
      target: { name: "cta_url", value: formattedUrl },
    });
  };

  return (
    <>
      <ItemActionModal
        isOpen={showForm}
        onClose={handleCancel}
        title={formData.id ? "Edit Update" : "Create Update"}
        mode={mode}
      >
        <form
          onSubmit={(e) => handleSubmit(e, handleCancel)}
          className="space-y-6"
        >
          <div>
            <label
              className={`block text-sm font-medium ${
                mode === "dark" ? "text-gray-300" : "text-gray-700"
              } mb-2`}
            >
              Title *
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              required
              className={`w-full px-4 py-3 rounded-xl ${
                mode === "dark"
                  ? "bg-gray-800/80 text-white border-gray-700/50"
                  : "bg-white/80 text-gray-900 border-gray-200/50"
              } focus:ring-2 focus:ring-indigo-500 backdrop-blur-sm`}
              placeholder="Enter update title"
            />
          </div>
          <div>
            <label
              className={`block text-sm font-medium ${
                mode === "dark" ? "text-gray-300" : "text-gray-700"
              } mb-2`}
            >
              Body *
            </label>
            <div className={`border-2 rounded-xl overflow-hidden transition-all duration-200 ${
              mode === "dark" ? "border-gray-600" : "border-gray-200"
            }`}>
              <EditorComponent
                initialValue={formData.description}
                onBlur={handleEditorChange}
                mode={mode}
                holderId="jodit-editor-updates-form"
                className="w-full"
                height="300"
              />
            </div>
          </div>
          <div>
            <label
              className={`block text-sm font-medium ${
                mode === "dark" ? "text-gray-300" : "text-gray-700"
              } mb-2`}
            >
              Category *
            </label>
            <select
              name="category"
              value={formData.category}
              onChange={handleInputChange}
              required
              className={`w-full px-4 py-3 rounded-xl ${
                mode === "dark"
                  ? "bg-gray-800/80 text-white border-gray-700/50"
                  : "bg-white/80 text-gray-900 border-gray-200/50"
              } focus:ring-2 focus:ring-indigo-500 backdrop-blur-sm`}
            >
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label
              className={`block text-sm font-medium ${
                mode === "dark" ? "text-gray-300" : "text-gray-700"
              } mb-2`}
            >
              Tier Restriction *
            </label>
            <select
              name="tier_restriction"
              value={formData.tier_restriction}
              onChange={handleInputChange}
              required
              className={`w-full px-4 py-3 rounded-xl ${
                mode === "dark"
                  ? "bg-gray-800/80 text-white border-gray-700/50"
                  : "bg-white/80 text-gray-900 border-gray-200/50"
              } focus:ring-2 focus:ring-indigo-500 backdrop-blur-sm`}
            >
              {validTiers.map((tier) => (
                <option key={tier} value={tier}>
                  {tier}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label
              className={`block text-sm font-medium ${
                mode === "dark" ? "text-gray-300" : "text-gray-700"
              } mb-2`}
            >
              Tags
            </label>
            <p className={`text-xs mb-2 ${
              mode === "dark" ? "text-gray-400" : "text-gray-500"
            }`}>
              Hold {isMac ? 'Command' : 'Control'} key to select multiple tags
            </p>
            <select
              name="tags"
              multiple
              value={
                formData.tags ? formData.tags.split(", ").filter(Boolean) : []
              }
              onChange={handleTagsChange}
              className={`w-full px-4 py-3 rounded-xl ${
                mode === "dark"
                  ? "bg-gray-800/80 text-white border-gray-700/50"
                  : "bg-white/80 text-gray-900 border-gray-200/50"
              } focus:ring-2 focus:ring-indigo-500 backdrop-blur-sm h-24`}
            >
              {tagOptions.map((tag) => (
                <option key={tag} value={tag}>
                  {tag}
                </option>
              ))}
            </select>
          </div>

          {/* Notification Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="notify-members"
                checked={notifyMembers}
                onChange={handleNotificationToggle}
                className={`w-4 h-4 rounded ${
                  mode === "dark"
                    ? "bg-gray-700 border-gray-600"
                    : "bg-white border-gray-300"
                }`}
              />
              <label
                htmlFor="notify-members"
                className={`text-sm font-medium ${
                  mode === "dark" ? "text-gray-300" : "text-gray-700"
                }`}
              >
                Notify Members
              </label>
            </div>
            {notifyMembers && memberCount > 0 && (
              <div className={`text-sm ${
                mode === "dark" ? "text-gray-400" : "text-gray-500"
              } pl-6`}>
                {memberCount} member{memberCount !== 1 ? 's' : ''} in the {formData.tier_restriction} tier will be notified
              </div>
            )}
          </div>

          {/* CTA Section with Toggle */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="enable-cta"
                checked={showCTA}
                onChange={handleCTAToggle}
                className={`w-4 h-4 rounded ${
                  mode === "dark"
                    ? "bg-gray-700 border-gray-600"
                    : "bg-white border-gray-300"
                }`}
              />
              <label
                htmlFor="enable-cta"
                className={`text-sm font-medium ${
                  mode === "dark" ? "text-gray-300" : "text-gray-700"
                }`}
              >
                Add Call-to-Action Link
              </label>
            </div>

            {showCTA && (
              <div className="space-y-4 pl-6">
                <div>
                  <label
                    className={`block text-sm font-medium ${
                      mode === "dark" ? "text-gray-300" : "text-gray-700"
                    } mb-2`}
                  >
                    CTA Text
                  </label>
                  <input
                    type="text"
                    name="cta_text"
                    value={formData.cta_text}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 rounded-xl ${
                      mode === "dark"
                        ? "bg-gray-800/80 text-white border-gray-700/50"
                        : "bg-white/80 text-gray-900 border-gray-200/50"
                    } focus:ring-2 focus:ring-indigo-500 backdrop-blur-sm`}
                    placeholder="e.g., Register for Webinar"
                  />
                </div>
                <div>
                  <label
                    className={`block text-sm font-medium ${
                      mode === "dark" ? "text-gray-300" : "text-gray-700"
                    } mb-2`}
                  >
                    CTA URL
                  </label>
                  <input
                    type="url"
                    name="cta_url"
                    value={formData.cta_url}
                    onChange={handleUrlChange}
                    className={`w-full px-4 py-3 rounded-xl ${
                      mode === "dark"
                        ? "bg-gray-800/80 text-white border-gray-700/50"
                        : "bg-white/80 text-gray-900 border-gray-200/50"
                    } focus:ring-2 focus:ring-indigo-500 backdrop-blur-sm`}
                    placeholder="e.g., paan.org/webinar"
                  />
                </div>
              </div>
            )}
          </div>

          <div className="flex gap-4">
            <button
              type="submit"
              disabled={loading}
              className={`flex-1 px-6 py-3 rounded-xl ${
                mode === "dark"
                  ? "bg-gradient-to-r from-blue-700 to-blue-500 text-white"
                  : "bg-gradient-to-r from-blue-600 to-blue-500 text-white"
              } disabled:opacity-50 flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-200`}
            >
              {loading ? (
                <>
                  <Icon
                    icon="heroicons:arrow-path"
                    className="w-5 h-5 mr-2 animate-spin"
                  />
                  Saving...
                </>
              ) : (
                <>
                  <Icon icon="heroicons:check" className="w-5 h-5 mr-2" />
                  {formData.id ? "Update" : "Create"}
                </>
              )}
            </button>
            <button
              type="button"
              onClick={handleCancel}
              className={`flex-1 px-6 py-3 rounded-xl ${
                mode === "dark"
                  ? "bg-gray-800 text-white"
                  : "bg-gray-200 text-gray-900"
              } flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-200`}
            >
              <Icon icon="heroicons:x-mark" className="w-5 h-5 mr-2" />
              Cancel
            </button>
          </div>
        </form>
      </ItemActionModal>

      {/* Notification Confirmation Modal */}
      <ItemActionModal
        isOpen={showNotificationConfirm}
        onClose={handleNotificationCancel}
        title="Confirm Member Notification"
        mode={mode}
      >
        <div className="space-y-6">
          <p className={`text-sm ${
            mode === "dark" ? "text-gray-300" : "text-gray-600"
          }`}>
            Are you sure you want to notify {memberCount} member{memberCount !== 1 ? 's' : ''} in the {formData.tier_restriction} tier about this update?
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
              className={`px-6 py-3 text-sm font-medium rounded-xl text-white bg-blue-600 hover:bg-blue-700 transition-all duration-200 flex items-center shadow-sm ${
                mode === "dark" ? "shadow-white/10" : "shadow-gray-200"
              }`}
            >
              <Icon icon="heroicons:bell" className="h-4 w-4 mr-2" />
              Send Notifications
            </button>
          </div>
        </div>
      </ItemActionModal>
    </>
  );
}
