import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { useBlog } from "../hooks/useBlog";
import { useAuth } from "../hooks/useAuth";
import { IKContext } from "imagekitio-react";
import toast from "react-hot-toast";
import ImageUpload from "./blog/ImageUpload";
import BlogFormFields from "./blog/BlogFormFields";
import ImageLibrary from "./blog/ImageLibrary";

export default function BlogForm({ mode, blogId }) {
  const router = useRouter();
  const { user } = useAuth();
  const {
    formData,
    setFormData,
    handleInputChange,
    handleSubmit,
    categories,
    tags,
    selectedTags,
    handleTagSelect,
    handleTagRemove,
    editorContent,
    setEditorContent,
    loading,
  } = useBlog(blogId);

  const [imageSource, setImageSource] = useState("url");
  const [uploadedImage, setUploadedImage] = useState(null);
  const [showMediaLibrary, setShowMediaLibrary] = useState(false);

  const authenticator = async () => {
    try {
      const response = await fetch("/api/imagekit/auth");
      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Authentication error:", error);
      throw error;
    }
  };

  const handleMediaSelect = (selectedImage) => {
    handleInputChange({
      target: {
        name: "article_image",
        value: selectedImage.url,
      },
    });
    setShowMediaLibrary(false);
    toast.success("Image selected successfully");
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    try {
      await handleSubmit(e);
      router.push("/admin/blogs");
    } catch (error) {
      console.error("Form submission error:", error);
      toast.error("Failed to save blog post");
    }
  };

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <div>
        <label
          className={`block text-sm font-medium mb-2 ${
            mode === "dark" ? "text-gray-300" : "text-gray-700"
          }`}
        >
          Featured Image
        </label>
        <ImageUpload
          mode={mode}
          imageSource={imageSource}
          setImageSource={setImageSource}
          formData={formData}
          handleInputChange={handleInputChange}
          authenticator={authenticator}
          uploadedImage={uploadedImage}
          setUploadedImage={setUploadedImage}
          setShowMediaLibrary={setShowMediaLibrary}
        />
      </div>

      <BlogFormFields
        mode={mode}
        formData={formData}
        handleInputChange={handleInputChange}
        categories={categories}
        tags={tags}
        selectedTags={selectedTags}
        handleTagSelect={handleTagSelect}
        handleTagRemove={handleTagRemove}
        editorContent={editorContent}
        setEditorContent={setEditorContent}
      />

      <div className="flex justify-end gap-4">
        <button
          type="button"
          onClick={() => router.push("/admin/blogs")}
          className={`px-6 py-3 rounded-xl ${
            mode === "dark"
              ? "bg-gray-800 text-white hover:bg-gray-700"
              : "bg-gray-100 text-gray-900 hover:bg-gray-200"
          }`}
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading}
          className={`px-6 py-3 rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed`}
        >
          {loading ? "Saving..." : blogId ? "Update Blog" : "Create Blog"}
        </button>
      </div>

      <ImageLibrary
        isOpen={showMediaLibrary}
        onClose={() => setShowMediaLibrary(false)}
        onSelect={handleMediaSelect}
        mode={mode}
        authenticator={authenticator}
      />
    </form>
  );
} 