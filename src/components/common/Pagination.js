import { Icon } from "@iconify/react";

export default function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  mode = "light",
  loading = false,
}) {
  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 7;

    if (totalPages <= maxVisible) {
      // Show all pages
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Show first, last, and pages around current
      if (currentPage <= 3) {
        // Near start
        for (let i = 1; i <= 5; i++) pages.push(i);
        pages.push('...');
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        // Near end
        pages.push(1);
        pages.push('...');
        for (let i = totalPages - 4; i <= totalPages; i++) pages.push(i);
      } else {
        // Middle
        pages.push(1);
        pages.push('...');
        for (let i = currentPage - 1; i <= currentPage + 1; i++) pages.push(i);
        pages.push('...');
        pages.push(totalPages);
      }
    }

    return pages;
  };

  if (totalPages <= 1) return null;

  const pages = getPageNumbers();

  return (
    <div className="flex items-center justify-between px-4 py-3 sm:px-6">
      <div className="flex flex-1 justify-between sm:hidden">
        {/* Mobile pagination */}
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1 || loading}
          className={`relative inline-flex items-center px-4 py-2 text-sm font-medium rounded-md ${
            mode === "dark"
              ? "bg-gray-800 text-gray-300 hover:bg-gray-700"
              : "bg-white text-gray-700 hover:bg-gray-50"
          } border ${
            mode === "dark" ? "border-gray-700" : "border-gray-300"
          } disabled:opacity-50 disabled:cursor-not-allowed`}
        >
          Previous
        </button>
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages || loading}
          className={`relative ml-3 inline-flex items-center px-4 py-2 text-sm font-medium rounded-md ${
            mode === "dark"
              ? "bg-gray-800 text-gray-300 hover:bg-gray-700"
              : "bg-white text-gray-700 hover:bg-gray-50"
          } border ${
            mode === "dark" ? "border-gray-700" : "border-gray-300"
          } disabled:opacity-50 disabled:cursor-not-allowed`}
        >
          Next
        </button>
      </div>

      <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
        <div>
          <p className={`text-sm ${mode === "dark" ? "text-gray-400" : "text-gray-700"}`}>
            Page <span className="font-medium">{currentPage}</span> of{" "}
            <span className="font-medium">{totalPages}</span>
          </p>
        </div>
        <div>
          <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
            {/* Previous button */}
            <button
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage === 1 || loading}
              className={`relative inline-flex items-center rounded-l-md px-2 py-2 ${
                mode === "dark"
                  ? "bg-gray-800 text-gray-400 hover:bg-gray-700"
                  : "bg-white text-gray-400 hover:bg-gray-50"
              } ring-1 ring-inset ${
                mode === "dark" ? "ring-gray-700" : "ring-gray-300"
              } focus:z-20 focus:outline-offset-0 disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              <span className="sr-only">Previous</span>
              <Icon icon="heroicons:chevron-left" className="h-5 w-5" />
            </button>

            {/* Page numbers */}
            {pages.map((page, index) => {
              if (page === '...') {
                return (
                  <span
                    key={`ellipsis-${index}`}
                    className={`relative inline-flex items-center px-4 py-2 text-sm font-semibold ${
                      mode === "dark" ? "text-gray-400 bg-gray-800" : "text-gray-700 bg-white"
                    } ring-1 ring-inset ${
                      mode === "dark" ? "ring-gray-700" : "ring-gray-300"
                    }`}
                  >
                    ...
                  </span>
                );
              }

              const isActive = page === currentPage;
              return (
                <button
                  key={page}
                  onClick={() => onPageChange(page)}
                  disabled={loading}
                  className={`relative inline-flex items-center px-4 py-2 text-sm font-semibold ${
                    isActive
                      ? "z-10 bg-blue-600 text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
                      : mode === "dark"
                      ? "text-gray-300 bg-gray-800 hover:bg-gray-700"
                      : "text-gray-900 bg-white hover:bg-gray-50"
                  } ring-1 ring-inset ${
                    mode === "dark" ? "ring-gray-700" : "ring-gray-300"
                  } focus:z-20 focus:outline-offset-0 disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  {page}
                </button>
              );
            })}

            {/* Next button */}
            <button
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage === totalPages || loading}
              className={`relative inline-flex items-center rounded-r-md px-2 py-2 ${
                mode === "dark"
                  ? "bg-gray-800 text-gray-400 hover:bg-gray-700"
                  : "bg-white text-gray-400 hover:bg-gray-50"
              } ring-1 ring-inset ${
                mode === "dark" ? "ring-gray-700" : "ring-gray-300"
              } focus:z-20 focus:outline-offset-0 disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              <span className="sr-only">Next</span>
              <Icon icon="heroicons:chevron-right" className="h-5 w-5" />
            </button>
          </nav>
        </div>
      </div>
    </div>
  );
}
