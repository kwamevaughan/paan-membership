import Link from "next/link";
import { useRouter } from "next/router";
import { Icon } from "@iconify/react";

/**
 * SummitNavigation Component
 * Provides quick navigation links between summit management pages
 */
export function SummitNavigation({ mode = "light", currentPage }) {
  const router = useRouter();

  const navItems = [
    {
      href: "/admin/summit/purchases",
      icon: "mdi:cart-outline",
      label: "Purchases",
      active: currentPage === "purchases",
    },
    {
      href: "/admin/summit/ticket-types",
      icon: "mdi:ticket-outline",
      label: "Ticket Types",
      active: currentPage === "ticket-types",
    },
    {
      href: "/admin/summit/promo-codes",
      icon: "mdi:coupon-outline",
      label: "Promo Codes",
      active: currentPage === "promo-codes",
    },
    {
      href: "/admin/summit/attendees",
      icon: "mdi:account-group-outline",
      label: "Attendees",
      active: currentPage === "attendees",
    },
    {
      href: "/admin/summit/payments",
      icon: "mdi:credit-card-check-outline",
      label: "Payments",
      active: currentPage === "payments",
    },
    {
      href: "/admin/summit/analytics",
      icon: "mdi:chart-box-outline",
      label: "Analytics",
      active: currentPage === "analytics",
    },
  ];

  return (
    <div
      className={`mb-6 p-4 rounded-lg border ${
        mode === "dark"
          ? "bg-gray-800 border-gray-700"
          : "bg-white border-gray-200"
      }`}
    >
      <div className="flex flex-wrap items-center gap-2">
        <span
          className={`text-sm font-medium ${
            mode === "dark" ? "text-gray-400" : "text-gray-600"
          }`}
        >
          Quick Navigation:
        </span>
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
              item.active
                ? "bg-paan-blue text-white"
                : mode === "dark"
                ? "bg-gray-700 text-gray-300 hover:bg-gray-600"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            <Icon icon={item.icon} className="w-4 h-4" />
            {item.label}
          </Link>
        ))}
      </div>
    </div>
  );
}

/**
 * Helper function to build deep link URLs
 */
export function buildSummitLink(page, params = {}) {
  const basePaths = {
    purchases: "/admin/summit/purchases",
    "ticket-types": "/admin/summit/ticket-types",
    "promo-codes": "/admin/summit/promo-codes",
    attendees: "/admin/summit/attendees",
    payments: "/admin/summit/payments",
    analytics: "/admin/summit/analytics",
  };

  const basePath = basePaths[page];
  if (!basePath) return "#";

  const queryString = new URLSearchParams(
    Object.entries(params).filter(([_, v]) => v != null && v !== "")
  ).toString();

  return queryString ? `${basePath}?${queryString}` : basePath;
}

/**
 * Hook to navigate to related summit pages
 */
export function useSummitNavigation() {
  const router = useRouter();

  const navigateTo = (page, params = {}) => {
    const url = buildSummitLink(page, params);
    router.push(url);
  };

  return { navigateTo, buildSummitLink };
}

