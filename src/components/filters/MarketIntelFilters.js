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
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <SelectFilter
        label="Category"
        value={selectedCategory}
        onChange={onCategoryChange}
        options={categories}
        disabled={loading}
        mode={mode}
        id="market-intel-category"
      />

      <SelectFilter
        label="Tier"
        value={selectedTier}
        onChange={onTierChange}
        options={tiers}
        disabled={loading}
        mode={mode}
        id="market-intel-tier"
      />

      <SelectFilter
        label="Type"
        value={selectedType}
        onChange={onTypeChange}
        options={types}
        disabled={loading}
        mode={mode}
        id="market-intel-type"
      />

      <SelectFilter
        label="Region"
        value={selectedRegion}
        onChange={onRegionChange}
        options={regions}
        disabled={loading}
        mode={mode}
        id="market-intel-region"
      />
    </div>
  );
} 