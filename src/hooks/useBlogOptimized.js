// Optimized useBlog hook with pagination and performance improvements
import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import toast from "react-hot-toast";
import { startTimer, endTimer } from "@/utils/performanceMonitor";

const ITEMS_PER_PAGE = 12;

export const useBlogOptimized = () => {
  const [blogs, setBlogs] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [tags, setTags] = useState([]);
  
  // Fetch blogs with pagination and optimized queries
  const fetchBlogs = useCallback(async (page = 1, filters = {}) => {
    try {
      setLoading(true);
      startTimer('fetch-blogs');

      const from = (page - 1) * ITEMS_PER_PAGE;
      const to = from + ITEMS_PER_PAGE - 1;

      // Build query with only needed columns
      let query = supabase
        .from("blogs")
        .select(`
          id,
          article_name,
          slug,
          article_image,
          created_at,
          updated_at,
          is_published,
          is_draft,
          category:blog_categories!inner(id, name),
          author_details:hr_users(name, username)
        `, { count: 'exact' })
        .range(from, to)
        .order('created_at', { ascending: false });

      // Apply filters
      if (filters.category && filters.category !== 'All') {
        query = query.eq('blog_categories.name', filters.category);
      }

      if (filters.status && filters.status !== 'All') {
        if (filters.status === 'published') {
          query = query.eq('is_published', true);
        } else if (filters.status === 'draft') {
          query = query.eq('is_published', false);
        }
      }

      if (filters.search) {
        query = query.ilike('article_name', `%${filters.search}%`);
      }

      const { data, error, count } = await query;

      if (error) throw error;

      setBlogs(data || []);
      setTotalCount(count || 0);
      setCurrentPage(page);

      endTimer('fetch-blogs');
    } catch (error) {
      console.error("Error fetching blogs:", error);
      toast.error("Failed to fetch blog posts");
      endTimer('fetch-blogs');
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch single blog with full details
  const fetchBlogById = useCallback(async (id) => {
    try {
      startTimer('fetch-single-blog');
      
      const { data, error } = await supabase
        .from("blogs")
        .select(`
          *,
          category:blog_categories(id, name),
          tags:blog_post_tags(
            tag:blog_tags(id, name)
          ),
          author_details:hr_users(name, username)
        `)
        .eq('id', id)
        .single();

      if (error) throw error;

      endTimer('fetch-single-blog');
      return data;
    } catch (error) {
      console.error("Error fetching blog:", error);
      toast.error("Failed to fetch blog post");
      endTimer('fetch-single-blog');
      return null;
    }
  }, []);

  // Fetch categories (cached)
  const fetchCategories = useCallback(async () => {
    try {
      startTimer('fetch-categories');
      
      const { data, error } = await supabase
        .from("blog_categories")
        .select("id, name, slug")
        .order("name");

      if (error) throw error;
      
      setCategories(data || []);
      endTimer('fetch-categories');
    } catch (error) {
      console.error("Error fetching categories:", error);
      toast.error("Failed to fetch categories");
      endTimer('fetch-categories');
    }
  }, []);

  // Fetch tags (cached)
  const fetchTags = useCallback(async () => {
    try {
      startTimer('fetch-tags');
      
      const { data, error } = await supabase
        .from("blog_tags")
        .select("id, name, slug")
        .order("name");

      if (error) throw error;
      
      setTags(data || []);
      endTimer('fetch-tags');
    } catch (error) {
      console.error("Error fetching tags:", error);
      toast.error("Failed to fetch tags");
      endTimer('fetch-tags');
    }
  }, []);

  // Delete blog
  const deleteBlog = useCallback(async (id) => {
    try {
      startTimer('delete-blog');
      
      const { error } = await supabase
        .from("blogs")
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast.success("Blog deleted successfully");
      endTimer('delete-blog');
      
      // Refresh current page
      await fetchBlogs(currentPage);
    } catch (error) {
      console.error("Error deleting blog:", error);
      toast.error("Failed to delete blog");
      endTimer('delete-blog');
    }
  }, [currentPage, fetchBlogs]);

  // Initial load
  useEffect(() => {
    fetchBlogs(1);
    fetchCategories();
    fetchTags();
  }, [fetchBlogs, fetchCategories, fetchTags]);

  return {
    blogs,
    totalCount,
    currentPage,
    itemsPerPage: ITEMS_PER_PAGE,
    totalPages: Math.ceil(totalCount / ITEMS_PER_PAGE),
    loading,
    categories,
    tags,
    fetchBlogs,
    fetchBlogById,
    deleteBlog,
    setCurrentPage,
  };
};

export default useBlogOptimized;
