// src/components/HRDashboardHeader.js
import Image from "next/image";
import { Icon } from "@iconify/react";


export default function HRDashboardHeader({ mode, onLogout }) {
    return (
        <header
            className={`p-4 flex justify-between items-center shadow-md ${
                mode === "dark" ? "bg-gray-900 text-white" : "bg-white text-[#231812]"
            }`}
        >
            <div className="flex items-center">
                <Image
                    src="/assets/images/logo-tagline-orange.svg"
                    alt="Growthpad Consulting Group Logo"
                    width={150}
                    height={50}
                    className="mr-4"
                />
                <h1 className="text-2xl font-bold">HR Job Dashboard</h1>
            </div>
            <button
                onClick={onLogout}
                className="flex items-center px-4 py-2 bg-[#f05d23] text-white rounded-lg hover:bg-[#d94f1e] transition duration-200 shadow-md"
            >
                <Icon icon="mdi:logout" width={20} height={20} className="mr-2" />
                Logout
            </button>
        </header>
    );
}