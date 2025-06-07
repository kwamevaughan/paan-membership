import { IKContext } from "imagekitio-react";
import dynamic from "next/dynamic";
import ItemActionModal from "../ItemActionModal";
import { useState, useEffect } from "react";
import toast from "react-hot-toast";

const MediaLibrary = dynamic(
  () => import("imagekitio-react").then((mod) => mod.MediaLibrary),
  {
    ssr: false,
    loading: () => <p>Loading media library...</p>,
  }
);

export default function ImageLibrary({ isOpen, onClose, onSelect, mode }) {
  const [authError, setAuthError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [files, setFiles] = useState([]);
  const [apiResponse, setApiResponse] = useState(null);
  const [manualFiles, setManualFiles] = useState([]);
  const [manualError, setManualError] = useState(null);

  const defaultPath = "/Blog"; // Works for manual fetch
  const [currentPath, setCurrentPath] = useState(defaultPath);

  const authenticator = async () => {
    try {
      const endpoint =
        process.env.NODE_ENV === "production"
          ? "https://membership.paan.africa/api/imagekit/auth"
          : "http://localhost:3000/api/imagekit/auth";
      const response = await fetch(endpoint, {
        method: "GET",
        credentials: "include",
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
      console.log("MediaLibrary authenticator success:", data);
      return {
        signature: data.signature,
        token: data.token,
        expire: data.expire,
      };
    } catch (error) {
      console.error("MediaLibrary authenticator error:", error);
      setAuthError(error.message);
      toast.error(`Authentication failed: ${error.message}`);
      setIsLoading(false);
      throw error;
    }
  };

  // Manual API fetch
  const fetchFilesManually = async (path) => {
    try {
      setManualError(null);
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
      console.log(`Manual API fetch for path ${path}:`, data);
      setManualFiles(data);
      if (data.length === 0) {
        toast.warn(`No files found in path: ${path}`);
      } else {
        toast.success(`Found ${data.length} files in path: ${path}`);
      }
    } catch (error) {
      console.error("Manual API fetch error:", error);
      setManualError(error.message);
      toast.error(`Manual fetch failed: ${error.message}`);
    }
  };

  const handleIKContextError = (err) => {
    console.error("IKContext error:", err);
    setAuthError(err.message || "Failed to initialize media library");
    setIsLoading(false);
    toast.error(`Media library initialization failed: ${err.message}`);
  };

  const handleMediaLibraryError = (err) => {
    console.error("MediaLibrary error:", err);
    setAuthError(err.message || "Media library failed to load");
    setIsLoading(false);
    toast.error(`Media library error: ${err.message}`);
  };

  const handleMediaLibraryLoad = (data) => {
    console.log("MediaLibrary loaded successfully:", data);
    setApiResponse(data);
    setFiles(data.files || []);
    setAuthError(null);
    setIsLoading(false);
    if (!data.files || data.files.length === 0) {
      console.warn(`MediaLibrary loaded but no files found in ${currentPath}`);
      toast.warn(`No images found in path: ${currentPath}`);
    } else {
      console.log(
        "Files found:",
        data.files.map((f) => f.name)
      );
      toast.success(`Found ${data.files.length} images`);
    }
  };

  const handleMediaLibrarySelect = (selectedImage) => {
    console.log("MediaLibrary image selected:", selectedImage);
    onSelect(selectedImage);
    onClose();
    toast.success("Image selected successfully");
  };

  useEffect(() => {
    console.log("MediaLibrary files:", files);
    console.log("MediaLibrary API response:", apiResponse);
    console.log("Manual API files:", manualFiles);
    if (isOpen && manualFiles.length === 0) {
      fetchFilesManually(currentPath);
    }
  }, [isOpen, currentPath]);

  return (
    <ItemActionModal
      isOpen={isOpen}
      onClose={onClose}
      title="Image Library"
      mode={mode}
      size="xl"
    >
      <div className="h-[600px]">
        {authError && (
          <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
            <p className="font-medium">Error: {authError}</p>
          </div>
        )}
        {manualError && (
          <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
            <p className="font-medium">Manual Fetch Error: {manualError}</p>
          </div>
        )}
        {manualFiles.length > 0 && (
          <div className="mb-4">
            <h3 className="text-lg font-medium mb-2">Images</h3>
            <div className="grid grid-cols-3 gap-4 max-h-[400px] overflow-y-auto">
              {manualFiles.map((file) => (
                <div
                  key={file.fileId}
                  className="border rounded-lg p-2 cursor-pointer hover:bg-gray-100"
                >
                  <img
                    src={file.thumbnail}
                    alt={file.name}
                    className="w-full h-24 object-cover rounded"
                    onClick={() => handleMediaLibrarySelect(file)}
                  />
                  <p className="text-sm truncate mt-1">{file.name}</p>
                </div>
              ))}
            </div>
          </div>
        )}
        {!isLoading && files.length === 0 && manualFiles.length === 0 && (
          <p className="text-center text-gray-600">
            No images available. Try uploading images to /Blog.
          </p>
        )}
        {isLoading && (
          <div className="flex items-center justify-center h-full">
            <p className="text-gray-600">Loading media library...</p>
          </div>
        )}
        <IKContext
          publicKey={process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY}
          urlEndpoint={process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT}
          authenticationEndpoint={
            process.env.NODE_ENV === "production"
              ? "https://membership.paan.africa/api/imagekit/auth-media"
              : "http://localhost:3000/api/imagekit/auth-media"
          }
          authenticator={authenticator}
          onError={handleIKContextError}
        >
          <MediaLibrary
            path="/Blog"
            onSelect={handleMediaLibrarySelect}
            onClose={onClose}
            onError={handleMediaLibraryError}
            onLoad={handleMediaLibraryLoad}
            showFolderSelection={true}
            showSearch={true}
            showSort={true}
            showFilter={true}
            showPreview={true}
            showUpload={true}
            showDelete={false}
            className={`w-full h-full ${
              mode === "dark" ? "bg-gray-900" : "bg-white"
            }`}
            style={{ height: "100%", width: "100%", borderRadius: "0.5rem" }}
            theme={mode === "dark" ? "dark" : "light"}
          />
        </IKContext>
      </div>
    </ItemActionModal>
  );
}
