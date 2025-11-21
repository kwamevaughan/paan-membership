// useBlog.jsx
import { useState, useEffect, useMemo } from "react";
import { supabase } from "@/lib/supabase";
import toast from "react-hot-toast";
import { calculateSEOScore } from '@/utils/seo';

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
          id,
          article_name,
          slug,
          article_image,
          created_at,
          updated_at,
          is_published,
          is_draft,
          category_id,
          category:blog_categories(id, name),
          tags:blog_post_tags(
            tag:blog_tags(id, name)
          ),
          author_details:hr_users(name, username)
        `
        )
        .limit(50)
        .order("created_at", { ascending: false });

      if (error) throw error;

      const transformedData = data.map((blog) => ({
        ...blog,
        article_category: blog.category?.name || null,
        article_tags: blog.tags?.map((t) => t.tag.name) || [],
        author_name: blog.author_details?.name || blog.author_details?.username || 'Unknown'
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

    if (filters.tags && Array.isArray(filters.tags) && filters.tags.length > 0) {
      filtered = filtered.filter((blog) =>
        blog.article_tags && 
        Array.isArray(blog.article_tags) && 
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

    // Apply sorting
    const sortValue = filters.sort || "newest";

    // Create a new array for sorting to avoid mutating the original
    const sortedBlogs = [...filtered].sort((a, b) => {
      switch (sortValue) {
        case "newest":
          return new Date(b.created_at) - new Date(a.created_at);
        case "oldest":
          return new Date(a.created_at) - new Date(b.created_at);
        case "az":
          return (a.article_name || "").toLowerCase().localeCompare((b.article_name || "").toLowerCase());
        case "za":
          return (b.article_name || "").toLowerCase().localeCompare((a.article_name || "").toLowerCase());
        case "category":
          return (a.article_category || "").toLowerCase().localeCompare((b.article_category || "").toLowerCase());
        default:
          return new Date(b.created_at) - new Date(a.created_at);
      }
    });

    setFilteredBlogs(sortedBlogs);
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
    const loadingToast = toast.loading(updatedFormData?.id ? "Updating blog post..." : "Creating blog post...");
    try {
      setLoading(true);
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        throw new Error("Not authenticated");
      }

      console.log('useBlog handleSubmit called with data:', updatedFormData);
      console.log('Editor content state:', editorContent);
      
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

      let finalImageUrl = "";
      if (featured_image_url && featured_image_url.startsWith('http')) {
        finalImageUrl = featured_image_url;
      } else {
        finalImageUrl = featured_image_upload || featured_image_library || article_image || "";
      }

      const finalMetaKeywords = meta_keywords || (keywords ? keywords.join(", ") : "");
      
      // Prioritize the most recent content
      const finalContent = dataToUse.article_body || editorContent || content || "";
      

      // Calculate SEO score
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
        seo_score: calculateSEOScore({
          article_name,
          description,
          slug,
          focus_keyword,
          article_body: finalContent
        }, finalContent),
        updated_at: new Date().toISOString(),
        created_at: id ? undefined : new Date().toISOString(),
      };

      Object.keys(blogToUpsert).forEach((key) => {
        if (blogToUpsert[key] === undefined || blogToUpsert[key] === null) {
          delete blogToUpsert[key];
        }
      });

      console.log('Attempting to upsert blog:', blogToUpsert);

      const { data: blog, error: blogError } = await supabase
        .from("blogs")
        .upsert(blogToUpsert)
        .select()
        .single();

      if (blogError) throw blogError;

      console.log('Blog upsert successful:', blog);

      // Delete ALL existing tags for this blog
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

      await fetchBlogs();
      console.log('Blog operation completed successfully');
      
      // Update the loading toast to success
      toast.success(updatedFormData?.id ? "Blog post updated successfully!" : "Blog post created successfully!", {
        id: loadingToast,
      });
      
      return true; // Explicitly return true on success
    } catch (error) {
      console.error("Error saving blog:", error);
      // Update the loading toast to error
      toast.error("Failed to save blog post", {
        id: loadingToast,
      });
      return false; // Return false on error
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
    if (!blog) return;

    // Transform the blog data to match the form structure
    const transformedData = {
      id: blog.id,
      article_name: blog.article_name || "",
      article_body: blog.article_body || "",
      category_id: blog.category_id || null,
      tag_ids: blog.blog_post_tags?.map(pt => pt.blog_tags?.id) || [],
      article_image: blog.article_image || "",
      meta_title: blog.meta_title || "",
      meta_description: blog.meta_description || "",
      meta_keywords: blog.meta_keywords || "",
      slug: blog.slug || "",
      is_published: blog.is_published || false,
      is_draft: blog.is_draft || true,
      publish_date: blog.publish_date || null,
      author: blog.author_details?.name || blog.author_details?.username || "PAAN Admin",
      title: blog.article_name || "",
      description: blog.meta_description || "",
      keywords: blog.meta_keywords ? blog.meta_keywords.split(",").map(k => k.trim()) : [],
      featured_image_url: blog.article_image || "",
      featured_image_upload: null,
      featured_image_library: blog.article_image || null,
      content: blog.article_body || "",
      publish_option: blog.is_published ? "publish" : "draft",
      scheduled_date: blog.publish_date || null,
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
