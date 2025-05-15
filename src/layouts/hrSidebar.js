import { useEffect, useState, useRef, useCallback, useMemo } from "react";
import { ArrowRightStartOnRectangleIcon } from "@heroicons/react/24/outline";
import Image from "next/image";
import { useRouter } from "next/router";
import { Icon } from "@iconify/react";
import { sidebarNav } from "@/data/nav";
import DraggableToggle from "@/components/DraggableToggle";

const HRSidebar = ({
  isOpen,
  mode,
  toggleMode,
  isSidebarOpen,
  onLogout,
  toggleSidebar,
  setDragOffset: setParentDragOffset,
}) => {
  const [windowWidth, setWindowWidth] = useState(null);
  const [isHovering, setIsHovering] = useState(false);
  const [sidebarHidden, setSidebarHidden] = useState(false);
  const [dragOffset, setDragOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const router = useRouter();
  const sidebarRef = useRef(null);
  const [showLogout, setShowLogout] = useState(false);

  // Debounce setParentDragOffset to reduce update frequency
  const debouncedSetParentDragOffset = useCallback(
    (offset) => {
      let timeout;
      clearTimeout(timeout);
      timeout = setTimeout(() => {
        setParentDragOffset?.(offset);
      }, 50);
    },
    [setParentDragOffset]
  );

  // Sync dragOffset with parent
  useEffect(() => {
    debouncedSetParentDragOffset(dragOffset);
  }, [dragOffset, debouncedSetParentDragOffset]);

  // Handle hover states
  const handleMouseEnter = () => {
    if (!isOpen && windowWidth >= 640) {
      setIsHovering(true);
    }
  };

  const handleMouseLeave = () => {
    setIsHovering(false);
  };

  const handleResize = useCallback(() => {
    setWindowWidth(window.innerWidth);
  }, []);

  useEffect(() => {
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [handleResize]);

  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (
        isOpen &&
        windowWidth < 640 &&
        sidebarRef.current &&
        !sidebarRef.current.contains(e.target)
      ) {
        toggleSidebar();
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    document.addEventListener("touchstart", handleOutsideClick);
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
      document.removeEventListener("touchstart", handleOutsideClick);
    };
  }, [isOpen, windowWidth, toggleSidebar]);

  // Update document body and content-container class for layout
  useEffect(() => {
    const contentContainer = document.querySelector(".content-container");
    if (sidebarHidden) {
      document.body.classList.add("sidebar-hidden");
      contentContainer?.classList.add("sidebar-hidden");
    } else {
      document.body.classList.remove("sidebar-hidden");
      contentContainer?.classList.remove("sidebar-hidden");
    }
    return () => {
      document.body.classList.remove("sidebar-hidden");
      contentContainer?.classList.remove("sidebar-hidden");
    };
  }, [sidebarHidden]);

  const fullName = "PAAN Member";

  const shouldAppearExpanded = isOpen || isHovering;

  const isActive = useMemo(() => {
    return (pathname) =>
      router.pathname === pathname
        ? mode === "dark"
          ? "bg-[#19191e] text-white shadow-md"
          : "bg-[#19191e] text-[#E7EEF8] shadow-md"
        : mode === "dark"
        ? "text-gray-200 hover:bg-gray-700 hover:text-white"
        : "text-[#231812] hover:bg-[#19191e]";
  }, [router.pathname, mode]);

  const toggleSidebarVisibility = () => {
    setSidebarHidden((prev) => {
      const newHidden = !prev;
      const event = new CustomEvent("sidebarVisibilityChange", {
        detail: { hidden: newHidden },
      });
      document.dispatchEvent(event);
      return newHidden;
    });
    setDragOffset(0);
  };

  if (windowWidth === null) return null;

  const sidebarWidth = shouldAppearExpanded
    ? "200px"
    : windowWidth < 640
    ? "0"
    : "80px";

  return (
    <div className="relative z-50">
      {/* Main sidebar */}
      <div
        ref={sidebarRef}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className={`fixed left-4 top-0 z-50 h-[calc(100vh-2rem)] my-4 rounded-xl select-none touch-action-none overflow-visible ${
          isDragging ? "transition-none" : "transition-all duration-300"
        }
        ${
          isHovering && !isOpen
            ? "backdrop-blur-sm backdrop-filter border border-gray-700"
            : mode === "dark"
            ? "bg-[#05050a]"
            : "bg-[#05050a]"
        } 
        group`}
        style={{
          width: sidebarWidth,
          backgroundColor: isHovering && !isOpen ? "rgba(5, 5, 11, 0.7)" : "",
          boxShadow:
            isHovering && !isOpen ? "0 8px 32px 0 rgba(31, 38, 135, 0.37)" : "",
          transform: `translateX(${
            sidebarHidden ? -parseInt(sidebarWidth) + dragOffset : dragOffset
          }px)`,
        }}
      >
        <div className="flex flex-col h-full relative">
          {/* Draggable Toggle */}
          <DraggableToggle
            sidebarHidden={sidebarHidden}
            toggleSidebarVisibility={toggleSidebarVisibility}
            sidebarWidth={sidebarWidth}
            setDragOffset={setDragOffset}
            isDragging={isDragging}
            setIsDragging={setIsDragging}
          />

          {/* Logo + Toggle Button */}
          <div
            className={`flex items-center justify-${
              shouldAppearExpanded ? "between" : "center"
            } py-8 ${shouldAppearExpanded ? "px-4" : "px-0"}`}
          >
            {shouldAppearExpanded ? (
              <>
                <Image
                  src={"/assets/images/paan-logo-white.svg"}
                  alt="PAAN Logo"
                  width={120}
                  height={75}
                  className="object-contain"
                  priority
                />
                <button
                  onClick={toggleSidebar}
                  className="text-white hover:scale-110 transition-transform hover:bg-[#19191e] rounded-full p-2"
                  title="Collapse sidebar"
                >
                  <Icon icon="ri:skip-left-line" className="w-6 h-6" />
                </button>
              </>
            ) : (
              <button
                onClick={toggleSidebar}
                className="text-white hover:scale-110 transition-transform"
                title="Expand sidebar"
              >
                <Icon icon="ri:skip-right-line" className="w-6 h-6" />
              </button>
            )}
          </div>

          {/* Navigation */}
          <ul
            className={`flex-grow px-2 space-y-2 overflow-hidden flex ${
              shouldAppearExpanded ? "items-start" : "items-center"
            } flex-col`}
          >
            {sidebarNav.map(({ category, items }, index) => (
              <div key={category}>
                {index !== 0 && (
                  <hr className="border-t border-gray-600 my-2" />
                )}
                {shouldAppearExpanded && (
                  <div className="text-xs tracking-wide font-semibold text-gray-400 px-2 pt-4 pb-1">
                    {category}
                  </div>
                )}
                <ul>
                  {items.map(({ href, icon, label }) => (
                    <li
                      key={href}
                      onClick={() => {
                        router.push(href);
                        if (windowWidth < 640) toggleSidebar();
                      }}
                      className={`relative py-4 px-2 flex items-center font-normal text-sm w-full text-white cursor-pointer
                        rounded-lg hover:shadow-md transition-all duration-200 group ${isActive(
                          href
                        )}`}
                    >
                      <Icon
                        icon={icon}
                        className={`${
                          shouldAppearExpanded ? "h-5 w-5 mr-3" : "h-6 w-6"
                        } group-hover:scale-110 transition-transform`}
                      />
                      {shouldAppearExpanded && (
                        <span className="text-sm">{label}</span>
                      )}
                      {!shouldAppearExpanded && (
                        <span className="absolute left-[100%] top-1/2 -translate-y-1/2 ml-3 bg-gray-800 text-white px-3 py-1 text-xs rounded shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-200 whitespace-nowrap z-50">
                          {label}
                        </span>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </ul>

          {/* Profile/Logout */}
          {!shouldAppearExpanded && windowWidth < 640 ? null : (
            <div
              className={`px-4 py-2 mt-auto${
                mode === "dark"
                  ? "bg-gradient-to-r from-gray-800 to-gray-700"
                  : ""
              } shadow-inner`}
            >
              <div
                className="flex items-center space-x-4 cursor-pointer bg-[#19191e] rounded-2xl p-2"
                onClick={() => setShowLogout((prev) => !prev)}
              >
                <div className="w-10 h-10 overflow-hidden rounded-full">
                  <Image
                    src="/assets/images/paan-logo-icon-white.svg"
                    alt="Profile"
                    width={38}
                    height={38}
                    className="object-cover"
                    priority
                  />
                </div>
                {shouldAppearExpanded && (
                  <span className="text-xs font-medium text-white">
                    {fullName}
                  </span>
                )}
              </div>
              <div
                className={`transition-[max-height,opacity] duration-500 ease-in-out overflow-hidden ${
                  showLogout && shouldAppearExpanded
                    ? "max-h-40 opacity-100"
                    : "max-h-0 opacity-0"
                }`}
              >
                <div className="flex flex-col gap-2 text-white text-sm pt-2">
                  <div className="flex items-center gap-2 hover:bg-[#19191e] rounded-2xl p-2">
                    <Icon
                      icon="mdi:business-card-outline"
                      className="h-5 w-5"
                    />
                    <span>Profile</span>
                  </div>
                  <div className="py-2 hover:bg-[#19191e] rounded-2xl p-2">
                    <button
                      onClick={toggleMode}
                      className="flex items-center gap-2 hover:opacity-80 transition-colors duration-300"
                    >
                      <Icon
                        icon={
                          mode === "dark"
                            ? "mdi:weather-night"
                            : "mdi:weather-sunny"
                        }
                        className={`h-5 w-5 ${
                          mode === "dark" ? "text-blue-400" : "text-yellow-400"
                        }`}
                      />
                      <span>
                        {mode === "dark" ? "Dark Mode" : "Light Mode"}
                      </span>
                    </button>
                  </div>
                  <hr className="border-t border-gray-600" />
                  <button
                    onClick={onLogout}
                    className="flex items-center gap-2 text-red-500 hover:text-red-600 transition-colors hover:bg-[#19191e] rounded-2xl p-2"
                  >
                    <ArrowRightStartOnRectangleIcon className="h-5 w-5" />
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default HRSidebar;
