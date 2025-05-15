import Link from "next/link";
import { useRouter } from "next/router";
import { Icon } from "@iconify/react";

const Breadcrumb = ({ breadcrumbs, mode }) => {
  const router = useRouter();

  return (
    <nav aria-label="Breadcrumb" className="w-full">
      <div
        className={`bg-gray-200 p-2 rounded-lg shadow-sm ${
          mode === "dark" ? "bg-gray-700 text-white" : "text-black"
        }`}
      >
        <ol className="flex items-center space-x-2 px-4">
          {breadcrumbs.map((crumb, index) => {
            const isLast = index === breadcrumbs.length - 1;
            const isFirst = index === 0;
            return (
              <li key={crumb.href} className="flex items-center">
                {!isFirst && (
                  <span
                    className={`mx-2 ${
                      mode === "dark" ? "text-gray-400" : "text-gray-500"
                    }`}
                  >
                    |
                  </span>
                )}
                {isLast ? (
                  <span
                    className={`px-4 py-2 rounded-full font-bold ${
                      mode === "dark"
                        ? "bg-gray-600 text-white"
                        : "bg-gray-200 text-black"
                    }`}
                  >
                    {crumb.label}
                  </span>
                ) : (
                  <Link
                    href={crumb.href}
                    className={`px-4 py-2 rounded-full transition-colors ${
                      mode === "dark"
                        ? "bg-gray-500 text-gray-200 hover:bg-gray-600"
                        : "bg-blue-100 text-gray-700 hover:bg-blue-200"
                    }`}
                  >
                    {crumb.label}
                  </Link>
                )}
              </li>
            );
          })}
        </ol>
      </div>
    </nav>
  );
};

export default Breadcrumb;
