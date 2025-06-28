import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import toast, { Toaster } from "react-hot-toast";
import { Icon } from "@iconify/react";
import HRSidebar from "@/layouts/hrSidebar";
import HRHeader from "@/layouts/hrHeader";
import useSidebar from "@/hooks/useSidebar";
import useLogout from "@/hooks/useLogout";
import useAuthSession from "@/hooks/useAuthSession";
import { useEvents } from "@/hooks/useEvents";
import EventForm from "@/components/events/EventForm";
import EventsGrid from "@/components/events/EventsGrid";
import PendingRegistrations from "@/components/PendingRegistrations";
import SimpleFooter from "@/layouts/simpleFooter";
import { getAdminEventsProps } from "utils/getPropsUtils";
import ItemActionModal from "@/components/ItemActionModal";
import ExportModal from "@/components/ExportModal";
import { supabase } from "@/lib/supabase";
import PageHeader from "@/components/common/PageHeader";
import EventFilters from "@/components/filters/EventFilters";
import BaseFilters from "@/components/filters/BaseFilters";

export default function AdminEvents({
  mode = "light",
  toggleMode,
  tiers = [],
  breadcrumbs,
}) {
  const [showForm, setShowForm] = useState(false);
  const [currentEvent, setCurrentEvent] = useState(null);
  const [showPendingRegistrations, setShowPendingRegistrations] =
    useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [exportData, setExportData] = useState([]);
  const [selectedEventRegistrations, setSelectedEventRegistrations] = useState(null);

  const [viewMode, setViewMode] = useState("grid");
  const [filterTerm, setFilterTerm] = useState("");
  const [sortOrder, setSortOrder] = useState("newest");
  const [showFilters, setShowFilters] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedTier, setSelectedTier] = useState("All");
  const [selectedType, setSelectedType] = useState("All");
  const [selectedRegion, setSelectedRegion] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(12);
  const [selectedIds, setSelectedIds] = useState([]);
  const [selectedEventType, setSelectedEventType] = useState("All");
  const [selectedDateRange, setSelectedDateRange] = useState("All");
  const [selectedLocation, setSelectedLocation] = useState("All");
  const [selectedVirtual, setSelectedVirtual] = useState("All");

  const router = useRouter();

  const {
    isSidebarOpen,
    toggleSidebar,
    sidebarState,
    updateDragOffset,
    isMobile,
    isHovering,
    handleMouseEnter,
    handleMouseLeave,
    handleOutsideClick,
  } = useSidebar();

  const {
    events,
    registeredEvents,
    filterOptions = {
      categories: [],
      tiers: [],
      types: [],
      regions: [],
      eventTypes: [],
      dateRanges: [],
      locations: [],
      virtualOptions: []
    },
    loading: eventsLoading,
    error,
    eventsLoading: registrationLoading,
    handleEventRegistration,
    fetchEvents,
    handleRegistrationAction,
    fetchRegistrations,
    registrations,
    handleInputChange,
    handleSubmit,
    handleDelete,
    formData,
  } = useEvents();

  const handleLogout = useLogout();
  useAuthSession();

  useEffect(() => {
    fetchEvents();
  }, []);

  const handleResetFilters = () => {
    setSelectedType("All");
    setSelectedTier("All");
    setSelectedRegion("All");
    setFilterTerm("");
    setSortOrder("newest");
  };

  const handleCreateEvent = () => {
    setCurrentEvent(null);
    setShowForm(true);
  };

  const handleEditClick = async (event) => {
    setCurrentEvent(event);
    setShowForm(true);
  };

  const handleFormSubmit = async (formData) => {
    const success = await handleSubmit(formData);
    if (success) {
      setShowForm(false);
      setCurrentEvent(null);
      fetchEvents();
    }
  };

  const handleDeleteClick = async (id) => {
    try {
      await handleDelete(id);
      fetchEvents();
    } catch (error) {
      toast.error(error.message);
    }
  };

  const handleViewRegistrations = async (eventData) => {
    try {
      console.log('View registrations clicked for event:', eventData);
      const fetchedRegistrations = await fetchRegistrations();
      console.log('Fetched registrations:', fetchedRegistrations);
      
      // Ensure we have a valid event ID
      if (!eventData || !eventData.id) {
        console.error('Invalid event data:', eventData);
        toast.error('Invalid event data');
        return;
      }

      const eventRegistrations = fetchedRegistrations.filter(reg => {
        console.log('Comparing:', { 
          regEventId: reg.event_id, 
          currentEventId: eventData.id,
          match: reg.event_id === eventData.id 
        });
        return reg.event_id === eventData.id;
      });

      console.log('Filtered registrations for event:', eventRegistrations);
      
      setSelectedEventRegistrations({
        event: {
          id: eventData.id,
          title: eventData.title,
          description: eventData.description,
          start_date: eventData.start_date,
          end_date: eventData.end_date,
          location: eventData.location,
          event_type: eventData.event_type,
          is_virtual: eventData.is_virtual,
          tier_restriction: eventData.tier_restriction
        },
        registrations: eventRegistrations
      });
      setShowPendingRegistrations(true);
    } catch (error) {
      console.error("Error fetching event registrations:", error);
      toast.error("Failed to fetch registrations");
    }
  };

  const handleRegistrationActionClick = async (registrationId, action) => {
    try {
      await handleRegistrationAction(registrationId, action);
      await fetchRegistrations();
    } catch (error) {
      console.error("Error handling registration action:", error);
    }
  };

  const handleViewPendingRegistrations = async () => {
    try {
      const fetchedRegistrations = await fetchRegistrations();
      setSelectedEventRegistrations({
        event: {
          id: 'all',
          title: 'All Events',
          description: 'View all pending registrations',
          start_date: null,
          end_date: null,
          location: null,
          event_type: null,
          is_virtual: null,
          tier_restriction: null
        },
        registrations: fetchedRegistrations
      });
      setShowPendingRegistrations(true);
    } catch (error) {
      console.error("Error fetching registrations:", error);
      toast.error("Failed to fetch registrations");
    }
  };

  return (
    <div
      className={`min-h-screen flex flex-col antialiased ${
        mode === "dark"
          ? "bg-gray-950 text-gray-100"
          : "bg-gray-100 text-gray-900"
      } transition-colors duration-300`}
    >
      
      <HRHeader
        toggleSidebar={toggleSidebar}
        isSidebarOpen={isSidebarOpen}
        sidebarState={sidebarState}
        mode={mode}
        toggleMode={toggleMode}
        onLogout={handleLogout}
        pageName="Events"
        pageDescription="Manage events for the PAAN community."
        breadcrumbs={breadcrumbs}
      />
      <div className="flex flex-1">
        <HRSidebar
          isSidebarOpen={isSidebarOpen}
          mode={mode}
          toggleSidebar={toggleSidebar}
          onLogout={handleLogout}
          setDragOffset={updateDragOffset}
          user={{ name: "PAAN Admin" }}
          isMobile={isMobile}
          isHovering={isHovering}
          handleMouseEnter={handleMouseEnter}
          handleMouseLeave={handleMouseLeave}
          handleOutsideClick={handleOutsideClick}
        />
        <div
          className={`flex-1 transition-all duration-300 ease-in-out ${
            isSidebarOpen ? "md:ml-64" : "md:ml-20"
          } ${sidebarState.hidden ? "ml-0" : ""}`}
          style={{
            marginLeft: sidebarState.hidden
              ? "0px"
              : `${84 + (isSidebarOpen ? 120 : 0) + sidebarState.offset}px`,
          }}
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
            <div className="relative group">
              <div
                className={`absolute inset-0 rounded-2xl backdrop-blur-xl ${
                  mode === "dark"
                    ? "bg-gradient-to-br from-slate-800/60 via-slate-900/40 to-slate-800/60"
                    : "bg-gradient-to-br from-white/80 via-white/20 to-white/80"
                } border ${
                  mode === "dark" ? "border-white/10" : "border-white/20"
                } shadow-2xl group-hover:shadow-lg transition-all duration-500`}
              ></div>
              <PageHeader
                title="Events"
                description="Manage events for the PAAN community. Create targeted content for specific membership tiers and track member engagement."
                mode={mode}
                stats={[
                  {
                    icon: "heroicons:calendar",
                    value: `${events?.length || 0} total events`,
                  },
                  ...(events?.length > 0
                    ? [
                        {
                          icon: "heroicons:clock",
                          value: `Last published ${new Date(
                            events[0].created_at
                          ).toLocaleDateString("en-US", {
                            month: "long",
                            day: "numeric",
                            year: "numeric",
                          })}`,
                          iconColor: "text-purple-500",
                        },
                      ]
                    : []),
                ]}
                actions={[
                  {
                    label: registrationLoading ? "Loading..." : "Pending Registrations",
                    icon: "heroicons:user-group",
                    onClick: handleViewPendingRegistrations,
                    disabled: registrationLoading,
                    variant: "secondary",
                  },
                  {
                    label: "New Event",
                    icon: "heroicons:plus",
                    onClick: handleCreateEvent,
                    variant: "primary",
                  },
                ]}
              />
            </div>

            <div className="space-y-8">
              <div className="relative group">
                <div
                  className={`absolute inset-0 rounded-2xl backdrop-blur-xl ${
                    mode === "dark"
                      ? "bg-gradient-to-br from-slate-800/60 via-slate-900/40 to-slate-800/60"
                      : "bg-gradient-to-br from-white/80 via-white/20 to-white/80"
                  } border ${
                    mode === "dark" ? "border-white/10" : "border-white/20"
                  } shadow-2xl group-hover:shadow-lg transition-all duration-500`}
                ></div>
                <div
                  className={`relative rounded-2xl overflow-hidden shadow-lg border ${
                    mode === "dark"
                      ? "bg-gray-900 border-gray-800"
                      : "bg-white border-gray-200"
                  }`}
                >
                  <div className="p-6">
                    <BaseFilters
                      mode={mode}
                      loading={eventsLoading}
                      viewMode={viewMode}
                      setViewMode={setViewMode}
                      filterTerm={filterTerm}
                      setFilterTerm={setFilterTerm}
                      sortOrder={sortOrder}
                      setSortOrder={setSortOrder}
                      showFilters={showFilters}
                      setShowFilters={setShowFilters}
                      type="event"
                      items={events || []}
                      filteredItems={events?.filter((event) => {
                        const matchesSearch =
                          !filterTerm ||
                          event.title
                            .toLowerCase()
                            .includes(filterTerm.toLowerCase()) ||
                          event.description
                            .toLowerCase()
                            .includes(filterTerm.toLowerCase());
                        const matchesCategory =
                          selectedCategory === "All" ||
                          event.category === selectedCategory;
                        const matchesTier =
                          selectedTier === "All" ||
                          event.tier_restriction === selectedTier;
                        const matchesType =
                          selectedType === "All" ||
                          event.type === selectedType;
                        const matchesRegion =
                          selectedRegion === "All" ||
                          event.region === selectedRegion;
                        return (
                          matchesSearch &&
                          matchesCategory &&
                          matchesTier &&
                          matchesType &&
                          matchesRegion
                        );
                      }) || []}
                      onResetFilters={handleResetFilters}
                    >
                      <EventFilters
                        selectedCategory={selectedCategory}
                        onCategoryChange={setSelectedCategory}
                        selectedTier={selectedTier}
                        onTierChange={setSelectedTier}
                        selectedType={selectedType}
                        onTypeChange={setSelectedType}
                        selectedRegion={selectedRegion}
                        onRegionChange={setSelectedRegion}
                        selectedEventType={selectedEventType}
                        onEventTypeChange={setSelectedEventType}
                        selectedDateRange={selectedDateRange}
                        onDateRangeChange={setSelectedDateRange}
                        selectedLocation={selectedLocation}
                        onLocationChange={setSelectedLocation}
                        selectedVirtual={selectedVirtual}
                        onVirtualChange={setSelectedVirtual}
                        categories={filterOptions?.categories || []}
                        tiers={filterOptions?.tiers || tiers || []}
                        types={filterOptions?.types || []}
                        regions={filterOptions?.regions || []}
                        eventTypes={filterOptions?.eventTypes || []}
                        dateRanges={filterOptions?.dateRanges || []}
                        locations={filterOptions?.locations || []}
                        virtualOptions={filterOptions?.virtualOptions || []}
                        mode={mode}
                        loading={eventsLoading}
                      />
                    </BaseFilters>

                    <div className="mt-8">
                      <EventsGrid
                        mode={mode}
                        events={events || []}
                        loading={eventsLoading}
                        selectedIds={selectedIds}
                        setSelectedIds={setSelectedIds}
                        handleEditClick={handleEditClick}
                        handleDelete={handleDeleteClick}
                        handleViewRegistrations={handleViewRegistrations}
                        currentPage={currentPage}
                        setCurrentPage={setCurrentPage}
                        itemsPerPage={itemsPerPage}
                        viewMode={viewMode}
                        setViewMode={setViewMode}
                        filterTerm={filterTerm}
                        selectedCategory={selectedCategory}
                        selectedTier={selectedTier}
                        selectedType={selectedType}
                        selectedRegion={selectedRegion}
                        filterOptions={filterOptions}
                      />
                    </div>
                  </div>
                </div>
                <div
                  className={`absolute bottom-0 left-0 right-0 h-1 ${
                    mode === "dark"
                      ? "bg-gradient-to-r from-blue-400 via-blue-500 to-blue-500"
                      : "bg-gradient-to-r from-[#3c82f6] to-[#dbe9fe]"
                  }`}
                ></div>
                <div
                  className={`absolute -top-1 sm:-top-2 -right-1 sm:-right-2 w-3 sm:w-4 h-3 sm:h-4 bg-[#85c2da] rounded-full opacity-60`}
                ></div>
                <div
                  className={`absolute -bottom-1 -left-1 w-2 sm:w-3 h-2 sm:h-3 bg-[#f3584a] rounded-full opacity-40 animate-pulse delay-1000`}
                ></div>
              </div>
            </div>

            <SimpleFooter mode={mode} />
          </div>
        </div>
      </div>

      <ItemActionModal
        isOpen={showForm}
        onClose={() => {
          setShowForm(false);
          setCurrentEvent(null);
        }}
        title={currentEvent ? "Edit Event" : "Create New Event"}
        mode={mode}
        width="max-w-4xl"
        style={{ isolation: 'isolate' }}
      >
        <EventForm
          formData={currentEvent || formData}
          handleInputChange={handleInputChange}
          submitForm={handleFormSubmit}
          cancelForm={() => {
            setShowForm(false);
            setCurrentEvent(null);
          }}
          isEditing={!!currentEvent}
          tiers={tiers}
          mode={mode}
        />
      </ItemActionModal>

      <ItemActionModal
        isOpen={showPendingRegistrations}
        onClose={() => {
          setShowPendingRegistrations(false);
          setSelectedEventRegistrations(null);
        }}
        title={selectedEventRegistrations ? `Registrations for ${selectedEventRegistrations.event.title}` : "Event Registrations"}
        mode={mode}
        width="max-w-4xl"
      >
        <PendingRegistrations
          registrations={selectedEventRegistrations?.registrations || registrations}
          onAction={handleRegistrationActionClick}
          mode={mode}
          loading={registrationLoading}
          onExportClick={(data) => {
            setExportData(data);
            setShowExportModal(true);
          }}
          events={events}
        />
      </ItemActionModal>

      <ExportModal
        isOpen={showExportModal}
        onClose={() => setShowExportModal(false)}
        candidates={exportData}
        mode={mode}
        type="events"
      />
    </div>
  );
}

export async function getServerSideProps({ req, res }) {
  return getAdminEventsProps({ req, res });
}
