import { useMemo } from "react";
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
  opportunities = [],
  filterTerm = "",
  sortOrder = "newest",
}) {
  const filteredOpportunities = useMemo(() => {
    if (!opportunities) return [];
    
    return opportunities.filter((opportunity) => {
      if (!opportunity) return false;
      
      const matchesSearch =
        !filterTerm ||
        (opportunity.title && opportunity.title.toLowerCase().includes(filterTerm.toLowerCase())) ||
        (opportunity.description && opportunity.description.toLowerCase().includes(filterTerm.toLowerCase()));
      
      const matchesLocation =
        selectedLocation === "All" || opportunity.location === selectedLocation;
      
      const matchesServiceType =
        !selectedServiceType || 
        !Array.isArray(selectedServiceType) || 
        selectedServiceType.length === 0 || 
        (opportunity.service_type && 
         Array.isArray(selectedServiceType) && 
         selectedServiceType.includes(opportunity.service_type));
      
      const matchesIndustry =
        selectedIndustry === "All" || opportunity.industry === selectedIndustry;
      
      const matchesJobType =
        selectedJobType === "All" || opportunity.job_type === selectedJobType;
      
      const matchesTier =
        selectedTier === "All" || opportunity.tier_restriction === selectedTier;
      
      return matchesSearch && matchesLocation && matchesServiceType && matchesIndustry && matchesJobType && matchesTier;
    }).sort((a, b) => {
      const dateA = new Date(a.created_at);
      const dateB = new Date(b.created_at);
      return sortOrder === "newest" ? dateB - dateA : dateA - dateB;
    });
  }, [
    opportunities,
    filterTerm,
    selectedLocation,
    selectedServiceType,
    selectedIndustry,
    selectedJobType,
    selectedTier,
    sortOrder
  ]);

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
