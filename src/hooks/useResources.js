import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { supabase } from "@/lib/supabase";

export function useResources(initialResources = []) {
  const [resources, setResources] = useState(initialResources);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    resource_type: "PDF",
    tier_restriction: "All",
    url: "",
    file: null,
    file_path: "",
    video_url: "",
  });
  const [loading, setLoading] = useState(false);

  const fetchResources = async () => {
    try {
      setLoading(true);
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();
      if (userError || !user) throw new Error("User not authenticated");

      const { data: hrUser, error: hrError } = await supabase
        .from("hr_users")
        .select("id")
        .eq("id", user.id)
        .single();
      if (hrError || !hrUser) throw new Error("User not authorized");

      const { data: resources, error: resourcesError } = await supabase
        .from("resources")
        .select(
          "id, title, description, resource_type, tier_restriction, url, file_path, video_url, created_at, updated_at"
        )
        .order("created_at", { ascending: false });

      if (resourcesError) throw resourcesError;

      console.log("[useResources] Fetched resources:", resources);
      setResources(resources || []);
    } catch (error) {
      console.error("[useResources] Error fetching resources:", error);
      toast.error("Failed to load resources");
      setResources([]);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { id, file, ...resourceData } = formData;

    try {
      if (!supabase) throw new Error("Supabase client is not initialized");
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();
      if (userError || !user) throw new Error("User not authenticated");

      const { data: hrUser, error: hrError } = await supabase
        .from("hr_users")
        .select("id")
        .eq("id", user.id)
        .single();
      if (hrError || !hrUser) throw new Error("User not authorized");

      // Validate resource_type
      const validResourceTypes = ["PDF", "Video", "Workshop"];
      if (!validResourceTypes.includes(resourceData.resource_type)) {
        throw new Error(
          `Invalid resource_type. Must be one of: ${validResourceTypes.join(
            ", "
          )}`
        );
      }

      // Validate tier_restriction
      const validTiers = ["Founding", "Full", "Associate", "All"];
      if (!validTiers.includes(resourceData.tier_restriction)) {
        throw new Error(
          `Invalid tier_restriction. Must be one of: ${validTiers.join(", ")}`
        );
      }

      // Handle file upload
      if (file) {
        const fileName = `${Date.now()}_${file.name}`;
        const { error: uploadError } = await supabase.storage
          .from("resources")
          .upload(fileName, file);
        if (uploadError)
          throw new Error(`File upload failed: ${uploadError.message}`);
        resourceData.file_path = fileName;
      }

      // Validate video_url
      if (resourceData.video_url) {
        if (
          !(
            resourceData.video_url.startsWith("https://www.youtube.com/") ||
            resourceData.video_url.startsWith("https://youtu.be/") ||
            resourceData.video_url.startsWith("https://vimeo.com/")
          )
        ) {
          throw new Error("Video URL must be a valid YouTube or Vimeo link");
        }
      }

      // Clear unused fields
      if (resourceData.file_path) {
        resourceData.video_url = "";
        resourceData.url = "";
      } else if (resourceData.video_url) {
        resourceData.file_path = "";
        resourceData.url = "";
      }

      if (id) {
        // Update existing resource
        const { error } = await supabase
          .from("resources")
          .update(resourceData)
          .eq("id", id);
        if (error) throw error;
        toast.success("Resource updated successfully!");
        setResources((prev) =>
          prev.map((resource) =>
            resource.id === id ? { id, ...resourceData } : resource
          )
        );
      } else {
        // Create new resource
        const { data, error } = await supabase
          .from("resources")
          .insert([resourceData])
          .select()
          .single();
        if (error) throw error;
        toast.success("Resource created successfully!");
        setResources((prev) => [...prev, data]);
      }

      setFormData({
        title: "",
        description: "",
        resource_type: "PDF",
        tier_restriction: "All",
        url: "",
        file: null,
        file_path: "",
        video_url: "",
      });
    } catch (error) {
      console.error("[useResources] Error in handleSubmit:", error);
      toast.error(`Error saving resource: ${error.message}`);
    }
  };

  const handleEdit = (resource) => {
    setFormData({
      id: resource.id,
      title: resource.title || "",
      description: resource.description || "",
      resource_type: resource.resource_type || "PDF",
      tier_restriction: resource.tier_restriction || "All",
      url: resource.url || "",
      file: null,
      file_path: resource.file_path || "",
      video_url: resource.video_url || "",
    });
  };

  const handleDelete = async (id) => {
    try {
      if (!supabase) throw new Error("Supabase client is not initialized");
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();
      if (userError || !user) throw new Error("User not authenticated");

      const { data: hrUser, error: hrError } = await supabase
        .from("hr_users")
        .select("id")
        .eq("id", user.id)
        .single();
      if (hrError || !hrUser) throw new Error("User not authorized");

      // Optionally delete file from storage
      const resource = resources.find((r) => r.id === id);
      if (resource?.file_path) {
        await supabase.storage.from("resources").remove([resource.file_path]);
      }

      const { error } = await supabase.from("resources").delete().eq("id", id);
      if (error) throw error;
      toast.success("Resource deleted successfully!");
      setResources((prev) => prev.filter((resource) => resource.id !== id));
    } catch (error) {
      console.error("[useResources] Error in handleDelete:", error);
      toast.error(`Error deleting resource: ${error.message}`);
    }
  };

  useEffect(() => {
    fetchResources();
  }, []);

  return {
    resources,
    formData,
    loading,
    handleInputChange,
    handleSubmit,
    handleEdit,
    handleDelete,
  };
}
