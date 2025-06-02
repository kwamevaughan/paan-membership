import { useState } from "react";
import { useRouter } from "next/router";
import toast, { Toaster } from "react-hot-toast";
import { Icon } from "@iconify/react";
import { motion } from "framer-motion";
import HRSidebar from "@/layouts/hrSidebar";
import HRHeader from "@/layouts/hrHeader";
import useSidebar from "@/hooks/useSidebar";
import useLogout from "@/hooks/useLogout";
import useAuthSession from "@/hooks/useAuthSession";
import { useUpdates } from "@/hooks/useUpdates";
import SimpleFooter from "@/layouts/simpleFooter";
import UpdatesForm from "@/components/UpdatesForm";
import { createSupabaseServerClient } from "@/lib/supabaseServer";

export default function AdminUpdates({
  mode = "light",
  toggleMode,
  initialUpdates,
}) {
  const [showForm, setShowForm] = useState(false);
  useAuthSession();
  
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
  
  const handleLogout = useLogout();
  const {
    updates,
    formData,
    loading,
    handleInputChange,
    handleSubmit,
    handleEdit,
    handleDelete,
    handleSearch,
    handleCategoryFilter,
    selectedCategory,
    searchQuery,
  } = useUpdates(initialUpdates);
  const router = useRouter();

  const categories = [
    "All",
    "Governance",
    "Member Spotlights",
    "Global Partnerships",
    "Regional Growth",
    "Events",
    "Strategic Direction",
  ];
  const formCategories = [
    "Governance",
    "Member Spotlights",
    "Global Partnerships",
    "Regional Growth",
    "Events",
    "Strategic Direction",
  ];

  const handleCreateUpdate = () => {
    setShowForm(true);
  };

  const handleCancel = () => {
    setShowForm(false);
    handleEdit({
      id: null,
      title: "",
      description: "",
      category: "Governance",
      cta_text: "",
      cta_url: "",
      tier_restriction: "All",
      tags: "",
    });
  };

  return (
    <div
      className={`min-h-screen flex flex-col bg-gradient-to-br ${
        mode === "dark"
          ? "from-gray-900 via-indigo-950 to-purple-950"
          : "from-indigo-100 via-purple-100 to-pink-100"
      } overflow-hidden`}
    >
      <HRHeader
        toggleSidebar={toggleSidebar}
        isSidebarOpen={isSidebarOpen}
        sidebarState={sidebarState}
        mode={mode}
        toggleMode={toggleMode}
        onLogout={handleLogout}
        pageName="Updates"
        pageDescription="Manage PAAN news, events, and strategic announcements."
        breadcrumbs={[
          { label: "Dashboard", href: "/admin" },
          { label: "Updates" },
        ]}
      />
      <div className="flex flex-1 relative">
        <HRSidebar
          isSidebarOpen={isSidebarOpen}
          mode={mode}
          toggleMode={toggleMode}
          toggleSidebar={toggleSidebar}
          onLogout={handleLogout}
          setDragOffset={updateDragOffset}
          user={{ name: "PAAN HR Team" }}
          isMobile={isMobile}
          isHovering={isHovering}
          handleMouseEnter={handleMouseEnter}
          handleMouseLeave={handleMouseLeave}
          handleOutsideClick={handleOutsideClick}
        />
        <div
          className={`flex-1 transition-all duration-300 overflow-auto ${
            showForm ? "backdrop-blur-md" : ""
          }`}
          style={{
            marginLeft: sidebarState.hidden
              ? "0px"
              : `${84 + (isSidebarOpen ? 120 : 0) + sidebarState.offset}px`,
          }}
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <motion.div
              initial={{ opacity: 0, y: -50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-center mb-12"
            >
              <h1
                className={`text-5xl font-extrabold ${
                  mode === "dark" ? "text-white" : "text-gray-900"
                } bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent`}
              >
                PAAN Updates
              </h1>
              <p
                className={`mt-4 text-lg ${
                  mode === "dark" ? "text-gray-300" : "text-gray-600"
                } max-w-2xl mx-auto`}
              >
                Stay informed with the latest news, events, and strategic
                initiatives from PAAN.
              </p>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleCreateUpdate}
                className={`mt-6 px-6 py-3 rounded-xl ${
                  mode === "dark"
                    ? "bg-gradient-to-r from-indigo-700 to-purple-700 text-white"
                    : "bg-gradient-to-r from-indigo-600 to-purple-600 text-white"
                } shadow-lg hover:shadow-xl`}
              >
                <Icon icon="heroicons:plus" className="w-5 h-5 mr-2 inline" />
                Create New Update
              </motion.button>
            </motion.div>

            {/* Filters */}
            <div className="mb-8 flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                  placeholder="Search updates..."
                  className={`w-full px-4 py-3 rounded-xl ${
                    mode === "dark"
                      ? "bg-gray-800 text-white border-gray-700"
                      : "bg-white text-gray-900 border-gray-200"
                  } focus:ring-2 focus:ring-indigo-500 backdrop-blur-sm`}
                />
              </div>
              <div className="w-full sm:w-48">
                <select
                  value={selectedCategory}
                  onChange={(e) => handleCategoryFilter(e.target.value)}
                  className={`w-full px-4 py-3 rounded-xl ${
                    mode === "dark"
                      ? "bg-gray-800 text-white border-gray-700"
                      : "bg-white text-gray-900 border-gray-200"
                  } focus:ring-2 focus:ring-indigo-500 backdrop-blur-sm`}
                >
                  {categories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Updates List */}
            {loading ? (
              <div className="text-center">
                <Icon
                  icon="heroicons:arrow-path"
                  className="w-8 h-8 animate-spin mx-auto"
                />
                <p
                  className={`mt-2 ${
                    mode === "dark" ? "text-gray-300" : "text-gray-600"
                  }`}
                >
                  Loading updates...
                </p>
              </div>
            ) : updates.length === 0 ? (
              <div className="text-center">
                <p
                  className={`text-lg ${
                    mode === "dark" ? "text-gray-300" : "text-gray-600"
                  }`}
                >
                  No updates found. Create one to get started!
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {updates.map((update) => (
                  <motion.div
                    key={update.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5 }}
                    className={`p-6 rounded-2xl shadow-xl border ${
                      mode === "dark"
                        ? "bg-gray-800/50 border-gray-700/50"
                        : "bg-white/50 border-gray-200/50"
                    } backdrop-blur-lg`}
                  >
                    <div className="flex justify-between items-start">
                      <h3
                        className={`text-xl font-semibold ${
                          mode === "dark" ? "text-white" : "text-gray-900"
                        }`}
                      >
                        {update.title}
                      </h3>
                      <div className="flex gap-2 flex-wrap">
                        <span
                          className={`text-xs px-2 py-1 rounded-full ${
                            mode === "dark"
                              ? "bg-indigo-700 text-white"
                              : "bg-indigo-100 text-indigo-800"
                          }`}
                        >
                          {update.category}
                        </span>
                        <span
                          className={`text-xs px-2 py-1 rounded-full ${
                            mode === "dark"
                              ? "bg-purple-700 text-white"
                              : "bg-purple-100 text-purple-800"
                          }`}
                        >
                          {update.tier_restriction}
                        </span>
                      </div>
                    </div>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {update.tags && update.tags.length > 0 ? (
                        update.tags.map((tag, index) => (
                          <span
                            key={index}
                            className={`text-xs px-2 py-1 rounded-full ${
                              mode === "dark"
                                ? "bg-green-700 text-white"
                                : "bg-green-100 text-green-800"
                            }`}
                          >
                            {tag}
                          </span>
                        ))
                      ) : (
                        <span
                          className={`text-xs px-2 py-1 rounded-full ${
                            mode === "dark"
                              ? "bg-gray-700 text-gray-300"
                              : "bg-gray-200 text-gray-600"
                          }`}
                        >
                          No Tags
                        </span>
                      )}
                    </div>
                    <p
                      className={`mt-2 text-sm ${
                        mode === "dark" ? "text-gray-300" : "text-gray-600"
                      } line-clamp-3`}
                    >
                      {update.description || "No description provided."}
                    </p>
                    {update.cta_text && update.cta_url && (
                      <a
                        href={update.cta_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`mt-4 inline-block px-4 py-2 rounded-lg ${
                          mode === "dark"
                            ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white"
                            : "bg-gradient-to-r from-indigo-500 to-purple-500 text-white"
                        } hover:shadow-lg transition-all`}
                      >
                        {update.cta_text}
                      </a>
                    )}
                    <div className="mt-4 flex justify-between items-center">
                      <p
                        className={`text-xs ${
                          mode === "dark" ? "text-gray-400" : "text-gray-500"
                        }`}
                      >
                        {new Date(update.created_at).toLocaleDateString(
                          "en-US",
                          {
                            month: "2-digit",
                            day: "2-digit",
                            year: "numeric",
                          }
                        )}
                      </p>
                      <div className="flex gap-2">
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => {
                            handleEdit(update);
                            setShowForm(true);
                          }}
                          className={`p-2 rounded-full ${
                            mode === "dark" ? "bg-gray-700" : "bg-gray-200"
                          }`}
                        >
                          <Icon icon="heroicons:pencil" className="w-4 h-4" />
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => handleDelete(update.id)}
                          className={`p-2 rounded-full ${
                            mode === "dark" ? "bg-red-700" : "bg-red-200"
                          }`}
                        >
                          <Icon icon="heroicons:trash" className="w-4 h-4" />
                        </motion.button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
          <SimpleFooter mode={mode} isSidebarOpen={isSidebarOpen} />
        </div>

        {/* Background Overlay */}
        {showForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className={`fixed inset-0 bg-black/30 backdrop-blur-md z-40`}
          />
        )}

        {/* Update Form */}
        <UpdatesForm
          showForm={showForm}
          mode={mode}
          formData={formData}
          handleInputChange={handleInputChange}
          handleSubmit={handleSubmit}
          handleCancel={handleCancel}
          loading={loading}
          categories={formCategories}
        />
      </div>
      <Toaster />
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

    const { data: hrUser, error: hrUserError } = await supabaseServer
      .from("hr_users")
      .select("id")
      .eq("id", session.user.id)
      .single();

    if (hrUserError || !hrUser) {
      console.error(
        "[AdminUpdates] HR User Error:",
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

    console.time("fetchUpdates");
    const { data: updates, error: updatesError } = await supabaseServer
      .from("updates")
      .select(
        "id, title, description, category, cta_text, cta_url, tier_restriction, tags, created_at, updated_at"
      )
      .order("created_at", { ascending: false });
    console.timeEnd("fetchUpdates");

    if (updatesError) {
      console.error("[AdminUpdates] Updates Error:", updatesError.message);
      throw updatesError;
    }

    return {
      props: {
        initialUpdates: updates || [],
      },
    };
  } catch (error) {
    console.error("[AdminUpdates] Error:", error.message);
    return {
      redirect: {
        destination: "/hr/login",
        permanent: false,
      },
    };
  }
}
