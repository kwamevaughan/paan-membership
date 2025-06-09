// useBlog.jsx
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import toast from "react-hot-toast";

export const useBlog = (blogId) => {
  const [blogs, setBlogs] = useState([]);
  const [filteredBlogs, setFilteredBlogs] = useState([]);
  const [editorContent, setEditorContent] = useState("");
  const [categories, setCategories] = useState([]);
  const [tags, setTags] = useState([]);
  const [hrUser, setHrUser] = useState(null);
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
    is_draft: true,
    publish_date: null,
    author: "",
    title: "",
    description: "",
    keywords: [],
    featured_image_url: "",
    featured_image_upload: null,
    featured_image_library: null,
    content: "",
    publish_option: "draft",
    scheduled_date: null,
    focus_keyword: "",
  });
  const [loading, setLoading] = useState(false);
  const [sortBy, setSortBy] = useState("newest");
  const [filters, setFilters] = useState({
    category: "All",
    tags: [],
    search: "",
    status: "",
    sort: "newest"
  });

  const fetchHRUser = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const { data: hrUserData, error: hrUserError } = await supabase
        .from("hr_users")
        .select("id, name, username")
        .eq("id", user.id)
        .single();

      if (hrUserError) throw hrUserError;
      setHrUser(hrUserData);
      setFormData((prev) => ({
        ...prev,
        author: hrUserData.name || hrUserData.username,
      }));
    } catch (error) {
      console.error("Error fetching HR user:", error);
    }
  };

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from("blog_categories")
        .select("id, name, slug")
        .order("name");

      if (error) throw error;
      setCategories(data || []);
    } catch (error) {
      console.error("Error fetching categories:", error);
      toast.error("Failed to fetch categories");
    }
  };

  const fetchTags = async () => {
    try {
      const { data, error } = await supabase
        .from("blog_tags")
        .select("id, name, slug")
        .order("name");

      if (error) throw error;
      setTags(data || []);
    } catch (error) {
      console.error("Error fetching tags:", error);
      toast.error("Failed to fetch tags");
    }
  };

  const fetchBlogs = async () => {
    try {
      setLoading(true);
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        throw new Error("Not authenticated");
      }

      const { data, error } = await supabase
        .from("blogs")
        .select(
          `
          *,
          category:blog_categories(name),
          tags:blog_post_tags(
            tag:blog_tags(name)
          )
        `
        )
        .order("created_at", { ascending: false });

      if (error) throw error;

      const transformedData = data.map((blog) => ({
        ...blog,
        article_category: blog.category?.name || null,
        article_tags: blog.tags?.map((t) => t.tag.name) || [],
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
    fetchHRUser();
    fetchCategories();
    fetchTags();
    fetchBlogs();
  }, []);

  useEffect(() => {
    let filtered = [...blogs];

    if (filters.category !== "All") {
      filtered = filtered.filter(
        (blog) => blog.article_category === filters.category
      );
    }

    if (filters.tags.length > 0) {
      filtered = filtered.filter((blog) =>
        filters.tags.some((tag) => blog.article_tags.includes(tag))
      );
    }

    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      filtered = filtered.filter(
        (blog) =>
          blog.article_name.toLowerCase().includes(searchTerm) ||
          blog.article_body.toLowerCase().includes(searchTerm)
      );
    }

    if (filters.status) {
      filtered = filtered.filter((blog) => {
        if (filters.status === "published") return blog.is_published;
        if (filters.status === "draft") return blog.is_draft;
        if (filters.status === "scheduled") return blog.publish_date && !blog.is_published;
        return true;
      });
    }

    switch (filters.sort) {
      case "newest":
        filtered.sort(
          (a, b) => new Date(b.created_at) - new Date(a.created_at)
        );
        break;
      case "oldest":
        filtered.sort(
          (a, b) => new Date(a.created_at) - new Date(b.created_at)
        );
        break;
      case "az":
        filtered.sort((a, b) => a.article_name.localeCompare(b.article_name));
        break;
      case "za":
        filtered.sort((a, b) => b.article_name.localeCompare(a.article_name));
        break;
      case "category":
        filtered.sort((a, b) => (a.article_category || "").localeCompare(b.article_category || ""));
        break;
      default:
        break;
    }

    setFilteredBlogs(filtered);
  }, [blogs, filters]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (name === "multiple") {
      setFormData((prev) => {
        const updated = {
          ...prev,
          ...value,
        };
        return updated;
      });
    } else if (name === "article_name") {
      const slug = value
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");
      setFormData((prev) => {
        const updated = {
          ...prev,
          [name]: value,
          slug: slug,
        };
        return updated;
      });
    } else if (name === "featured_image_url") {
      // Handle external image URL
      setFormData((prev) => {
        const updated = {
          ...prev,
          [name]: value,
          article_image: value, // Update article_image with the external URL
          featured_image_upload: "", // Clear upload field
          featured_image_library: "", // Clear library field
        };
        return updated;
      });
    } else {
      setFormData((prev) => {
        const updated = {
          ...prev,
          [name]: type === "checkbox" ? checked : value,
        };
        return updated;
      });
    }
  };

  const handleSubmit = async (e, updatedFormData = null) => {
    e.preventDefault();
    try {
      setLoading(true);
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        throw new Error("Not authenticated");
      }

      
      const dataToUse = updatedFormData || formData;

      const {
        id,
        article_name,
        article_body,
        article_image,
        meta_title,
        meta_description,
        meta_keywords,
        slug,
        author,
        category_id,
        tag_ids,
        publish_option,
        scheduled_date,
        title,
        description,
        keywords,
        featured_image_url,
        featured_image_upload,
        featured_image_library,
        content,
        article_tags,
        focus_keyword,
        ...rest
      } = dataToUse;

      

      const is_published = publish_option === "publish";
      const is_draft = publish_option === "draft";
      const publish_date =
        publish_option === "schedule" ? scheduled_date : null;

      let article_category = null;
      if (category_id) {
        const category = categories.find((c) => c.id === category_id);
        if (category) {
          article_category = category.name;
        }
      }

      // Updated image URL selection logic
      let finalImageUrl = "";
      if (featured_image_url && featured_image_url.startsWith('http')) {
        // If it's an external URL, use it directly
        finalImageUrl = featured_image_url;
      } else {
        // Otherwise, use the uploaded or library image
        finalImageUrl = featured_image_upload || featured_image_library || article_image || "";
      }
      

      // Ensure meta_keywords are properly handled
      const finalMetaKeywords = meta_keywords || (keywords ? keywords.join(", ") : "");

      // Get the final content from editor or form data
      const finalContent = editorContent || content || article_body || "";

      const blogToUpsert = {
        id: id || undefined,
        article_name,
        article_body: finalContent,
        article_image: finalImageUrl,
        meta_title: title || article_name,
        meta_description: description || "",
        meta_keywords: finalMetaKeywords,
        slug,
        is_published,
        is_draft,
        publish_date,
        author: user.id,
        category_id,
        article_category,
        article_tags: article_tags || [],
        focus_keyword: focus_keyword || "",
        updated_at: new Date().toISOString(),
        created_at: id ? undefined : new Date().toISOString(),
      };

      // Remove any undefined or null values
      Object.keys(blogToUpsert).forEach((key) => {
        if (blogToUpsert[key] === undefined || blogToUpsert[key] === null) {
          delete blogToUpsert[key];
        }
      });

      

      const { data: blog, error: blogError } = await supabase
        .from("blogs")
        .upsert(blogToUpsert)
        .select()
        .single();

      if (blogError) throw blogError;

      // Delete existing tags for this blog
      const { error: deleteTagsError } = await supabase
        .from("blog_post_tags")
        .delete()
        .eq("blog_id", blog.id);

      if (deleteTagsError) throw deleteTagsError;

      // Insert new tags if any
      if (tag_ids && tag_ids.length > 0) {
        const tagInserts = tag_ids.map((tag_id) => ({
          blog_id: blog.id,
          tag_id,
        }));

        const { error: tagError } = await supabase
          .from("blog_post_tags")
          .insert(tagInserts);

        if (tagError) throw tagError;
      }

      toast.success(
        formData.id
          ? "Blog post updated successfully"
          : "Blog post created successfully"
      );
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
      const {
        data: { user },
      } = await supabase.auth.getUser();

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

    // Get article tags from blog_post_tags if available
    const articleTags = blog.blog_post_tags?.map(t => t.tag.name) || [];

    // Parse meta_keywords into an array if it exists
    const keywordsArray = blog.meta_keywords 
      ? blog.meta_keywords.split(',').map(k => k.trim()).filter(k => k)
      : [];

    // Format the publish_date to datetime-local input format if it exists
    const formattedPublishDate = blog.publish_date 
      ? new Date(blog.publish_date).toISOString().slice(0, 16)
      : null;

    const transformedData = {
      ...blog,
      category_id: blog.category_id,
      tag_ids: blog.tags?.map((t) => t.tag.id) || [],
      article_tags: articleTags,
      author: blog.author || hrUser?.name || hrUser?.username || "PAAN Admin",
      publish_option: blog.is_published
        ? "publish"
        : blog.publish_date
        ? "schedule"
        : "draft",
      scheduled_date: formattedPublishDate,
      publish_date: formattedPublishDate,
      title: blog.meta_title || "",
      description: blog.meta_description || "",
      keywords: keywordsArray,
      meta_keywords: blog.meta_keywords || "",
      article_image: blog.article_image || "",
      featured_image_url: blog.article_image || "",
      featured_image_upload: "",
      featured_image_library: blog.article_image || "",
      content: blog.article_body || "",
      article_body: blog.article_body || "",
      focus_keyword: blog.focus_keyword || "",
    };


    setFormData(transformedData);
    setEditorContent(blog.article_body || "");
  };

  const updateFilters = (newFilters) => {
    setFilters((prev) => ({
      ...prev,
      ...newFilters,
    }));
  };

  const handleCategoryAdded = async (newCategory) => {
    try {
      await fetchCategories();
      setFormData((prev) => ({
        ...prev,
        category_id: newCategory.id,
      }));
    } catch (error) {
      console.error("Error handling category addition:", error);
    }
  };

  const handleTagAdded = async (newTag) => {
    try {
      await fetchTags();
      setFormData((prev) => ({
        ...prev,
        tag_ids: [...(prev.tag_ids || []), newTag.id],
      }));
    } catch (error) {
      console.error("Error handling tag addition:", error);
    }
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
    editorContent,
    setEditorContent,
    categories,
    tags,
    hrUser,
    handleCategoryAdded,
    handleTagAdded,
    fetchBlogs,
  };
};
