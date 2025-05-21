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
import EventForm from "@/components/EventForm";
import EventFilters from "@/components/EventFilters";
import PendingRegistrations from "@/components/PendingRegistrations";
import SimpleFooter from "@/layouts/simpleFooter";
import { fetchHRData } from "@/../utils/hrData";
import { createSupabaseServerClient } from "@/lib/supabaseServer";
import { getTierBadgeColor, getStatusBadgeColor } from "@/../utils/badgeUtils";
import { getDaysRemaining } from "@/../utils/dateUtils";

export default function AdminEvents({
  mode = "light",
  toggleMode,
  initialEvents,
  tiers,
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState("list");
  const [filterTerm, setFilterTerm] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [showFilters, setShowFilters] = useState(false);
  const [sortOrder, setSortOrder] = useState("date");

  useAuthSession();

  const { isSidebarOpen, toggleSidebar, sidebarState, updateDragOffset } =
    useSidebar();
  const handleLogout = useLogout();
  const {
    events,
    pendingRegistrations,
    formData,
    loading,
    handleInputChange,
    handleSubmit,
    handleEdit,
    handleDelete,
    handleRegistrationAction,
  } = useEvents(initialEvents);

  const router = useRouter();

  useEffect(() => {
    if (isEditing) {
      setActiveTab("form");
    }
  }, [isEditing]);

  const submitForm = (e) => {
    e.preventDefault();
    handleSubmit(e);
    if (isEditing) {
      setIsEditing(false);
      toast.success("Event updated successfully!");
    } else {
      toast.success("New event created!");
    }
    setActiveTab("list");
  };

  const startEditing = (event) => {
    handleEdit(event);
    setIsEditing(true);
    setActiveTab("form");
  };

  const cancelForm = () => {
    setIsEditing(false);
    setActiveTab("list");
  };

  const filteredEvents = events.filter((event) => {
    const matchesTerm =
      event.title.toLowerCase().includes(filterTerm.toLowerCase()) ||
      event.description?.toLowerCase().includes(filterTerm.toLowerCase()) ||
      event.location?.toLowerCase().includes(filterTerm.toLowerCase());

    if (filterType === "all") return matchesTerm;
    return matchesTerm && event.event_type === filterType;
  });

  const sortedEvents = [...filteredEvents].sort((a, b) => {
    if (sortOrder === "date") {
      return new Date(a.date) - new Date(b.date);
    } else if (sortOrder === "title") {
      return a.title.localeCompare(b.title);
    } else if (sortOrder === "tier") {
      return a.tier_restriction.localeCompare(b.tier_restriction);
    }
    return 0;
  });

  return (
    <div
      className={`min-h-screen flex flex-col ${
        mode === "dark" ? "bg-gray-900 text-white" : "bg-gray-50 text-gray-900"
      }`}
    >
      <HRHeader
        toggleSidebar={toggleSidebar}
        isSidebarOpen={isSidebarOpen}
        sidebarState={sidebarState}
        mode={mode}
        toggleMode={toggleMode}
        onLogout={handleLogout}
        pageName="Events"
        pageDescription="Create and manage events for PAAN members."
        breadcrumbs={[
          { label: "Dashboard", href: "/admin" },
          { label: "Events" },
        ]}
      />
      <div className="flex flex-1">
        <HRSidebar
          isOpen={isSidebarOpen}
          isSidebarOpen={isSidebarOpen}
          mode={mode}
          toggleMode={toggleMode}
          onLogout={handleLogout}
          toggleSidebar={toggleSidebar}
          setDragOffset={updateDragOffset}
        />
        <div
          className={`content-container flex-1 transition-all duration-300 overflow-hidden ${
            isSidebarOpen ? "sidebar-open" : ""
          } ${sidebarState.hidden ? "sidebar-hidden" : ""}`}
          style={{
            marginLeft: sidebarState.hidden
              ? "0px"
              : `${84 + (isSidebarOpen ? 120 : 0) + sidebarState.offset}px`,
          }}
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  Events
                </h1>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  Manage and track events for your network
                </p>
              </div>
              <div className="mt-4 md:mt-0 flex space-x-3">
                {activeTab === "list" || activeTab === "pending" ? (
                  <button
                    onClick={() => {
                      setIsEditing(false);
                      setActiveTab("form");
                    }}
                    className="inline-flex items-center px-4 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-sm font-medium rounded-xl shadow-sm transition-all duration-200 hover:shadow-lg hover:from-indigo-700 hover:to-purple-700"
                  >
                    <Icon icon="heroicons:plus" className="w-5 h-5 mr-2" />
                    Add Event
                  </button>
                ) : (
                  <button
                    onClick={cancelForm}
                    className="inline-flex items-center px-4 py-2.5 bg-gray-600 hover:bg-gray-700 text-white text-sm font-medium rounded-xl shadow-sm transition-all duration-200"
                  >
                    <Icon
                      icon="heroicons:arrow-left"
                      className="w-5 h-5 mr-2"
                    />
                    Back to List
                  </button>
                )}
              </div>
            </div>

            {/* Tabs */}
            <div className="flex space-x-2 mb-6">
              <button
                onClick={() => setActiveTab("list")}
                className={`px-4 py-2 rounded-lg text-sm font-medium ${
                  activeTab === "list"
                    ? "bg-indigo-600 text-white"
                    : "bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-200"
                }`}
              >
                Event List
              </button>
              <button
                onClick={() => setActiveTab("pending")}
                className={`px-4 py-2 rounded-lg text-sm font-medium ${
                  activeTab === "pending"
                    ? "bg-indigo-600 text-white"
                    : "bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-200"
                }`}
              >
                Pending Registrations
              </button>
            </div>

            {activeTab === "list" ? (
              <div className="space-y-6">
                <div
                  className={`bg-white dark:bg-gray-800 shadow-xl rounded-2xl overflow-hidden border-0`}
                >
                  <EventFilters
                    filterTerm={filterTerm}
                    setFilterTerm={setFilterTerm}
                    filterType={filterType}
                    setFilterType={setFilterType}
                    showFilters={showFilters}
                    setShowFilters={setShowFilters}
                    sortOrder={sortOrder}
                    setSortOrder={setSortOrder}
                    mode={mode}
                  />
                  {sortedEvents.length > 0 ? (
                    <div className="p-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {sortedEvents.map((event) => {
                          const tierColors = getTierBadgeColor(
                            event.tier_restriction,
                            mode
                          );
                          const daysLeft = getDaysRemaining(event.date);
                          const statusColors = getStatusBadgeColor(
                            daysLeft,
                            mode
                          );

                          return (
                            <div
                              key={event.id}
                              className={`relative flex flex-col h-full rounded-2xl border-0 ${
                                mode === "dark" ? "bg-gray-800/50" : "bg-white"
                              } shadow-lg overflow-hidden hover:shadow-xl transition-all duration-200 group`}
                            >
                              <div className="px-6 pt-6 pb-4 border-b border-gray-100 dark:border-gray-700">
                                <div className="flex justify-between items-start mb-2">
                                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors line-clamp-1">
                                    {event.title}
                                  </h3>
                                  <span
                                    className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${tierColors.bg} ${tierColors.text} ${tierColors.border}`}
                                  >
                                    {event.tier_restriction === "All"
                                      ? "All Members"
                                      : event.tier_restriction}
                                  </span>
                                </div>
                                <div className="flex items-center mt-1.5">
                                  <Icon
                                    icon="heroicons:map-pin"
                                    className="w-4 h-4 text-gray-500 dark:text-gray-400 mr-1.5 flex-shrink-0"
                                  />
                                  <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                                    {event.location || "Virtual"}
                                  </p>
                                </div>
                              </div>
                              <div className="px-6 py-4 flex-grow">
                                {event.description && (
                                  <p className="text-sm text-gray-700 dark:text-gray-300 line-clamp-2 mb-4">
                                    {event.description}
                                  </p>
                                )}
                                <div className="flex flex-wrap gap-2 mb-4">
                                  <div className="flex items-center text-xs px-2.5 py-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300">
                                    <Icon
                                      icon="heroicons:calendar"
                                      className="w-3.5 h-3.5 mr-1.5"
                                    />
                                    <span className="font-medium">
                                      {event.event_type}
                                    </span>
                                  </div>
                                  {event.is_virtual && (
                                    <div className="flex items-center text-xs px-2.5 py-1.5 rounded-lg bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300">
                                      <Icon
                                        icon="heroicons:video-camera"
                                        className="w-3.5 h-3.5 mr-1.5"
                                      />
                                      <span className="font-medium">
                                        Virtual
                                      </span>
                                    </div>
                                  )}
                                </div>
                                {event.registration_link && (
                                  <a
                                    href={event.registration_link}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-sm text-indigo-600 dark:text-indigo-400 hover:underline"
                                  >
                                    Register Now
                                  </a>
                                )}
                              </div>
                              <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 mt-auto bg-gray-50 dark:bg-gray-800/80">
                                <div className="flex justify-between items-center">
                                  <div>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                                      Event Date
                                    </p>
                                    <div className="flex items-center">
                                      <div
                                        className={`flex items-center space-x-1.5 px-2.5 py-1.5 rounded-lg ${statusColors.bg}`}
                                      >
                                        <Icon
                                          icon="heroicons:clock"
                                          className={`w-3.5 h-3.5 ${statusColors.icon}`}
                                        />
                                        <span
                                          className={`text-xs font-medium ${statusColors.text}`}
                                        >
                                          {daysLeft <= 0
                                            ? "Past Event"
                                            : `${daysLeft} days left`}
                                        </span>
                                      </div>
                                    </div>
                                  </div>
                                  <div className="flex space-x-2">
                                    <button
                                      onClick={() => startEditing(event)}
                                      className={`inline-flex items-center justify-center p-2 border rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${
                                        mode === "dark"
                                          ? "border-gray-700"
                                          : "border-gray-200"
                                      }`}
                                      aria-label="Edit"
                                    >
                                      <Icon
                                        icon="heroicons:pencil-square"
                                        className="w-4 h-4"
                                      />
                                    </button>
                                    <button
                                      onClick={() => {
                                        if (
                                          window.confirm(
                                            "Are you sure you want to delete this event?"
                                          )
                                        ) {
                                          handleDelete(event.id);
                                          toast.success(
                                            "Event deleted successfully!"
                                          );
                                        }
                                      }}
                                      className={`inline-flex items-center justify-center p-2 border rounded-lg text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors ${
                                        mode === "dark"
                                          ? "border-gray-700"
                                          : "border-gray-200"
                                      }`}
                                      aria-label="Delete"
                                    >
                                      <Icon
                                        icon="heroicons:trash"
                                        className="w-4 h-4"
                                      />
                                    </button>
                                  </div>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ) : (
                    <div className="p-12 text-center">
                      <div className="w-24 h-24 mx-auto bg-indigo-50 dark:bg-indigo-900/20 rounded-full flex items-center justify-center mb-6">
                        <Icon
                          icon="heroicons:calendar"
                          className="h-12 w-12 text-indigo-500 dark:text-indigo-300"
                        />
                      </div>
                      <h3 className="mt-2 text-xl font-medium text-gray-900 dark:text-gray-200">
                        No events found
                      </h3>
                      <p className="mt-2 text-sm text-gray-500 dark:text-gray-400 max-w-md mx-auto">
                        {filterTerm || filterType !== "all"
                          ? "Try adjusting your search or filter criteria to find what you're looking for"
                          : "Get started by creating a new event for your network"}
                      </p>
                      <div className="mt-8">
                        <button
                          onClick={() => {
                            setIsEditing(false);
                            setActiveTab("form");
                          }}
                          className="inline-flex items-center px-6 py-3 border border-transparent shadow-sm text-sm font-medium rounded-xl text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-200"
                        >
                          <Icon
                            icon="heroicons:plus"
                            className="-ml-1 mr-2 h-5 w-5"
                          />
                          Add new event
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : activeTab === "pending" ? (
              <PendingRegistrations
                registrations={pendingRegistrations}
                onAction={handleRegistrationAction}
                mode={mode}
              />
            ) : (
              <EventForm
                formData={formData}
                handleInputChange={handleInputChange}
                submitForm={submitForm}
                cancelForm={cancelForm}
                isEditing={isEditing}
                tiers={tiers}
                mode={mode}
              />
            )}
          </div>
          <SimpleFooter mode={mode} isSidebarOpen={isSidebarOpen} />
        </div>
      </div>
    </div>
  );
}

export async function getServerSideProps({ req, res }) {
  try {
    const supabaseServer = createSupabaseServerClient(req, res);

    const {
      data: { session },
      error: sessionError,
    } = await supabaseServer.auth.getSession();

    if (sessionError || !session) {
      return {
        redirect: {
          destination: "/hr/login",
          permanent: false,
        },
      };
    }

    // Verify user is in hr_users
    const { data: hrUser, error: hrUserError } = await supabaseServer
      .from("hr_users")
      .select("id")
      .eq("id", session.user.id)
      .single();

    if (hrUserError || !hrUser) {
      console.error(
        "[AdminEvents] HR User Error:",
        hrUserError?.message || "User not in hr_users"
      );
      await supabaseServer.auth.signOut();
      return {
        redirect: {
          destination: "/hr/login",
          permanent: false,
        },
      };
    }

    console.time("fetchHRData");
    const data = await fetchHRData({
      supabaseClient: supabaseServer,
      fetchEvents: true,
    });
    console.timeEnd("fetchHRData");

    return {
      props: {
        initialEvents: data.events || [],
        tiers: data.tiers || [],
      },
    };
  } catch (error) {
    console.error("[AdminEvents] Error:", error.message);
    return {
      redirect: {
        destination: "/hr/login",
        permanent: false,
      },
    };
  }
}
