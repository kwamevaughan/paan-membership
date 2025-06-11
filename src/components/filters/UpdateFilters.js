import SelectFilter from "./common/SelectFilter";

export default function UpdateFilters({
  selectedCategory = "all",
  onCategoryChange,
  selectedTier = "all",
  onTierChange,
  categories = [],
  tiers = [],
  mode = "light",
  loading = false,
}) {
  // Add default "all" option to categories and tiers if not present
  const categoryOptions = [
    { label: "All Categories", value: "all" },
    ...categories.map(cat => ({ label: cat, value: cat }))
  ];

  const tierOptions = [
    { label: "All Tiers", value: "all" },
    { label: "Associate Member", value: "Associate Member" },
    { label: "Full Member", value: "Full Member" },
    { label: "Gold Member", value: "Gold Member" },
    { label: "Free Member", value: "Free Member" }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 w-full">
      <div className="w-full">
        <SelectFilter
          label="Category"
          value={selectedCategory}
          onChange={onCategoryChange}
          options={categoryOptions}
          disabled={loading}
          mode={mode}
          id="updates-category"
        />
      </div>

      <div className="w-full">
        <SelectFilter
          label="Tier"
          value={selectedTier}
          onChange={onTierChange}
          options={tierOptions}
          disabled={loading}
          mode={mode}
          id="updates-tier"
        />
      </div>
    </div>
  );
}
