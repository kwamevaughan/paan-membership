export function filterAndSortBlogs({
  blogs,
  filterTerm,
  selectedCategory,
  selectedTags,
  selectedStatus,
  sortOrder,
}) {
  const filteredBlogs = blogs.filter((blog) => {
    const matchesSearch =
      !filterTerm ||
      blog.article_name.toLowerCase().includes(filterTerm.toLowerCase()) ||
      blog.article_body.toLowerCase().includes(filterTerm.toLowerCase());

    const matchesCategory =
      selectedCategory === "All" || blog.article_category === selectedCategory;

    const matchesTags =
      selectedTags.length === 0 ||
      selectedTags.some((tag) => blog.article_tags.includes(tag));

    const matchesStatus = !selectedStatus || (
      (selectedStatus === "published" && blog.is_published) ||
      (selectedStatus === "draft" && blog.is_draft) ||
      (selectedStatus === "scheduled" && blog.publish_date && !blog.is_published)
    );

    return matchesSearch && matchesCategory && matchesTags && matchesStatus;
  });

  return [...filteredBlogs].sort((a, b) => {
    switch (sortOrder) {
      case "newest":
        return new Date(b.created_at) - new Date(a.created_at);
      case "oldest":
        return new Date(a.created_at) - new Date(b.created_at);
      case "a-z":
        return a.article_name.localeCompare(b.article_name);
      case "z-a":
        return b.article_name.localeCompare(a.article_name);
      default:
        return 0;
    }
  });
} 