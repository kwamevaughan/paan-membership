import SelectFilter from "./common/SelectFilter";

export default function OfferFilters({
  selectedTier,
  onTierChange,
  selectedType,
  onTypeChange,
  tiers = [],
  types = [],
  mode = "light",
  loading = false,
}) {
  const defaultTiers = [
    "All",
    "Associate Member",
    "Full Member",
    "Gold Member",
    "Free Member",
  ];

  const defaultTypes = [
    "All",
    "Workshop",
    "Service",
    "Discount",
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <SelectFilter
        label="Tier"
        value={selectedTier}
        onChange={onTierChange}
        options={tiers.length > 0 ? ["All", ...tiers] : defaultTiers}
        disabled={loading}
        mode={mode}
        id="offer-tier"
      />

      <SelectFilter
        label="Type"
        value={selectedType}
        onChange={onTypeChange}
        options={types.length > 0 ? ["All", ...types] : defaultTypes}
        disabled={loading}
        mode={mode}
        id="offer-type"
      />
    </div>
  );
}
