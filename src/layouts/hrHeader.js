// src/layouts/hrHeader.jsx
import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { Icon } from "@iconify/react";
import Search from "@/components/Search";
import FullscreenToggle from "@/components/FullscreenToggle";
import TooltipIconButton from "@/components/TooltipIconButton";
import LanguageSwitch from "@/components/LanguageSwitch";

const HRHeader = ({
  mode,
  toggleMode,
  isSidebarOpen,
  onLogout,
  sidebarState,
  toggleSidebar,
  isMobile, // Added from useSidebar
}) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const headerRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (headerRef.current) {
      const headerHeight = headerRef.current.offsetHeight;
      document.body.style.paddingTop = `${headerHeight}px`;
    }
  }, []);

  const fullName = "PAAN HR Team";

  return (
    <header
      ref={headerRef}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        mode === "dark" ? "bg-[#101827]" : "bg-transparent"
      }`}
    >
      <div
        className={`
          p-2 m-4 transition-all duration-300
          ${
            sidebarState.hidden
              ? "md:ml-0"
              : isSidebarOpen
              ? "md:ml-[250px]"
              : "md:ml-[84px]"
          }
          sm:ml-0
          ${
            mode === "dark"
              ? "bg-[#101827]/50 text-white"
              : "bg-white/50 text-black"
          }
          backdrop-blur-md shadow-lg rounded-2xl
        `}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center w-full gap-2">
            {isMobile && (
              <button
                onClick={() => toggleSidebar(!isSidebarOpen)}
                className="text-white hover:scale-110 transition-transform"
                title={isSidebarOpen ? "Close sidebar" : "Open sidebar"}
              >
                <Icon
                  icon={isSidebarOpen ? "ri:close-line" : "ri:menu-line"}
                  className="w-6 h-6 text-gray-900"
                />
              </button>
            )}
            <div className="flex-grow">
              <Search mode={mode} />
            </div>
          </div>

          <div className="flex justify-end items-center w-full gap-2">
            {/* Dark Mode Toggle */}
            <TooltipIconButton
              label={
                mode === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode"
              }
              onClick={toggleMode}
              mode={mode}
              className="bg-white/50"
            >
              <Icon
                icon={mode === "dark" ? "bi:moon" : "bi:sun"}
                className="h-5 w-5"
              />
            </TooltipIconButton>

            {/* Fullscreen Toggle */}
            <FullscreenToggle mode={mode} />

            {/* Language Switch */}
            <LanguageSwitch mode={mode} />

            {/* Notifications */}
            <TooltipIconButton
              label="View Notifications"
              mode={mode}
              className="bg-white/50"
            >
              <Icon
                icon="mdi-light:bell"
                width={26}
                height={26}
                className="animate-swing-infinite"
              />
            </TooltipIconButton>

            {/* User Dropdown */}
            <div
              className="flex items-center gap-2 pl-4 relative group cursor-default"
              ref={dropdownRef}
              onClick={() => setDropdownOpen(!dropdownOpen)}
            >
              <div className="flex items-center gap-2 cursor-pointer">
                <div className="hidden md:block">
                  <span
                    className={`font-bold text-xs ${
                      mode === "dark" ? "text-white" : "text-[#231812]"
                    }`}
                  >
                    {fullName}
                  </span>
                  <span className="block text-sm font-normal text-right text-[#f05d23]">
                    Admin
                  </span>
                </div>
                <div className="w-10 h-10 overflow-hidden">
                  <Image
                    src={
                      mode === "dark"
                        ? "/assets/images/paan-logo-icon-white.svg"
                        : "/assets/images/paan-logo-icon.svg"
                    }
                    alt="User Profile"
                    width={40}
                    height={40}
                    className="object-cover"
                  />
                </div>
              </div>

              {dropdownOpen && (
                <div
                  className={`absolute top-full mt-2 right-0 w-80 rounded-2xl shadow-lg z-10 ${
                    mode === "dark"
                      ? "bg-gray-800 text-white"
                      : "bg-white text-[#231812]"
                  }`}
                >
                  <div className="p-8">
                    <p className="text-lg mb-6">User Profile</p>
                    <div className="flex items-center gap-2 border-b pb-6 w-full">
                      <div className="overflow-hidden flex-shrink-0">
                        <Image
                          src={
                            mode === "dark"
                              ? "/assets/images/paan-logo-icon-white.svg"
                              : "/assets/images/paan-logo-icon.svg"
                          }
                          alt="User Profile"
                          width={40}
                          height={40}
                          className="object-cover"
                        />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-md font-bold">{fullName}</span>
                        <span className="text-sm">Business Department</span>
                      </div>
                    </div>
                    <button
                      onClick={onLogout}
                      className="block w-full text-center text-white px-4 py-2 bg-[#f05d23] rounded-full hover:bg-[#d94f1e] transition duration-200 mt-4"
                    >
                      Logout
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default HRHeader;
