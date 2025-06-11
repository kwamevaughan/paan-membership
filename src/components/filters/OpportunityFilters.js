import SelectFilter from "./common/SelectFilter";

export default function OpportunityFilters({
  selectedLocation,
  onLocationChange,
  selectedServiceType,
  onServiceTypeChange,
  selectedIndustry,
  onIndustryChange,
  selectedJobType,
  onJobTypeChange,
  selectedTier,
  onTierChange,
  locations = [],
  serviceTypes = [],
  industries = [],
  jobTypes = [],
  tiers = [],
  mode = "light",
  loading = false,
}) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 w-full">
      <div className="w-full">
        <SelectFilter
          label="Location"
          value={selectedLocation}
          onChange={onLocationChange}
          options={locations}
          disabled={loading}
          mode={mode}
          id="opportunities-location"
        />
      </div>

      <div className="w-full">
        <SelectFilter
          label="Service Type"
          value={selectedServiceType}
          onChange={onServiceTypeChange}
          options={serviceTypes}
          disabled={loading}
          mode={mode}
          id="opportunities-service-type"
          isMulti={true}
        />
      </div>

      <div className="w-full">
        <SelectFilter
          label="Industry"
          value={selectedIndustry}
          onChange={onIndustryChange}
          options={industries}
          disabled={loading}
          mode={mode}
          id="opportunities-industry"
        />
      </div>

      <div className="w-full">
        <SelectFilter
          label="Job Type"
          value={selectedJobType}
          onChange={onJobTypeChange}
          options={jobTypes}
          disabled={loading}
          mode={mode}
          id="opportunities-job-type"
        />
      </div>

      <div className="w-full">
        <SelectFilter
          label="Tier"
          value={selectedTier}
          onChange={onTierChange}
          options={tiers}
          disabled={loading}
          mode={mode}
          id="opportunities-tier"
        />
      </div>
    </div>
  );
}
