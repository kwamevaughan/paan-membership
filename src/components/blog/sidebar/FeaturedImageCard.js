import { Icon } from "@iconify/react";
import toast from "react-hot-toast";
import SidebarCard from "@/components/common/SidebarCard";
import ImageUpload from "@/components/common/ImageUpload";
import ImageLibrary from "@/components/common/ImageLibrary";

export default function FeaturedImageCard({
  mode,
  isCollapsed,
  onToggle,
  imageSource,
  setImageSource,
  formData,
  handleInputChange,
  showImageLibrary,
  setShowImageLibrary,
}) {
  return (
    <>
      <SidebarCard
        title="Featured Image"
        icon="heroicons:photo"
        isCollapsed={isCollapsed}
        onToggle={onToggle}
        mode={mode}
      >
        {/* Image Preview - Show first if image exists */}
        {formData.article_image && typeof formData.article_image === 'string' && !formData.article_image.startsWith('data:') ? (
          <div className="space-y-3">
            <div className="relative w-full aspect-video rounded-lg overflow-hidden border-2 border-dashed border-gray-300 dark:border-gray-600">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={formData.article_image}
                alt="Featured"
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.style.display = 'none';
                  toast.error('Failed to load image');
                }}
              />
              <div className="absolute inset-0 bg-black/0 hover:bg-black/20 transition-all duration-200 flex items-center justify-center group">
                <button
                  type="button"
                  onClick={() =>
                    handleInputChange({
                      target: { name: "article_image", value: "" },
                    })
                  }
                  className="px-3 py-2 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 transition-all opacity-0 group-hover:opacity-100 flex items-center gap-2"
                >
                  <Icon icon="heroicons:trash" className="w-4 h-4" />
                  Remove
                </button>
              </div>
            </div>
            
            <button
              type="button"
              onClick={() => {
                handleInputChange({
                  target: { name: "article_image", value: "" },
                });
                setImageSource("upload");
              }}
              className={`w-full px-3 py-2 text-sm rounded-lg transition-colors flex items-center justify-center gap-2 ${
                mode === "dark"
                  ? "bg-gray-700 hover:bg-gray-600 text-gray-200"
                  : "bg-gray-100 hover:bg-gray-200 text-gray-700"
              }`}
            >
              <Icon icon="heroicons:arrow-path" className="w-4 h-4" />
              Change Image
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Image Source Tabs */}
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setImageSource("upload")}
                className={`px-3 py-2 text-xs font-medium rounded-lg transition-all ${
                  imageSource === "upload"
                    ? mode === "dark"
                      ? "bg-blue-600 text-white"
                      : "bg-blue-600 text-white"
                    : mode === "dark"
                    ? "bg-gray-700 text-gray-300 hover:bg-gray-600"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                <Icon icon="heroicons:arrow-up-tray" className="w-4 h-4 mx-auto mb-1" />
                Upload
              </button>
              <button
                type="button"
                onClick={() => setImageSource("url")}
                className={`px-3 py-2 text-xs font-medium rounded-lg transition-all ${
                  imageSource === "url"
                    ? mode === "dark"
                      ? "bg-blue-600 text-white"
                      : "bg-blue-600 text-white"
                    : mode === "dark"
                    ? "bg-gray-700 text-gray-300 hover:bg-gray-600"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                <Icon icon="heroicons:link" className="w-4 h-4 mx-auto mb-1" />
                URL
              </button>
              <button
                type="button"
                onClick={() => setImageSource("library")}
                className={`px-3 py-2 text-xs font-medium rounded-lg transition-all ${
                  imageSource === "library"
                    ? mode === "dark"
                      ? "bg-blue-600 text-white"
                      : "bg-blue-600 text-white"
                    : mode === "dark"
                    ? "bg-gray-700 text-gray-300 hover:bg-gray-600"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                <Icon icon="heroicons:photo" className="w-4 h-4 mx-auto mb-1" />
                Library
              </button>
            </div>

            {/* Image Source Content */}
            <div className={`p-4 rounded-lg border-2 border-dashed ${
              mode === "dark"
                ? "border-gray-600 bg-gray-800/50"
                : "border-gray-300 bg-gray-50"
            }`}>
              {imageSource === "upload" && (
                <ImageUpload
                  mode={mode}
                  imageSource={imageSource}
                  onImageSelect={(url) =>
                    handleInputChange({
                      target: { name: "article_image", value: url },
                    })
                  }
                  currentImage={formData.article_image}
                  showPreview={false}
                />
              )}

              {imageSource === "url" && (
                <div>
                  <label className={`block text-xs font-medium mb-2 ${
                    mode === "dark" ? "text-gray-300" : "text-gray-600"
                  }`}>
                    Enter image URL
                  </label>
                  <input
                    type="url"
                    name="article_image"
                    value={formData.article_image || ""}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 rounded-lg border text-sm ${
                      mode === "dark"
                        ? "bg-gray-700 border-gray-600 text-gray-100"
                        : "bg-white border-gray-300 text-gray-900"
                    } focus:ring-2 focus:ring-blue-500`}
                    placeholder="https://example.com/image.jpg"
                  />
                </div>
              )}

              {imageSource === "library" && (
                <button
                  type="button"
                  onClick={() => setShowImageLibrary(true)}
                  className={`w-full px-4 py-8 rounded-lg border-2 border-dashed transition-colors flex flex-col items-center justify-center gap-2 ${
                    mode === "dark"
                      ? "border-gray-600 hover:border-gray-500 text-gray-400 hover:text-gray-300"
                      : "border-gray-300 hover:border-gray-400 text-gray-600 hover:text-gray-700"
                  }`}
                >
                  <Icon icon="heroicons:photo" className="w-8 h-8" />
                  <span className="text-sm font-medium">Browse Image Library</span>
                </button>
              )}
            </div>
          </div>
        )}
      </SidebarCard>

      {/* Image Library Modal */}
      <ImageLibrary
        isOpen={showImageLibrary}
        onClose={() => setShowImageLibrary(false)}
        onSelect={(selectedImage) => {
          handleInputChange({
            target: { name: "article_image", value: selectedImage.url },
          });
          setShowImageLibrary(false);
        }}
        mode={mode}
      />
    </>
  );
}
