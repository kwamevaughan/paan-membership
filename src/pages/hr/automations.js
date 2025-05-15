import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/router";
import { supabase } from "@/lib/supabase";
import { motion } from "framer-motion";
import toast, { Toaster } from "react-hot-toast";
import { Icon } from "@iconify/react";
import HRSidebar from "@/layouts/hrSidebar";
import HRHeader from "@/layouts/hrHeader";
import SimpleFooter from "@/layouts/simpleFooter";
import useSidebar from "@/hooks/useSidebar";
import useStatusChange from "@/hooks/useStatusChange";
import EmailModal from "@/components/EmailModal";
import AutomationCard from "@/components/AutomationCard";
import AutomationForm from "@/components/AutomationForm";
import { fetchHRData } from "../../../utils/hrData";
import { useEmailTemplates } from "@/hooks/useEmailTemplates";
import { templateNameMap } from "../../../utils/templateUtils";

export default function Automations({
  mode = "light",
  toggleMode,
  initialCandidates,
  initialTemplates,
  breadcrumbs,
}) {
  const { isSidebarOpen, toggleSidebar } = useSidebar();
  const [sidebarState, setSidebarState] = useState({
    hidden: false,
    offset: 0,
  });
  const router = useRouter();
  const [automations, setAutomations] = useState([]);
  const [isCreating, setIsCreating] = useState(false);
  const [editingAutomation, setEditingAutomation] = useState(null); // New state for editing
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
  const [emailData, setEmailData] = useState({ subject: "", body: "" });

  const { templates: emailTemplates } = useEmailTemplates(initialTemplates);

  const { handleStatusChange } = useStatusChange({
    candidates: initialCandidates,
    setCandidates: () => {},
    setFilteredCandidates: () => {},
    setSelectedCandidate: () => {},
    setEmailData,
    setIsEmailModalOpen,
  });

  // Update dragOffset from HRSidebar
  const updateDragOffset = useCallback((offset) => {
    setSidebarState((prev) => {
      if (prev.offset === offset) return prev;
      return { ...prev, offset };
    });
  }, []);

  useEffect(() => {
    if (!localStorage.getItem("hr_session")) {
      router.push("/hr/login");
      return;
    }
    fetchAutomations();
  }, [router]);

  const fetchAutomations = async () => {
    const { data, error } = await supabase.from("automations").select("*");
    if (error) {
      console.error(
        "Error fetching automations:",
        error.message,
        error.details
      );
      toast.error(`Failed to load automations: ${error.message}`);
    } else {
      setAutomations(data || []);
    }
  };

  const saveAutomation = async (automation) => {
    const { data, error } = await supabase
      .from("automations")
      .insert([automation])
      .select();
    if (error) {
      toast.error(`Failed to save automation: ${error.message}`);
    } else {
      setAutomations([...automations, data[0]]);
      toast.success("Automation activated! 🚀", { icon: "✨" });
      setIsCreating(false);
    }
  };

  const updateAutomation = async (automation) => {
    const { data, error } = await supabase
      .from("automations")
      .update(automation)
      .eq("id", automation.id)
      .select();
    if (error) {
      toast.error(`Failed to update automation: ${error.message}`);
    } else {
      setAutomations(
        automations.map((auto) => (auto.id === data[0].id ? data[0] : auto))
      );
      toast.success("Automation updated! ✅", { icon: "✨" });
      setEditingAutomation(null);
    }
  };

  const updateAutomationStatus = async (id, active) => {
    const { error } = await supabase
      .from("automations")
      .update({ active })
      .eq("id", id);
    if (error) {
      toast.error(`Failed to update status: ${error.message}`);
      return false;
    }
    setAutomations(
      automations.map((auto) => (auto.id === id ? { ...auto, active } : auto))
    );
    toast.success(`Automation ${active ? "activated" : "deactivated"}!`, {
      icon: active ? "✅" : "⛔",
    });
    return true;
  };

  const deleteAutomation = async (id) => {
    const confirmed = await new Promise((resolve) => {
      toast(
        (t) => (
          <span>
            Delete this automation?
            <button
              onClick={() => {
                toast.dismiss(t.id);
                resolve(true);
              }}
              className="ml-2 px-2 py-1 bg-red-500 text-white rounded"
            >
              Yes
            </button>
            <button
              onClick={() => {
                toast.dismiss(t.id);
                resolve(false);
              }}
              className="ml-2 px-2 py-1 bg-gray-300 rounded"
            >
              No
            </button>
          </span>
        ),
        { duration: Infinity }
      );
    });

    if (!confirmed) return;

    const { error } = await supabase.from("automations").delete().eq("id", id);
    if (error) {
      toast.error(`Failed to delete: ${error.message}`);
    } else {
      setAutomations(automations.filter((auto) => auto.id !== id));
      toast.success("Automation deleted!", { icon: "🗑️" });
    }
  };

  const handleEditAutomation = (automation) => {
    setEditingAutomation(automation);
  };

  const handleLogout = () => {
    localStorage.removeItem("hr_session");
    document.cookie = "hr_session=; path=/; max-age=0";
    toast.success("Logged out successfully!");
    setTimeout(() => router.push("/hr/login"), 1000);
  };

  const handleSendEmail = async (emailDataWithToast) => {
    const { toastId, subject, body } = emailDataWithToast;
    try {
      const response = await fetch("/api/send-status-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subject, body, email: "test@example.com" }),
      });
      if (!response.ok) throw new Error("Failed to send email");
      toast.dismiss(toastId);
      toast.success("Email sent successfully!", { icon: "✅" });
      setIsEmailModalOpen(false);
    } catch (error) {
      toast.dismiss(toastId);
      toast.error("Failed to send email.");
    }
  };

  // Listen for sidebar visibility changes
  useEffect(() => {
    const handleSidebarChange = (e) => {
      const newHidden = e.detail.hidden;
      setSidebarState((prev) => {
        if (prev.hidden === newHidden) return prev;
        return { ...prev, hidden: newHidden };
      });
    };
    document.addEventListener("sidebarVisibilityChange", handleSidebarChange);
    return () =>
      document.removeEventListener(
        "sidebarVisibilityChange",
        handleSidebarChange
      );
  }, []);

  return (
    <div
      className={`min-h-screen flex flex-col ${
        mode === "dark" ? "bg-gray-900" : "bg-gray-50"
      }`}
    >
      <HRHeader
        toggleSidebar={toggleSidebar}
        isSidebarOpen={isSidebarOpen}
        sidebarState={sidebarState}
        mode={mode}
        toggleMode={toggleMode}
        onLogout={handleLogout}
        pageName=""
        pageDescription="."
        breadcrumbs={breadcrumbs}
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
          className={`content-container flex-1 p-10 pt-4 transition-all duration-300 overflow-hidden ${
            isSidebarOpen ? "sidebar-open" : ""
          } ${sidebarState.hidden ? "sidebar-hidden" : ""}`}
          style={{
            marginLeft: sidebarState.hidden
              ? "0px"
              : `${84 + (isSidebarOpen ? 120 : 0) + sidebarState.offset}px`,
          }}
        >
          <div className="max-w-7xl mx-auto space-y-6">
            <motion.h1
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className={`text-3xl font-bold mb-6 flex items-center ${
                mode === "dark" ? "text-white" : "text-[#231812]"
              }`}
            >
              HR Automations{" "}
              <Icon
                icon="mdi:robot"
                className="ml-2 text-[#f05d23]"
                width={32}
              />
            </motion.h1>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {automations.length === 0 ? (
                <p className="text-center text-gray-500 col-span-full">
                  No automations yet. Create one to get started!
                </p>
              ) : (
                automations.map((auto) => (
                  <AutomationCard
                    key={auto.id}
                    automation={auto}
                    mode={mode}
                    onToggle={updateAutomationStatus}
                    onDelete={deleteAutomation}
                    onEdit={handleEditAutomation} // Pass edit handler
                  />
                ))
              )}
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="mt-4 px-6 py-3 rounded-full flex items-center gap-2 bg-[#f05d23] text-white shadow-lg hover:bg-[#e04c1e] transition-colors"
              onClick={() => setIsCreating(true)}
            >
              <Icon icon="mdi:plus" width={20} />
              Create Automation
            </motion.button>
            {isCreating && (
              <AutomationForm
                onSave={saveAutomation}
                onCancel={() => setIsCreating(false)}
                mode={mode}
                emailTemplates={emailTemplates}
                handleStatusChange={handleStatusChange}
              />
            )}
            {editingAutomation && (
              <AutomationForm
                onSave={updateAutomation}
                onCancel={() => setEditingAutomation(null)}
                mode={mode}
                emailTemplates={emailTemplates}
                handleStatusChange={handleStatusChange}
                initialAutomation={editingAutomation} // Pass the automation to edit
              />
            )}
          </div>
        </div>
      </div>
      <EmailModal
        isOpen={isEmailModalOpen}
        onClose={() => setIsEmailModalOpen(false)}
        emailData={emailData}
        setEmailData={setEmailData}
        onSend={handleSendEmail}
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

    const { initialCandidates } = await fetchHRData({ fetchCandidates: true, fetchQuestions: false });
    const { data: initialTemplates, error } = await supabase.from("email_templates").select("id, name, subject, body, updated_at");
    if (error) {
        console.error("Error fetching initial templates:", error.message, error.details);
    }

    return {
        props: {
            mode: "light",
            initialCandidates,
            initialTemplates: initialTemplates || [],
        },
    };
}