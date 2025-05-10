import { useRef, useCallback } from "react";

const useThrottle = (callback, delay) => {
  const lastCall = useRef(0);
  return useCallback(
    (...args) => {
      const now = Date.now();
      if (now - lastCall.current >= delay) {
        lastCall.current = now;
        callback(...args);
      }
    },
    [callback, delay]
  );
};

const DraggableToggle = ({
  sidebarHidden,
  toggleSidebarVisibility,
  sidebarWidth,
  setDragOffset,
  isDragging,
  setIsDragging,
}) => {
  const dragRef = useRef(null);
  const startX = useRef(0);

  const throttledSetDragOffset = useThrottle(setDragOffset, 16);

  // Use fixed maxDrag of 200px when hidden for consistency
  const maxDrag = sidebarHidden ? 200 : parseInt(sidebarWidth) || 200;

  const handleDragStart = (e) => {
    e.dataTransfer.setData("text/plain", "");
    setIsDragging(true);
    startX.current = e.clientX;
    console.log("Drag started", { clientX: e.clientX, sidebarHidden });
  };

  const handleDrag = (e) => {
    if (!isDragging || e.clientX === 0) return;
    const deltaX = e.clientX - startX.current;
    const baseOffset = sidebarHidden ? -maxDrag : 0;
    const newOffset = Math.max(-maxDrag, Math.min(0, baseOffset + deltaX));
    console.log("Dragging", { deltaX, baseOffset, newOffset, maxDrag });
    throttledSetDragOffset(newOffset);
  };

  const handleDragEnd = (e) => {
    setIsDragging(false);
    const deltaX = e.clientX - startX.current;
    const threshold = maxDrag / 6; // ~33px for 200px sidebar
    const shouldHide =
      deltaX > (sidebarHidden ? maxDrag - threshold : -threshold);
    console.log("Drag ended", { deltaX, threshold, shouldHide, sidebarHidden });
    if (shouldHide !== sidebarHidden) {
      toggleSidebarVisibility();
    }
    setDragOffset(0);
    startX.current = 0;
  };

  const handleTouchStart = (e) => {
    e.preventDefault(); // Prevent scrolling
    setIsDragging(true);
    startX.current = e.touches[0].clientX;
    console.log("Touch started", {
      clientX: e.touches[0].clientX,
      sidebarHidden,
    });
  };

  const handleTouchMove = (e) => {
    if (!isDragging) return;
    e.preventDefault(); // Prevent scrolling
    const touchX = e.touches[0].clientX;
    const deltaX = touchX - startX.current;
    const baseOffset = sidebarHidden ? -maxDrag : 0;
    const newOffset = Math.max(-maxDrag, Math.min(0, baseOffset + deltaX));
    console.log("Touch moving", { deltaX, baseOffset, newOffset, maxDrag });
    throttledSetDragOffset(newOffset);
  };

  const handleTouchEnd = (e) => {
    setIsDragging(false);
    const touchX = e.changedTouches[0].clientX;
    const deltaX = touchX - startX.current;
    const threshold = maxDrag / 6;
    const shouldHide =
      deltaX > (sidebarHidden ? maxDrag - threshold : -threshold);
    console.log("Touch ended", {
      deltaX,
      threshold,
      shouldHide,
      sidebarHidden,
    });
    if (shouldHide !== sidebarHidden) {
      toggleSidebarVisibility();
    }
    setDragOffset(0);
    startX.current = 0;
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      toggleSidebarVisibility();
    }
  };

  return (
    <div
      ref={dragRef}
      draggable="true"
      onDragStart={handleDragStart}
      onDrag={handleDrag}
      onDragEnd={handleDragEnd}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onClick={toggleSidebarVisibility}
      onKeyDown={handleKeyDown}
      role="button"
      tabIndex={0}
      aria-label={sidebarHidden ? "Show Sidebar" : "Hide Sidebar"}
      className={`absolute top-1/2 -translate-y-1/2 right-[-12px] z-60 ${
        isDragging ? "transition-none" : "transition-all duration-300"
      }
        h-40 w-2 bg-gray-500 hover:bg-gray-300 cursor-pointer
        rounded-r-md hover:w-6 select-none focus:outline-none focus:ring-2 focus:ring-gray-300 pointer-events-auto touch-action-none`}
    >
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1 h-4 bg-white rounded-full opacity-70"></div>
    </div>
  );
};

export default DraggableToggle;
