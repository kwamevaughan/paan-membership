import SelectFilter from "./common/SelectFilter";

export default function BlogFilters({
  selectedCategory,
  onCategoryChange,
  selectedTags,
  onTagsChange,
  selectedStatus,
  onStatusChange,
  selectedAuthor,
  onAuthorChange,
  dateRange,
  onDateRangeChange,
  categories = [],
  tags = [],
  statuses = [],
  authors = [],
  dateRanges = [],
  mode = "light",
  loading = false,
}) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 w-full">
      <div className="w-full">
        <SelectFilter
          label="Category"
          value={selectedCategory}
          onChange={onCategoryChange}
          options={categories}
          disabled={loading}
          mode={mode}
          id="blog-category"
        />
      </div>

      <div className="w-full">
        <SelectFilter
          label="Tags"
          value={selectedTags}
          onChange={onTagsChange}
          options={tags}
          disabled={loading}
          mode={mode}
          id="blog-tags"
          isMulti={true}
        />
      </div>

      <div className="w-full">
        <SelectFilter
          label="Status"
          value={selectedStatus}
          onChange={onStatusChange}
          options={statuses}
          disabled={loading}
          mode={mode}
          id="blog-status"
        />
      </div>

      <div className="w-full">
        <SelectFilter
          label="Author"
          value={selectedAuthor}
          onChange={onAuthorChange}
          options={authors}
          disabled={loading}
          mode={mode}
          id="blog-author"
        />
      </div>

      <div className="w-full">
        <SelectFilter
          label="Date Range"
          value={dateRange}
          onChange={onDateRangeChange}
          options={dateRanges}
          disabled={loading}
          mode={mode}
          id="blog-date-range"
        />
      </div>
    </div>
  );
} 