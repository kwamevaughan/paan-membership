import { useState } from "react";
import { Icon } from "@iconify/react";
import toast from "react-hot-toast";
import ImageLibrary from "./ImageLibrary";

export default function ImageUpload({
  mode,
  imageSource,
  setImageSource,
  formData,
  handleInputChange,
  uploadedImage,
  setUploadedImage,
}) {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [showMediaLibrary, setShowMediaLibrary] = useState(false);

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

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
        xhr.open("POST", "/api/imagekit/upload-file", true);
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

      setUploadedImage(response);
      const imageUrl = response.url;
      handleInputChange({
        target: {
          name: "multiple",
          value: {
            article_image: imageUrl,
            featured_image_url: imageUrl,
            featured_image_upload: imageUrl,
            featured_image_library: "",
          },
        },
      });
      toast.success("Image uploaded successfully");
    } catch (error) {
      console.error("Upload error:", error);
      toast.error(`Failed to upload image: ${error.message}`);
    } finally {
      setUploading(false);
    }
  };

  const handleMediaSelect = (selectedImage) => {
    // selectedImage is now the entire file object
    const imageUrl = selectedImage.url;
    console.log("ImageUpload handleMediaSelect - Setting image URL:", imageUrl);

    handleInputChange({
      target: {
        name: "multiple",
        value: {
          article_image: imageUrl,
          featured_image_url: imageUrl,
          featured_image_library: imageUrl,
          featured_image_upload: "",
        },
      },
    });
    setShowMediaLibrary(false);
    toast.success("Image selected successfully");
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-4">
        <label className="flex items-center gap-2">
          <input
            type="radio"
            value="url"
            checked={imageSource === "url"}
            onChange={(e) => setImageSource(e.target.value)}
            className={`w-4 h-4 ${
              mode === "dark" ? "text-blue-500" : "text-blue-600"
            }`}
          />
          <span
            className={`text-sm ${
              mode === "dark" ? "text-gray-300" : "text-gray-700"
            }`}
          >
            Image URL
          </span>
        </label>
        <label className="flex items-center gap-2">
          <input
            type="radio"
            value="upload"
            checked={imageSource === "upload"}
            onChange={(e) => setImageSource(e.target.value)}
            className={`w-4 h-4 ${
              mode === "dark" ? "text-blue-500" : "text-blue-600"
            }`}
          />
          <span
            className={`text-sm ${
              mode === "dark" ? "text-gray-300" : "text-gray-700"
            }`}
          >
            Upload Image
          </span>
        </label>
        <label className="flex items-center gap-2">
          <input
            type="radio"
            value="library"
            checked={imageSource === "library"}
            onChange={(e) => setImageSource(e.target.value)}
            className={`w-4 h-4 ${
              mode === "dark" ? "text-blue-500" : "text-blue-600"
            }`}
          />
          <span
            className={`text-sm ${
              mode === "dark" ? "text-gray-300" : "text-gray-700"
            }`}
          >
            Choose from Library
          </span>
        </label>
      </div>

      {imageSource === "url" && (
        <input
          type="url"
          name="article_image"
          value={formData.article_image || ""}
          onChange={handleInputChange}
          className={`w-full px-4 py-2 rounded-xl border ${
            mode === "dark"
              ? "bg-gray-800 border-gray-700 text-gray-100"
              : "bg-white border-gray-300 text-gray-900"
          } focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
          placeholder="Enter image URL"
        />
      )}

      {imageSource === "upload" && (
        <div className="space-y-4">
          <label
            className={`w-full px-4 py-2 rounded-xl border ${
              mode === "dark"
                ? "bg-gray-800 border-gray-700 text-gray-100"
                : "bg-white border-gray-300 text-gray-900"
            } focus:ring-2 focus:ring-blue-500 focus:border-transparent cursor-pointer`}
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
                {uploading ? "Uploading..." : "Choose file or drag and drop"}
              </span>
            </div>
          </label>
          {uploading && (
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div
                className="bg-blue-600 h-2.5 rounded-full"
                style={{ width: `${uploadProgress}%` }}
              ></div>
            </div>
          )}
        </div>
      )}

      {imageSource === "library" && (
        <button
          type="button"
          onClick={() => setShowMediaLibrary(true)}
          className={`w-full px-4 py-2 rounded-xl border ${
            mode === "dark"
              ? "bg-gray-800 border-gray-700 text-gray-100 hover:bg-gray-700"
              : "bg-white border-gray-300 text-gray-900 hover:bg-gray-50"
          } focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
        >
          <Icon icon="heroicons:photo" className="w-5 h-5 inline-block mr-2" />
          Browse Image Library
        </button>
      )}

      {(formData.article_image || uploadedImage) && (
        <div className="mt-4">
          <img
            src={uploadedImage?.url || formData.article_image}
            alt="Preview"
            className="w-full h-48 object-cover rounded-xl"
          />
        </div>
      )}

      <ImageLibrary
        isOpen={showMediaLibrary}
        onClose={() => setShowMediaLibrary(false)}
        onSelect={handleMediaSelect}
        mode={mode}
      />
    </div>
  );
}
