import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { supabase } from "@/lib/supabase";
import { motion } from "framer-motion";
import toast, { Toaster } from "react-hot-toast";
import { Icon } from "@iconify/react";
import HRSidebar from "@/layouts/hrSidebar";
import HRHeader from "@/layouts/hrHeader";
import SimpleFooter from "@/layouts/simpleFooter";
import useSidebar from "@/hooks/useSidebar";
import EditEmailGroupModal from "@/components/EditEmailGroupModal";
import AddEmailGroupModal from "@/components/AddEmailGroupModal";

export default function Recruiters({ mode = "light", toggleMode, initialEmailGroups = [] }) {
    const { isSidebarOpen, toggleSidebar } = useSidebar();
    const router = useRouter();
    const [emailGroups, setEmailGroups] = useState(initialEmailGroups);
    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [editingGroup, setEditingGroup] = useState(null);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
        if (!localStorage.getItem("hr_session")) {
            router.push("/hr/login");
            return;
        }
        if (initialEmailGroups.length === 0) {
            fetchRecruiters();
        }
    }, [router, initialEmailGroups]);

    const fetchRecruiters = async () => {
        const loadingToast = toast.loading("Loading email groups...");
        const { data, error } = await supabase.from("email_groups").select("*");
        if (error) {
            toast.error("Error fetching email groups", { id: loadingToast });
            console.error(error);
        } else {
            setEmailGroups(data);
            toast.success("Email groups loaded!", { id: loadingToast });
        }
    };

    const handleCreate = async (newGroup) => {
        const toastId = toast.loading("Creating group...");
        const { data, error } = await supabase
            .from("email_groups")
            .insert([newGroup])
            .select();
        if (error) {
            toast.error("Error creating group", { id: toastId });
            console.error(error);
        } else {
            setEmailGroups([...emailGroups, data[0]]);
            toast.success("Group created successfully", { id: toastId });
        }
    };

    const handleUpdate = async (updatedGroup) => {
        const toastId = toast.loading("Updating group...");
        const { data, error } = await supabase
            .from("email_groups")
            .update(updatedGroup)
            .eq("id", updatedGroup.id)
            .select();
        if (error) {
            toast.error("Error updating group", { id: toastId });
        } else {
            setEmailGroups(emailGroups.map((group) =>
                group.id === updatedGroup.id ? data[0] : group
            ));
            setEditingGroup(null);
            toast.success("Group updated successfully", { id: toastId });
        }
    };

    const handleDelete = (id, groupName) => {
        toast(
            (t) => (
                <div className="flex flex-col gap-2">
                    <p>Are you sure you want to delete "{groupName}"?</p>
                    <div className="flex gap-2">
                        <button
                            onClick={async () => {
                                toast.dismiss(t.id);
                                const toastId = toast.loading("Deleting group...");
                                const { error } = await supabase
                                    .from("email_groups")
                                    .delete()
                                    .eq("id", id);
                                if (error) {
                                    toast.error("Error deleting group", { id: toastId });
                                } else {
                                    setEmailGroups(emailGroups.filter((group) => group.id !== id));
                                    toast.success("Group deleted successfully", { id: toastId });
                                }
                            }}
                            className="bg-red-500 text-white px-4 py-2 rounded-full hover:bg-red-600 transition duration-200"
                        >
                            Yes
                        </button>
                        <button
                            onClick={() => toast.dismiss(t.id)}
                            className="bg-gray-300 text-gray-800 px-4 py-2 rounded-full hover:bg-gray-400 transition duration-200"
                        >
                            No
                        </button>
                    </div>
                </div>
            ),
            { duration: Infinity } // Keep open until user responds
        );
    };

    const handleLogout = () => {
        localStorage.removeItem("hr_session");
        document.cookie = "hr_session=; path=/; max-age=0";
        toast.success("Logged out successfully!");
        setTimeout(() => router.push("/hr/login"), 1000);
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleString("en-US", {
            year: "numeric",
            month: "short",
            day: "2-digit",
            hour: "2-digit",
            minute: "2-digit",
            hour12: true,
        });
    };

    const getEmailCount = (emails) => {
        return emails ? emails.split(",").length : 0;
    };

    const filteredGroups = emailGroups.filter((group) => {
        const matchesSearch = 
            group.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            group.emails.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStatus =
            statusFilter === "all" ||
            (statusFilter === "recent" && 
             new Date(group.updated_at) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000));
        return matchesSearch && matchesStatus;
    });

    if (!isMounted) {
        return (
            <div
                className={`min-h-screen flex flex-col ${
                    mode === "dark"
                        ? "bg-gradient-to-b from-gray-900 to-gray-800"
                        : "bg-gradient-to-b from-gray-50 to-gray-100"
                }`}
            >
                <Toaster />
                <HRHeader
                    toggleSidebar={toggleSidebar}
                    isSidebarOpen={isSidebarOpen}
                    mode={mode}
                    toggleMode={toggleMode}
                    onLogout={handleLogout}
                    pageName="Recruiters"
                    pageDescription="Manage email groups for recruiters"
                />
                <div className="flex flex-1">
                    <HRSidebar
                        isOpen={isSidebarOpen}
                        mode={mode}
                        onLogout={handleLogout}
                        toggleSidebar={toggleSidebar}
                    />
                    <div
                        className={`content-container flex-1 p-6 transition-all duration-300 overflow-hidden ${
                            isSidebarOpen ? "md:ml-[300px]" : "md:ml-[80px]"
                        }`}
                    >
                        <div className="max-w-7xl mx-auto space-y-8">
                            <h1
                                className={`text-3xl font-bold flex items-center gap-2 ${
                                    mode === "dark" ? "text-white" : "text-[#231812]"
                                }`}
                            >
                                <Icon icon="mdi:email" className="w-8 h-8 text-[#f05d23]" />
                                Recruiters Email Groups
                            </h1>
                        </div>
                    </div>
                </div>
                <SimpleFooter mode={mode} isSidebarOpen={isSidebarOpen} />
            </div>
        );
    }

    return (
        <div
            className={`min-h-screen flex flex-col ${
                mode === "dark"
                    ? "bg-gradient-to-b from-gray-900 to-gray-800"
                    : "bg-gradient-to-b from-gray-50 to-gray-100"
            }`}
        >
            <Toaster />
            <HRHeader
                toggleSidebar={toggleSidebar}
                isSidebarOpen={isSidebarOpen}
                mode={mode}
                toggleMode={toggleMode}
                onLogout={handleLogout}
                pageName="Recruiters"
                pageDescription="Manage email groups for recruiters"
            />
            <div className="flex flex-1">
                <HRSidebar
                    isOpen={isSidebarOpen}
                    mode={mode}
                    onLogout={handleLogout}
                    toggleSidebar={toggleSidebar}
                />
                <div
                    className={`content-container flex-1 p-6 transition-all duration-300 overflow-hidden ${
                        isSidebarOpen ? "md:ml-[300px]" : "md:ml-[80px]"
                    }`}
                >
                    <div className="max-w-7xl mx-auto space-y-8">
                        <motion.h1
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5 }}
                            className={`text-3xl font-bold flex items-center gap-2 ${
                                mode === "dark" ? "text-white" : "text-[#231812]"
                            }`}
                        >
                            <Icon icon="mdi:email" className="w-8 h-8 text-[#f05d23]" />
                            Recruiters Email Groups
                        </motion.h1>

                        {/* Search and Filters */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.2 }}
                            className={`p-6 rounded-xl shadow-md ${
                                mode === "dark" ? "bg-gray-800" : "bg-white"
                            }`}
                        >
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="relative">
                                    <Icon
                                        icon="mdi:magnify"
                                        className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 ${
                                            mode === "dark" ? "text-gray-400" : "text-gray-500"
                                        }`}
                                    />
                                    <input
                                        type="text"
                                        placeholder="Search by name or email..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className={`w-full pl-10 pr-4 py-2 rounded-md border focus:outline-none focus:ring-2 focus:ring-[#f05d23] ${
                                            mode === "dark"
                                                ? "bg-gray-700 text-white border-gray-600"
                                                : "bg-white text-gray-900 border-gray-300"
                                        }`}
                                    />
                                </div>
                                <div className="relative">
                                    <Icon
                                        icon="mdi:filter"
                                        className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 ${
                                            mode === "dark" ? "text-gray-400" : "text-gray-500"
                                        }`}
                                    />
                                    <select
                                        value={statusFilter}
                                        onChange={(e) => setStatusFilter(e.target.value)}
                                        className={`w-full pl-10 pr-4 py-2 rounded-md border focus:outline-none focus:ring-2 focus:ring-[#f05d23] ${
                                            mode === "dark"
                                                ? "bg-gray-700 text-white border-gray-600"
                                                : "bg-white text-gray-900 border-gray-300"
                                        }`}
                                    >
                                        <option value="all">All Groups</option>
                                        <option value="recent">Recently Updated (7 days)</option>
                                    </select>
                                </div>
                                <button
                                    onClick={() => setIsAddModalOpen(true)}
                                    className="bg-[#f05d23] text-white py-2 px-4 rounded-full hover:bg-[#d94f1e] transition duration-200 flex items-center justify-center gap-2 shadow-md"
                                >
                                    <Icon icon="mdi:plus" width={20} height={20} />
                                    Add New Group
                                </button>
                            </div>
                        </motion.div>

                        {/* Email Groups Grid */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.4 }}
                        >
                            {filteredGroups.length === 0 ? (
                                <div
                                    className={`p-6 rounded-xl shadow-md text-center ${
                                        mode === "dark" ? "bg-gray-800 text-gray-300" : "bg-white text-gray-600"
                                    }`}
                                >
                                    <Icon icon="mdi:alert-circle" className="inline-block w-6 h-6 text-[#f05d23] mb-2" />
                                    <p>No email groups match your criteria. Try adjusting your filters!</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {filteredGroups.map((group) => (
                                        <motion.div
                                            key={group.id}
                                            initial={{ opacity: 0, scale: 0.95 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            transition={{ duration: 0.3 }}
                                            className={`p-6 rounded-xl shadow-md transition-all duration-300 transform hover:scale-105 hover:shadow-lg ${
                                                mode === "dark"
                                                    ? "bg-gray-800 text-white border-gray-700"
                                                    : "bg-white text-[#231812] border-gray-200"
                                            }`}
                                        >
                                            <div className="space-y-3">
                                                <div className="flex items-center justify-between">
                                                    <h3
                                                        className={`text-lg font-semibold truncate ${
                                                            mode === "dark"
                                                                ? "text-gray-200"
                                                                : "text-[#231812]"
                                                        }`}
                                                    >
                                                        {group.name}
                                                    </h3>
                                                    <div className="flex gap-2">
                                                        <button
                                                            onClick={() => setEditingGroup(group)}
                                                            className="p-2 rounded-full bg-[#f05d23] text-white hover:bg-[#d94f1e] transition duration-200"
                                                            title="Edit"
                                                        >
                                                            <Icon icon="mdi:pencil" width={20} height={20} />
                                                        </button>
                                                        <button
                                                            onClick={() => handleDelete(group.id, group.name)}
                                                            className="p-2 rounded-full bg-red-500 text-white hover:bg-red-600 transition duration-200"
                                                            title="Delete"
                                                        >
                                                            <Icon icon="mdi:delete" width={20} height={20} />
                                                        </button>
                                                    </div>
                                                </div>
                                                <p
                                                    className={`text-sm line-clamp-2 ${
                                                        mode === "dark"
                                                            ? "text-gray-400"
                                                            : "text-gray-600"
                                                    }`}
                                                >
                                                    <Icon
                                                        icon="mdi:email"
                                                        className="inline-block w-5 h-5 text-[#f05d23] mr-2"
                                                    />
                                                    {group.emails}
                                                </p>
                                                <p
                                                    className={`text-sm ${
                                                        mode === "dark"
                                                            ? "text-gray-400"
                                                            : "text-gray-600"
                                                    }`}
                                                >
                                                    <Icon
                                                        icon="mdi:email-multiple"
                                                        className="inline-block w-5 h-5 text-[#f05d23] mr-2"
                                                    />
                                                    Emails: {getEmailCount(group.emails)}
                                                </p>
                                                <p
                                                    suppressHydrationWarning
                                                    className={`text-xs ${
                                                        mode === "dark"
                                                            ? "text-gray-500"
                                                            : "text-gray-400"
                                                    }`}
                                                >
                                                    <Icon
                                                        icon="mdi:clock"
                                                        className="inline-block w-4 h-4 text-[#f05d23] mr-1"
                                                    />
                                                    Updated: {formatDate(group.updated_at)}
                                                </p>
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            )}
                        </motion.div>
                    </div>
                </div>
            </div>

            {/* Modals */}
            <EditEmailGroupModal
                isOpen={!!editingGroup}
                onClose={() => setEditingGroup(null)}
                group={editingGroup}
                onSave={handleUpdate}
                mode={mode}
            />
            <AddEmailGroupModal
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                onSave={handleCreate}
                mode={mode}
            />

            <SimpleFooter mode={mode} isSidebarOpen={isSidebarOpen} />
        </div>
    );
}

export async function getServerSideProps(context) {
    const { req } = context;
    if (!req.cookies.hr_session) {
        return { redirect: { destination: "/hr/login", permanent: false } };
    }

    const { data: initialEmailGroups, error } = await supabase
        .from("email_groups")
        .select("*");
    if (error) {
        console.error("Error fetching email groups:", error.message, error.details);
        return { props: { mode: "light", initialEmailGroups: [] } };
    }

    return {
        props: {
            mode: "light",
            initialEmailGroups,
        },
    };
}