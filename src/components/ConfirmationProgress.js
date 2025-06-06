import { Icon } from "@iconify/react";
import { motion } from "framer-motion";
import toast from "react-hot-toast";

export default function ConfirmationProgress({ submissionStatus, referenceNumber, mode }) {
  const isDark = mode === "dark";
  const textColor = isDark ? "text-white" : "text-gray-800";
  const subTextColor = isDark ? "text-gray-300" : "text-gray-600";
  const bgColor = isDark ? "bg-gray-800" : "bg-white";
  const cardBgColor = isDark ? "bg-gray-700" : "bg-gray-50";

  const copyToClipboard = async () => {
    if (!referenceNumber) return;
    
    try {
      await navigator.clipboard.writeText(referenceNumber);
      toast.success("Reference number copied to clipboard!", {
        duration: 2000,
        style: {
          background: isDark ? "#1f2937" : "#fff",
          color: isDark ? "#fff" : "#1f2937",
          border: `1px solid ${isDark ? "#374151" : "#e5e7eb"}`,
        },
      });
    } catch (err) {
      toast.error("Failed to copy reference number", {
        duration: 2000,
        style: {
          background: isDark ? "#1f2937" : "#fff",
          color: isDark ? "#fff" : "#1f2937",
          border: `1px solid ${isDark ? "#374151" : "#e5e7eb"}`,
        },
      });
    }
  };

  const steps = [
    {
      id: "application",
      title: "Application Form",
      description: "Personal and professional information",
      icon: "mdi:account-details",
      status: "complete"
    },
    {
      id: "questions",
      title: "Questions",
      description: "Professional experience and preferences",
      icon: "mdi:help-circle",
      status: "complete"
    },
    {
      id: "documents",
      title: "Documents",
      description: "Required documentation and declarations",
      icon: "mdi:file-document",
      status: "complete"
    },
    {
      id: "confirmation",
      title: "Confirmation",
      description: "Application submission status",
      icon: "mdi:check-circle",
      status: submissionStatus?.status === "success" ? "complete" : "error"
    }
  ];

  return (
    <div className={`p-6 rounded-lg ${bgColor} shadow-lg`}>
      <h3 className={`text-xl font-bold mb-6 ${textColor}`}>Application Progress</h3>
      
      <div className="space-y-6">
        {steps.map((step, index) => (
          <motion.div
            key={step.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`relative ${index !== steps.length - 1 ? 'pb-8' : ''}`}
          >
            {/* Connection Line */}
            {index !== steps.length - 1 && (
              <div className={`absolute left-4 top-8 bottom-0 w-0.5 ${
                step.status === "complete" 
                  ? isDark ? "bg-blue-400" : "bg-blue-500"
                  : isDark ? "bg-gray-600" : "bg-gray-300"
              }`} />
            )}

            <div className="flex items-start">
              {/* Icon Circle */}
              <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                step.status === "complete"
                  ? isDark ? "bg-blue-400" : "bg-blue-500"
                  : step.status === "error"
                  ? "bg-red-500"
                  : isDark ? "bg-gray-600" : "bg-gray-300"
              }`}>
                <Icon 
                  icon={step.icon} 
                  className={`w-5 h-5 ${
                    step.status === "complete" || step.status === "error"
                      ? "text-white"
                      : isDark ? "text-gray-400" : "text-gray-500"
                  }`}
                />
              </div>

              {/* Content */}
              <div className="ml-4">
                <h4 className={`font-semibold ${textColor}`}>{step.title}</h4>
                <p className={`text-sm ${subTextColor}`}>{step.description}</p>
                {step.status === "complete" && (
                  <span className="inline-flex items-center mt-1 text-xs text-green-500">
                    <Icon icon="mdi:check" className="w-4 h-4 mr-1" />
                    Completed
                  </span>
                )}
                {step.status === "error" && (
                  <span className="inline-flex items-center mt-1 text-xs text-red-500">
                    <Icon icon="mdi:alert" className="w-4 h-4 mr-1" />
                    Error
                  </span>
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Reference Number Section */}
      {submissionStatus?.status === "success" && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className={`mt-8 p-4 rounded-lg ${cardBgColor}`}
        >
          <h4 className={`font-semibold mb-2 ${textColor}`}>Reference Number</h4>
          <div className={`p-3 rounded-lg ${
            isDark ? "bg-gray-600" : "bg-white"
          } border ${isDark ? "border-gray-500" : "border-gray-200"} flex items-center justify-between`}>
            <p className={`font-mono text-sm ${textColor}`}>
              {referenceNumber || "Loading..."}
            </p>
            <button
              onClick={copyToClipboard}
              className={`ml-2 p-2 rounded-lg hover:bg-opacity-80 transition-colors ${
                isDark 
                  ? "bg-gray-500 hover:bg-gray-400" 
                  : "bg-gray-200 hover:bg-gray-300"
              }`}
              title="Copy reference number"
            >
              <Icon 
                icon="mdi:content-copy" 
                className={`w-4 h-4 ${isDark ? "text-gray-300" : "text-gray-600"}`}
              />
            </button>
          </div>
          <p className={`text-xs mt-2 ${subTextColor}`}>
            Please keep this number for future reference
          </p>
        </motion.div>
      )}
    </div>
  );
} 