import SelectFilter from "./common/SelectFilter";

export default function ResourceFilters({
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
    "Associate Member",
    "Full Member",
    "Gold Member",
    "Free Member",
  ];

  const defaultTypes = [
    "Workshop",
    "PDF",
    "Event",
    "Video",
    "Audio",
    "Other",
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <SelectFilter
        label="Tier"
        value={selectedTier}
        onChange={onTierChange}
        options={tiers.length > 0 ? tiers : defaultTiers}
        disabled={loading}
        mode={mode}
        id="resource-tier"
      />

      <SelectFilter
        label="Type"
        value={selectedType}
        onChange={onTypeChange}
        options={types.length > 0 ? types : defaultTypes}
        disabled={loading}
        mode={mode}
        id="resource-type"
      />
    </div>
  );
}