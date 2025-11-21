/**
 * BlogSkeleton - Loading skeleton for blog cards
 * Shows while blog data is being fetched
 */

export default function BlogSkeleton({ mode = "light" }) {
  return (
    <div
      className={`animate-pulse rounded-xl border overflow-hidden ${
        mode === "dark"
          ? "bg-gray-800 border-gray-700"
          : "bg-white border-gray-200"
      } shadow-sm`}
    >
      {/* Image skeleton */}
      <div
        className={`h-48 w-full ${
          mode === "dark" ? "bg-gray-700" : "bg-gray-300"
        }`}
      />

      {/* Content skeleton */}
      <div className="p-4 space-y-3">
        {/* Title skeleton */}
        <div
          className={`h-5 rounded ${
            mode === "dark" ? "bg-gray-700" : "bg-gray-300"
          }`}
        />
        <div
          className={`h-5 w-3/4 rounded ${
            mode === "dark" ? "bg-gray-700" : "bg-gray-300"
          }`}
        />

        {/* Description skeleton */}
        <div className="space-y-2 pt-2">
          <div
            className={`h-3 rounded ${
              mode === "dark" ? "bg-gray-700" : "bg-gray-300"
            }`}
          />
          <div
            className={`h-3 rounded ${
              mode === "dark" ? "bg-gray-700" : "bg-gray-300"
            }`}
          />
          <div
            className={`h-3 w-2/3 rounded ${
              mode === "dark" ? "bg-gray-700" : "bg-gray-300"
            }`}
          />
        </div>

        {/* Footer skeleton */}
        <div className="flex items-center justify-between pt-3">
          <div
            className={`h-4 w-20 rounded ${
              mode === "dark" ? "bg-gray-700" : "bg-gray-300"
            }`}
          />
          <div
            className={`h-4 w-16 rounded ${
              mode === "dark" ? "bg-gray-700" : "bg-gray-300"
            }`}
          />
        </div>
      </div>
    </div>
  );
}
