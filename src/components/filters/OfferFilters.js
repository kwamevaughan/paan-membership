import SelectFilter from "./common/SelectFilter";

export default function OfferFilters({
  selectedCategory = "All",
  onCategoryChange,
  selectedTier = "All",
  onTierChange,
  selectedType = "All",
  onTypeChange,
  selectedRegion = "All",
  onRegionChange,
  categories = [],
  tiers = [],
  types = [],
  regions = [],
  mode = "light",
  loading = false,
}) {
  return (
    <>
      <SelectFilter
        id="filter-category"
        label="Category"
        value={selectedCategory}
        onChange={onCategoryChange}
        options={categories}
        mode={mode}
        loading={loading}
      />

      <SelectFilter
        id="filter-tier"
        label="Tier"
        value={selectedTier}
        onChange={onTierChange}
        options={tiers}
        mode={mode}
        loading={loading}
      />

      <SelectFilter
        id="filter-type"
        label="Type"
        value={selectedType}
        onChange={onTypeChange}
        options={types}
        mode={mode}
        loading={loading}
      />

      <SelectFilter
        id="filter-region"
        label="Region"
        value={selectedRegion}
        onChange={onRegionChange}
        options={regions}
        mode={mode}
        loading={loading}
      />
    </>
  );
} 