import { useState, useEffect } from "react";
import { Icon } from "@iconify/react";
import { IKContext, IKUpload } from "imagekitio-react";
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

  useEffect(() => {
    console.log("ImageUpload state:", {
      imageSource,
      showMediaLibrary,
      hasUploadedImage: !!uploadedImage,
      hasFormImage: !!formData.article_image,
    });
  }, [imageSource, showMediaLibrary, uploadedImage, formData.article_image]);

  // Authenticator function
  const authenticator = async () => {
    try {
      const endpoint =
        process.env.NODE_ENV === "production"
          ? "https://membership.paan.africa/api/imagekit/auth"
          : "http://localhost:3000/api/imagekit/auth";
      const response = await fetch(endpoint, {
        method: "GET",
        credentials: "include", // Include cookies for Supabase session
      });
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `Failed to fetch auth parameters: ${response.status} ${errorText}`
        );
      }
      const data = await response.json();
      if (!data.signature || !data.token || !data.expire) {
        throw new Error("Invalid auth parameters received");
      }
      console.log("Authenticator success:", data);
      return {
        signature: data.signature,
        token: data.token,
        expire: data.expire,
      };
    } catch (error) {
      console.error("Authenticator error:", error);
      toast.error(`Authentication failed: ${error.message}`);
      throw error;
    }
  };

  const onUploadStart = () => {
    setUploading(true);
    setUploadProgress(0);
  };

  const onUploadSuccess = (res) => {
    setUploading(false);
    setUploadProgress(100);
    setUploadedImage(res);
    handleInputChange({
      target: {
        name: "article_image",
        value: res.url,
      },
    });
    toast.success("Image uploaded successfully");
  };

  const onUploadError = (error) => {
    setUploading(false);
    console.error("Upload error:", error);
    toast.error("Failed to upload image");
  };

  const onUploadProgress = (progressEvent) => {
    const progress = Math.round(
      (progressEvent.loaded * 100) / progressEvent.total
    );
    setUploadProgress(progress);
  };

  const handleMediaSelect = (selectedImage) => {
    console.log("Media selected:", selectedImage);
    handleInputChange({
      target: {
        name: "article_image",
        value: selectedImage.url,
      },
    });
    setShowMediaLibrary(false);
    toast.success("Image selected successfully");
  };

  const handleOpenMediaLibrary = () => {
    console.log("Opening media library...");
    setShowMediaLibrary(true);
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
          <IKContext
            publicKey={process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY}
            urlEndpoint={process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT}
            authenticationEndpoint={
              process.env.NODE_ENV === "production"
                ? "https://membership.paan.africa/api/imagekit/auth"
                : "http://localhost:3000/api/imagekit/auth"
            }
            authenticator={authenticator}
          >
            <IKUpload
              fileName="blog-image.jpg"
              useUniqueFileName={true}
              folder="/Blog"
              onUploadStart={onUploadStart}
              onUploadProgress={onUploadProgress}
              onSuccess={onUploadSuccess}
              onError={onUploadError}
              accept="image/*"
              className={`w-full px-4 py-2 rounded-xl border ${
                mode === "dark"
                  ? "bg-gray-800 border-gray-700 text-gray-100"
                  : "bg-white border-gray-300 text-gray-900"
              } focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
            />
          </IKContext>
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
          onClick={handleOpenMediaLibrary}
          className={`w-full px-4 py-2 rounded-xl border ${
            mode === "dark"
              ? "bg-gray-800 border-gray-700 text-gray-100 hover:bg-gray-700"
              : "bg-white border-gray-300 text-gray-900 hover:bg-gray-50"
          } focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
        >
          <Icon icon="heroicons:photo-library" className="w-5 h-5 inline-block mr-2" />
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