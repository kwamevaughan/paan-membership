import { useState } from "react";
import { motion } from "framer-motion";
import { Icon } from "@iconify/react";
import ItemActionModal from "../ItemActionModal";
import DataTable from "../common/DataTable";
import DataGrid from "../common/DataGrid";
import Image from "next/image";
import { formatDistanceToNow } from "date-fns";
import toast from "react-hot-toast";

export default function EventsGrid({
  mode,
  events,
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
  selectedEventType = "All",
  selectedLocation = "All",
  selectedVirtual = "All",
  selectedDateRange = "All"
}) {
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [eventToDelete, setEventToDelete] = useState(null);

  const handleSelectAll = (checked) => {
    if (checked) {
      setSelectedIds(events.map(event => event.id));
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
      // Find the event items by their IDs
      const itemsToDelete = events.filter(item => selectedIds.includes(item.id));
      
      // Delete each item
      for (const item of itemsToDelete) {
        await handleDelete(item);
      }
      
      // Clear selection after successful deletion
      setSelectedIds([]);
    } catch (error) {
      console.error('Error deleting event items:', error);
    }
  };

  const confirmDelete = async () => {
    if (eventToDelete) {
      try {
        await handleDelete(eventToDelete.id);
        setIsDeleteModalOpen(false);
        setEventToDelete(null);
      } catch (error) {
        console.error('Error deleting event:', error);
        toast.error('Failed to delete event');
      }
    }
  };

  const filteredEvents = events?.filter((event) => {
      const matchesSearch =
        !filterTerm ||
      event.title.toLowerCase().includes(filterTerm.toLowerCase()) ||
      event.description.toLowerCase().includes(filterTerm.toLowerCase());

      const matchesCategory =
      selectedCategory === "All" || event.category === selectedCategory;

      const matchesTier =
      selectedTier === "All" || event.tier_restriction === selectedTier;

    const matchesType = selectedType === "All" || event.event_type === selectedType;

      const matchesRegion =
      selectedRegion === "All" || event.location === selectedRegion;

    const matchesEventType =
      selectedEventType === "All" || event.event_type === selectedEventType;

    const matchesLocation =
      selectedLocation === "All" || event.location === selectedLocation;

    const matchesVirtual =
      selectedVirtual === "All" || 
      (selectedVirtual === "Virtual" && event.is_virtual) ||
      (selectedVirtual === "In-Person" && !event.is_virtual);

    const matchesDateRange = (() => {
      if (selectedDateRange === "All") return true;
      const eventDate = new Date(event.start_date);
      const now = new Date();
      const thirtyDaysFromNow = new Date(now.setDate(now.getDate() + 30));
      const ninetyDaysFromNow = new Date(now.setDate(now.getDate() + 60));

      switch (selectedDateRange) {
        case "Today":
          return eventDate.toDateString() === new Date().toDateString();
        case "This Week":
          const weekStart = new Date(now.setDate(now.getDate() - now.getDay()));
          const weekEnd = new Date(now.setDate(now.getDate() + 6));
          return eventDate >= weekStart && eventDate <= weekEnd;
        case "Next 30 Days":
          return eventDate <= thirtyDaysFromNow;
        case "Next 90 Days":
          return eventDate <= ninetyDaysFromNow;
        default:
          return true;
      }
    })();

      return (
        matchesSearch &&
        matchesCategory &&
        matchesTier &&
        matchesType &&
      matchesRegion &&
      matchesEventType &&
      matchesLocation &&
      matchesVirtual &&
      matchesDateRange
      );
    }) || [];

  const totalItems = currentPage * itemsPerPage;
  const paginatedEvents = filteredEvents.slice(0, totalItems);
  const hasMore = filteredEvents.length > totalItems;
  const remainingCount = filteredEvents.length - paginatedEvents.length;

  const getEventStatus = (startDate, endDate) => {
    const now = new Date();
    const start = new Date(startDate);
    const end = new Date(endDate);

    if (now < start) {
      return {
        status: "upcoming",
        label: "Upcoming",
        color: mode === "dark" ? "text-blue-400" : "text-blue-600",
        bgColor: mode === "dark" ? "bg-blue-900/30" : "bg-blue-100",
      };
    } else if (now >= start && now <= end) {
      return {
        status: "ongoing",
        label: "Ongoing",
        color: mode === "dark" ? "text-green-400" : "text-green-600",
        bgColor: mode === "dark" ? "bg-green-900/30" : "bg-green-100",
      };
    } else {
      return {
        status: "past",
        label: "Past",
        color: mode === "dark" ? "text-gray-400" : "text-gray-600",
        bgColor: mode === "dark" ? "bg-gray-800" : "bg-gray-100",
      };
    }
  };

  const getTimeRemaining = (endDate) => {
    const now = new Date();
    const end = new Date(endDate);
    const diff = end - now;

    if (diff <= 0) return null;

    const months = Math.floor(diff / (1000 * 60 * 60 * 24 * 30));
    const days = Math.floor((diff % (1000 * 60 * 60 * 24 * 30)) / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

    if (months > 0) {
      return `${months} month${months !== 1 ? 's' : ''} ${days} day${days !== 1 ? 's' : ''} left`;
    } else if (days > 0) {
      return `${days} day${days !== 1 ? 's' : ''} ${hours} hour${hours !== 1 ? 's' : ''} left`;
    } else {
      return `${hours} hour${hours !== 1 ? 's' : ''} left`;
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "No date";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  };

  const formatTime = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  const renderEventCard = (event) => {
    const eventStatus = getEventStatus(event.start_date, event.end_date);
    const timeRemaining = getTimeRemaining(event.end_date);
    const isMultiDay = event.start_date && event.end_date && 
      new Date(event.start_date).toDateString() !== new Date(event.end_date).toDateString();

    return (
      <>
        {/* Header with Image */}
        <div className="relative w-full h-48">
          {event.banner_image ? (
            <>
              <div className="relative w-full h-full">
                <Image
                  src={event.banner_image}
                  alt={event.title}
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  className="object-cover rounded-t-xl"
                  unoptimized={true}
                  priority={true}
                  onError={(e) => {
                    console.error('[EventsGrid] Image load error:', {
                      url: event.banner_image,
                      eventId: event.id,
                      eventTitle: event.title,
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
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                    `;
                  }}
                  onLoad={(e) => {
                    console.log('[EventsGrid] Image loaded successfully:', {
                      url: event.banner_image,
                      eventId: event.id,
                      eventTitle: event.title,
                      naturalWidth: e.target.naturalWidth,
                      naturalHeight: e.target.naturalHeight,
                      currentSrc: e.target.currentSrc
                    });
                  }}
                />
                {/* Debug info */}
                <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-xs p-1 opacity-0 hover:opacity-100 transition-opacity">
                  {event.banner_image}
                </div>
              </div>
              {/* Fallback image */}
              <img
                src={event.banner_image}
                alt={event.title}
                className="hidden"
                onError={(e) => {
                  console.error('[EventsGrid] Fallback image failed:', {
                    url: event.banner_image,
                    eventId: event.id,
                    eventTitle: event.title,
                    error: e,
                    target: e.target,
                    naturalWidth: e.target.naturalWidth,
                    naturalHeight: e.target.naturalHeight,
                    currentSrc: e.target.currentSrc
                  });
                }}
                onLoad={(e) => {
                  console.log('[EventsGrid] Fallback image loaded:', {
                    url: event.banner_image,
                    eventId: event.id,
                    eventTitle: event.title,
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
              className={`px-3 py-1 rounded-full text-xs font-medium ${eventStatus.color} ${eventStatus.bgColor}`}
            >
              {eventStatus.label}
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 pb-4">
          <div className="mb-4">
            <h3 className="font-bold text-lg mb-1 truncate pr-6 max-w-full">
              {event.title} 
            </h3>
          </div>

          {/* Date and Time */}
          <div className="flex flex-col gap-2 mb-4">
            <div className="flex items-center gap-2 text-sm">
              <Icon icon="heroicons:calendar" className="w-4 h-4" />
              <span>
                {isMultiDay ? (
                  <>
                    {formatDate(event.start_date)} - {formatDate(event.end_date)}
                  </>
                ) : (
                  formatDate(event.start_date)
                )}
              </span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Icon icon="heroicons:clock" className="w-4 h-4" />
              <span>
                {formatTime(event.start_date)} - {formatTime(event.end_date)}
              </span>
            </div>
            {timeRemaining && (
              <div className="flex items-center gap-2 text-sm text-blue-500">
                <Icon icon="heroicons:clock" className="w-4 h-4" />
                <span>{timeRemaining}</span>
              </div>
            )}
          </div>

          {/* Type and Region */}
          <div className="flex flex-wrap items-center align-middle gap-2 mb-4 text-sm text-gray-600 dark:text-gray-300">
            <div className="flex items-center gap-1">
              <Icon icon="heroicons:document-text" className="w-4 h-4" />
              <span>{event.event_type}</span>
            </div>
            
          </div>
        </div>

        {/* Description */}
        <div className="px-6 pb-6 flex-grow">
          <div
            className={`text-sm leading-relaxed mb-6 line-clamp-3 text-gray-600 dark:text-gray-300`}
            dangerouslySetInnerHTML={{ __html: event.description }}
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
              {event.tier_restriction}
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
              <Icon icon="heroicons:map-pin" className="w-4 h-4 mr-1" />
              {event.location || "Virtual Event"}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => handleViewRegistrations(event)}
              className="p-2 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 text-blue-600 dark:text-blue-400 transition"
              title="View registrations"
            >
              <Icon icon="heroicons:user-group" className="w-4 h-4" />
            </button>
            <button
              onClick={() => handleEditClick(event)}
              className="p-2 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 text-blue-600 dark:text-blue-400 transition"
              title="Edit event"
            >
              <Icon icon="heroicons:pencil-square" className="w-4 h-4" />
            </button>
            <button
              onClick={() => {
                setEventToDelete(event);
                setIsDeleteModalOpen(true);
              }}
              className="p-2 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 text-red-600 dark:text-red-400 transition"
              title="Delete event"
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
          Loading events...
        </h3>
      </div>
    );
  }

  if (filteredEvents.length === 0) {
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
          No events found
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
            : "Create your first event"}
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
      render: (event) => (
        <span
          className={`px-2 py-1 rounded-lg text-xs font-medium ${
            mode === "dark"
              ? "bg-blue-900/50 text-blue-300"
              : "bg-blue-100 text-blue-700"
          }`}
        >
          {event.event_type}
        </span>
      ),
    },
    {
      key: "tier_restriction",
      label: "Tier",
      render: (event) => (
        <span
          className={`px-2 py-1 rounded-lg text-xs font-medium ${
            mode === "dark"
              ? "bg-blue-900/50 text-blue-300"
              : "bg-blue-100 text-blue-700"
          }`}
        >
          {event.tier_restriction}
          </span>
        ),
    },
    {
      key: "created_at",
      label: "Created",
      render: (event) => new Date(event.created_at).toLocaleDateString("en-US", {
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
          data={paginatedEvents}
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
          itemName="event"
          customActions={(event) => (
            <>
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleViewRegistrations(event);
                }}
                className="p-2 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 text-blue-600 dark:text-blue-400 transition"
                title="View registrations"
              >
                <Icon icon="heroicons:user-group" className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleEditClick(event)}
                className="p-2 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 text-blue-600 dark:text-blue-400 transition"
                title="Edit event"
              >
                <Icon icon="heroicons:pencil-square" className="w-4 h-4" />
              </button>
              <button
                onClick={() => {
                  setEventToDelete(event);
                  setIsDeleteModalOpen(true);
                }}
                className="p-2 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 text-red-600 dark:text-red-400 transition"
                title="Delete event"
              >
                <Icon icon="heroicons:trash" className="w-4 h-4" />
              </button>
            </>
          )}
        />
      ) : (
        <DataGrid
          data={paginatedEvents}
          renderCard={renderEventCard}
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
          setEventToDelete(null);
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
            Are you sure you want to delete the event{" "}
            <strong>&quot;{eventToDelete?.title}&quot;</strong>? This action
            cannot be undone.
          </p>
          <div className="flex justify-end space-x-4">
            <button
              onClick={() => {
                setIsDeleteModalOpen(false);
                setEventToDelete(null);
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
