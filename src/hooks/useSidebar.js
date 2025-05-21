// src/hooks/useSidebar.js
import { useState, useEffect, useCallback } from "react";

const useSidebar = () => {
  const [isSidebarOpen, setSidebarOpen] = useState(null);
  const [sidebarState, setSidebarState] = useState({
    hidden: false,
    offset: 0,
  });

  useEffect(() => {
    const savedState = localStorage.getItem("sidebarOpen");
    const initialState =
      savedState !== null ? JSON.parse(savedState) : window.innerWidth > 768;
    setSidebarOpen(initialState);
    document.body.classList.toggle("sidebar-open", initialState);
    document.body.classList.toggle("sidebar-closed", !initialState);
  }, []);

  useEffect(() => {
    if (isSidebarOpen !== null) {
      localStorage.setItem("sidebarOpen", JSON.stringify(isSidebarOpen));
      document.body.classList.toggle("sidebar-open", isSidebarOpen);
      document.body.classList.toggle("sidebar-closed", !isSidebarOpen);
    }
  }, [isSidebarOpen]);

  const toggleSidebar = () => setSidebarOpen((prev) => !prev);

  const handleSidebarChange = (e) => {
    const newHidden = e.detail.hidden;
    setSidebarState((prev) =>
      prev.hidden === newHidden ? prev : { ...prev, hidden: newHidden }
    );
  };

  const updateDragOffset = useCallback((offset) => {
    setSidebarState((prev) =>
      prev.offset === offset ? prev : { ...prev, offset }
    );
  }, []);

  useEffect(() => {
    document.addEventListener("sidebarVisibilityChange", handleSidebarChange);
    return () =>
      document.removeEventListener(
        "sidebarVisibilityChange",
        handleSidebarChange
      );
  }, []);

  return {
    isSidebarOpen: isSidebarOpen === null ? false : isSidebarOpen,
    toggleSidebar,
    sidebarState,
    updateDragOffset,
  };
};

export default useSidebar;
