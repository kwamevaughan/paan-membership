import { useState, useEffect } from "react";
import DragDropZone from "./DragDropZone";
import { Icon } from "@iconify/react";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";

export default function Step3Documents({
  formData,
  setFormData,
  isSubmitting,
  uploadProgress,
  setUploadProgress,
  mode,
  ...fileUploadProps
}) {
  const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB in bytes

  const fileTypes = [
    {
      id: "companyRegistration",
      title: "Company Registration Certificate",
      description: "Upload your official business registration document",
    },
    {
      id: "portfolioWork",
      title: "Portfolio Work",
      description: "Share examples of your previous projects",
    },
    {
      id: "agencyProfile",
      title: "Agency Profile",
      description: "Present your agency's capabilities and team",
    },
    {
      id: "taxRegistration",
      title: "Tax Registration Certificate",
      description: "Provide your tax documentation as per your country",
    },
  ];

  const declarations = [
    {
      id: "accurateInfo",
      text: "I confirm that the information provided is accurate and complete.",
    },
    {
      id: "verificationConsent",
      text: "I understand that PAAN reserves the right to verify all details and may request additional documentation.",
    },
    {
      id: "membershipConsent",
      text: "I confirm that submitting this form provides PAAN with consent to make you a member.",
    },
  ];

  const [activeFileIndex, setActiveFileIndex] = useState(0);
  const [completedFiles, setCompletedFiles] = useState([]);
  const [isAnimating, setIsAnimating] = useState(false);
  const [declarationChecks, setDeclarationChecks] = useState({
    accurateInfo: false,
    verificationConsent: false,
    membershipConsent: false,
  });

  // Format file size in KB or MB
  const formatFileSize = (bytes) => {
    if (bytes < 1024) return `${bytes} bytes`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  // Calculate total file size
  const getTotalFileSize = () => {
    return fileTypes.reduce((total, type) => {
      const file = formData[type.id];
      return total + (file && file.size ? file.size : 0);
    }, 0);
  };

  // Update formData with declaration values
  useEffect(() => {
    setFormData((prev) => ({
      ...prev,
      declarations: declarationChecks,
    }));
  }, [declarationChecks, setFormData]);

  // Move to next file when current one is uploaded
  useEffect(() => {
    if (
      completedFiles.includes(fileTypes[activeFileIndex].id) &&
      !isAnimating &&
      activeFileIndex < fileTypes.length - 1
    ) {
      setIsAnimating(true);
      setTimeout(() => {
        setActiveFileIndex((prev) => prev + 1);
        setIsAnimating(false);
      }, 500);
    }
  }, [completedFiles, activeFileIndex, fileTypes.length]);

  // Track completed files
  useEffect(() => {
    const completed = fileTypes
      .map((type) => type.id)
      .filter((id) => formData[id] !== undefined && formData[id] !== null);
    setCompletedFiles(completed);

    // Set active file to first incomplete file
    if (completed.length > 0 && completed.length < fileTypes.length) {
      const firstIncomplete = fileTypes.findIndex(
        (type) => !completed.includes(type.id)
      );
      if (firstIncomplete !== -1 && firstIncomplete !== activeFileIndex) {
        setActiveFileIndex(firstIncomplete);
      }
    }
  }, [formData, fileTypes, activeFileIndex]);

  const handleFileUpload = (type, file) => {
    if (file && file.size > MAX_FILE_SIZE) {
      toast.error(
        `File "${file.name}" exceeds the ${formatFileSize(
          MAX_FILE_SIZE
        )} limit. Please upload a smaller file.`,
        {
          duration: 4000,
          icon: "⚠️",
        }
      );
      return;
    }
    setFormData((prev) => ({ ...prev, [type]: file }));
    if (!completedFiles.includes(type)) {
      setCompletedFiles((prev) => [...prev, type]);
      toast.success(`${file.name} uploaded successfully!`, {
        icon: "✅",
      });
    }
  };

  const getCompletionStatus = (index) => {
    const fileId = fileTypes[index].id;
    if (completedFiles.includes(fileId)) return "complete";
    if (index === activeFileIndex) return "active";
    return "pending";
  };

  const handleDeclarationChange = (id) => {
    setDeclarationChecks((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const areAllDeclarationsChecked = () => {
    return Object.values(declarationChecks).every((val) => val === true);
  };

  const bgColor = mode === "dark" ? "bg-gray-800" : "bg-white";
  const textColor = mode === "dark" ? "text-white" : "text-[#231812]";
  const secondaryTextColor =
    mode === "dark" ? "text-gray-400" : "text-gray-600";
  const checkboxBgColor = mode === "dark" ? "bg-gray-700" : "bg-gray-100";

  return (
    <div className="animate-fade-in max-w-2xl mx-auto">
      <div
        className={`shadow-lg rounded-lg p-6 border-t-4 border-blue-400 ${bgColor} ${textColor}`}
      >
        <div className="flex items-center justify-center mb-6">
          <Icon icon="mdi:upload" className="w-8 h-8 text-blue-400 mr-2" />
          <h2 className="text-3xl font-bold text-center">
            Submit Your Documents
          </h2>
        </div>

        {/* Progress Indicators */}
        <div className="flex justify-between mb-8 relative">
          <div className="absolute top-1/2 left-0 right-0 h-1 bg-gray-300 -translate-y-1/2 z-0"></div>

          {fileTypes.map((file, index) => (
            <div
              key={file.id}
              className="z-10 flex flex-col items-center group"
              onClick={() => !isAnimating && setActiveFileIndex(index)}
            >
              <motion.div
                className={`w-8 h-8 rounded-full flex items-center justify-center cursor-pointer transition-colors
                  ${
                    getCompletionStatus(index) === "complete"
                      ? "bg-blue-400 text-white"
                      : getCompletionStatus(index) === "active"
                      ? "bg-blue-400 text-white"
                      : `${
                          mode === "dark" ? "bg-gray-700" : "bg-gray-200"
                        } ${secondaryTextColor}`
                  }`}
                whileHover={{ scale: 1.1 }}
                animate={
                  getCompletionStatus(index) === "active"
                    ? { scale: [1, 1.1, 1] }
                    : {}
                }
                transition={{
                  repeat:
                    getCompletionStatus(index) === "active" ? Infinity : 0,
                  duration: 2,
                }}
              >
                {getCompletionStatus(index) === "complete" ? (
                  <Icon icon="mdi:check" className="w-5 h-5" />
                ) : (
                  index + 1
                )}
              </motion.div>
              <span
                className={`text-xs mt-1 ${secondaryTextColor} hidden sm:block group-hover:text-blue-400 transition-colors`}
              >
                {file.title}
              </span>
              <span className="absolute top-full mt-2 text-xs text-white bg-gray-800 p-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10">
                Click to edit {file.title}
              </span>
            </div>
          ))}
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={activeFileIndex}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="mb-6"
          >
            <h3 className="text-xl font-bold mb-2">
              {fileTypes[activeFileIndex].title}
            </h3>
            <p className={`mb-4 ${secondaryTextColor}`}>
              {fileTypes[activeFileIndex].description} (Max size:{" "}
              {formatFileSize(MAX_FILE_SIZE)})
            </p>

            <DragDropZone
              key={fileTypes[activeFileIndex].id}
              type={fileTypes[activeFileIndex].id}
              file={formData[fileTypes[activeFileIndex].id]}
              isDragging={
                fileUploadProps[
                  `isDragging${
                    fileTypes[activeFileIndex].id[0].toUpperCase() +
                    fileTypes[activeFileIndex].id.slice(1)
                  }`
                ]
              }
              uploadProgress={uploadProgress}
              isSubmitting={isSubmitting}
              setFormData={(prev) =>
                handleFileUpload(
                  fileTypes[activeFileIndex].id,
                  prev[fileTypes[activeFileIndex].id]
                )
              }
              setUploadProgress={setUploadProgress}
              mode={mode}
              required
              {...fileUploadProps}
            />
          </motion.div>
        </AnimatePresence>

        {/* Document Summary */}
        {completedFiles.length > 0 && (
          <motion.div
            className={`mt-8 p-4 rounded-lg ${
              mode === "dark" ? "bg-gray-700" : "bg-gray-100"
            }`}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            <h4 className="font-semibold mb-2 flex items-center">
              <Icon
                icon="mdi:file-document-multiple"
                className="w-5 h-5 mr-2 text-blue-500"
              />
              Uploaded Documents ({completedFiles.length}/{fileTypes.length}) -
              Total Size: {formatFileSize(getTotalFileSize())}
            </h4>
            <ul className="space-y-2">
              {fileTypes.map((file) => (
                <li key={file.id} className="flex items-center">
                  <div
                    className={`w-4 h-4 rounded-full mr-2 ${
                      completedFiles.includes(file.id)
                        ? "bg-blue-400"
                        : "bg-gray-300"
                    }`}
                  ></div>
                  <span
                    className={
                      completedFiles.includes(file.id) ? "" : secondaryTextColor
                    }
                  >
                    {file.title}{" "}
                    {completedFiles.includes(file.id) &&
                      formData[file.id] &&
                      `(${formatFileSize(formData[file.id].size)})`}
                  </span>
                  {completedFiles.includes(file.id) && (
                    <button
                      className="ml-auto text-xs underline text-red-500 hover:text-red-700"
                      onClick={() => {
                        setFormData((prev) => ({ ...prev, [file.id]: null }));
                        setCompletedFiles((prev) =>
                          prev.filter((id) => id !== file.id)
                        );
                      }}
                    >
                      Remove
                    </button>
                  )}
                </li>
              ))}
            </ul>
          </motion.div>
        )}

        {/* Declaration Checkboxes */}
        <motion.div
          className={`mt-8 p-4 rounded-lg ${checkboxBgColor}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <h4 className="font-bold mb-3 flex items-center">
            <Icon
              icon="mdi:clipboard-check"
              className="w-5 h-5 mr-2 text-[#f05d23]"
            />
            Declaration
          </h4>

          <div className="space-y-3">
            {declarations.map((declaration) => (
              <div key={declaration.id} className="flex items-start">
                <div className="flex items-center h-5">
                  <input
                    id={declaration.id}
                    type="checkbox"
                    className="w-4 h-4 border-gray-300 rounded text-[#f05d23] focus:ring-[#f05d23]"
                    checked={declarationChecks[declaration.id]}
                    onChange={() => handleDeclarationChange(declaration.id)}
                  />
                </div>
                <label
                  htmlFor={declaration.id}
                  className={`ml-2 text-sm ${secondaryTextColor} cursor-pointer hover:text-[#f05d23] transition-colors`}
                >
                  {declaration.text}
                </label>
              </div>
            ))}
          </div>

          {!areAllDeclarationsChecked() && (
            <p className="text-red-500 text-xs mt-2 italic">
              * All declarations must be checked before submitting
            </p>
          )}
        </motion.div>
      </div>
    </div>
  );
}
