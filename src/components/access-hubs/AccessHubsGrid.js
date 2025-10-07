import { useState } from "react";
import { motion } from "framer-motion";
import { Icon } from "@iconify/react";
import ItemActionModal from "../ItemActionModal";
import DataTable from "../common/DataTable";
import DataGrid from "../common/DataGrid";
import Image from "next/image";
import { formatDistanceToNow } from "date-fns";
import toast from "react-hot-toast";

export default function AccessHubsGrid({
  mode,
  accessHubs,
  loading,
  selectedIds,
  setSelectedIds,
  handleEditClick,
  handleDelete,
  handleViewRegistrations,
  currentPage,
  setCurrentPage,
  itemsPerPage,
  viewMode = "grid",
  setViewMode,
  filterTerm = "",
  selectedCategory = "All",
  selectedTier = "All",
  selectedType = "All",
  selectedRegion = "All",
  selectedLocation = "All",
  selectedVirtual = "All",
  selectedDateRange = "All"
}) {
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [accessHubToDelete, setAccessHubToDelete] = useState(null);

  const handleSelectAll = (checked) => {
    if (checked) {
      setSelectedIds(accessHubs.map(accessHub => accessHub.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectItem = (id) => {
    setSelectedIds(prev => {
      if (prev.includes(id)) {
        return prev.filter(itemId => itemId !== id);
      }
      return [...prev, id];
    });
  };

  const handleLoadMore = () => {
    setCurrentPage(prev => prev + 1);
  };

  const handleBulkDelete = async (selectedIds) => {
    try {
      // Find the access hub items by their IDs
      const itemsToDelete = accessHubs.filter(item => selectedIds.includes(item.id));
      
      // Delete each item
      for (const item of itemsToDelete) {
        await handleDelete(item);
      }
      
      // Clear selection after successful deletion
      setSelectedIds([]);
    } catch (error) {
      console.error('Error deleting access hub items:', error);
    }
  };

  const confirmDelete = async () => {
    if (accessHubToDelete) {
      try {
        await handleDelete(accessHubToDelete.id);
        setIsDeleteModalOpen(false);
        setAccessHubToDelete(null);
      } catch (error) {
        console.error('Error deleting access hub:', error);
        toast.error('Failed to delete access hub');
      }
    }
  };

  const filteredAccessHubs = accessHubs?.filter((accessHub) => {
    const matchesSearch =
      !filterTerm ||
      accessHub.title.toLowerCase().includes(filterTerm.toLowerCase()) ||
      accessHub.description.toLowerCase().includes(filterTerm.toLowerCase());

    const matchesCategory =
      selectedCategory === "All" || accessHub.category === selectedCategory;

    const matchesTier =
      selectedTier === "All" || accessHub.tier_restriction === selectedTier;

    const matchesType = selectedType === "All" || accessHub.space_type === selectedType;

    const matchesLocation =
      selectedLocation === "All" || 
      accessHub.city === selectedLocation || 
      accessHub.country === selectedLocation;

    const matchesAvailability =
      selectedVirtual === "All" || 
      (selectedVirtual === "Available" && accessHub.is_available) ||
      (selectedVirtual === "Unavailable" && !accessHub.is_available);

    return (
      matchesSearch &&
      matchesCategory &&
      matchesTier &&
      matchesType &&
      matchesLocation &&
      matchesAvailability
    );
  }) || [];

  const totalItems = currentPage * itemsPerPage;
  const paginatedAccessHubs = filteredAccessHubs.slice(0, totalItems);
  const hasMore = filteredAccessHubs.length > totalItems;
  const remainingCount = filteredAccessHubs.length - paginatedAccessHubs.length;

  const getAccessHubStatus = (isAvailable) => {
    if (isAvailable) {
      return {
        label: "Available",
        color: "text-green-800 dark:text-green-300",
        bgColor: "bg-green-100 dark:bg-green-900/30",
      };
    } else {
      return {
        label: "Unavailable",
        color: "text-red-800 dark:text-red-300",
        bgColor: "bg-red-100 dark:bg-red-900/30",
      };
    }
  };

  const formatPrice = (price) => {
    const numericPrice = parseFloat(price) || 0;
    if (numericPrice === 0) return "Free";
    return `$${numericPrice.toFixed(2)}/day`;
  };

  const renderAccessHubCard = (accessHub) => {
    const accessHubStatus = getAccessHubStatus(accessHub.is_available);

    return (
      <>
        {/* Header with Image */}
        <div className="relative w-full h-48">
          {accessHub.images && accessHub.images.length > 0 ? (
            <>
              <div className="relative w-full h-full">
                <Image
                  src={accessHub.images[0]}
                  alt={accessHub.title}
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  className="object-cover rounded-t-xl"
                  unoptimized={true}
                  priority={true}
                  onError={(e) => {
                    console.error('[AccessHubsGrid] Image load error:', {
                      url: accessHub.images[0],
                      accessHubId: accessHub.id,
                      accessHubTitle: accessHub.title,
                      error: e,
                      target: e.target,
                      naturalWidth: e.target.naturalWidth,
                      naturalHeight: e.target.naturalHeight,
                      currentSrc: e.target.currentSrc
                    });
                    e.target.style.display = 'none';
                    e.target.parentElement.classList.add('bg-gray-100');
                    e.target.parentElement.innerHTML = `
                      <div class="w-full h-full flex items-center justify-center">
                        <svg class="w-12 h-12 opacity-50" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        </svg>
                      </div>
                    `;
                  }}
                  onLoad={(e) => {
                    console.log('[AccessHubsGrid] Image loaded successfully:', {
                      url: accessHub.images[0],
                      accessHubId: accessHub.id,
                      accessHubTitle: accessHub.title,
                      naturalWidth: e.target.naturalWidth,
                      naturalHeight: e.target.naturalHeight,
                      currentSrc: e.target.currentSrc
                    });
                  }}
                />
                {/* Debug info */}
                <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-xs p-1 opacity-0 hover:opacity-100 transition-opacity">
                  {accessHub.images[0]}
                </div>
              </div>
              {/* Fallback image */}
              <Image
                src={accessHub.images[0]}
                alt={accessHub.title}
                className="hidden"
                width={400}
                height={200}
                onError={(e) => {
                  console.error('[AccessHubsGrid] Fallback image failed:', {
                    url: accessHub.images[0],
                    accessHubId: accessHub.id,
                    accessHubTitle: accessHub.title,
                    error: e,
                    target: e.target,
                    naturalWidth: e.target.naturalWidth,
                    naturalHeight: e.target.naturalHeight,
                    currentSrc: e.target.currentSrc
                  });
                }}
                onLoad={(e) => {
                    console.log('[AccessHubsGrid] Fallback image loaded:', {
                    url: accessHub.images[0],
                    accessHubId: accessHub.id,
                    accessHubTitle: accessHub.title,
                    naturalWidth: e.target.naturalWidth,
                    naturalHeight: e.target.naturalHeight,
                    currentSrc: e.target.currentSrc
                  });
                }}
              />
            </>
          ) : (
            <div
              className={`w-full h-full flex items-center justify-center ${
                mode === "dark" ? "bg-gray-700" : "bg-gray-100"
              }`}
            >
              <Icon
                icon="heroicons:calendar"
                className="w-12 h-12 opacity-50"
              />
            </div>
          )}
          <div
            className={`absolute inset-0 bg-gradient-to-t ${
              mode === "dark"
                ? "from-gray-900/80 to-transparent"
                : "from-gray-900/60 to-transparent"
            }`}
          />
          <div className="absolute top-4 right-4">
            <span
                className={`px-3 py-1 rounded-full text-xs font-medium ${accessHubStatus.color} ${accessHubStatus.bgColor}`}
            >
              {accessHubStatus.label}
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 pb-4">
          <div className="mb-4">
            <h3 className="font-semibold text-lg mb-1 truncate pr-6 max-w-full">
              {accessHub.title} 
            </h3>
          </div>

          {/* Space Type and Location */}
          <div className="flex flex-col gap-2 mb-4">
            <div className="flex items-center gap-2 text-sm">
              <Icon icon="heroicons:building-office" className="w-4 h-4" />
              <span>{accessHub.space_type}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Icon icon="heroicons:map-pin" className="w-4 h-4" />
              <span>
                {accessHub.city && accessHub.country 
                  ? `${accessHub.city}, ${accessHub.country}`
                  : accessHub.city || accessHub.country || "Location TBD"
                }
              </span>
            </div>
          </div>

          {/* Capacity and Pricing */}
          <div className="flex flex-wrap items-center align-middle gap-4 mb-4 text-sm text-gray-600 dark:text-gray-300">
            <div className="flex items-center gap-1">
              <Icon icon="heroicons:users" className="w-4 h-4" />
              <span>Capacity: {accessHub.capacity}</span>
            </div>
            <div className="flex items-center gap-1">
              <Icon icon="heroicons:currency-dollar" className="w-4 h-4" />
              <span>{formatPrice(accessHub.pricing_per_day)}</span>
            </div>
          </div>
        </div>

        {/* Description */}
        <div className="px-6 pb-6 flex-grow">
          <div
            className={`text-sm leading-relaxed mb-6 line-clamp-3 text-gray-600 dark:text-gray-300`}
            dangerouslySetInnerHTML={{ __html: accessHub.description }}
          />

          {/* Tier Restriction */}
          <div className="flex flex-wrap gap-2">
            <span
              className={`px-2 py-1 rounded-md text-xs font-medium ${
                mode === "dark"
                  ? "bg-blue-900/50 text-blue-300"
                  : "bg-blue-100 text-blue-700"
              }`}
            >
              {accessHub.tier_restriction}
            </span>
          </div>
        </div>

        {/* Footer */}
        <div
          className={`px-6 py-4 border-t flex items-center justify-between ${
            mode === "dark"
              ? "bg-gray-800/40 border-gray-700"
              : "bg-gray-50 border-gray-200"
          }`}
        >
          <div className="flex items-center gap-2 text-sm font-medium">
            <span className="flex items-center text-gray-500">
              <Icon icon="heroicons:building-office" className="w-4 h-4 mr-1" />
              {accessHub.space_type}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => handleViewRegistrations(accessHub)}
              className="p-2 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 text-blue-600 dark:text-blue-400 transition"
              title="View registrations"
            >
              <Icon icon="heroicons:user-group" className="w-4 h-4" />
            </button>
            <button
              onClick={() => handleEditClick(accessHub)}
              className="p-2 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 text-blue-600 dark:text-blue-400 transition"
              title="Edit access hub"
            >
              <Icon icon="heroicons:pencil-square" className="w-4 h-4" />
            </button>
            <button
              onClick={() => {
                setAccessHubToDelete(accessHub);
                setIsDeleteModalOpen(true);
              }}
              className="p-2 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 text-red-600 dark:text-red-400 transition"
              title="Delete access hub"
            >
              <Icon icon="heroicons:trash" className="w-4 h-4" />
            </button>
          </div>
        </div>
      </>
    );
  };

  if (loading) {
    return (
      <div className="p-12 text-center">
        <div
          className={`w-16 h-16 mx-auto rounded-full flex items-center justify-center mb-4 animate-pulse ${
            mode === "dark" ? "bg-blue-900/30" : "bg-blue-100"
          }`}
        >
          <Icon
            icon="eos-icons:loading"
            className={`h-8 w-8 ${
              mode === "dark" ? "text-blue-300" : "text-blue-500"
            } animate-spin`}
          />
        </div>
        <h3 className="mt-2 text-lg font-medium">
          Loading access hubs...
        </h3>
      </div>
    );
  }

  if (filteredAccessHubs.length === 0) {
    return (
      <div className="p-12 text-center">
        <div
          className={`w-16 h-16 mx-auto rounded-full flex items-center justify-center mb-4 ${
            mode === "dark" ? "bg-blue-900/30" : "bg-blue-100"
          }`}
        >
          <Icon
            icon="heroicons:document-text"
            className={`h-8 w-8 ${
              mode === "dark" ? "text-blue-300" : "text-blue-500"
            }`}
          />
        </div>
        <h3 className="mt-2 text-lg font-medium">
          No access hubs found
        </h3>
        <p
          className={`mt-2 text-sm max-w-md mx-auto ${
            mode === "dark" ? "text-gray-400" : "text-gray-500"
          }`}
        >
          {filterTerm ||
          selectedCategory !== "All" ||
          selectedTier !== "All" ||
          selectedType !== "All" ||
          selectedRegion !== "All"
            ? "Try adjusting your filters"
            : "Create your first access hub"}
        </p>
      </div>
    );
  }

  const tableColumns = [
    {
      key: "title",
      label: "Title",
    },
    {
      key: "type",
      label: "Type",
      render: (accessHub) => (
        <span
          className={`px-2 py-1 rounded-lg text-xs font-medium ${
            mode === "dark"
              ? "bg-blue-900/50 text-blue-300"
              : "bg-blue-100 text-blue-700"
          }`}
        >
          {accessHub.space_type}
        </span>
      ),
    },
    {
      key: "tier_restriction",
      label: "Tier",
      render: (accessHub) => (
        <span
          className={`px-2 py-1 rounded-lg text-xs font-medium ${
            mode === "dark"
              ? "bg-blue-900/50 text-blue-300"
              : "bg-blue-100 text-blue-700"
          }`}
        >
          {accessHub.tier_restriction}
          </span>
        ),
    },
    {
      key: "created_at",
      label: "Created",
      render: (accessHub) => new Date(accessHub.created_at).toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      }),
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.4 }}
      className="mb-12"
    >
      {viewMode === "table" ? (
        <DataTable
          data={paginatedAccessHubs}
          columns={tableColumns}
          selectedItems={selectedIds}
          onSelectAll={handleSelectAll}
          onSelectItem={handleSelectItem}
          onDelete={handleDelete}
          onBulkDelete={handleBulkDelete}
          onEdit={handleEditClick}
          mode={mode}
          hasMore={hasMore}
          onLoadMore={handleLoadMore}
          remainingCount={remainingCount}
          itemName="access hub"
          customActions={(accessHub) => (
            <>
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleViewRegistrations(accessHub);
                }}
                className="p-2 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 text-blue-600 dark:text-blue-400 transition"
                title="View registrations"
              >
                <Icon icon="heroicons:user-group" className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleEditClick(accessHub)}
                className="p-2 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 text-blue-600 dark:text-blue-400 transition"
                title="Edit access hub"
              >
                <Icon icon="heroicons:pencil-square" className="w-4 h-4" />
              </button>
              <button
                onClick={() => {
                  setAccessHubToDelete(accessHub);
                  setIsDeleteModalOpen(true);
                }}
                className="p-2 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 text-red-600 dark:text-red-400 transition"
                title="Delete access hub"
              >
                <Icon icon="heroicons:trash" className="w-4 h-4" />
              </button>
            </>
          )}
        />
      ) : (
        <DataGrid
            data={paginatedAccessHubs}
          renderCard={renderAccessHubCard}
          mode={mode}
          hasMore={hasMore}
          onLoadMore={handleLoadMore}
          remainingCount={remainingCount}
        />
      )}

      {/* Delete Modal */}
      <ItemActionModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setAccessHubToDelete(null);
        }}
        title="Confirm Deletion"
        mode={mode}
      >
        <div className="space-y-6">
          <p
            className={`text-sm ${
              mode === "dark" ? "text-gray-300" : "text-gray-600"
            }`}
          >
            Are you sure you want to delete the access hub{" "}
            <strong>&quot;{accessHubToDelete?.title}&quot;</strong>? This action
            cannot be undone.
          </p>
          <div className="flex justify-end space-x-4">
            <button
              onClick={() => {
                setIsDeleteModalOpen(false);
                setAccessHubToDelete(null);
              }}
              className={`px-6 py-3 text-sm font-medium rounded-xl border transition-all duration-200 flex items-center shadow-sm ${
                mode === "dark"
                  ? "border-gray-600 text-gray-200 bg-gray-800 hover:bg-gray-700"
                  : "border-gray-200 text-gray-700 bg-white hover:bg-gray-50"
              }`}
            >
              <Icon icon="heroicons:x-mark" className="h-4 w-4 mr-2" />
              Cancel
            </button>
            <button
              onClick={confirmDelete}
              className={`px-6 py-3 text-sm font-medium rounded-xl text-white bg-red-600 hover:bg-red-700 transition-all duration-200 flex items-center shadow-sm ${
                mode === "dark" ? "shadow-white/10" : "shadow-gray-200"
              }`}
            >
              <Icon icon="heroicons:trash" className="h-4 w-4 mr-2" />
              Delete
            </button>
          </div>
        </div>
      </ItemActionModal>
    </motion.div>
  );
}
