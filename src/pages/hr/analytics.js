// src/pages/hr/analytics.js (example)
import { useState } from "react";
import HRSidebar from "@/layouts/hrSidebar";
import HRHeader from "@/layouts/hrHeader";
import { Toaster } from "react-hot-toast";

export default function HRAnalytics({ mode = "light", toggleMode }) {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    const handleLogout = () => {
        localStorage.removeItem("hr_session");
    };

    return (
        <div
            className={`min-h-screen flex flex-col ${
                mode === "dark" ? "bg-gradient-to-b from-gray-900 to-gray-800" : "bg-gradient-to-b from-gray-50 to-gray-100"
            }`}
        >

            <HRHeader mode={mode} toggleMode={toggleMode} onLogout={handleLogout} />
            
                <HRSidebar
                    isOpen={isSidebarOpen}
                    mode={mode}
                    onLogout={handleLogout}
                    toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
                />
                <div
                    className={`flex-1 p-6 transition-all duration-300 ${
                        isSidebarOpen ? "md:ml-[300px]" : "md:ml-[80px]"
                    }`}
                >
                    <h3 className={`text-xl font-bold mb-4 ${mode === "dark" ? "text-white" : "text-[#231812]"}`}>
                        Applicants
                    </h3>
                    <p className={`${mode === "dark" ? "text-gray-300" : "text-[#231812]"}`}>
                        Placeholder for applicant stats coming soon...
                    </p>
                </div>
            
            <footer
                className={`p-4 text-center text-sm shadow-inner ${
                    mode === "dark" ? "bg-gray-900 text-gray-400" : "bg-white text-gray-500"
                }`}
            >
                © {new Date().getFullYear()} Growthpad Consulting Group. All rights reserved.
            </footer>
        </div>
    );
}