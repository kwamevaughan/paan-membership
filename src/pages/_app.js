import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import toast, { Toaster } from "react-hot-toast";
import "leaflet/dist/leaflet.css";
import "../styles/globals.css";
import { sidebarNav } from "@/data/nav";

function MyApp({ Component, pageProps }) {
    const [mode, setMode] = useState("light");
    const router = useRouter();

    // Toggle dark mode and persist in localStorage
    const toggleMode = () => {
        const newMode = mode === "light" ? "dark" : "light";
        setMode(newMode);
        localStorage.setItem("mode", newMode);
    };

    useEffect(() => {
        // Load saved mode or system preference on mount
        const savedMode = localStorage.getItem("mode");
        if (savedMode) {
            setMode(savedMode);
        } else {
            const systemMode = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
            setMode(systemMode);
            localStorage.setItem("mode", systemMode);
        }

        // Listen for system theme changes
        const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
        const handleChange = (e) => {
            const systemMode = e.matches ? "dark" : "light";
            if (!localStorage.getItem("mode")) {
                setMode(systemMode);
            }
        };
        mediaQuery.addEventListener("change", handleChange);

        return () => mediaQuery.removeEventListener("change", handleChange);
    }, []);

    // Handle route change with toast
    useEffect(() => {
        const routeChangeStart = (url) => {
            const pageSlug = url.split("/").pop() || "overview"; // Default to "overview" if empty
            const page = sidebarNav.find((item) => item.href === url || item.href.endsWith(`/${pageSlug}`));
            const pageName = page ? page.label : pageSlug.charAt(0).toUpperCase() + pageSlug.slice(1); // Fallback to capitalized slug
            toast.loading(`Fetching ${pageName}...`, {
                id: "route-loading",
            });
        };

        const routeChangeComplete = () => {
            toast.dismiss("route-loading");
        };

        const routeChangeError = () => {
            toast.error("Failed to load page", { id: "route-loading" });
        };

        router.events.on("routeChangeStart", routeChangeStart);
        router.events.on("routeChangeComplete", routeChangeComplete);
        router.events.on("routeChangeError", routeChangeError);

        return () => {
            router.events.off("routeChangeStart", routeChangeStart);
            router.events.off("routeChangeComplete", routeChangeComplete);
            router.events.off("routeChangeError", routeChangeError);
        };
    }, [router]);

    return (
        <div className={mode === "dark" ? "dark" : ""}>
            <Toaster position="top-center" reverseOrder={false} />
            <Component {...pageProps} mode={mode} toggleMode={toggleMode} />
        </div>
    );
}

export default MyApp;