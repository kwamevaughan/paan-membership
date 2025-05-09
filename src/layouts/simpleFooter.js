// src/layouts/simpleFooter.js
import Image from "next/image";
import { useState, useEffect } from "react";

const SimpleFooter = ({ mode }) => {
  const [mounted, setMounted] = useState(false);
  const currentYear = new Date().getFullYear();

  // Set mounted to true after component mounts
  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <footer
      className={`${
        mode === "dark"
          ? "bg-gray-800 border-[#84c1d9]"
          : "bg-[#172840] border-[#84c1d9]"
      } px-8 mt-10 border-t shadow-lg py-4 md:py-6 flex flex-col items-center 
        transition-all duration-300 ${!mounted ? "opacity-0" : "opacity-100"}`}
    >
      <div className="flex w-full justify-between items-center mt-4 text-white">
        <div className="flex flex-col">
          <span className="text-base">
            © {currentYear} Pan African Agency Network (PAAN).
          </span>
        </div>
        <div className="hidden md:flex flex-col items-end">
          <a
            href="https://paan.africa"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Image
              src={
                mode === "dark"
                  ? "/assets/images/paan-logo-white.svg"
                  : "/assets/images/paan-logo-white.svg"
              }
              alt="Growthpad Logo"
              width={140}
              height={40}
            />
          </a>
        </div>
      </div>
    </footer>
  );
};

export default SimpleFooter;
