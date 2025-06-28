import SelectFilter from "./common/SelectFilter";

export default function AccessHubFilters({
  selectedTier,
  onTierChange,
  selectedSpaceType,
  onSpaceTypeChange,
  selectedLocation,
  onLocationChange,
  tiers = [],
  spaceTypes = [],
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

  const defaultSpaceTypes = ["Networking", "Workshop", "Conference", "Webinar"];

  const defaultLocations = ["All", "Kenya", "Nigeria", "Ghana", "Tanzania", "Uganda", "Rwanda", "Other"];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      <SelectFilter
        label="Tier"
        value={selectedTier}
        onChange={onTierChange}
        options={tiers.length > 0 ? tiers : defaultTiers}
        disabled={loading}
        mode={mode}
        id="access-hub-tier"
      />

      <SelectFilter
        label="Space Type"
        value={selectedSpaceType}
        onChange={onSpaceTypeChange}
        options={spaceTypes.length > 0 ? spaceTypes : defaultSpaceTypes}
        disabled={loading}
        mode={mode}
        id="access-hub-space-type"
      />

      <SelectFilter
        label="Location"
        value={selectedLocation}
        onChange={onLocationChange}
        options={locations.length > 0 ? locations : defaultLocations}
        disabled={loading}
        mode={mode}
        id="access-hub-location"
      />
    </div>
  );
}
