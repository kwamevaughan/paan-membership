import { useState } from "react";
import { Icon } from "@iconify/react";
import toast from "react-hot-toast";
import ImageLibrary from "@/components/common/ImageLibrary";

export default function ImageUpload({
  mode,
  imageSource,
  setImageSource,
  formData = {},
  handleInputChange,
  uploadedImage,
  setUploadedImage,
  onImageSelect,
  currentImage,
  showPreview = true,
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

      setUploadedImage?.(response);
      const imageUrl = response.url;
      
      if (onImageSelect) {
        onImageSelect(imageUrl);
      } else if (handleInputChange) {
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
      }
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

    if (onImageSelect) {
      onImageSelect(imageUrl);
    } else if (handleInputChange) {
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
    }
    setShowMediaLibrary(false);
    toast.success("Image selected successfully");
  };

  return (
    <div className="space-y-4">
      {/* Upload interface - no radio buttons needed since tabs handle selection */}
      {imageSource === "url" && (
        <input
          type="url"
          name="article_image"
          value={formData?.article_image || currentImage || ""}
          onChange={(e) => {
            if (onImageSelect) {
              onImageSelect(e.target.value);
            } else if (handleInputChange) {
              handleInputChange(e);
            }
          }}
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

      {showPreview && (formData?.article_image || currentImage || uploadedImage) && (
        <div className="mt-4">
          {(() => {
            const imageSrc = uploadedImage?.url || formData?.article_image || currentImage;
            if (imageSrc && imageSrc.startsWith('data:')) {
              return (
                <div className={`p-4 rounded-xl ${mode === 'dark' ? 'bg-red-900/20 text-red-400' : 'bg-red-100 text-red-600'}`}>
                  <p className="text-sm">Invalid image format. Base64 data URLs are not supported.</p>
                </div>
              );
            }
            return (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img
                src={imageSrc}
                alt="Preview"
                className="w-full h-48 object-cover rounded-xl"
                onError={(e) => {
                  e.target.style.display = 'none';
                  toast.error('Failed to load image preview');
                }}
              />
            );
          })()}
        </div>
      )}

    </div>
  );
}
