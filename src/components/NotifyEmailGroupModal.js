import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { Icon } from "@iconify/react";
import { motion } from "framer-motion";

const NotifyEmailGroupModal = ({
  isOpen,
  onClose,
  jobTitle,
  jobId,
  jobType,
  expiresOn,
  mode,
}) => {
  const [emailGroups, setEmailGroups] = useState([]);
  const [selectedGroups, setSelectedGroups] = useState([]);
  const [previewGroups, setPreviewGroups] = useState([]);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetch("/api/email-groups")
        .then((res) => res.json())
        .then((data) => setEmailGroups(data))
        .catch(() => toast.error("Failed to load email groups"));
    }
  }, [isOpen]);

  const handleGroupToggle = (groupId) => {
    setSelectedGroups((prev) =>
      prev.includes(groupId)
        ? prev.filter((id) => id !== groupId)
        : [...prev, groupId]
    );
    setIsPreviewOpen(false);
    setPreviewGroups([]);
  };

  const handleSelectAll = () => {
    setSelectedGroups(emailGroups.map((group) => group.id));
    setIsPreviewOpen(false);
    setPreviewGroups([]);
  };

  const handleSelectNone = () => {
    setSelectedGroups([]);
    setIsPreviewOpen(false);
    setPreviewGroups([]);
  };

  const handlePreview = async () => {
    if (selectedGroups.length === 0) {
      toast.error("Please select at least one email group to preview!", {
        icon: "⚠️",
      });
      return;
    }

    try {
      const fetchPromises = selectedGroups.map((id) =>
        fetch(`/api/email-group-details?id=${id}`).then((res) => res.json())
      );
      const groups = await Promise.all(fetchPromises);
      const errors = groups.filter((g) => g.error);
      if (errors.length > 0)
        throw new Error(
          errors[0].error || "Failed to fetch some group details"
        );

      setPreviewGroups(groups);
      setIsPreviewOpen(true);

      const totalEmails = groups
        .reduce((acc, group) => acc.concat((group.emails || "").split(",")), [])
        .filter((email) => email.trim()).length;
      toast.success(
        `Previewing ${selectedGroups.length} group(s) (${totalEmails} emails)`,
        {
          icon: "👀",
        }
      );
    } catch (error) {
      toast.error(`Error: ${error.message}`, { icon: "❌" });
      setPreviewGroups([]);
      setIsPreviewOpen(false);
    }
  };

  const handleNotify = async () => {
    if (selectedGroups.length === 0) {
      toast.error("Please select at least one email group to notify!", {
        icon: "⚠️",
      });
      return;
    }

    const notifyingToast = toast.loading("Initiating email notifications...");
    try {
      const response = await fetch("/api/notify-email-group", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          groupIds: selectedGroups,
          jobTitle,
          jobId,
          jobType,
          expiresOn,
        }),
      });
      const result = await response.json();
      if (!response.ok)
        throw new Error(result.error || "Failed to initiate notification");

      // Start polling for status
      toast.loading(`${result.message} (0/${result.total} sent)`, {
        id: notifyingToast,
      });

      const checkStatus = async () => {
        const interval = setInterval(async () => {
          const statusRes = await fetch(
            `/api/email-status?jobId=${result.jobId}`
          );
          const status = await statusRes.json();

          if (!statusRes.ok) {
            clearInterval(interval);
            toast.error("Failed to track email status", { id: notifyingToast });
            onClose();
            return;
          }

          toast.loading(
            `Sending emails: ${status.sent_emails}/${status.total_emails} sent`,
            { id: notifyingToast }
          );

          if (status.status === "completed") {
            clearInterval(interval);
            toast.success(
              `All ${status.total_emails} emails sent successfully!`,
              {
                id: notifyingToast,
                duration: 5000,
              }
            );
            setTimeout(onClose, 5000);
          } else if (status.status === "failed") {
            clearInterval(interval);
            toast.error("Email sending failed", { id: notifyingToast });
            onClose();
          }
        }, 2000); // Poll every 2 seconds
      };

      checkStatus();
    } catch (error) {
      toast.error(error.message, { id: notifyingToast });
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div
        className={`p-6 rounded-lg shadow-lg max-w-md w-full ${
          mode === "dark" ? "bg-gray-800" : "bg-white"
        }`}
      >
        <h2
          className={`text-xl font-bold mb-4 ${
            mode === "dark" ? "text-white" : "text-[#231812]"
          }`}
        >
          Notify Email Groups
        </h2>
        <p
          className={`mb-4 ${
            mode === "dark" ? "text-gray-300" : "text-gray-600"
          }`}
        >
          Job &quot;{jobTitle}&quot; ({jobType}) has been posted. Select groups to notify:
        </p>
        <div className="mb-4">
          <div className="flex gap-2 mb-2">
            <button
              onClick={handleSelectAll}
              className={`px-3 py-1 text-sm rounded ${
                mode === "dark"
                  ? "bg-blue-600 hover:bg-blue-700 text-white"
                  : "bg-blue-500 hover:bg-blue-600 text-white"
              }`}
            >
              Select All
            </button>
            <button
              onClick={handleSelectNone}
              className={`px-3 py-1 text-sm rounded ${
                mode === "dark"
                  ? "bg-gray-600 hover:bg-gray-500 text-white"
                  : "bg-gray-300 hover:bg-gray-400 text-[#231812]"
              }`}
            >
              Select None
            </button>
          </div>
          <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto">
            {emailGroups.map((group) => (
              <label
                key={group.id}
                className={`flex items-center gap-2 p-2 rounded cursor-pointer ${
                  mode === "dark"
                    ? "hover:bg-gray-700 text-gray-300"
                    : "hover:bg-gray-100 text-gray-600"
                }`}
              >
                <input
                  type="checkbox"
                  checked={selectedGroups.includes(group.id)}
                  onChange={() => handleGroupToggle(group.id)}
                  className={`h-4 w-4 ${
                    mode === "dark"
                      ? "text-blue-500 bg-gray-700 border-gray-600"
                      : "text-blue-500 bg-gray-50 border-gray-300"
                  }`}
                />
                {group.name}
              </label>
            ))}
          </div>
        </div>

        {isPreviewOpen && previewGroups.length > 0 && (
          <div
            className={`mt-4 p-4 rounded-lg max-h-40 overflow-y-auto ${
              mode === "dark"
                ? "bg-gray-700 text-gray-300"
                : "bg-gray-100 text-gray-600"
            }`}
          >
            <h3 className="text-sm font-semibold mb-2">
              Preview ({previewGroups.length} Group(s),{" "}
              {
                previewGroups
                  .reduce(
                    (acc, g) => acc.concat((g.emails || "").split(",")),
                    []
                  )
                  .filter((e) => e.trim()).length
              }{" "}
              Emails)
            </h3>
            {previewGroups.map((group) => (
              <div key={group.id} className="mb-2">
                <p className="text-xs font-medium">{group.name}</p>
                {group.emails ? (
                  group.emails.split(",").map((email, index) => (
                    <p key={index} className="text-xs truncate">
                      {email.trim()}
                    </p>
                  ))
                ) : (
                  <p className="text-xs italic">No emails</p>
                )}
              </div>
            ))}
          </div>
        )}

        <div className="mt-6 flex gap-4 justify-between">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handlePreview}
            className="px-4 py-2 bg-blue-500 text-white rounded-full flex items-center gap-2 hover:bg-blue-600 transition-colors"
          >
            <Icon icon="mdi:eye" width={20} />
            Preview
          </motion.button>
          <div className="flex gap-4">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleNotify}
              className="px-6 py-2 bg-[#f05d23] text-white rounded-full flex items-center gap-2 hover:bg-[#d94f1e] transition-colors"
            >
              <Icon icon="mdi:send" width={20} />
              Notify
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onClose}
              className={`px-6 py-2 rounded-full ${
                mode === "dark"
                  ? "bg-gray-600 hover:bg-gray-500 text-white"
                  : "bg-gray-300 hover:bg-gray-400 text-[#231812]"
              } transition-colors`}
            >
              Cancel
            </motion.button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotifyEmailGroupModal;
