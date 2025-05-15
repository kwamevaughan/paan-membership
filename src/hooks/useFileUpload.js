import { useState } from "react";
import toast from "react-hot-toast";

export const useFileUpload = (formData, setFormData) => {
  const [isDragging, setIsDragging] = useState({}); // Dynamic dragging states based on file type
  const [uploadProgress, setUploadProgress] = useState({
    companyRegistration: 0,
    portfolioWork: 0,
    agencyProfile: 0,
    taxRegistration: 0,
  });

  // Handle file selection
  const handleFileChange = (e, type) => {
    const file = e.target.files[0];
    if (file) {
      setFormData((prev) => ({ ...prev, [type]: file }));
      toast.success(`${capitalizeFirstLetter(type)} selected: ${file.name}`);
    }
  };

  // Handle file drop event
  const handleDrop = (e, type) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) {
      setFormData((prev) => ({ ...prev, [type]: file }));
      toast.success(`${capitalizeFirstLetter(type)} dropped: ${file.name}`);
    }
    setIsDragging((prev) => ({ ...prev, [type]: false }));
  };

  // Handle drag over event
  const handleDragOver = (e, type) => {
    e.preventDefault();
    setIsDragging((prev) => ({ ...prev, [type]: true }));
  };

  // Handle drag leave event
  const handleDragLeave = (e, type) => {
    e.preventDefault();
    setIsDragging((prev) => ({ ...prev, [type]: false }));
  };

  // Remove selected file
  const removeFile = (type) => {
    setFormData((prev) => ({ ...prev, [type]: null }));
    setUploadProgress((prev) => ({ ...prev, [type]: 0 }));
    toast.success(`${capitalizeFirstLetter(type)} removed`);
  };

  return {
    isDragging,
    uploadProgress,
    setUploadProgress,
    handleFileChange,
    handleDrop,
    handleDragOver,
    handleDragLeave,
    removeFile,
  };
};

// Utility function to capitalize first letter of a string
function capitalizeFirstLetter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}
