import { useState, useEffect } from "react";
import { Icon } from "@iconify/react";
import Image from "next/image";
import toast from "react-hot-toast";

export default function ImageLibrary({
  isOpen,
  onClose,
  onSelect,
  mode,
  onUpload,
  uploading = false,
}) {
  const [files, setFiles] = useState([]);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchFiles = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/imagekit/list-files?path=/Blog");
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

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file || !onUpload) return;

    try {
      await onUpload(file);
      fetchFiles(); // Refresh the list
    } catch (error) {
      console.error("Upload failed:", error);
      toast.error(`Failed to upload image: ${error.message}`);
    }
  };

  const handleImageSelect = (file) => {
    if (onSelect) {
      onSelect(file.url);
    }
  };

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center ${
        isOpen ? "block" : "hidden"
      }`}
    >
      <div
        className="absolute inset-0 bg-black bg-opacity-50"
        onClick={onClose}
      ></div>
      <div
        className={`relative w-full max-w-4xl max-h-[80vh] overflow-auto rounded-2xl shadow-xl ${
          mode === "dark" ? "bg-gray-900" : "bg-white"
        }`}
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
            onClick={onClose}
            className={`p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 ${
              mode === "dark" ? "text-gray-400" : "text-gray-500"
            }`}
          >
            <Icon icon="heroicons:x-mark" className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6">
          {/* Upload Section */}
          <div className="mb-6">
            <label
              className={`block text-sm font-medium mb-2 ${
                mode === "dark" ? "text-gray-300" : "text-gray-700"
              }`}
            >
              Upload New Image
            </label>
            <div className="flex items-center gap-4">
              <label
                className={`flex-1 px-4 py-2 rounded-xl border-2 border-dashed cursor-pointer transition-colors ${
                  mode === "dark"
                    ? "border-gray-700 hover:border-gray-600"
                    : "border-gray-300 hover:border-gray-400"
                }`}
              >
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                  disabled={uploading}
                />
                <div className="flex items-center justify-center gap-2">
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
                    {uploading
                      ? "Uploading..."
                      : "Choose file or drag and drop"}
                  </span>
                </div>
              </label>
            </div>
          </div>

          {/* Image Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {loading ? (
              <div className="col-span-full flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
              </div>
            ) : files.length === 0 ? (
              <div
                className={`col-span-full text-center py-8 ${
                  mode === "dark" ? "text-gray-400" : "text-gray-500"
                }`}
              >
                No images found. Try uploading a new image above.
              </div>
            ) : (
              files.map((file) => (
                <div
                  key={file.fileId}
                  className={`relative group rounded-xl overflow-hidden border-2 cursor-pointer transition-all ${
                    mode === "dark"
                      ? "border-gray-700 hover:border-blue-500"
                      : "border-gray-200 hover:border-blue-500"
                  }`}
                  onClick={() => handleImageSelect(file)}
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
                    <Icon
                      icon="heroicons:plus"
                      className="w-8 h-8 opacity-0 group-hover:opacity-100 transition-opacity"
                    />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
