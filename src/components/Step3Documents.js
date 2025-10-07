import { useState, useEffect, useMemo } from "react";
import DragDropZone from "./DragDropZone";
import { Icon } from "@iconify/react";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import DocumentsProgress from "./DocumentsProgress";

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

  const fileTypes = useMemo(() => {
    if (formData.job_type === "agency") {
      return [
        {
          id: "companyRegistration",
          title: "Company Registration Certificate",
          description: "Upload your official business registration document",
        },
        {
          id: "agencyProfile",
          title: "Agency Company Profile",
          description: "Present your agency's capabilities and team",
        },
        {
          id: "portfolioWork",
          title: "Company Portfolio",
          description: "Upload your portfolio file or add links to your online work",
          isOptional: true,
        },
      ];
    } else {
      // For freelancers
      return [
        {
          id: "portfolioWork",
          title: "Portfolio",
          description: "Upload your portfolio file or add links to your online work",
        },
      ];
    }
  }, [formData.job_type]);

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

  const [portfolioLinks, setPortfolioLinks] = useState([{ url: "" }]);
  const [isEditingPortfolio, setIsEditingPortfolio] = useState(false);

  // Format file size in KB or MB
  const formatFileSize = (bytes) => {
    if (bytes < 1024) return `${bytes} bytes`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  // Calculate total file size
  const getTotalFileSize = () => {
    return fileTypes.reduce((total, type) => {
      if (type.id === "portfolioWork" && formData.portfolioLinks) {
        return total; // Don't count portfolio links in total size
      }
      const file = formData[type.id];
      return total + (file && file.size ? file.size : 0);
    }, 0);
  };

  // Compute completed files using useMemo
  const memoizedCompletedFiles = useMemo(() => {
    return fileTypes
      .map((type) => {
        if (type.id === "portfolioWork") {
          return (formData[type.id] !== undefined && formData[type.id] !== null) || 
                 (formData.portfolioLinks && formData.portfolioLinks.length > 0 && 
                  formData.portfolioLinks.some(link => link.url.trim() !== "")) ? type.id : null;
        }
        return (formData[type.id] !== undefined && formData[type.id] !== null) ? type.id : null;
      })
      .filter(id => id !== null);
  }, [formData, fileTypes]);

  // Compute active file index using useMemo
  const memoizedActiveFileIndex = useMemo(() => {
    if (memoizedCompletedFiles.length > 0 && memoizedCompletedFiles.length < fileTypes.length) {
      const firstIncomplete = fileTypes.findIndex(
        (type) => !memoizedCompletedFiles.includes(type.id)
      );
      return firstIncomplete !== -1 ? firstIncomplete : 0;
    }
    return 0;
  }, [memoizedCompletedFiles, fileTypes]);

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
      memoizedCompletedFiles.includes(fileTypes[memoizedActiveFileIndex].id) &&
      !isAnimating &&
      memoizedActiveFileIndex < fileTypes.length - 1
    ) {
      setIsAnimating(true);
      setTimeout(() => {
        setActiveFileIndex((prev) => prev + 1);
        setIsAnimating(false);
      }, 500);
    }
  }, [memoizedCompletedFiles, memoizedActiveFileIndex, fileTypes, isAnimating]);

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
    if (memoizedCompletedFiles.includes(fileId)) return "complete";
    if (index === memoizedActiveFileIndex) return "active";
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

  // Add new portfolio link field
  const addPortfolioLink = () => {
    setPortfolioLinks([...portfolioLinks, { url: "" }]);
  };

  // Update portfolio link
  const updatePortfolioLink = (index, url) => {
    // Only strip protocol if it's a complete URL
    const cleanUrl = url.startsWith('http://') || url.startsWith('https://') 
      ? url.replace(/^(https?:\/\/)/, '')
      : url;
    
    const newLinks = [...portfolioLinks];
    newLinks[index].url = cleanUrl;
    setPortfolioLinks(newLinks);
  };

  // Add URL to form data
  const addUrlToFormData = (index) => {
    const url = portfolioLinks[index].url.trim();
    if (url) {
      setFormData(prev => ({
        ...prev,
        portfolioLinks: [...(prev.portfolioLinks || []), { url }]
      }));
      // Clear the input field but keep it visible
      const newLinks = [...portfolioLinks];
      newLinks[index].url = "";
      setPortfolioLinks(newLinks);
    }
  };

  // Add all valid URLs to form data
  const addAllUrlsToFormData = () => {
    const validUrls = portfolioLinks
      .map(link => link.url.trim())
      .filter(url => url !== "");
    
    if (validUrls.length > 0) {
      setFormData(prev => ({
        ...prev,
        portfolioLinks: [
          ...(prev.portfolioLinks || []),
          ...validUrls.map(url => ({ url }))
        ]
      }));
      // Clear all input fields but keep them visible
      setPortfolioLinks(portfolioLinks.map(() => ({ url: "" })));
    }
  };

  // Check if there are any valid URLs to add
  const hasValidUrls = () => {
    return portfolioLinks.some(link => link.url.trim() !== "");
  };

  // Remove portfolio link field
  const removePortfolioLink = (index) => {
    const newLinks = portfolioLinks.filter((_, i) => i !== index);
    setPortfolioLinks(newLinks);
  };

  // Remove URL from form data
  const removeUrlFromFormData = (index) => {
    setFormData(prev => ({
      ...prev,
      portfolioLinks: prev.portfolioLinks.filter((_, i) => i !== index)
    }));
  };

  // Update the document summary section to show links count for portfolio
  const getDocumentSummary = (file) => {
    if (file.id === "portfolioWork") {
      if (formData.portfolioLinks && formData.portfolioLinks.length > 0) {
        const validLinks = formData.portfolioLinks.filter(link => link.url.trim() !== "").length;
        return validLinks > 0 ? `(${validLinks} link${validLinks > 1 ? 's' : ''} added)` : '';
      }
      return formData[file.id] ? `(${formatFileSize(formData[file.id].size)})` : '';
    }
    return formData[file.id] ? `(${formatFileSize(formData[file.id].size)})` : '';
  };

  // Load portfolio links into input fields for editing
  const startEditingPortfolio = () => {
    if (formData.portfolioLinks && formData.portfolioLinks.length > 0) {
      setPortfolioLinks(formData.portfolioLinks.map(link => ({ url: link.url })));
      setIsEditingPortfolio(true);
    }
  };

  // Save edited portfolio links
  const savePortfolioLinks = () => {
    const validUrls = portfolioLinks
      .map(link => link.url.trim())
      .filter(url => url !== "");
    
    setFormData(prev => ({
      ...prev,
      portfolioLinks: validUrls.map(url => ({ url }))
    }));
    setIsEditingPortfolio(false);
  };

  // Cancel editing portfolio links
  const cancelEditingPortfolio = () => {
    setPortfolioLinks([{ url: "" }]);
    setIsEditingPortfolio(false);
  };

  const bgColor = mode === "dark" ? "bg-gray-800" : "bg-white";
  const textColor = mode === "dark" ? "text-white" : "text-[#231812]";
  const secondaryTextColor =
    mode === "dark" ? "text-gray-400" : "text-gray-600";
  const checkboxBgColor = mode === "dark" ? "bg-gray-700" : "bg-gray-100";

  return (
    <div className="animate-fade-in max-w-7xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Progress Sidebar */}
        <div className="lg:col-span-1">
          <DocumentsProgress
            formData={formData}
            fileTypes={fileTypes}
            declarationChecks={declarationChecks}
            mode={mode}
          />
        </div>

        {/* Main Content */}
        <div className="lg:col-span-2">
          <div
            className={`shadow-lg rounded-lg p-6 border-t-4 border-paan-blue ${bgColor} ${textColor}`}
          >
            <div className="flex items-center justify-center mb-6">
              <Icon icon="mdi:clipboard-check" className="w-8 h-8 text-paan-blue mr-2" />
              <h2 className="text-3xl font-medium text-center">
                Declaration
              </h2>
            </div>

            {/* Progress Indicators - COMMENTED OUT */}
            {/* <div className="flex justify-between mb-8 relative">
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
                          ? "bg-paan-blue text-white"
                          : getCompletionStatus(index) === "active"
                          ? "bg-paan-blue text-white"
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
                    className={`text-xs mt-1 ${secondaryTextColor} hidden sm:block group-hover:text-paan-blue transition-colors`}
                  >
                    {file.title}
                  </span>
                  <span className="absolute top-full mt-2 text-xs text-white bg-gray-800 p-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10">
                    Click to edit {file.title}
                  </span>
                </div>
              ))}
            </div> */}

            {/* File Upload Section - COMMENTED OUT */}
            {/* <AnimatePresence mode="wait">
              <motion.div
                key={memoizedActiveFileIndex}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="mb-6"
              >
                <h3 className="text-xl font-medium mb-2">
                  {fileTypes[memoizedActiveFileIndex].title}
                  {fileTypes[memoizedActiveFileIndex].isOptional && (
                    <span className="text-sm font-normal text-gray-500 ml-2">(Optional)</span>
                  )}
                </h3>
                <p className={`mb-4 ${secondaryTextColor}`}>
                  {fileTypes[memoizedActiveFileIndex].description}
                  {!fileTypes[memoizedActiveFileIndex].isOptional && ` (Max size: ${formatFileSize(MAX_FILE_SIZE)})`}
                </p>

                {fileTypes[memoizedActiveFileIndex].id === "portfolioWork" ? (
                  <div className="space-y-4">
                    <div className={`p-4 rounded-lg ${mode === "dark" ? "bg-gray-700" : "bg-gray-100"} mb-4`}>
                      <p className={`${secondaryTextColor} text-sm`}>
                        You can either upload a portfolio file or add links to your online work. If you don&apos;t have a portfolio file ready, you can add links to your previous work below.
                      </p>
                    </div>
                    <DragDropZone
                      key="portfolioWork"
                      type="portfolioWork"
                      file={formData.portfolioWork}
                      isDragging={fileUploadProps.isDraggingPortfolioWork}
                      uploadProgress={uploadProgress}
                      isSubmitting={isSubmitting}
                      setFormData={(prev) =>
                        handleFileUpload("portfolioWork", prev.portfolioWork)
                      }
                      setUploadProgress={setUploadProgress}
                      mode={mode}
                      {...fileUploadProps}
                    />
                    
                    <div className="mt-6">
                      <h4 className="font-semibold mb-3">Add links to your online work</h4>
                      <p className={`${secondaryTextColor} text-sm mb-4`}>
                        Add URLs to your previous work, case studies, or any online portfolio. You can add multiple links.
                      </p>
                      <div className="space-y-3">
                        {portfolioLinks.map((link, index) => (
                          <div key={index} className="flex gap-2">
                            <div className="flex-1 relative">
                              <span className={`absolute left-3 top-1/2 -translate-y-1/2 ${mode === "dark" ? "text-gray-400" : "text-gray-500"}`}>
                                https://
                              </span>
                              <input
                                type="text"
                                value={link.url}
                                onChange={(e) => updatePortfolioLink(index, e.target.value)}
                                placeholder="example.com/portfolio"
                                className={`w-full pl-[4.5rem] pr-3 py-2 rounded-lg border ${
                                  mode === "dark" 
                                    ? "bg-gray-700 border-gray-600 text-white" 
                                    : "bg-white border-gray-300 text-gray-900"
                                } focus:outline-none focus:ring-2 focus:ring-paan-blue`}
                              />
                            </div>
                            <button
                              onClick={() => addUrlToFormData(index)}
                              disabled={!link.url.trim()}
                              className={`p-2 rounded-lg ${
                                link.url.trim()
                                  ? "text-paan-yellow hover:text-paan-yellow/80"
                                  : "text-gray-400 cursor-not-allowed"
                              }`}
                            >
                              <Icon icon="mdi:plus-circle" className="w-5 h-5" />
                            </button>
                            <button
                              onClick={() => removePortfolioLink(index)}
                              className="p-2 text-paan-red hover:text-paan-red/80"
                            >
                              <Icon icon="mdi:close" className="w-5 h-5" />
                            </button>
                          </div>
                        ))}
                        <div className="flex gap-3">
                          <button
                            onClick={addPortfolioLink}
                            className="flex items-center text-paan-blue hover:text-paan-blue/80"
                          >
                            <Icon icon="mdi:plus" className="w-5 h-5 mr-1" />
                            Add another link field
                          </button>
                          <button
                            onClick={addAllUrlsToFormData}
                            disabled={!hasValidUrls()}
                            className={`flex items-center ${
                              hasValidUrls()
                                ? "text-paan-yellow hover:text-paan-yellow/80"
                                : "text-gray-400 cursor-not-allowed"
                            }`}
                          >
                            <Icon icon="mdi:plus-circle-multiple" className="w-5 h-5 mr-1" />
                            Add all URLs
                          </button>
                        </div>
                      </div>

                      {formData.portfolioLinks && formData.portfolioLinks.length > 0 && (
                        <div className="mt-4">
                          <h5 className={`font-medium mb-2 ${mode === "dark" ? "text-gray-200" : "text-gray-700"}`}>
                            Added Links ({formData.portfolioLinks.length})
                          </h5>
                          <div className={`space-y-2 p-3 rounded-lg ${
                            mode === "dark" ? "bg-gray-700/50" : "bg-gray-50"
                          }`}>
                            {formData.portfolioLinks.map((link, index) => (
                              <div key={index} className="flex items-center justify-between">
                                <a
                                  href={`https://${link.url}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className={`text-sm hover:underline ${
                                    mode === "dark" ? "text-paan-blue" : "text-paan-blue"
                                  }`}
                                >
                                  {link.url}
                                </a>
                                <button
                                  onClick={() => removeUrlFromFormData(index)}
                                  className="p-1 text-paan-red hover:text-paan-red/80"
                                >
                                  <Icon icon="mdi:close" className="w-4 h-4" />
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <DragDropZone
                    key={fileTypes[memoizedActiveFileIndex].id}
                    type={fileTypes[memoizedActiveFileIndex].id}
                    file={formData[fileTypes[memoizedActiveFileIndex].id]}
                    isDragging={
                      fileUploadProps[
                        `isDragging${
                          fileTypes[memoizedActiveFileIndex].id[0].toUpperCase() +
                          fileTypes[memoizedActiveFileIndex].id.slice(1)
                        }`
                      ]
                    }
                    uploadProgress={uploadProgress}
                    isSubmitting={isSubmitting}
                    setFormData={(prev) =>
                      handleFileUpload(
                        fileTypes[memoizedActiveFileIndex].id,
                        prev[fileTypes[memoizedActiveFileIndex].id]
                      )
                    }
                    setUploadProgress={setUploadProgress}
                    mode={mode}
                    required
                    {...fileUploadProps}
                  />
                )}
              </motion.div>
            </AnimatePresence> */}

            {/* Document Summary - COMMENTED OUT */}
            {/* {memoizedCompletedFiles.length > 0 && (
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
                    className="w-5 h-5 mr-2 text-paan-blue"
                  />
                  Uploaded Documents ({memoizedCompletedFiles.length}/{fileTypes.length}) -
                  Total Size: {formatFileSize(getTotalFileSize())}
                </h4>
                <ul className="space-y-2">
                  {fileTypes.map((file) => (
                    <li key={file.id} className="flex items-center">
                      <div
                        className={`w-4 h-4 rounded-full mr-2 ${
                          memoizedCompletedFiles.includes(file.id)
                            ? "bg-paan-blue"
                            : "bg-gray-300"
                        }`}
                      ></div>
                      <span
                        className={
                          memoizedCompletedFiles.includes(file.id) ? "" : secondaryTextColor
                        }
                      >
                        {file.title}{" "}
                        {memoizedCompletedFiles.includes(file.id) && getDocumentSummary(file)}
                      </span>
                      {memoizedCompletedFiles.includes(file.id) && (
                        <div className="ml-auto flex gap-2">
                          {file.id === "portfolioWork" && formData.portfolioLinks && formData.portfolioLinks.length > 0 && (
                            <>
                              <button
                                className="text-xs underline text-paan-blue hover:text-paan-blue/80"
                                onClick={startEditingPortfolio}
                              >
                                Edit
                              </button>
                              <span className="text-gray-400">|</span>
                            </>
                          )}
                          <button
                            className="text-xs underline text-paan-red hover:text-paan-red/80"
                            onClick={() => {
                              if (file.id === "portfolioWork") {
                                setFormData(prev => ({
                                  ...prev,
                                  [file.id]: null,
                                  portfolioLinks: []
                                }));
                              } else {
                                setFormData(prev => ({ ...prev, [file.id]: null }));
                              }
                              setCompletedFiles(prev =>
                                prev.filter(id => id !== file.id)
                              );
                            }}
                          >
                            Remove
                          </button>
                        </div>
                      )}
                    </li>
                  ))}
                </ul>
              </motion.div>
            )} */}

            {/* Portfolio Links Editing Section - COMMENTED OUT */}
            {/* {isEditingPortfolio && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className={`mt-4 p-4 rounded-lg ${
                  mode === "dark" ? "bg-gray-700" : "bg-gray-100"
                }`}
              >
                <div className="flex justify-between items-center mb-4">
                  <h4 className="font-semibold">Edit Portfolio Links</h4>
                  <div className="flex gap-2">
                    <button
                      onClick={savePortfolioLinks}
                      className="px-3 py-1 text-sm bg-paan-yellow text-white rounded hover:bg-paan-yellow/80"
                    >
                      Save Changes
                    </button>
                    <button
                      onClick={cancelEditingPortfolio}
                      className="px-3 py-1 text-sm bg-gray-500 text-white rounded hover:bg-gray-600"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
                <div className="space-y-3">
                  {portfolioLinks.map((link, index) => (
                    <div key={index} className="flex gap-2">
                      <div className="flex-1 relative">
                        <span className={`absolute left-3 top-1/2 -translate-y-1/2 ${mode === "dark" ? "text-gray-400" : "text-gray-500"}`}>
                          https://
                        </span>
                        <input
                          type="text"
                          value={link.url}
                          onChange={(e) => updatePortfolioLink(index, e.target.value)}
                          placeholder="example.com/portfolio"
                          className={`w-full pl-[4.5rem] pr-3 py-2 rounded-lg border ${
                            mode === "dark" 
                              ? "bg-gray-700 border-gray-600 text-white" 
                              : "bg-white border-gray-300 text-gray-900"
                          } focus:outline-none focus:ring-2 focus:ring-paan-blue`}
                        />
                      </div>
                      <button
                        onClick={() => removePortfolioLink(index)}
                        className="p-2 text-paan-red hover:text-paan-red/80"
                      >
                        <Icon icon="mdi:close" className="w-5 h-5" />
                      </button>
                    </div>
                  ))}
                  <button
                    onClick={addPortfolioLink}
                    className="flex items-center text-paan-blue hover:text-paan-blue/80"
                  >
                    <Icon icon="mdi:plus" className="w-5 h-5 mr-1" />
                    Add another link field
                  </button>
                </div>
              </motion.div>
            )} */}

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
                  className="w-5 h-5 mr-2 text-paan-blue"
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
                        className="w-4 h-4 border-gray-300 rounded text-paan-blue focus:ring-paan-blue"
                        checked={declarationChecks[declaration.id]}
                        onChange={() => handleDeclarationChange(declaration.id)}
                      />
                    </div>
                    <label
                      htmlFor={declaration.id}
                      className={`ml-2 text-sm ${secondaryTextColor} cursor-pointer hover:text-paan-red transition-colors`}
                    >
                      {declaration.text}
                    </label>
                  </div>
                ))}
              </div>

              {!areAllDeclarationsChecked() && (
                <p className="text-paan-red text-xs mt-2 italic">
                  * All declarations must be checked before submitting
                </p>
              )}
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
