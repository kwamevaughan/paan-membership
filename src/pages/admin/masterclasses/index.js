// Admin page for masterclasses management
import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { Icon } from "@iconify/react";
import toast from "react-hot-toast";
import HRHeader from "@/layouts/hrHeader";
import HRSidebar from "@/layouts/hrSidebar";
import SimpleFooter from "@/layouts/simpleFooter";
import PageHeader from "@/components/common/PageHeader";
import ItemActionModal from "@/components/ItemActionModal";
import ImageLibrary from "@/components/common/ImageLibrary";
import MasterclassForm from "@/components/masterclasses/MasterclassForm";
import MasterclassTable from "@/components/masterclasses/MasterclassTable";
import useSidebar from "@/hooks/useSidebar";
import useLogout from "@/hooks/useLogout";
import useAuthSession from "@/hooks/useAuthSession";

export default function MasterclassesAdmin({ mode = "light", toggleMode }) {
  useAuthSession();
  const [masterclasses, setMasterclasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    status: "",
    category: "",
    search: "",
  });
  const [categories, setCategories] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    published: 0,
    draft: 0,
    upcoming: 0,
  });

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [masterclassToDelete, setMasterclassToDelete] = useState(null);
  
  // Table selection states
  const [selectedItems, setSelectedItems] = useState([]);
  
  // Image library states
  const [formData, setFormData] = useState({});
  const [showImageLibrary, setShowImageLibrary] = useState(false);
  const [imageLibraryCallback, setImageLibraryCallback] = useState(null);

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

  const fetchMasterclasses = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.status) params.append("status", filters.status);
      if (filters.category) params.append("category", filters.category);
      if (filters.search) params.append("search", filters.search);

      const response = await fetch(`/api/masterclasses?${params}`);
      const result = await response.json();

      if (response.ok) {
        setMasterclasses(result.data || []);
      } else {
        console.error("Error fetching masterclasses:", result.error);
      }
    } catch (error) {
      console.error("Error fetching masterclasses:", error);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  const fetchCategories = useCallback(async () => {
    try {
      const response = await fetch("/api/masterclasses/categories");
      const result = await response.json();
      if (response.ok) {
        setCategories(result.data || []);
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  }, []);

  const fetchStats = useCallback(async () => {
    try {
      // Fetch basic stats
      const response = await fetch("/api/masterclasses");
      const result = await response.json();

      if (response.ok) {
        const data = result.data || [];
        const now = new Date();

        setStats({
          total: data.length,
          published: data.filter((m) => m.status === "published").length,
          draft: data.filter((m) => m.status === "draft").length,
          upcoming: data.filter(
            (m) => new Date(m.start_date) > now && m.status === "published"
          ).length,
        });
      }
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  }, []);

  useEffect(() => {
    fetchMasterclasses();
    fetchCategories();
    fetchStats();
  }, [fetchMasterclasses, fetchCategories, fetchStats]);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      draft: { color: "bg-gray-100 text-gray-800", label: "Draft" },
      published: { color: "bg-green-100 text-green-800", label: "Published" },
      cancelled: { color: "bg-red-100 text-red-800", label: "Cancelled" },
      completed: { color: "bg-blue-100 text-blue-800", label: "Completed" },
    };

    const config = statusConfig[status] || statusConfig.draft;
    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${config.color}`}>
        {config.label}
      </span>
    );
  };

  // Modal actions
  const modalActions = {
    openModal: (masterclass = null) => {
      if (masterclass) {
        setIsEditing(true);
        setEditingId(masterclass.id);
        setFormData(masterclass);
      } else {
        setIsEditing(false);
        setEditingId(null);
        setFormData({});
      }
      setIsModalOpen(true);
    },
    closeModal: () => {
      setIsModalOpen(false);
      setIsEditing(false);
      setEditingId(null);
      setFormData({});
    },
    saveModal: async (masterclassData) => {
      try {
        const url = isEditing
          ? `/api/masterclasses/${editingId}`
          : "/api/masterclasses";
        const method = isEditing ? "PUT" : "POST";

        const response = await fetch(url, {
          method,
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(masterclassData),
        });

        const result = await response.json();

        if (response.ok) {
          fetchMasterclasses();
          fetchStats();
          modalActions.closeModal();
          toast.success(
            isEditing ? "Masterclass updated successfully" : "Masterclass created successfully"
          );
        } else {
          toast.error(result.error || "Error saving masterclass");
        }
      } catch (error) {
        console.error("Error saving masterclass:", error);
        toast.error("Error saving masterclass");
      }
    },
  };

  const openDeleteModal = (masterclass) => {
    setMasterclassToDelete(masterclass);
    setIsDeleteModalOpen(true);
  };

  const closeDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setMasterclassToDelete(null);
  };

  const confirmDelete = async () => {
    if (!masterclassToDelete) return;

    const loadingToast = toast.loading("Deleting masterclass...");

    try {
      const response = await fetch(
        `/api/masterclasses/${masterclassToDelete.id}`,
        {
          method: "DELETE",
        }
      );

      if (response.ok) {
        fetchMasterclasses();
        fetchStats();
        closeDeleteModal();
        toast.success("Masterclass deleted successfully", {
          id: loadingToast,
        });
      } else {
        const result = await response.json();
        toast.error(result.error || "Error deleting masterclass", {
          id: loadingToast,
        });
      }
    } catch (error) {
      console.error("Error deleting masterclass:", error);
      toast.error("Error deleting masterclass", {
        id: loadingToast,
      });
    }
  };

  // Selection handlers
  const handleSelectAll = (checked) => {
    if (checked) {
      setSelectedItems(masterclasses.map(m => m.id));
    } else {
      setSelectedItems([]);
    }
  };

  const handleSelectItem = (id) => {
    setSelectedItems(prev => 
      prev.includes(id) 
        ? prev.filter(item => item !== id)
        : [...prev, id]
    );
  };

  const handleBulkDelete = async (ids) => {
    const loadingToast = toast.loading("Deleting masterclasses...");
    
    try {
      const promises = ids.map(id => 
        fetch(`/api/masterclasses/${id}`, { method: "DELETE" })
      );
      
      await Promise.all(promises);
      
      fetchMasterclasses();
      fetchStats();
      setSelectedItems([]);
      toast.success(`${ids.length} masterclass(es) deleted successfully`, {
        id: loadingToast,
      });
    } catch (error) {
      console.error("Error deleting masterclasses:", error);
      toast.error("Error deleting masterclasses", {
        id: loadingToast,
      });
    }
  };

  const handleView = (masterclass) => {
    window.location.href = `/admin/masterclasses/${masterclass.id}`;
  };

  const handleEdit = (masterclass) => {
    modalActions.openModal(masterclass);
  };

  const handleDelete = (masterclass) => {
    openDeleteModal(masterclass);
  };

  const handleImageUpload = async (file) => {
    if (!file) return;

    const loadingToast = toast.loading("Uploading image...");

    try {
      // Get authentication token for ImageKit
      const response = await fetch("/api/imagekit/auth");
      if (!response.ok) throw new Error("Failed to get upload token");
      const authData = await response.json();

      if (!authData?.token) throw new Error("Failed to get upload token");

      // Create form data for upload
      const uploadFormData = new FormData();
      uploadFormData.append("file", file);
      uploadFormData.append("fileName", file.name);
      uploadFormData.append("token", authData.token);
      uploadFormData.append("signature", authData.signature);
      uploadFormData.append("expire", authData.expire);
      uploadFormData.append("publicKey", authData.publicKey);
      uploadFormData.append("folder", "/Masterclass");

      // Upload to ImageKit
      const uploadResponse = await fetch(
        "https://upload.imagekit.io/api/v1/files/upload",
        {
          method: "POST",
          body: uploadFormData,
        }
      );

      if (!uploadResponse.ok) throw new Error("Upload failed");

      const uploadData = await uploadResponse.json();

      toast.success("Image uploaded successfully", {
        id: loadingToast,
      });

      return uploadData.url;
    } catch (error) {
      console.error("Error uploading image:", error);
      toast.error("Failed to upload image", {
        id: loadingToast,
      });
      return null;
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
        pageName="Masterclasses"
        pageDescription="Manage and organize masterclasses"
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
            {/* Header */}
            <div className="relative group mb-8">
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
                title="Masterclasses"
                description="Manage and organize masterclasses for your members"
                mode={mode}
                stats={[
                  {
                    icon: "heroicons:academic-cap",
                    value: `${stats.total} total`,
                  },
                  {
                    icon: "heroicons:eye",
                    value: `${stats.published} published`,
                    iconColor: "text-green-500",
                  },
                  {
                    icon: "heroicons:document-text",
                    value: `${stats.draft} drafts`,
                    iconColor: "text-yellow-500",
                  },
                  {
                    icon: "heroicons:calendar",
                    value: `${stats.upcoming} upcoming`,
                    iconColor: "text-blue-500",
                  },
                ]}
                actions={[                  
                  {
                    label: "Create Masterclass",
                    icon: "heroicons:plus",
                    onClick: () => modalActions.openModal(),
                    variant: "primary",
                  },
                ]}
              />
            </div>

            <div className="space-y-8">
              {/* Quick Access Section */}
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
                    <h3 className={`text-lg font-semibold mb-4 ${
                      mode === "dark" ? "text-white" : "text-gray-900"
                    }`}>
                      Quick Access
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <Link
                        href="/admin/masterclasses/purchases"
                        className={`p-4 rounded-lg border transition-all duration-200 hover:scale-105 ${
                          mode === "dark"
                            ? "bg-gray-800 border-gray-700 hover:bg-gray-700"
                            : "bg-gray-50 border-gray-200 hover:bg-gray-100"
                        }`}
                      >
                        <div className="flex items-center space-x-3">
                          <div className={`p-2 rounded-lg ${
                            mode === "dark" ? "bg-blue-900/30" : "bg-blue-100"
                          }`}>
                            <Icon 
                              icon="heroicons:credit-card" 
                              className="w-6 h-6 text-blue-600" 
                            />
                          </div>
                          <div>
                            <h4 className={`font-medium ${
                              mode === "dark" ? "text-white" : "text-gray-900"
                            }`}>
                              Purchase Management
                            </h4>
                            <p className={`text-sm ${
                              mode === "dark" ? "text-gray-400" : "text-gray-600"
                            }`}>
                              Track payments and revenue
                            </p>
                          </div>
                        </div>
                      </Link>

                      <Link
                        href="/admin/masterclasses/tickets"
                        className={`p-4 rounded-lg border transition-all duration-200 hover:scale-105 ${
                          mode === "dark"
                            ? "bg-gray-800 border-gray-700 hover:bg-gray-700"
                            : "bg-gray-50 border-gray-200 hover:bg-gray-100"
                        }`}
                      >
                        <div className="flex items-center space-x-3">
                          <div className={`p-2 rounded-lg ${
                            mode === "dark" ? "bg-green-900/30" : "bg-green-100"
                          }`}>
                            <Icon 
                              icon="heroicons:ticket" 
                              className="w-6 h-6 text-green-600" 
                            />
                          </div>
                          <div>
                            <h4 className={`font-medium ${
                              mode === "dark" ? "text-white" : "text-gray-900"
                            }`}>
                              Ticket Management
                            </h4>
                            <p className={`text-sm ${
                              mode === "dark" ? "text-gray-400" : "text-gray-600"
                            }`}>
                              Issue and manage tickets
                            </p>
                          </div>
                        </div>
                      </Link>

                      <Link
                        href="/admin/masterclasses/analytics"
                        className={`p-4 rounded-lg border transition-all duration-200 hover:scale-105 ${
                          mode === "dark"
                            ? "bg-gray-800 border-gray-700 hover:bg-gray-700"
                            : "bg-gray-50 border-gray-200 hover:bg-gray-100"
                        }`}
                      >
                        <div className="flex items-center space-x-3">
                          <div className={`p-2 rounded-lg ${
                            mode === "dark" ? "bg-purple-900/30" : "bg-purple-100"
                          }`}>
                            <Icon 
                              icon="heroicons:chart-bar" 
                              className="w-6 h-6 text-purple-600" 
                            />
                          </div>
                          <div>
                            <h4 className={`font-medium ${
                              mode === "dark" ? "text-white" : "text-gray-900"
                            }`}>
                              Analytics & Reports
                            </h4>
                            <p className={`text-sm ${
                              mode === "dark" ? "text-gray-400" : "text-gray-600"
                            }`}>
                              View performance metrics
                            </p>
                          </div>
                        </div>
                      </Link>
                    </div>
                  </div>
                </div>
              </div>

              {/* Filters */}
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
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label
                          className={`block text-sm font-medium mb-2 ${
                            mode === "dark" ? "text-gray-300" : "text-gray-700"
                          }`}
                        >
                          Search
                        </label>
                        <input
                          type="text"
                          placeholder="Search masterclasses..."
                          value={filters.search}
                          onChange={(e) =>
                            setFilters({ ...filters, search: e.target.value })
                          }
                          className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                            mode === "dark"
                              ? "bg-gray-800 border-gray-600 text-white"
                              : "bg-white border-gray-300 text-gray-900"
                          }`}
                        />
                      </div>
                      <div>
                        <label
                          className={`block text-sm font-medium mb-2 ${
                            mode === "dark" ? "text-gray-300" : "text-gray-700"
                          }`}
                        >
                          Status
                        </label>
                        <select
                          value={filters.status}
                          onChange={(e) =>
                            setFilters({ ...filters, status: e.target.value })
                          }
                          className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                            mode === "dark"
                              ? "bg-gray-800 border-gray-600 text-white"
                              : "bg-white border-gray-300 text-gray-900"
                          }`}
                        >
                          <option value="">All Statuses</option>
                          <option value="draft">Draft</option>
                          <option value="published">Published</option>
                          <option value="cancelled">Cancelled</option>
                          <option value="completed">Completed</option>
                        </select>
                      </div>
                      <div>
                        <label
                          className={`block text-sm font-medium mb-2 ${
                            mode === "dark" ? "text-gray-300" : "text-gray-700"
                          }`}
                        >
                          Category
                        </label>
                        <select
                          value={filters.category}
                          onChange={(e) =>
                            setFilters({ ...filters, category: e.target.value })
                          }
                          className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                            mode === "dark"
                              ? "bg-gray-800 border-gray-600 text-white"
                              : "bg-white border-gray-300 text-gray-900"
                          }`}
                        >
                          <option value="">All Categories</option>
                          {categories.map((category) => (
                            <option key={category.id} value={category.id}>
                              {category.name}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>

                  <div className="mt-8">
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
                        {loading ? (
                          <div className="p-8 text-center">
                            <Icon
                              icon="heroicons:arrow-path"
                              className="w-8 h-8 animate-spin mx-auto text-gray-400"
                            />
                            <p
                              className={`mt-2 ${
                                mode === "dark"
                                  ? "text-gray-400"
                                  : "text-gray-500"
                              }`}
                            >
                              Loading masterclasses...
                            </p>
                          </div>
                        ) : masterclasses.length === 0 ? (
                          <div className="p-8 text-center">
                            <Icon
                              icon="heroicons:academic-cap"
                              className="w-12 h-12 mx-auto text-gray-400"
                            />
                            <p
                              className={`mt-2 ${
                                mode === "dark"
                                  ? "text-gray-400"
                                  : "text-gray-500"
                              }`}
                            >
                              No masterclasses found
                            </p>
                            <button
                              onClick={() => modalActions.openModal()}
                              className="mt-4 inline-flex items-center px-4 py-2 bg-paan-blue text-white rounded-lg hover:bg-paan-blue/80 cursor-pointer"
                            >
                              <Icon
                                icon="heroicons:plus"
                                className="w-4 h-4 mr-2"
                              />
                              Create your first masterclass
                            </button>
                          </div>
                        ) : (
                          <MasterclassTable
                            masterclasses={masterclasses}
                            mode={mode}
                            onEdit={handleEdit}
                            onDelete={handleDelete}
                            onView={handleView}
                            selectedItems={selectedItems}
                            onSelectAll={handleSelectAll}
                            onSelectItem={handleSelectItem}
                            onBulkDelete={handleBulkDelete}
                          />
                        )}
                      </div>
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
          </div>
          <SimpleFooter mode={mode} isSidebarOpen={isSidebarOpen} />
        </div>

        {/* Form Modal */}
        <ItemActionModal
          isOpen={isModalOpen}
          onClose={modalActions.closeModal}
          title={isEditing ? "Edit Masterclass" : "Create New Masterclass"}
          mode={mode}
        >
          <MasterclassForm
            initialData={formData}
            onSubmit={modalActions.saveModal}
            onCancel={modalActions.closeModal}
            categories={categories}
            mode={mode}
            onImageSelect={(callback) => {
              setImageLibraryCallback(() => callback);
              setShowImageLibrary(true);
            }}
          />
        </ItemActionModal>

        {/* Delete Confirmation Modal */}
        <ItemActionModal
          isOpen={isDeleteModalOpen}
          onClose={closeDeleteModal}
          title="Delete Masterclass"
          mode={mode}
        >
          <div className="space-y-6">
            <p
              className={`text-sm ${
                mode === "dark" ? "text-gray-300" : "text-gray-600"
              }`}
            >
              Are you sure you want to delete the masterclass{" "}
              <strong>&quot;{masterclassToDelete?.title || ""}&quot;</strong>?
              This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-4">
              <button
                onClick={closeDeleteModal}
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

        {/* Image Library Modal */}
        <ImageLibrary
          isOpen={showImageLibrary}
          onClose={() => {
            setShowImageLibrary(false);
            setImageLibraryCallback(null);
          }}
          onSelect={(selectedImage) => {
            if (imageLibraryCallback) {
              imageLibraryCallback(selectedImage.url);
            }
            setShowImageLibrary(false);
            setImageLibraryCallback(null);
          }}
          mode={mode}
          onUpload={handleImageUpload}
          folder="/Masterclass"
        />
      </div>
    </div>
  );
}