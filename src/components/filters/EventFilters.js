import SelectFilter from "./common/SelectFilter";

export default function EventFilters({
  selectedTier,
  onTierChange,
  selectedType,
  onTypeChange,
  selectedLocation,
  onLocationChange,
  tiers = [],
  types = [],
  locations = [],
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
    "Networking",
    "Workshop",
    "Conference",
    "Webinar",
    "Training",
    "Other",
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      <SelectFilter
        label="Tier"
        value={selectedTier}
        onChange={onTierChange}
        options={tiers.length > 0 ? tiers : defaultTiers}
        disabled={loading}
        mode={mode}
        id="event-tier"
      />

      <SelectFilter
        label="Type"
        value={selectedType}
        onChange={onTypeChange}
        options={types.length > 0 ? types : defaultTypes}
        disabled={loading}
        mode={mode}
        id="event-type"
      />

      <SelectFilter
        label="Location"
        value={selectedLocation}
        onChange={onLocationChange}
        options={locations}
        disabled={loading}
        mode={mode}
        id="event-location"
      />
    </div>
  );
} 