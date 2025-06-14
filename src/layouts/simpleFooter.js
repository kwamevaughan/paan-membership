import { useEffect, useState } from "react";
import Image from "next/image";
import useSidebar from "@/hooks/useSidebar";
import Link from "next/link";

const SimpleFooter = ({ mode, isSidebarOpen }) => {
  const [sidebarHidden, setSidebarHidden] = useState(false);
  const currentYear = new Date().getFullYear();

  // Listen for sidebar visibility changes
  useEffect(() => {
    const handleSidebarVisibilityChange = (event) => {
      setSidebarHidden(event.detail.hidden);
    };
    document.addEventListener(
      "sidebarVisibilityChange",
      handleSidebarVisibilityChange
    );

    // Check initial state from body class
    setSidebarHidden(document.body.classList.contains("sidebar-hidden"));

    return () => {
      document.removeEventListener(
        "sidebarVisibilityChange",
        handleSidebarVisibilityChange
      );
    };
  }, []);

  return (
    <div className=" relative z-20 mt-10 flex justify-center">
      <footer
        className={`
          ${
            mode === "dark"
              ? "bg-gray-800/40 text-white"
              : "bg-white/40 text-gray-800"
          }
          backdrop-blur-md
          rounded-xl shadow-lg py-3 px-6
          transition-all duration-300
          ${
            sidebarHidden
              ? "md:ml-0"
              : isSidebarOpen
              ? "md:ml-[0]"
              : "md:ml-[84px]"
          }
        `}
      >
        <div className="flex justify-between items-center gap-4">
          <div className="text-sm">
            Copyright © {currentYear}
            <span className="relative group ml-1">
              <span className="cursor-pointer hover:text-blue-400 transition-colors">
                Pan-African Agency Network (PAAN)
              </span>
              <span
                className={`absolute bottom-full mb-2 left-1/2 -translate-x-1/2 text-xs 
                ${
                  mode === "dark"
                    ? "bg-gray-700 text-gray-200"
                    : "bg-gray-800 text-white"
                } 
                rounded py-1 px-2 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50
                before:content-[''] before:absolute before:top-full before:left-1/2 before:-translate-x-1/2
                before:border-4 before:border-transparent ${
                  mode === "dark"
                    ? "before:border-t-gray-700"
                    : "before:border-t-gray-800"
                }`}
              >
                Visit our website
              </span>
            </span>
            . Made with ♡ in
            <span className="relative group">
              <span className="cursor-default"> Nairobi</span>
              <div className="absolute top-[-110%] left-0 w-full h-full bg-transparent opacity-0 transition-all duration-500 ease-in-out group-hover:top-[-150%] group-hover:opacity-100">
                <Image
                  src="/assets/images/kenya.gif"
                  alt="Nairobi Flag"
                  width={30}
                  height={30}
                  className="absolute top-0 left-0"
                  unoptimized
                />
              </div>
            </span>{" "}
            x{" "}
            <span className="relative group">
              <span className="cursor-default">Accra</span>
              <div className="absolute top-[-110%] left-0 w-full h-full bg-transparent opacity-0 transition-all duration-500 ease-in-out group-hover:top-[-150%] group-hover:opacity-100">
                <Image
                  src="/assets/images/ghana.gif"
                  alt="Accra Flag"
                  width={30}
                  height={30}
                  className="absolute top-0 left-0"
                  unoptimized
                />
              </div>
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default SimpleFooter;
