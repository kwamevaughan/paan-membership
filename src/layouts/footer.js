import { Icon } from "@iconify/react";
import Link from "next/link";
import { useState, useEffect } from "react";

const Footer = () => {
  // Use static year to avoid hydration mismatch
  const currentYear = 2025;
  const [isHeaderFixed, setIsHeaderFixed] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    
    const handleScrollEvent = () => {
      if (typeof window !== "undefined" && window.scrollY > 50) {
        setIsHeaderFixed(true);
      } else {
        setIsHeaderFixed(false);
      }
    };

    if (typeof window !== "undefined") {
      window.addEventListener("scroll", handleScrollEvent);
      return () => window.removeEventListener("scroll", handleScrollEvent);
    }
  }, []);

  const handleScroll = (e, href) => {
    if (typeof window === "undefined" || typeof document === "undefined") return;
    
    e.preventDefault();
    const targetId = href.replace("#", "");
    const element = document.getElementById(targetId);
    if (element) {
      const nav = document.querySelector("nav");
      const headerHeight = nav ? nav.offsetHeight : 0;
      const elementPosition =
        element.getBoundingClientRect().top + window.scrollY;
      window.scrollTo({
        top: elementPosition - (isHeaderFixed ? headerHeight : 0),
        behavior: "smooth",
      });
    }
  };

  return (
    <section
      className="relative bg-[#172840] pt-28 pb-8 text-white"
      style={{
        backgroundImage: "url('/assets/images/bg-pattern.svg')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundAttachment: "fixed",
      }}
    >
      <div className="absolute inset-0 bg-[#172840] opacity-90"></div>
      <div className="relative z-10 max-w-6xl mx-auto px-3 sm:px-0">
        <div className="grid grid-cols-1 md:grid-cols-6 justify-items-center gap-4 text-center md:text-left">
          <p className="text-4xl font-medium">Collaborate</p>
          <span className="flex bg-[#F2B706] rounded-full w-8 h-8"></span>
          <p className="text-4xl font-medium">Innovate</p>
          <span className="flex bg-[#84C1D9] rounded-full w-8 h-8"></span>
          <p className="text-4xl font-medium">Dominate</p>
          <span className="flex bg-[#F25849] rounded-full w-8 h-8"></span>
        </div>

        <div className="flex flex-col gap-8 mt-14 mb-14">
          <div>
            {mounted && (
              <ul className="flex gap-2">
                <li className="group pb-4 hover:translate-y-[-4px] transition-transform duration-300">
                  <Link
                    href="https://www.facebook.com/panafricanagencynetwork"
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Facebook"
                  >
                    <Icon
                      icon="ic:baseline-facebook"
                      width="32"
                      height="32"
                      className="text-gray-400 group-hover:text-[#1877F2]"
                    />
                  </Link>
                </li>
                <li className="group pb-4 hover:translate-y-[-4px] transition-transform duration-300">
                  <Link
                    href="https://www.linkedin.com/company/pan-african-agency-network"
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="LinkedIn"
                  >
                    <Icon
                      icon="mdi:linkedin"
                      width="32"
                      height="32"
                      className="text-gray-400 group-hover:text-[#0077B5]"
                    />
                  </Link>
                </li>
                <li className="group pb-4 hover:translate-y-[-4px] transition-transform duration-300">
                  <Link
                    href="https://instagram.com/pan_african_agency_network"
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Instagram"
                  >
                    <Icon
                      icon="mingcute:instagram-fill"
                      width="32"
                      height="32"
                      className="text-gray-400 group-hover:text-[#E4405F]"
                    />
                  </Link>
                </li>
                <li className="group pb-4 hover:translate-y-[-4px] transition-transform duration-300">
                  <Link
                    href="https://x.com/paan_network"
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="X"
                  >
                    <Icon
                      icon="iconoir:x"
                      width="32"
                      height="32"
                      className="text-gray-400 group-hover:text-black"
                    />
                  </Link>
                </li>
              </ul>
            )}
          </div>
        </div>
          </div>
          
      <div className="relative max-w-6xl mx-auto px-3 sm:px-0">
        <p className="pt-10 border-t border-gray-400 text-center text-gray-200 text-sm">
          © {currentYear} PAAN. All rights reserved. |
          <Link
            href="https://paan.africa/privacy-policy"
            className="ml-2 text-white hover:text-[#84c1d9]"
            aria-label="Privacy Policy"
            target="_blank"
          >
            Privacy Policy
          </Link>
        </p>
      </div>
    </section>
  );
};

export default Footer;
