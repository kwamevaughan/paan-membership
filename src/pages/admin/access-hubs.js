import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import toast, { Toaster } from "react-hot-toast";
import HRSidebar from "@/layouts/hrSidebar";
import HRHeader from "@/layouts/hrHeader";
import useSidebar from "@/hooks/useSidebar";
import useLogout from "@/hooks/useLogout";
import useAuthSession from "@/hooks/useAuthSession";
import { useAccessHubs } from "@/hooks/useAccessHubs";
import AccessHubForm from "@/components/access-hubs/AccessHubForm";
import AccessHubsGrid from "@/components/access-hubs/AccessHubsGrid";
import PendingRegistrations from "@/components/PendingRegistrations";
import SimpleFooter from "@/layouts/simpleFooter";
import { getAdminAccessHubsProps } from "utils/getPropsUtils";
import ItemActionModal from "@/components/ItemActionModal";
import ExportModal from "@/components/ExportModal";
import PageHeader from "@/components/common/PageHeader";
import AccessHubFilters from "@/components/filters/AccessHubFilters";
import BaseFilters from "@/components/filters/BaseFilters";
import ImageLibrary from "@/components/common/ImageLibrary";

export default function AdminAccessHubs({
  mode = "light",
  toggleMode,
  tiers = [],
  breadcrumbs,
}) {
  const [showForm, setShowForm] = useState(false);
  const [currentAccessHub, setCurrentAccessHub] = useState(null);
  const [showPendingRegistrations, setShowPendingRegistrations] =
    useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [exportData, setExportData] = useState([]);
  const [selectedAccessHubRegistrations, setSelectedAccessHubRegistrations] = useState(null);
  const [showImageLibrary, setShowImageLibrary] = useState(false);
  const [imageLibraryCallback, setImageLibraryCallback] = useState(null);

  const [viewMode, setViewMode] = useState("grid");
  const [filterTerm, setFilterTerm] = useState("");
  const [sortOrder, setSortOrder] = useState("newest");
  const [showFilters, setShowFilters] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedTier, setSelectedTier] = useState("All");
  const [selectedSpaceType, setSelectedSpaceType] = useState("All");
  const [selectedRegion, setSelectedRegion] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(12);
  const [selectedIds, setSelectedIds] = useState([]);
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
    accessHubs,
    registeredAccessHubs,
    filterOptions = {
      categories: [],
      tiers: [],
      spaceTypes: [],
      regions: [],
      dateRanges: [],
      locations: [],
      virtualOptions: []
    },
    loading: accessHubsLoading,
    error,
    accessHubsLoading: registrationLoading,
    handleAccessHubRegistration,
    fetchAccessHubs,
    handleRegistrationAction,
    fetchRegistrations,
    registrations,
    handleInputChange,
    handleSubmit,
    handleDelete,
    formData,
  } = useAccessHubs();

  const handleLogout = useLogout();
  useAuthSession();

  useEffect(() => {
    fetchAccessHubs();
  }, []);

  const handleResetFilters = () => {
    setSelectedSpaceType("All");
    setSelectedTier("All");
    setSelectedRegion("All");
    setFilterTerm("");
    setSortOrder("newest");
  };

  const handleCreateAccessHub = () => {
    setCurrentAccessHub(null);
    setShowForm(true);
  };

  const handleEditClick = async (accessHub) => {
    setCurrentAccessHub(accessHub);
    setShowForm(true);
  };

  const handleFormSubmit = async (formData) => {
    const success = await handleSubmit(formData);
    if (success) {
      setShowForm(false);
      setCurrentAccessHub(null);
      fetchAccessHubs();
    }
  };

  const handleDeleteClick = async (id) => {
    try {
      await handleDelete(id);
      fetchAccessHubs();
    } catch (error) {
      toast.error(error.message);
    }
  };

  const handleViewRegistrations = async (accessHubData) => {
    try {
      console.log('View registrations clicked for access hub:', accessHubData);
      const fetchedRegistrations = await fetchRegistrations();
      console.log('Fetched registrations:', fetchedRegistrations);
      
      // Ensure we have a valid access hub ID
      if (!accessHubData || !accessHubData.id) {
        console.error('Invalid access hub data:', accessHubData);
        toast.error('Invalid access hub data');
        return;
      }

      const accessHubRegistrations = fetchedRegistrations.filter(reg => {
        console.log('Comparing:', { 
          regAccessHubId: reg.access_hub_id, 
          currentAccessHubId: accessHubData.id,
          match: reg.access_hub_id === accessHubData.id 
        });
        return reg.access_hub_id === accessHubData.id;
      });

      console.log('Filtered registrations for access hub:', accessHubRegistrations);
      
      setSelectedAccessHubRegistrations({
        accessHub: {
          id: accessHubData.id,
          title: accessHubData.title,
          description: accessHubData.description,
          city: accessHubData.city,
          country: accessHubData.country,
          space_type: accessHubData.space_type,
          tier_restriction: accessHubData.tier_restriction
        },
        registrations: accessHubRegistrations
      });
      setShowPendingRegistrations(true);
    } catch (error) {
      console.error("Error fetching access hub registrations:", error);
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
      setSelectedAccessHubRegistrations({
        accessHub: {
          id: 'all',
          title: 'All Access Hubs',
          description: 'View all pending registrations',
          city: null,
          country: null,
          space_type: null,
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

  const handleImageUpload = async (files) => {
    return null;
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
        pageName="Access Hubs"
        pageDescription="Manage access hubs for the PAAN community."
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
                title="Access Hubs"
                description="Manage access hubs for the PAAN community. Create targeted content for specific membership tiers and track member engagement."
                mode={mode}
                stats={[
                  {
                    icon: "heroicons:calendar",
                    value: `${accessHubs?.length || 0} total access hubs`,
                  },
                  ...(accessHubs?.length > 0
                    ? [
                        {
                          icon: "heroicons:clock",
                          value: `Last published ${new Date(
                            accessHubs[0].created_at
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
                    label: "New Access Hub",
                    icon: "heroicons:plus",
                    onClick: handleCreateAccessHub,
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
                      loading={accessHubsLoading}
                      viewMode={viewMode}
                      setViewMode={setViewMode}
                      filterTerm={filterTerm}
                      setFilterTerm={setFilterTerm}
                      sortOrder={sortOrder}
                      setSortOrder={setSortOrder}
                      showFilters={showFilters}
                      setShowFilters={setShowFilters}
                      type="access-hub"
                      items={accessHubs || []}
                      filteredItems={accessHubs?.filter((accessHub) => {
                        const matchesSearch =
                          !filterTerm ||
                          accessHub.title
                            .toLowerCase()
                            .includes(filterTerm.toLowerCase()) ||
                          accessHub.description
                            .toLowerCase()
                            .includes(filterTerm.toLowerCase());
                        const matchesCategory =
                          selectedCategory === "All" ||
                          accessHub.category === selectedCategory;
                        const matchesTier =
                          selectedTier === "All" ||
                          accessHub.tier_restriction === selectedTier;
                        const matchesType =
                          selectedSpaceType === "All" ||
                          accessHub.space_type === selectedSpaceType;
                        const matchesRegion =
                          selectedRegion === "All" ||
                          accessHub.region === selectedRegion;
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
                      <AccessHubFilters
                        selectedCategory={selectedCategory}
                        onCategoryChange={setSelectedCategory}
                        selectedTier={selectedTier}
                        onTierChange={setSelectedTier}
                        selectedSpaceType={selectedSpaceType}
                        onSpaceTypeChange={setSelectedSpaceType}
                        selectedRegion={selectedRegion}
                        onRegionChange={setSelectedRegion}
                        selectedDateRange={selectedDateRange}
                        onDateRangeChange={setSelectedDateRange}
                        selectedLocation={selectedLocation}
                        onLocationChange={setSelectedLocation}
                        selectedVirtual={selectedVirtual}
                        onVirtualChange={setSelectedVirtual}
                        categories={filterOptions?.categories || []}
                        tiers={filterOptions?.tiers || tiers || []}
                        spaceTypes={filterOptions?.spaceTypes || []}
                        regions={filterOptions?.regions || []}
                        dateRanges={filterOptions?.dateRanges || []}
                        locations={filterOptions?.locations || []}
                        virtualOptions={filterOptions?.virtualOptions || []}
                        mode={mode}
                        loading={accessHubsLoading}
                      />
                    </BaseFilters>

                    <div className="mt-8">
                      <AccessHubsGrid
                        mode={mode}
                        accessHubs={accessHubs || []}
                        loading={accessHubsLoading}
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
                        selectedSpaceType={selectedSpaceType}
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
          setCurrentAccessHub(null);
        }}
        title={currentAccessHub ? "Edit Access Hub" : "Create New Access Hub"}
        mode={mode}
        width="max-w-4xl"
        style={{ isolation: 'isolate' }}
      >
        <AccessHubForm
          key={currentAccessHub ? currentAccessHub.id : `new-${showForm}`}
          formData={currentAccessHub || formData}
          handleInputChange={handleInputChange}
          submitForm={handleFormSubmit}
          cancelForm={() => {
            setShowForm(false);
            setCurrentAccessHub(null);
          }}
          isEditing={!!currentAccessHub}
          tiers={tiers}
          mode={mode}
          showImageLibrary={showImageLibrary}
          setShowImageLibrary={setShowImageLibrary}
          setImageLibraryCallback={setImageLibraryCallback}
        />
      </ItemActionModal>

      <ItemActionModal
        isOpen={showPendingRegistrations}
        onClose={() => {
          setShowPendingRegistrations(false);
          setSelectedAccessHubRegistrations(null);
        }}
        title={selectedAccessHubRegistrations ? `Registrations for ${selectedAccessHubRegistrations.accessHub.title}` : "Access Hub Registrations"}
        mode={mode}
        width="max-w-4xl"
      >
        <PendingRegistrations
          registrations={selectedAccessHubRegistrations?.registrations || registrations}
          onAction={handleRegistrationActionClick}
          mode={mode}
          loading={registrationLoading}
          onExportClick={(data) => {
            setExportData(data);
            setShowExportModal(true);
          }}
          accessHubs={accessHubs}
          type="access_hubs"
        />
      </ItemActionModal>

      <ExportModal
        isOpen={showExportModal}
        onClose={() => setShowExportModal(false)}
        candidates={exportData}
        mode={mode}
        type="access-hubs"
      />

      <ImageLibrary
        isOpen={showImageLibrary}
        onClose={() => setShowImageLibrary(false)}
        onSelect={(selectedImage) => {
          if (imageLibraryCallback) imageLibraryCallback(selectedImage);
          setShowImageLibrary(false);
        }}
        mode={mode}
        onUpload={handleImageUpload}
        folder="/AccessHubs"
      />
    </div>
  );
}

export async function getServerSideProps({ req, res }) {
  return getAdminAccessHubsProps({ req, res });
}
