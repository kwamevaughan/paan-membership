import SelectFilter from "./common/SelectFilter";

export default function EventFilters({
  selectedCategory,
  onCategoryChange,
  selectedTier,
  onTierChange,
  selectedType,
  onTypeChange,
  selectedRegion,
  onRegionChange,
  selectedEventType,
  onEventTypeChange,
  selectedDateRange,
  onDateRangeChange,
  selectedLocation,
  onLocationChange,
  selectedVirtual,
  onVirtualChange,
  categories = [],
  tiers = [],
  types = [],
  regions = [],
  eventTypes = [],
  dateRanges = [],
  locations = [],
  virtualOptions = [],
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
        id="event-category"
      />

      <SelectFilter
        label="Tier"
        value={selectedTier}
        onChange={onTierChange}
        options={tiers}
        disabled={loading}
        mode={mode}
        id="event-tier"
      />

      <SelectFilter
        label="Type"
        value={selectedType}
        onChange={onTypeChange}
        options={types}
        disabled={loading}
        mode={mode}
        id="event-type"
      />

      <SelectFilter
        label="Region"
        value={selectedRegion}
        onChange={onRegionChange}
        options={regions}
        disabled={loading}
        mode={mode}
        id="event-region"
      />

      <SelectFilter
        label="Event Type"
        value={selectedEventType}
        onChange={onEventTypeChange}
        options={eventTypes}
        disabled={loading}
        mode={mode}
        id="event-event-type"
      />

      <SelectFilter
        label="Date Range"
        value={selectedDateRange}
        onChange={onDateRangeChange}
        options={dateRanges}
        disabled={loading}
        mode={mode}
        id="event-date-range"
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

      <SelectFilter
        label="Virtual"
        value={selectedVirtual}
        onChange={onVirtualChange}
        options={virtualOptions}
        disabled={loading}
        mode={mode}
        id="event-virtual"
      />
    </div>
  );
} 