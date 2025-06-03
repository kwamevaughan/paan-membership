export function filterAndSortOpportunities({
  opportunities,
  filterTerm,
  filterType,
  filterJobType,
  filterProjectType,
  sortOrder,
}) {
  const filteredOpportunities = opportunities.filter((opp) => {
    const matchesTerm =
      opp.title.toLowerCase().includes(filterTerm.toLowerCase()) ||
      opp.description?.toLowerCase().includes(filterTerm.toLowerCase()) ||
      opp.location?.toLowerCase().includes(filterTerm.toLowerCase());

    const matchesTier =
      filterType === "all" ||
      (opp.tier_restriction && opp.tier_restriction.includes(filterType));
    const matchesJobType = filterJobType === "all" || opp.job_type === filterJobType;
    const matchesProjectType =
      filterProjectType === "all" ||
      (opp.job_type === "Agency" && opp.project_type === filterProjectType);
    return matchesTerm && matchesTier && matchesJobType && matchesProjectType;
  });

  return [...filteredOpportunities].sort((a, b) => {
    if (sortOrder === "deadline") {
      return new Date(a.deadline) - new Date(b.deadline);
    } else if (sortOrder === "title") {
      return a.title.localeCompare(b.title);
    } else if (sortOrder === "tier") {
      return (a.tier_restriction || "").localeCompare(b.tier_restriction || "");
    }
    return 0;
  });
}
