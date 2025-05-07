import { useState, useEffect, useRef } from "react";
import { MoonIcon, SunIcon } from "@heroicons/react/24/outline";
import Image from "next/image";
import { Icon } from "@iconify/react";

const JobsHeader = ({
    mode,
    toggleMode,
    pageName = "",
    pageDescription = "",
}) => {
    const headerRef = useRef(null);

    // Adjust body padding based on header height
    useEffect(() => {
        if (headerRef.current) {
            const headerHeight = headerRef.current.offsetHeight;
            document.body.style.paddingTop = `${headerHeight}px`;
        }
    }, []);

    return (
        <header
            ref={headerRef}
            className={`fixed top-0 left-0 right-0 z-50 mb-6 content-container transition-all duration-300 shadow-sm w-full ${
                mode === "dark"
                    ? "border-[#f05d23] bg-[#101827] text-white bg-opacity-100"
                    : "border-gray-300 bg-[#ececec] text-black bg-opacity-50"
            }  backdrop-blur-md`}
        >
            <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center p-4">
                <div className="flex flex-col items-center md:items-start space-y-2 md:space-y-0 md:flex-row md:space-x-2">
                    <Image
                        src={mode === "dark" ? "/assets/images/logo-tagline-white.svg" : "/assets/images/logo-tagline-orange.svg"}
                        alt="Growthpad Consulting Group Logo"
                        width={350}
                        height={50}
                        className="mr-4"
                    />
                    <div className="flex flex-col items-center md:items-start">
                        <h1
                            className={`text-xl md:text-2xl font-bold flex items-center gap-2 ${
                                mode === "dark" ? "text-white" : "text-[#231812]"
                            }`}
                        >
                            {pageName}
                        </h1>
                        {pageDescription && (
                            <p
                                className={`text-base truncate max-w-[200px] md:max-w-[500px] ${
                                    mode === "dark" ? "text-gray-400" : "text-gray-600"
                                }`}
                            >
                                {pageDescription}
                            </p>
                        )}
                    </div>
                </div>

                <div className="flex items-center space-x-2 md:space-x-6">
                    <button
                        onClick={toggleMode}
                        className="p-2 focus:outline-none md:hidden"
                        aria-label="Toggle dark mode"
                    >
                        {mode === "dark" ? (
                            <SunIcon className="h-6 w-6" />
                        ) : (
                            <MoonIcon className="h-6 w-6" />
                        )}
                    </button>
                    <label className="hidden md:inline-flex items-center cursor-pointer">
                        <input
                            type="checkbox"
                            checked={mode === "dark"}
                            onChange={toggleMode}
                            className="hidden"
                        />
                        <div
                            className={`relative w-14 h-8 rounded-full border-2 flex items-center ${
                                mode === "dark" ? "border-blue-600 bg-blue-600" : "border-gray-300 bg-gray-300"
                            } transition`}
                        >
                            <div
                                className={`absolute w-6 h-6 rounded-full bg-white flex items-center justify-center transition-transform ${
                                    mode === "dark" ? "translate-x-6" : ""
                                }`}
                            >
                                {mode === "dark" ? (
                                    <Icon icon="bi:moon" className="h-4 w-4 text-gray-700" />
                                ) : (
                                    <Icon icon="bi:sun" className="h-4 w-4 text-yellow-500" />
                                )}
                            </div>
                        </div>
                    </label>
                </div>
            </div>
        </header>
    );
};

export default JobsHeader;
