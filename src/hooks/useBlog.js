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
    category_id: null,
    tag_ids: [],
    article_image: "",
    meta_title: "",
    meta_description: "",
    meta_keywords: "",
    slug: "",
    is_published: false,
    is_draft: false,
    publish_date: null,
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
        .select(`
          *,
          category:blog_categories(name),
          tags:blog_post_tags(
            tag:blog_tags(name)
          )
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Transform the data to include category name and tag names
      const transformedData = data.map(blog => ({
        ...blog,
        article_category: blog.category?.name || null,
        article_tags: blog.tags?.map(t => t.tag.name) || []
      }));

      setBlogs(transformedData || []);
      setFilteredBlogs(transformedData || []);
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

      const { category_id, tag_ids, id, ...blogData } = formData;

      // Start a transaction
      const { data: blog, error: blogError } = await supabase
        .from("blogs")
        .upsert({
          ...blogData,
          id: id || undefined, // Only include id if it exists (for updates)
          updated_at: new Date().toISOString(),
          created_at: id ? undefined : new Date().toISOString(),
        })
        .select()
        .single();

      if (blogError) throw blogError;

      // Handle tags - ensure tag_ids is an array
      const tagIdsArray = Array.isArray(tag_ids) ? tag_ids : [];
      
      if (tagIdsArray.length > 0) {
        // Delete existing tags
        await supabase
          .from("blog_post_tags")
          .delete()
          .eq("blog_id", blog.id);

        // Insert new tags
        const tagInserts = tagIdsArray.map(tag_id => ({
          blog_id: blog.id,
          tag_id: tag_id
        }));

        const { error: tagError } = await supabase
          .from("blog_post_tags")
          .insert(tagInserts);

        if (tagError) throw tagError;
      }

      toast.success(formData.id ? "Blog post updated successfully" : "Blog post created successfully");
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

      // Delete blog post (cascade will handle blog_post_tags)
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
    // Transform the blog data to match the form structure
    setFormData({
      ...blog,
      category_id: blog.category_id,
      tag_ids: blog.tags?.map(t => t.tag_id) || []
    });
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
