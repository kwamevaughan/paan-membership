import { useState, useRef } from "react";
import { Icon } from "@iconify/react";
import toast from "react-hot-toast";

export default function FileUpload({
  mode,
  onFileUpload,
  onFileSelect,
  uploadedFile,
  setUploadedFile,
  allowedTypes = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'text/plain',
    'application/zip',
    'application/x-zip-compressed'
  ],
  maxSize = 50 * 1024 * 1024, // 50MB
  folder = "/Tenders",
  label = "Upload Document",
  placeholder = "Choose file or drag and drop",
  showLibrary = false,
  onLibrarySelect,
}) {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);

  const getFileIcon = (fileType) => {
    if (fileType.includes('pdf')) return 'heroicons:document-text';
    if (fileType.includes('word') || fileType.includes('document')) return 'heroicons:document';
    if (fileType.includes('excel') || fileType.includes('spreadsheet')) return 'heroicons:table-cells';
    if (fileType.includes('powerpoint') || fileType.includes('presentation')) return 'heroicons:presentation-chart-line';
    if (fileType.includes('zip') || fileType.includes('compressed')) return 'heroicons:archive-box';
    if (fileType.includes('text')) return 'heroicons:document-text';
    return 'heroicons:document';
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const validateFile = (file) => {
    if (!allowedTypes.includes(file.type)) {
      toast.error('Invalid file type. Please select a valid document.');
      return false;
    }

    if (file.size > maxSize) {
      toast.error(`File size too large. Maximum size is ${formatFileSize(maxSize)}.`);
      return false;
    }

    return true;
  };

  const handleFileUpload = async (file) => {
    if (!validateFile(file)) return;

    try {
      setUploading(true);
      setUploadProgress(0);
      console.log("Upload started with file:", file.name);

      const formData = new FormData();
      formData.append("file", file);

      const xhr = new XMLHttpRequest();
      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          const progress = Math.round((event.loaded * 100) / event.total);
          setUploadProgress(progress);
        }
      };

      const response = await new Promise((resolve, reject) => {
        xhr.open("POST", "/api/imagekit/upload-tender-file", true);
        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            resolve(JSON.parse(xhr.responseText));
          } else {
            reject(new Error(`Upload failed with status ${xhr.status}`));
          }
        };
        xhr.onerror = () => reject(new Error("Network error"));
        xhr.send(formData);
      });

      console.log("Upload success:", {
        fileId: response.fileId,
        name: response.name,
        url: response.url,
        filePath: response.filePath,
      });

      const uploadedFileData = {
        fileId: response.fileId,
        name: response.name,
        url: response.url,
        filePath: response.filePath,
        fileType: response.fileType,
        fileSize: response.fileSize,
      };

      setUploadedFile(uploadedFileData);
      
      if (onFileUpload) {
        onFileUpload(uploadedFileData);
      }

      toast.success("File uploaded successfully");
    } catch (error) {
      console.error("Upload error:", error);
      toast.error(`Failed to upload file: ${error.message}`);
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      handleFileUpload(file);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files[0];
    if (file) {
      handleFileUpload(file);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleRemoveFile = () => {
    setUploadedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-4">
      {/* File Upload Area */}
      <div
        className={`border-2 border-dashed rounded-xl p-6 text-center transition-all duration-200 cursor-pointer ${
          isDragging
            ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
            : mode === "dark"
            ? "border-gray-700 hover:border-gray-600 bg-gray-800"
            : "border-gray-300 hover:border-gray-400 bg-white"
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          onChange={handleFileChange}
          accept={allowedTypes.join(',')}
          className="hidden"
          disabled={uploading}
        />
        
        <div className="flex flex-col items-center justify-center gap-2">
          <Icon
            icon={uploading ? "heroicons:arrow-path" : "heroicons:arrow-up-tray"}
            className={`w-8 h-8 ${
              uploading
                ? "text-blue-500 animate-spin"
                : mode === "dark"
                ? "text-gray-400"
                : "text-gray-500"
            }`}
          />
          <div className="text-center">
            <p
              className={`text-sm font-medium ${
                mode === "dark" ? "text-gray-300" : "text-gray-700"
              }`}
            >
              {uploading ? "Uploading..." : label}
            </p>
            <p
              className={`text-xs mt-1 ${
                mode === "dark" ? "text-gray-400" : "text-gray-500"
              }`}
            >
              {placeholder}
            </p>
            <p
              className={`text-xs mt-1 ${
                mode === "dark" ? "text-gray-400" : "text-gray-500"
              }`}
            >
              Max size: {formatFileSize(maxSize)}
            </p>
          </div>
        </div>
      </div>

      {/* Upload Progress */}
      {uploading && (
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${uploadProgress}%` }}
          ></div>
        </div>
      )}

      {/* Uploaded File Display */}
      {uploadedFile && (
        <div
          className={`p-4 rounded-xl border ${
            mode === "dark"
              ? "bg-gray-800 border-gray-700"
              : "bg-gray-50 border-gray-200"
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Icon
                icon={getFileIcon(uploadedFile.fileType)}
                className={`w-6 h-6 ${
                  mode === "dark" ? "text-gray-400" : "text-gray-500"
                }`}
              />
              <div>
                <p
                  className={`text-sm font-medium ${
                    mode === "dark" ? "text-gray-300" : "text-gray-700"
                  }`}
                >
                  {uploadedFile.name}
                </p>
                <p
                  className={`text-xs ${
                    mode === "dark" ? "text-gray-400" : "text-gray-500"
                  }`}
                >
                  {formatFileSize(uploadedFile.fileSize)}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <a
                href={uploadedFile.url}
                target="_blank"
                rel="noopener noreferrer"
                className={`p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors ${
                  mode === "dark" ? "text-gray-400" : "text-gray-500"
                }`}
                title="View file"
              >
                <Icon icon="heroicons:eye" className="w-4 h-4" />
              </a>
              <button
                onClick={handleRemoveFile}
                className={`p-2 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/20 transition-colors ${
                  mode === "dark" ? "text-red-400" : "text-red-500"
                }`}
                title="Remove file"
              >
                <Icon icon="heroicons:trash" className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* File Library Button (if enabled) */}
      {showLibrary && onLibrarySelect && (
        <button
          type="button"
          onClick={() => onLibrarySelect()}
          className={`w-full px-4 py-3 rounded-xl border transition-all duration-200 flex items-center justify-center gap-2 ${
            mode === "dark"
              ? "border-gray-700 text-gray-300 bg-gray-800 hover:bg-gray-700"
              : "border-gray-300 text-gray-700 bg-white hover:bg-gray-50"
          }`}
        >
          <Icon icon="heroicons:folder" className="w-5 h-5" />
          Choose from Library
        </button>
      )}
    </div>
  );
} 