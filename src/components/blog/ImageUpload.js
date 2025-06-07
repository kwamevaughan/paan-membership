import { useState } from "react";
import { Icon } from "@iconify/react";
import { IKContext, IKUpload } from "imagekitio-react";
import toast from "react-hot-toast";

export default function ImageUpload({
  mode,
  imageSource,
  setImageSource,
  formData,
  handleInputChange,
  authenticator,
  uploadedImage,
  setUploadedImage,
}) {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const onUploadStart = () => {
    setUploading(true);
    setUploadProgress(0);
  };

  const onUploadSuccess = (res) => {
    try {
      const fileUrl = `${process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT}${res.filePath}`;
      handleInputChange({
        target: {
          name: "article_image",
          value: fileUrl,
        },
      });
      setUploadedImage(fileUrl);
      toast.success("Image uploaded successfully");
    } catch (error) {
      console.error("Upload success handling error:", error);
      toast.error("Failed to process uploaded image");
    } finally {
      setUploading(false);
    }
  };

  const onUploadError = (error) => {
    console.error("Upload error:", error);
    toast.error(`Failed to upload image: ${error.message || "Unknown error"}`);
    setUploading(false);
  };

  const onUploadProgress = (progressEvent) => {
    const progress = Math.round(
      (progressEvent.loaded / progressEvent.total) * 100
    );
    setUploadProgress(progress);
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-4">
        <label className="flex items-center gap-2">
          <input
            type="radio"
            name="imageSource"
            value="url"
            checked={imageSource === "url"}
            onChange={(e) => setImageSource(e.target.value)}
            className={`w-4 h-4 ${
              mode === "dark"
                ? "bg-gray-700 border-gray-600"
                : "bg-white border-gray-300"
            }`}
          />
          <span className={`text-sm ${
            mode === "dark" ? "text-gray-300" : "text-gray-700"
          }`}>External URL</span>
        </label>
        <label className="flex items-center gap-2">
          <input
            type="radio"
            name="imageSource"
            value="upload"
            checked={imageSource === "upload"}
            onChange={(e) => setImageSource(e.target.value)}
            className={`w-4 h-4 ${
              mode === "dark"
                ? "bg-gray-700 border-gray-600"
                : "bg-white border-gray-300"
            }`}
          />
          <span className={`text-sm ${
            mode === "dark" ? "text-gray-300" : "text-gray-700"
          }`}>Upload Image</span>
        </label>
        <label className="flex items-center gap-2">
          <input
            type="radio"
            name="imageSource"
            value="library"
            checked={imageSource === "library"}
            onChange={(e) => setImageSource(e.target.value)}
            className={`w-4 h-4 ${
              mode === "dark"
                ? "bg-gray-700 border-gray-600"
                : "bg-white border-gray-300"
            }`}
          />
          <span className={`text-sm ${
            mode === "dark" ? "text-gray-300" : "text-gray-700"
          }`}>Choose from Library</span>
        </label>
      </div>

      {imageSource === "url" ? (
        <input
          type="url"
          name="article_image"
          value={formData.article_image}
          onChange={handleInputChange}
          className={`w-full px-4 py-3 rounded-xl ${
            mode === "dark"
              ? "bg-gray-800/80 text-white border-gray-700/50"
              : "bg-white/80 text-gray-900 border-gray-200/50"
          } focus:ring-2 focus:ring-indigo-500 backdrop-blur-sm`}
          placeholder="https://example.com/image.jpg"
        />
      ) : imageSource === "upload" ? (
        <IKContext
          publicKey={process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY}
          urlEndpoint={process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT}
          authenticationEndpoint={
            process.env.NODE_ENV === "production"
              ? "https://membership.paan.africa/api/imagekit/auth"
              : "http://localhost:3000/api/imagekit/auth"
          }
          authenticator={authenticator}
          onError={(err) => {
            console.error("ImageKit context error:", err);
            toast.error(
              `Failed to initialize image upload: ${
                err.message || "Unknown error"
              }`
            );
          }}
        >
          <div className="space-y-4">
            <IKUpload
              fileName="blog-image.jpg"
              useUniqueFileName={true}
              folder="/Blog"
              onUploadStart={onUploadStart}
              onUploadProgress={onUploadProgress}
              onSuccess={onUploadSuccess}
              onError={onUploadError}
              accept="image/*"
              className={`w-full px-4 py-3 rounded-xl ${
                mode === "dark"
                  ? "bg-gray-800/80 text-white border-gray-700/50"
                  : "bg-white/80 text-gray-900 border-gray-200/50"
              } focus:ring-2 focus:ring-indigo-500 backdrop-blur-sm`}
            />
            {uploading && (
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div
                  className="bg-blue-600 h-2.5 rounded-full"
                  style={{ width: `${uploadProgress}%` }}
                ></div>
              </div>
            )}
            {uploadedImage && (
              <div className="mt-2">
                <img
                  src={uploadedImage}
                  alt="Uploaded"
                  className="max-h-40 rounded-lg object-cover"
                />
              </div>
            )}
          </div>
        </IKContext>
      ) : (
        <div className="space-y-4">
          <button
            type="button"
            onClick={() => setShowMediaLibrary(true)}
            className={`w-full px-4 py-3 rounded-xl ${
              mode === "dark"
                ? "bg-gray-800/80 text-white border-gray-700/50 hover:bg-gray-700/80"
                : "bg-white/80 text-gray-900 border-gray-200/50 hover:bg-gray-50/80"
            } focus:ring-2 focus:ring-indigo-500 backdrop-blur-sm flex items-center justify-center gap-2`}
          >
            <Icon icon="heroicons:photo-library" className="w-5 h-5" />
            Browse Image Library
          </button>
          {formData.article_image && (
            <div className="mt-2">
              <img
                src={formData.article_image}
                alt="Selected"
                className="max-h-40 rounded-lg object-cover"
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
} 