import { Icon } from "@iconify/react";
import { motion } from "framer-motion";
import DataView from "@/components/common/DataView";
import OfferCard from "./OfferCard";

export default function OffersGrid({
  mode,
  offers,
  loading,
  handleEditClick,
  handleDelete,
  onViewFeedback,
  currentPage,
  setCurrentPage,
  itemsPerPage,
  viewMode,
  setViewMode,
  filterTerm,
  selectedCategory,
  selectedTier,
  selectedType,
  selectedRegion,
  selectedIds = [],
  onSelect,
  onSelectAll,
  isSelectable = false,
}) {
  const filteredOffers = offers?.filter((offer) => {
    const matchesSearch =
      !filterTerm ||
      offer.title.toLowerCase().includes(filterTerm.toLowerCase()) ||
      offer.description.toLowerCase().includes(filterTerm.toLowerCase());
    const matchesCategory =
      selectedCategory === "All" || offer.category === selectedCategory;
    const matchesTier =
      selectedTier === "All" || offer.tier_restriction === selectedTier;
    const matchesType = selectedType === "All" || offer.type === selectedType;
    const matchesRegion =
      selectedRegion === "All" || offer.region === selectedRegion;
    return (
      matchesSearch &&
      matchesCategory &&
      matchesTier &&
      matchesType &&
      matchesRegion
    );
  });

  const sortedOffers = [...(filteredOffers || [])].sort((a, b) => {
    const dateA = new Date(a.created_at);
    const dateB = new Date(b.created_at);
    return dateB - dateA; // Always sort by newest first
  });

  const paginatedOffers = sortedOffers.slice(0, currentPage * itemsPerPage);
  const hasMore = filteredOffers.length > currentPage * itemsPerPage;
  const remainingCount = filteredOffers.length - paginatedOffers.length;

  const handleLoadMore = () => {
    setCurrentPage((prev) => prev + 1);
  };

  const handleViewFeedback = (offer) => {
    if (onViewFeedback) {
      onViewFeedback(offer.id);
    }
  };

  const renderOfferCard = (offer) => (
    <OfferCard
      key={offer.id}
      offer={offer}
      onEdit={() => handleEditClick(offer)}
      onDelete={() => handleDelete(offer.id)}
      onViewFeedback={() => handleViewFeedback(offer)}
      mode={mode}
      isSelected={selectedIds.includes(offer.id)}
      onSelect={() => onSelect(offer.id)}
      isSelectable={isSelectable}
    />
  );

  const tableColumns = [
    {
      key: "title",
      label: "Title",
      render: (offer) => (
        <div className="flex items-center">
          <span className="font-medium">{offer.title}</span>
        </div>
      ),
    },
    {
      key: "category",
      label: "Category",
      render: (offer) => (
        <span
          className={`px-2 py-1 text-xs font-medium rounded-full ${
            mode === "dark"
              ? "bg-blue-900/30 text-blue-300"
              : "bg-blue-100 text-blue-600"
          }`}
        >
          {offer.category}
        </span>
      ),
    },
    {
      key: "tier_restriction",
      label: "Tier",
      render: (offer) => (
        <span
          className={`px-2 py-1 text-xs font-medium rounded-full ${
            mode === "dark"
              ? "bg-blue-900/30 text-blue-300"
              : "bg-blue-100 text-blue-600"
          }`}
        >
          {offer.tier_restriction}
        </span>
      ),
    },
    {
      key: "created_at",
      label: "Added",
      render: (offer) =>
        new Date(offer.created_at).toLocaleDateString("en-US", {
          month: "long",
          day: "numeric",
          year: "numeric",
        }),
    },
  ];

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className={`relative rounded-2xl overflow-hidden border ${
              mode === "dark"
                ? "bg-gray-800/50 border-gray-700"
                : "bg-white border-gray-200"
            }`}
          >
            <div className="h-48 bg-gray-200 dark:bg-gray-700 animate-pulse" />
            <div className="p-6">
              <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-4 animate-pulse" />
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full mb-2 animate-pulse" />
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3 animate-pulse" />
            </div>
            <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4 animate-pulse" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!offers || offers.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-center py-16"
      >
        <Icon
          icon="heroicons:tag"
          className={`mx-auto h-24 w-24 ${
            mode === "dark" ? "text-blue-400" : "text-blue-500"
          }`}
        />
        <h3
          className={`mt-4 text-2xl font-semibold ${
            mode === "dark" ? "text-white" : "text-gray-900"
          }`}
        >
          No Offers Found
        </h3>
        <p
          className={`mt-2 text-sm ${
            mode === "dark" ? "text-gray-400" : "text-gray-500"
          }`}
        >
          {filterTerm ||
          selectedCategory !== "All" ||
          selectedTier !== "All" ||
          selectedType !== "All" ||
          selectedRegion !== "All"
            ? "Try adjusting your filters."
            : "Create a new offer to get started!"}
        </p>
      </motion.div>
    );
  }

  return (
    <DataView
      data={paginatedOffers}
      columns={tableColumns}
      renderCard={renderOfferCard}
      mode={mode}
      loading={loading}
      selectedItems={selectedIds}
      onSelect={onSelect}
      onSelectAll={onSelectAll}
      onDelete={handleDelete}
      onEdit={handleEditClick}
      hasMore={hasMore}
      onLoadMore={handleLoadMore}
      remainingCount={remainingCount}
      itemName="offer"
      viewMode={viewMode}
      onViewModeChange={setViewMode}
      customActions={(offer) => (
        <>
          <button
            onClick={() => handleViewFeedback(offer)}
            className="p-2 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 text-blue-600 dark:text-blue-400 transition"
            title="View feedback"
          >
            <Icon icon="heroicons:chat-bubble-left-right" className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleEditClick(offer)}
            className="p-2 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 text-blue-600 dark:text-blue-400 transition"
            title="Edit offer"
          >
            <Icon icon="heroicons:pencil-square" className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleDelete(offer.id)}
            className="p-2 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 text-red-600 dark:text-red-400 transition"
            title="Delete offer"
          >
            <Icon icon="heroicons:trash" className="w-4 h-4" />
          </button>
        </>
      )}
    />
  );
}