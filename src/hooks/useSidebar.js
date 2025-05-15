// src/hooks/useSidebar.js
import { useState, useEffect } from "react";

const useSidebar = () => {
  // Use null as initial state to indicate "not initialized yet"
  const [isSidebarOpen, setSidebarOpen] = useState(null);

  // Initialize sidebar state on client-side only
  useEffect(() => {
    const savedState = localStorage.getItem("sidebarOpen");
    // Initialize with saved state or default to open on larger screens
    const initialState =
      savedState !== null ? JSON.parse(savedState) : window.innerWidth > 768;

    setSidebarOpen(initialState);

    // Apply body classes immediately
    document.body.classList.toggle("sidebar-open", initialState);
    document.body.classList.toggle("sidebar-closed", !initialState);
  }, []);

  // Update localStorage and body classes when state changes
  useEffect(() => {
    if (isSidebarOpen !== null) {
      // Only run if initialized
      localStorage.setItem("sidebarOpen", JSON.stringify(isSidebarOpen));
      document.body.classList.toggle("sidebar-open", isSidebarOpen);
      document.body.classList.toggle("sidebar-closed", !isSidebarOpen);
    }
  }, [isSidebarOpen]);

  const toggleSidebar = () => setSidebarOpen((prev) => !prev);

  return {
    isSidebarOpen: isSidebarOpen === null ? false : isSidebarOpen,
    toggleSidebar,
    isInitialized: isSidebarOpen !== null,
  };
};

export default useSidebar;
