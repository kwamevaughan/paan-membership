import { useState, useEffect, useRef } from "react";
import { Icon } from "@iconify/react";
import Image from "next/image";
import toast from "react-hot-toast";

const FileUploader = ({ onUpload, uploading, mode }) => {
  const fileInputRef = useRef(null);
  const [isClicking, setIsClicking] = useState(false);

  const handleClick = (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (uploading || isClicking) {
      console.log("Click ignored - currently uploading or processing");
      return;
    }

    setIsClicking(true);
    console.log("Upload area clicked");

    // Create and trigger a new click event - but with bubbles: false to prevent infinite loop
    const clickEvent = new MouseEvent("click", {
      view: window,
      bubbles: false, // This is the key fix - prevent bubbling
      cancelable: true,
    });

    if (fileInputRef.current) {
      console.log("File input ref found, triggering click");
      fileInputRef.current.dispatchEvent(clickEvent);
    } else {
      console.log("File input ref not found");
    }

    // Reset clicking state after a short delay
    setTimeout(() => setIsClicking(false), 100);
  };

  const handleFileChange = (e) => {
    e.preventDefault();
    e.stopPropagation();
    console.log("File input change event triggered");

    const file = e.target.files[0];
    if (file) {
      console.log("File selected:", file.name, file.type);
      onUpload(file);
    } else {
      console.log("No file selected");
    }

    // Reset the input after handling
    if (e.target) {
      e.target.value = "";
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (uploading) return;

    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith("image/")) {
      console.log("File dropped:", file.name, file.type);
      onUpload(file);
    } else {
      console.log("Invalid file type dropped:", file?.type);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  return (
    <div
      className={`flex-1 px-4 py-2 rounded-xl border-2 border-dashed cursor-pointer transition-colors ${
        mode === "dark"
          ? "border-gray-700 hover:border-gray-600"
          : "border-gray-300 hover:border-gray-400"
      } ${isClicking ? "opacity-75" : ""}`}
      onClick={handleClick}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      style={{ userSelect: "none" }}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        style={{
          position: "absolute",
          left: "-9999px",
          top: "-9999px",
          visibility: "hidden",
          width: "1px",
          height: "1px",
        }}
        disabled={uploading}
        tabIndex={-1}
      />
      <div className="flex items-center justify-center gap-2 pointer-events-none">
        <Icon
          icon="heroicons:arrow-up-tray"
          className={`w-5 h-5 ${
            mode === "dark" ? "text-gray-400" : "text-gray-500"
          }`}
        />
        <span
          className={`text-sm ${
            mode === "dark" ? "text-gray-400" : "text-gray-500"
          }`}
        >
          {uploading ? "Uploading..." : "Choose file or drag and drop"}
        </span>
      </div>
    </div>
  );
};

export default function ImageLibrary({
  isOpen,
  onClose,
  onSelect,
  mode,
  onUpload,
  uploading = false,
  folder = "/Blog",
}) {
  const [files, setFiles] = useState([]);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [sortBy, setSortBy] = useState("newest");
  const [searchTerm, setSearchTerm] = useState("");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [imageToDelete, setImageToDelete] = useState(null);

  const fetchFiles = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/imagekit/list-files?path=${folder}`);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to fetch images");
      }
      const data = await response.json();
      console.log("Fetched files from API:", data);
      setFiles(Array.isArray(data) ? data : data.files || []);
    } catch (error) {
      console.error("Error fetching files:", error.message);
      toast.error(error.message || "Failed to load images");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchFiles();
    }
  }, [isOpen]);

  const handleFileUpload = async (file) => {
    if (!file || !onUpload) {
      console.log("No file or onUpload handler:", {
        file,
        hasOnUpload: !!onUpload,
      });
      return;
    }

    try {
      setLoading(true);
      console.log("Starting file upload:", file.name);

      // Upload the file and get the response
      const uploadData = await onUpload(file);
      console.log("File upload completed successfully:", uploadData);

      // Add the new file to the files array immediately
      if (uploadData && uploadData.url) {
        setFiles(prevFiles => {
          // Check if file already exists
          const exists = prevFiles.some(f => f.fileId === uploadData.fileId);
          if (exists) return prevFiles;
          
          // Add new file at the beginning
          return [{
            fileId: uploadData.fileId,
            name: uploadData.name,
            url: uploadData.url,
            createdAt: uploadData.createdAt || new Date().toISOString()
          }, ...prevFiles];
        });
      }

      // Show success message
      toast.success("Image uploaded successfully");
    } catch (error) {
      console.error("Upload failed:", error);
      toast.error(`Failed to upload image: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleImageSelect = (file) => {
    if (onSelect) {
      console.log("Selected file from library:", file);
      onSelect({
        url: file.url,
        name: file.name,
        fileId: file.fileId,
      });
    }
  };

  const handleDeleteClick = (file) => {
    setImageToDelete(file);
    setShowDeleteConfirm(true);
  };

  const handleDeleteConfirm = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!imageToDelete) return;

    try {
      setLoading(true); // Set loading state while deleting
      console.log("Attempting to delete file:", imageToDelete);

      const response = await fetch("/api/imagekit/delete-files", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fileIds: [imageToDelete.fileId],
        }),
      });

      const data = await response.json();
      console.log("Delete response:", data);

      if (!response.ok) {
        throw new Error(data.error || data.details || "Failed to delete image");
      }

      // Update the files state immediately
      setFiles((prevFiles) => {
        const updatedFiles = prevFiles.filter((file) => file.fileId !== imageToDelete.fileId);
        console.log("Updated files after deletion:", updatedFiles);
        return updatedFiles;
      });

      toast.success("Image deleted successfully");
      setShowDeleteConfirm(false);
      setImageToDelete(null);
    } catch (error) {
      console.error("Delete failed:", {
        error: error.message,
        file: imageToDelete,
        stack: error.stack,
      });
      toast.error(error.message || "Failed to delete image");
      setShowDeleteConfirm(false);
      setImageToDelete(null);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCancel = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setShowDeleteConfirm(false);
    setImageToDelete(null);
  };

  const getSortedFiles = () => {
    let sortedFiles = [...files];

    if (searchTerm) {
      sortedFiles = sortedFiles.filter((file) =>
        file.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    switch (sortBy) {
      case "newest":
        sortedFiles.sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        );
        break;
      case "oldest":
        sortedFiles.sort(
          (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
        );
        break;
      case "name":
        sortedFiles.sort((a, b) => a.name.localeCompare(b.name));
        break;
      default:
        break;
    }

    return sortedFiles;
  };

  const handleSearchChange = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setSearchTerm(e.target.value);
  };

  const handleSortChange = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setSortBy(e.target.value);
  };

  const handleRefresh = (e) => {
    e.preventDefault();
    e.stopPropagation();
    fetchFiles();
  };

  // Alternative upload method as backup
  const triggerFileUpload = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.onchange = (e) => {
      const file = e.target.files[0];
      if (file) {
        handleFileUpload(file);
      }
    };
    input.click();
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[9999] overflow-y-auto"
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 9999,
      }}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
      }}
    >
      <div className="min-h-screen px-4 text-center">
        <div
          className="fixed inset-0 bg-black bg-opacity-50"
          style={{ zIndex: 9999 }}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onClose();
          }}
        ></div>

        <div
          className="fixed inset-0 flex items-center justify-center p-4"
          style={{ zIndex: 10000 }}
        >
          <div
            className={`relative w-full max-w-4xl max-h-[80vh] overflow-auto rounded-2xl shadow-xl ${
              mode === "dark" ? "bg-gray-900" : "bg-white"
            }`}
            style={{
              marginTop: "2rem",
              zIndex: 10000,
            }}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
            }}
          >
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
              <h2
                className={`text-xl font-semibold ${
                  mode === "dark" ? "text-white" : "text-gray-900"
                }`}
              >
                Image Library
              </h2>
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onClose();
                }}
                className={`p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 ${
                  mode === "dark" ? "text-gray-400" : "text-gray-500"
                }`}
              >
                <Icon icon="heroicons:x-mark" className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6">
              <div className="mb-6 space-y-4">
                <div className="flex flex-wrap gap-4">
                  <div className="flex-1 min-w-[200px]">
                    <input
                      type="text"
                      placeholder="Search images..."
                      value={searchTerm}
                      onChange={handleSearchChange}
                      className={`w-full px-4 py-2 rounded-xl border ${
                        mode === "dark"
                          ? "bg-gray-800 border-gray-700 text-gray-100"
                          : "bg-white border-gray-300 text-gray-900"
                      } focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                    />
                  </div>
                  <select
                    value={sortBy}
                    onChange={handleSortChange}
                    className={`px-4 py-2 rounded-xl border ${
                      mode === "dark"
                        ? "bg-gray-800 border-gray-700 text-gray-100"
                        : "bg-white border-gray-300 text-gray-900"
                    } focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                  >
                    <option value="newest">Newest First</option>
                    <option value="oldest">Oldest First</option>
                    <option value="name">Name</option>
                  </select>
                  <button
                    onClick={handleRefresh}
                    disabled={loading}
                    className={`px-4 py-2 rounded-xl border flex items-center gap-2 ${
                      mode === "dark"
                        ? "bg-gray-800 border-gray-700 text-gray-100 hover:bg-gray-700"
                        : "bg-white border-gray-300 text-gray-900 hover:bg-gray-50"
                    } focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                    <Icon
                      icon="heroicons:arrow-path"
                      className={`w-5 h-5 ${loading ? "animate-spin" : ""}`}
                    />
                    Refresh
                  </button>
                </div>

                <div>
                  <label
                    className={`block text-sm font-medium mb-2 ${
                      mode === "dark" ? "text-gray-300" : "text-gray-700"
                    }`}
                  >
                    Upload New Image
                  </label>
                  <div className="flex items-center gap-4">
                    <FileUploader
                      onUpload={handleFileUpload}
                      uploading={uploading}
                      mode={mode}
                    />
                    {/* Backup upload button */}
                    <button
                      onClick={triggerFileUpload}
                      disabled={uploading}
                      className={`px-4 py-2 rounded-xl border flex items-center gap-2 ${
                        mode === "dark"
                          ? "bg-gray-800 border-gray-700 text-gray-100 hover:bg-gray-700"
                          : "bg-white border-gray-300 text-gray-900 hover:bg-gray-50"
                      } focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed`}
                    >
                      <Icon icon="heroicons:folder-plus" className="w-5 h-5" />
                      Browse
                    </button>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {loading ? (
                  <div className="col-span-full flex justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                  </div>
                ) : getSortedFiles().length === 0 ? (
                  <div
                    className={`col-span-full text-center py-8 ${
                      mode === "dark" ? "text-gray-400" : "text-gray-500"
                    }`}
                  >
                    {searchTerm
                      ? "No images found matching your search."
                      : "No images found. Try uploading a new image above."}
                  </div>
                ) : (
                  getSortedFiles().map((file) => (
                    <div
                      key={file.fileId}
                      className={`relative group rounded-xl overflow-hidden border-2 cursor-pointer transition-all ${
                        mode === "dark"
                          ? "border-gray-700 hover:border-blue-500"
                          : "border-gray-200 hover:border-blue-500"
                      }`}
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                      }}
                    >
                      <div className="w-full h-48">
                        <Image
                          src={file.url}
                          alt={file.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div
                        className={`absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-opacity flex items-center justify-center ${
                          mode === "dark" ? "text-white" : "text-white"
                        }`}
                      >
                        <div className="flex gap-2">
                          <button
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              handleImageSelect(file);
                            }}
                            className="p-2 rounded-full bg-blue-500 hover:bg-blue-600 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <Icon icon="heroicons:plus" className="w-5 h-5" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              handleDeleteClick(file);
                            }}
                            className="p-2 rounded-full bg-red-500 hover:bg-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <Icon icon="heroicons:trash" className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {showDeleteConfirm && (
        <div
          className="fixed inset-0 z-[10001] flex items-center justify-center"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
          }}
        >
          <div
            className="absolute inset-0 bg-black bg-opacity-50"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              handleDeleteCancel(e);
            }}
          ></div>
          <div
            className={`relative p-6 rounded-xl shadow-xl max-w-md w-full mx-4 ${
              mode === "dark" ? "bg-gray-900" : "bg-white"
            }`}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
            }}
          >
            <h3
              className={`text-lg font-semibold mb-4 ${
                mode === "dark" ? "text-white" : "text-gray-900"
              }`}
            >
              Delete Image
            </h3>
            <p
              className={`mb-6 ${
                mode === "dark" ? "text-gray-300" : "text-gray-600"
              }`}
            >
              Are you sure you want to delete this image? This action cannot be
              undone.
            </p>
            <div className="flex justify-end gap-4">
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleDeleteCancel(e);
                }}
                className={`px-4 py-2 rounded-lg ${
                  mode === "dark"
                    ? "bg-gray-800 text-gray-300 hover:bg-gray-700"
                    : "bg-gray-100 text-gray-900 hover:bg-gray-200"
                }`}
              >
                Cancel
              </button>
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleDeleteConfirm(e);
                }}
                className="px-4 py-2 rounded-lg bg-red-500 text-white hover:bg-red-600"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
