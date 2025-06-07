import ItemActionModal from "../ItemActionModal";
import { useState, useEffect, useMemo } from "react";
import toast from "react-hot-toast";

export default function ImageLibrary({ isOpen, onClose, onSelect, mode }) {
  const [isLoading, setIsLoading] = useState(false);
  const [files, setFiles] = useState([]);
  const [selectedFiles, setSelectedFiles] = useState(new Set());
  const [searchQuery, setSearchQuery] = useState("");
  const [fileTypeFilter, setFileTypeFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("all");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const path = "/Blog"; // Confirmed working path

  // Fetch files from /Blog
  const fetchFiles = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(
        `/api/imagekit/list-files?path=${encodeURIComponent(path)}`,
        {
          credentials: "include",
        }
      );
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          `API request failed: ${response.status} ${
            errorData.error || "Unknown error"
          }`
        );
      }
      const data = await response.json();
      console.log(`Fetched files for path ${path}:`, data);
      setFiles(data);
      if (data.length === 0) {
        toast.warn("No images found in /Blog");
      } else {
        toast.success(`Found ${data.length} images`);
      }
    } catch (error) {
      console.error("Fetch files error:", error);
      toast.error(`Failed to load images: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Delete selected files
  const deleteFiles = async () => {
    try {
      const fileIds = Array.from(selectedFiles);
      const response = await fetch("/api/imagekit/delete-files", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ fileIds }),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          `Delete failed: ${response.status} ${
            errorData.error || "Unknown error"
          }`
        );
      }
      const data = await response.json();
      console.log("Delete success:", data);
      setFiles(files.filter((file) => !fileIds.includes(file.fileId)));
      setSelectedFiles(new Set());
      setShowDeleteConfirm(false);
      toast.success(`Deleted ${fileIds.length} file(s)`);
    } catch (error) {
      console.error("Delete files error:", error);
      toast.error(`Failed to delete files: ${error.message}`);
    }
  };

  // Toggle file selection for bulk delete
  const toggleFileSelection = (fileId) => {
    setSelectedFiles((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(fileId)) {
        newSet.delete(fileId);
      } else {
        newSet.add(fileId);
      }
      return newSet;
    });
  };

  // Filter and search files
  const filteredFiles = useMemo(() => {
    return files.filter((file) => {
      // Search by name
      const matchesSearch = file.name
        .toLowerCase()
        .includes(searchQuery.toLowerCase());
      // Filter by file type
      const matchesFileType =
        fileTypeFilter === "all" ||
        (fileTypeFilter === "jpeg" && file.mime === "image/jpeg") ||
        (fileTypeFilter === "png" && file.mime === "image/png");
      // Filter by date
      const createdAt = new Date(file.createdAt);
      const now = new Date();
      const matchesDate =
        dateFilter === "all" ||
        (dateFilter === "today" &&
          createdAt.toDateString() === now.toDateString()) ||
        (dateFilter === "week" &&
          createdAt >= new Date(now.setDate(now.getDate() - 7))) ||
        (dateFilter === "month" &&
          createdAt >=
            new Date(now.setFullYear(now.getFullYear(), now.getMonth(), 1)));
      return matchesSearch && matchesFileType && matchesDate;
    });
  }, [files, searchQuery, fileTypeFilter, dateFilter]);

  useEffect(() => {
    if (isOpen) {
      fetchFiles();
    }
    return () => {
      setSelectedFiles(new Set());
      setSearchQuery("");
      setFileTypeFilter("all");
      setDateFilter("all");
    };
  }, [isOpen]);

  return (
    <ItemActionModal
      isOpen={isOpen}
      onClose={onClose}
      title="Image Library"
      mode={mode}
      size="xl"
    >
      <div className="h-full flex flex-col">
        {/* Search and Filters */}
        <div className="mb-4 flex flex-col gap-4">
          <div className="flex gap-4">
            <input
              type="text"
              placeholder="Search by name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`flex-1 px-4 py-2 rounded-xl border ${
                mode === "dark"
                  ? "bg-gray-800 border-gray-700 text-gray-100"
                  : "bg-white border-gray-300 text-gray-900"
              }`}
            />
            {selectedFiles.size > 0 && (
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="px-4 py-2 rounded-xl bg-red-500 text-white hover:bg-red-600"
              >
                Delete Selected ({selectedFiles.size})
              </button>
            )}
          </div>
          <div className="flex gap-4">
            <select
              value={fileTypeFilter}
              onChange={(e) => setFileTypeFilter(e.target.value)}
              className={`px-4 py-2 rounded-xl border ${
                mode === "dark"
                  ? "bg-gray-800 border-gray-700 text-gray-100"
                  : "bg-white border-gray-300 text-gray-900"
              }`}
            >
              <option value="all">All Types</option>
              <option value="jpeg">JPEG</option>
              <option value="png">PNG</option>
            </select>
            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className={`px-4 py-2 rounded-xl border ${
                mode === "dark"
                  ? "bg-gray-800 border-gray-700 text-gray-100"
                  : "bg-white border-gray-300 text-gray-900"
              }`}
            >
              <option value="all">All Dates</option>
              <option value="today">Today</option>
              <option value="week">Last Week</option>
              <option value="month">Last Month</option>
            </select>
          </div>
        </div>

        {/* File Grid */}
        {isLoading ? (
          <div className="flex items-center justify-center flex-1">
            <p className="text-gray-600">Loading images...</p>
          </div>
        ) : filteredFiles.length > 0 ? (
          <div className="grid grid-cols-3 gap-4 flex-1 overflow-y-auto p-4 border rounded-lg">
            {filteredFiles.map((file) => (
              <div
                key={file.fileId}
                className={`relative border rounded-lg p-2 ${
                  selectedFiles.has(file.fileId)
                    ? "border-blue-500 bg-blue-50"
                    : ""
                } ${mode === "dark" ? "border-gray-600" : "border-gray-200"}`}
              >
                <input
                  type="checkbox"
                  checked={selectedFiles.has(file.fileId)}
                  onChange={() => toggleFileSelection(file.fileId)}
                  className="absolute top-2 left-2"
                />
                <img
                  src={file.thumbnail}
                  alt={file.name}
                  onClick={() => onSelect(file)}
                  className="w-full h-24 object-cover rounded cursor-pointer mb-2"
                />
                <p className="text-sm truncate">{file.name}</p>
                <p className="text-xs text-gray-500">
                  {new Date(file.createdAt).toLocaleDateString()}
                </p>
                <button
                  onClick={() => {
                    setSelectedFiles(new Set([file.fileId]));
                    setShowDeleteConfirm(true);
                  }}
                  className="absolute top-2 right-2 text-red-500 hover:text-red-700"
                  title="Delete"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center text-gray-500 flex-1 flex items-center justify-center">
            No images found. Try uploading or adjusting filters.
          </p>
        )}

        {/* Delete Confirmation Dialog */}
        {showDeleteConfirm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div
              className={`p-6 rounded-lg ${
                mode === "dark"
                  ? "bg-gray-800 text-white"
                  : "bg-white text-gray-900"
              } border ${
                mode === "dark" ? "border-gray-600" : "border-gray-200"
              }`}
            >
              <h3 className="text-lg font-medium mb-2">
                Delete {selectedFiles.size} file(s)?
              </h3>
              <p className="text-sm text-gray-500 mb-4">
                This action cannot be undone.
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className={`px-4 py-2 rounded-lg ${
                    mode === "dark"
                      ? "bg-gray-600 text-white hover:bg-gray-700"
                      : "bg-gray-200 text-gray-900 hover:bg-gray-300"
                  }`}
                >
                  Cancel
                </button>
                <button
                  onClick={deleteFiles}
                  className="px-4 py-2 rounded-lg bg-red-500 text-white hover:bg-red-600"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </ItemActionModal>
  );
}
