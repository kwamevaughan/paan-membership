import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import toast from "react-hot-toast";

export const useBlog = () => {
  const [blogs, setBlogs] = useState([]);
  const [filteredBlogs, setFilteredBlogs] = useState([]);
  const [formData, setFormData] = useState({
    id: null,
    article_name: "",
    article_body: "",
    article_category: "General",
    article_tags: [],
    article_image: "",
    meta_title: "",
    meta_description: "",
    meta_keywords: "",
    slug: "",
    is_published: false,
  });
  const [loading, setLoading] = useState(false);
  const [sortBy, setSortBy] = useState("newest");
  const [filters, setFilters] = useState({
    category: "All",
    tags: [],
    search: "",
  });

  const fetchBlogs = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error("Not authenticated");
      }

      const { data, error } = await supabase
        .from("blogs")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;

      setBlogs(data || []);
      setFilteredBlogs(data || []);
    } catch (error) {
      console.error("Error fetching blogs:", error);
      toast.error("Failed to fetch blog posts");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBlogs();
  }, []);

  useEffect(() => {
    let filtered = [...blogs];

    // Apply category filter
    if (filters.category !== "All") {
      filtered = filtered.filter(
        (blog) => blog.article_category === filters.category
      );
    }

    // Apply tags filter
    if (filters.tags.length > 0) {
      filtered = filtered.filter((blog) =>
        filters.tags.some((tag) => blog.article_tags.includes(tag))
      );
    }

    // Apply search filter
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      filtered = filtered.filter(
        (blog) =>
          blog.article_name.toLowerCase().includes(searchTerm) ||
          blog.article_body.toLowerCase().includes(searchTerm)
      );
    }

    // Apply sorting
    switch (sortBy) {
      case "newest":
        filtered.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        break;
      case "oldest":
        filtered.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
        break;
      case "az":
        filtered.sort((a, b) =>
          a.article_name.localeCompare(b.article_name)
        );
        break;
      case "za":
        filtered.sort((a, b) =>
          b.article_name.localeCompare(a.article_name)
        );
        break;
      default:
        break;
    }

    setFilteredBlogs(filtered);
  }, [blogs, filters, sortBy]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error("Not authenticated");
      }

      const blogData = {
        ...formData,
        updated_at: new Date().toISOString(),
      };

      if (formData.id) {
        // Update existing blog
        const { error } = await supabase
          .from("blogs")
          .update(blogData)
          .eq("id", formData.id);

        if (error) throw error;
        toast.success("Blog post updated successfully");
      } else {
        // Create new blog
        blogData.created_at = new Date().toISOString();
        const { error } = await supabase.from("blogs").insert([blogData]);

        if (error) throw error;
        toast.success("Blog post created successfully");
      }

      await fetchBlogs();
      return true;
    } catch (error) {
      console.error("Error saving blog:", error);
      toast.error("Failed to save blog post");
      return false;
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error("Not authenticated");
      }

      const { error } = await supabase.from("blogs").delete().eq("id", id);

      if (error) throw error;

      toast.success("Blog post deleted successfully");
      await fetchBlogs();
      return true;
    } catch (error) {
      console.error("Error deleting blog:", error);
      toast.error("Failed to delete blog post");
      return false;
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (blog) => {
    setFormData(blog);
  };

  const updateFilters = (newFilters) => {
    setFilters((prev) => ({
      ...prev,
      ...newFilters,
    }));
  };

  return {
    blogs: filteredBlogs,
    formData,
    setFormData,
    loading,
    sortBy,
    setSortBy,
    filters,
    updateFilters,
    handleInputChange,
    handleSubmit,
    handleDelete,
    handleEdit,
  };
};
