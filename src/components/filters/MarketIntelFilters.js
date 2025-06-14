import SelectFilter from "./common/SelectFilter";

export default function MarketIntelFilters({
  selectedCategory,
  onCategoryChange,
  selectedTier,
  onTierChange,
  selectedType,
  onTypeChange,
  selectedRegion,
  onRegionChange,
  categories = [],
  tiers = [],
  types = [],
  regions = [],
  mode = "light",
  loading = false,
}) {
  const defaultCategories = [
    "Report",
    "Regional Insight",
    "Data Visualization",
    "Downloadable Resource"
  ];

  const defaultTiers = [
    "Associate Member",
    "Full Member",
    "Gold Member",
    "Free Member"
  ];

  const defaultTypes = [
    "Report",
    "Regional Insight",
    "Data Visualization",
    "Downloadable Resource"
  ];

  const defaultRegions = [
    "Global",
    "East Africa",
    "West Africa",
    "Southern Africa",
    "North Africa",
    "Central Africa"
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <SelectFilter
        label="Category"
        value={selectedCategory}
        onChange={onCategoryChange}
        options={categories.length > 0 ? categories : defaultCategories}
        disabled={loading}
        mode={mode}
        id="market-intel-category"
      />

      <SelectFilter
        label="Tier"
        value={selectedTier}
        onChange={onTierChange}
        options={tiers.length > 0 ? tiers : defaultTiers}
        disabled={loading}
        mode={mode}
        id="market-intel-tier"
      />

      <SelectFilter
        label="Type"
        value={selectedType}
        onChange={onTypeChange}
        options={types.length > 0 ? types : defaultTypes}
        disabled={loading}
        mode={mode}
        id="market-intel-type"
      />

      <SelectFilter
        label="Region"
        value={selectedRegion}
        onChange={onRegionChange}
        options={regions.length > 0 ? regions : defaultRegions}
        disabled={loading}
        mode={mode}
        id="market-intel-region"
      />
    </div>
  );
} 