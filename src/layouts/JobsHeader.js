import Image from "next/image";
import { Icon } from "@iconify/react";
import Link from "next/link";

const JobsHeader = ({
  mode,
  toggleMode,
}) => {


  return (
    <header
      className={`${mode === "dark" ? "bg-slate-900" : "bg-white"} 
      transition-all duration-500 sticky top-0 z-50 border-b 
      ${mode === "dark" ? "border-slate-800/70" : "border-slate-200/70"}`}
    >
      {/* Animated gradient bar */}
      <div className="h-1 w-full bg-gradient-to-r from-[#f25849] via-[#f05d23] to-[#84c1d9] bg-[length:200%_auto] animate-gradient"></div>

      <div className="container mx-auto px-4 sm:px-6 py-4 md:py-5">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link
              href="/"
              className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 rounded-lg"
              aria-label="Go to homepage"
            >
              <div className="block md:hidden relative h-16 w-16 overflow-hidden rounded-xl">
                <Image
                  src={
                    mode === "dark"
                      ? "/assets/images/favicon-white.png"
                      : "/assets/images/logo.svg"
                  }
                  alt="PAAN Logo"
                  fill
                  className="object-contain p-1"
                />
              </div>
              <div className="hidden md:block relative h-20 w-64">
                <Image
                  src={
                    mode === "dark"
                      ? "/assets/images/paan-logo-white.svg"
                      : "/assets/images/logo.svg"
                  }
                  alt="PAAN Logo"
                  fill
                  className="object-contain object-left"
                />
              </div>
            </Link>
          </div>
          

          {/* Dark Mode Toggle */}
          <div className="flex items-center space-x-4">
            <button
              onClick={() => toggleMode()}
              className={`relative p-3 rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-[#f05d23]
    ${
      mode === "dark"
        ? "bg-slate-800/90 text-slate-200 hover:bg-slate-700/90"
        : "bg-slate-100/90 text-slate-700 hover:bg-slate-200/90"
    }
    transform hover:scale-110 transition-all duration-300 backdrop-blur-md shadow-md flex items-center justify-center group`}
              aria-label={`Switch to ${
                mode === "dark" ? "light" : "dark"
              } mode`}
            >
              <Icon
                icon={mode === "dark" ? "ph:sun-bold" : "ph:moon-bold"}
                className="h-6 w-6 transition-transform duration-300 group-hover:rotate-180"
              />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default JobsHeader;
