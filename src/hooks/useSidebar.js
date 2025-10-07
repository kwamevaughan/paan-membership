// src/hooks/useSidebar.js
import { useState, useEffect, useCallback } from "react";

const useSidebar = () => {
  const [isSidebarOpen, setSidebarOpen] = useState(null);
  const [sidebarState, setSidebarState] = useState({
    hidden: false,
    offset: 0,
  });
  const [windowWidth, setWindowWidth] = useState(null);
  const [isHovering, setIsHovering] = useState(false);

  // Window width tracking
  const handleResize = useCallback(() => {
    setWindowWidth(window.innerWidth);
  }, []);

  useEffect(() => {
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [handleResize]);

  const isMobile = windowWidth !== null && windowWidth < 640;

  // Sidebar open/close state
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

  // Toggle sidebar
  const toggleSidebar = useCallback((open) => {
    setSidebarOpen(prev => open !== undefined ? open : !prev);
  }, []);

  // Sidebar visibility change
  const handleSidebarChange = useCallback((e) => {
    const newHidden = e.detail.hidden;
    setSidebarState((prev) =>
      prev.hidden === newHidden ? prev : { ...prev, hidden: newHidden }
    );
  }, []);

  useEffect(() => {
    document.addEventListener("sidebarVisibilityChange", handleSidebarChange);
    return () =>
      document.removeEventListener(
        "sidebarVisibilityChange",
        handleSidebarChange
      );
  }, [handleSidebarChange]);

  // Update drag offset
  const updateDragOffset = useCallback((offset) => {
    setSidebarState((prev) =>
      prev.offset === offset ? prev : { ...prev, offset }
    );
  }, []);

  // Hover handling
  const handleMouseEnter = useCallback(() => {
    if (!isSidebarOpen && !isMobile) {
      setIsHovering(true);
    }
  }, [isSidebarOpen, isMobile]);

  const handleMouseLeave = useCallback(() => {
    setIsHovering(false);
  }, []);

  // Outside click handling for mobile
  const handleOutsideClick = useCallback(
    (sidebarRef) => (e) => {
      if (
        isSidebarOpen &&
        isMobile &&
        sidebarRef.current &&
        !sidebarRef.current.contains(e.target)
      ) {
        toggleSidebar(false);
      }
    },
    [isSidebarOpen, isMobile, toggleSidebar]
  );

  return {
    isSidebarOpen: isSidebarOpen === null ? false : isSidebarOpen,
    toggleSidebar,
    sidebarState,
    updateDragOffset,
    isMobile,
    isHovering,
    handleMouseEnter,
    handleMouseLeave,
    handleOutsideClick,
  };
};

export default useSidebar;
