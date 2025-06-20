// src/layouts/hrSidebar.jsx
import { useEffect, useState, useRef } from "react";
import Image from "next/image";
import { useRouter } from "next/router";
import { Icon } from "@iconify/react";
import { sidebarNav } from "@/data/nav";

const HRSidebar = ({
  isSidebarOpen,
  mode,
  toggleMode,
  toggleSidebar,
  user,
  isMobile,
  isHovering,
  handleMouseEnter,
  handleMouseLeave,
  handleOutsideClick,
  onLogout,
}) => {
  const router = useRouter();
  const sidebarRef = useRef(null);
  const [showLogout, setShowLogout] = useState(false);
  const [expandedCategories, setExpandedCategories] = useState({});

  // Initialize with all categories expanded
  useEffect(() => {
    if (
      sidebarNav &&
      sidebarNav.length > 0 &&
      Object.keys(expandedCategories).length === 0
    ) {
      const allExpanded = {};
      sidebarNav.forEach(({ category }) => {
        allExpanded[category] = true;
      });
      setExpandedCategories(allExpanded);
    }
  }, []);

  // Toggle category expansion
  const toggleCategory = (category) => {
    setExpandedCategories((prev) => ({
      ...prev,
      [category]: !prev[category],
    }));
  };
  

  // Handle outside clicks for mobile
  useEffect(() => {
    const handler = handleOutsideClick(sidebarRef);
    document.addEventListener("mousedown", handler);
    document.addEventListener("touchstart", handler);
    return () => {
      document.removeEventListener("mousedown", handler);
      document.removeEventListener("touchstart", handler);
    };
  }, [handleOutsideClick]);

  // Define isActive function
  const isActive = (pathname) =>
    router.pathname === pathname
      ? mode === "dark"
        ? "bg-[#19191e] text-white shadow-md"
        : "bg-[#0a1215] text-[#E7EEF8] shadow-md"
      : mode === "dark"
      ? "text-gray-200 hover:bg-gray-700 hover:text-white"
      : "text-[#231812] hover:bg-[#0B1215]";

  const shouldAppearExpanded = isMobile
    ? isSidebarOpen
    : isSidebarOpen || isHovering;
  const sidebarWidth = isMobile
    ? isSidebarOpen
      ? "100vw"
      : "0"
    : shouldAppearExpanded
    ? "200px"
    : "80px";

  return (
    <div className="relative z-[40]">
      {/* Main sidebar */}
      <div
        ref={sidebarRef}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className={`fixed left-0 top-0 z-50 rounded-xl m-0 md:m-3 transition-all duration-300
          ${isMobile ? (isSidebarOpen ? "block" : "hidden") : "block"}
          ${mode === "dark" ? "bg-[#05050a]" : "bg-[#101720]"}
          ${
            isHovering && !isSidebarOpen && !isMobile
              ? "backdrop-blur-sm backdrop-filter border border-gray-700"
              : ""
          }
          group shadow-lg shadow-black/20 custom-scrollbar`}
        style={{
          width: sidebarWidth,
          height: isMobile ? "100vh" : "calc(100vh - 24px)",
          backgroundColor:
            isHovering && !isSidebarOpen && !isMobile
              ? "rgba(5, 5, 11, 0.7)"
              : "",
          boxShadow:
            isHovering && !isSidebarOpen && !isMobile
              ? "0 8px 32px 0 rgba(31, 38, 135, 0.37)"
              : "",
        }}
      >
        <div className="flex flex-col h-full relative">
          {/* Logo + Toggle/Close Button */}
          <div
            className={`flex items-center justify-${
              shouldAppearExpanded ? "between" : "center"
            } py-8 ${shouldAppearExpanded ? "px-4" : "px-0"}`}
          >
            {shouldAppearExpanded ? (
              <>
                <Image
                  src={"/assets/images/logo-white.svg"}
                  alt="PAAN Logo"
                  width={120}
                  height={75}
                  className="object-contain"
                  priority
                />
                {isMobile ? (
                  <button
                    onClick={() => toggleSidebar(false)}
                    className="text-white hover:scale-110 transition-transform hover:bg-[#19191e] rounded-full p-2"
                    aria-label="Close sidebar"
                    title="Close sidebar"
                  >
                    <Icon icon="ri:close-line" className="w-6 h-6" />
                  </button>
                ) : (
                  <button
                    onClick={() => toggleSidebar(!isSidebarOpen)}
                    className="text-white hover:scale-110 transition-transform hover:bg-[#19191e] rounded-full p-2"
                    aria-label={
                      isSidebarOpen ? "Collapse sidebar" : "Expand sidebar"
                    }
                    title={
                      isSidebarOpen ? "Collapse sidebar" : "Expand sidebar"
                    }
                  >
                    <Icon
                      icon={
                        isSidebarOpen
                          ? "ri:skip-left-line"
                          : "ri:skip-right-line"
                      }
                      className="w-6 h-6"
                    />
                  </button>
                )}
              </>
            ) : (
              <button
                onClick={() => toggleSidebar(true)}
                className="text-white hover:scale-110 transition-transform"
                aria-label="Expand sidebar"
                title="Expand sidebar"
              >
                <Icon icon="ri:skip-right-line" className="w-6 h-6" />
              </button>
            )}
          </div>

          {/* Navigation with collapsible categories */}
          <div className="flex-grow px-2 overflow-y-auto flex flex-col scrollbar-thin">
            {sidebarNav.map(({ category, items }, index) => (
              <div key={category} className="w-full mb-1">
                {index !== 0 && (
                  <hr className="border-t border-gray-600 my-2" />
                )}

                {shouldAppearExpanded ? (
                  <div
                    className="flex items-center justify-between text-xs tracking-wide font-semibold text-gray-300 px-2 pt-4 pb-1 cursor-pointer hover:text-white"
                    onClick={() => toggleCategory(category)}
                  >
                    <span className="uppercase">{category}</span>
                    <Icon
                      icon={
                        expandedCategories[category]
                          ? "mdi:chevron-down"
                          : "mdi:chevron-right"
                      }
                      className="w-4 h-4 transition-transform duration-200"
                    />
                  </div>
                ) : (
                  <div className="text-center py-2">
                    <div className="inline-flex justify-center items-center w-6 h-6 rounded-full bg-gray-800 text-xs text-white">
                      {category.charAt(0)}
                    </div>
                  </div>
                )}

                <div
                  className={`overflow-hidden transition-all duration-300 ${
                    !shouldAppearExpanded || expandedCategories[category]
                      ? "max-h-96 opacity-100"
                      : "max-h-0 opacity-0"
                  }`}
                >
                  <ul>
                    {Array.isArray(items) && items.length > 0 ? (
                      items.map(({ href, icon, label }) => (
                        <li
                          key={href}
                          onClick={() => {
                            router.push(href);
                            if (isMobile) toggleSidebar(false);
                          }}
                          className={`relative py-3 px-2 flex items-center font-normal text-sm w-full text-white cursor-pointer rounded-lg hover:shadow-md transition-all duration-200 group mb-1 ${isActive(
                            href
                          )}`}
                        >
                          <Icon
                            icon={icon}
                            className={`${
                              shouldAppearExpanded
                                ? "h-5 w-5 mr-3 text-gray-300"
                                : "h-6 w-6"
                            } group-hover:scale-110 group-hover:text-white transition-all`}
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
                      ))
                    ) : (
                      <li className="py-3 px-2 text-gray-500 text-sm">
                        No items available
                      </li>
                    )}
                  </ul>
                </div>
              </div>
            ))}
          </div>

          {/* Profile/Logout */}
          {shouldAppearExpanded && user && (
            <div
              className={`px-4 py-2 mt-auto ${
                mode === "dark"
                  ? "bg-gradient-to-r from-gray-800 to-gray-700"
                  : ""
              } shadow-inner`}
            >
              <div
                className="flex items-center space-x-4 cursor-pointer bg-[#0a1215] rounded-2xl p-2"
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
                    {user.name || "Guest"}
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
                            ? "line-md:sunny-filled-loop-to-moon-filled-alt-loop-transition"
                            : "line-md:moon-alt-to-sunny-outline-loop-transition"
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
                    <Icon icon="mdi:logout" className="h-5 w-5" />
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
