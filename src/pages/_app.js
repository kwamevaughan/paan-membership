import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import toast, { Toaster } from "react-hot-toast";
import "leaflet/dist/leaflet.css";
import "../styles/globals.css";
import { Questrial } from "next/font/google";
import { sidebarNav } from "@/data/nav";

const questrial = Questrial({
  weight: "400",
  subsets: ["latin"],
});

function MyApp({ Component, pageProps }) {
  const [mode, setMode] = useState("light");
  const router = useRouter();

  // Toggle dark mode and persist in localStorage
  const toggleMode = () => {
    const newMode = mode === "light" ? "dark" : "light";
    setMode(newMode);
    if (typeof window !== "undefined") {
      window.localStorage.setItem("mode", newMode);
    }
  };

  useEffect(() => {
    if (typeof window === "undefined") return;

    const savedMode = window.localStorage.getItem("mode");
    if (savedMode) {
      setMode(savedMode);
    } else {
      const systemMode = window.matchMedia("(prefers-color-scheme: dark)")
        .matches
        ? "dark"
        : "light";
      setMode(systemMode);
      window.localStorage.setItem("mode", systemMode);
    }

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = (e) => {
      const systemMode = e.matches ? "dark" : "light";
      if (!window.localStorage.getItem("mode")) {
        setMode(systemMode);
      }
    };
    mediaQuery.addEventListener("change", handleChange);

    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  // Handle route change with toast
  useEffect(() => {
    const routeChangeStart = (url) => {
      // Skip toast for interview page or customize it
      if (url.startsWith("/interview")) {
        // Option 1: Skip toast entirely for interview page
        // return;

        // Option 2: Use a custom page name for interview page
        // toast.loading("Fetching Expression of Interest...", {
        //   id: "route-loading",
        // });
        return;
      }

      const pageSlug = url.split("/").pop() || "overview";
      const navItems = sidebarNav.flatMap((category) => category.items);
      const page = navItems.find(
        (item) => item.href === url || item.href.endsWith(`/${pageSlug}`)
      );
      const pageName = page
        ? page.label
        : pageSlug.charAt(0).toUpperCase() + pageSlug.slice(1);
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
    router.events.off("routeChangeError", routeChangeError);

    return () => {
      router.events.off("routeChangeStart", routeChangeStart);
      router.events.off("routeChangeComplete", routeChangeComplete);
      router.events.off("routeChangeError", routeChangeError);
    };
  }, [router]);

  // Compute breadcrumbs
  const breadcrumbs = (() => {
    const path = router.asPath.split("?")[0];
    const segments = path.split("/").filter((s) => s);
    const crumbs = [{ href: "/", label: "Home" }];
    let currentPath = "";
    const navItems = sidebarNav.flatMap((category) => category.items);

    segments.forEach((segment, index) => {
      currentPath += `/${segment}`;
      const navItem = navItems.find(
        (item) => item.href === currentPath || item.href.endsWith(`/${segment}`)
      );
      const label = navItem
        ? navItem.label
        : segment === "interview"
        ? "Expression of Interest" // Customize breadcrumb label for interview
        : segment.charAt(0).toUpperCase() + segment.slice(1);
      crumbs.push({ href: currentPath, label });
    });

    return crumbs;
  })();

  return (
    <div className={`${mode === "dark" ? "dark" : ""} ${questrial.className}`}>
      <Toaster position="top-center" reverseOrder={false} />
      <Component
        {...pageProps}
        mode={mode}
        toggleMode={toggleMode}
        breadcrumbs={breadcrumbs}
      />
    </div>
  );
}

export default MyApp;
