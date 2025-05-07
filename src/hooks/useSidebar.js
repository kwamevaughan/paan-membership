import { useState, useEffect } from "react";

const useSidebar = () => {
    // Initialize state synchronously from localStorage
    const getInitialSidebarState = () => {
        if (typeof window === "undefined") return false; // SSR default
        const savedState = localStorage.getItem("sidebarOpen");
        return savedState !== null ? JSON.parse(savedState) : window.innerWidth > 768;
    };

    const [isSidebarOpen, setSidebarOpen] = useState(getInitialSidebarState);

    // Sync state with localStorage and apply body class
    useEffect(() => {
        localStorage.setItem("sidebarOpen", JSON.stringify(isSidebarOpen));
        if (typeof window !== "undefined") {
            document.body.classList.toggle("sidebar-open", isSidebarOpen);
            document.body.classList.toggle("sidebar-closed", !isSidebarOpen);
        }
    }, [isSidebarOpen]);

    // Apply initial body class on mount
    useEffect(() => {
        if (typeof window !== "undefined") {
            document.body.classList.toggle("sidebar-open", isSidebarOpen);
            document.body.classList.toggle("sidebar-closed", !isSidebarOpen);
        }
    }, []); // Run once on mount

    const toggleSidebar = () => setSidebarOpen((prev) => !prev);

    return { isSidebarOpen, toggleSidebar };
};

export default useSidebar;