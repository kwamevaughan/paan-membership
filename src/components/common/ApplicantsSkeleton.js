/**
 * ApplicantsSkeleton - Loading skeleton for applicants table
 * Shows while applicant data is being fetched
 */

export default function ApplicantsSkeleton({ mode = "light", rows = 10 }) {
  return (
    <div
      className={`rounded-xl border overflow-hidden ${
        mode === "dark"
          ? "bg-gray-800 border-gray-700"
          : "bg-white border-gray-200"
      } shadow-sm`}
    >
      {/* Table Header Skeleton */}
      <div
        className={`px-6 py-4 border-b ${
          mode === "dark" ? "border-gray-700 bg-gray-800" : "border-gray-200 bg-gray-50"
        }`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div
              className={`h-4 w-4 rounded ${
                mode === "dark" ? "bg-gray-700" : "bg-gray-300"
              } animate-pulse`}
            />
            <div
              className={`h-4 w-32 rounded ${
                mode === "dark" ? "bg-gray-700" : "bg-gray-300"
              } animate-pulse`}
            />
            <div
              className={`h-4 w-24 rounded ${
                mode === "dark" ? "bg-gray-700" : "bg-gray-300"
              } animate-pulse`}
            />
            <div
              className={`h-4 w-20 rounded ${
                mode === "dark" ? "bg-gray-700" : "bg-gray-300"
              } animate-pulse`}
            />
            <div
              className={`h-4 w-16 rounded ${
                mode === "dark" ? "bg-gray-700" : "bg-gray-300"
              } animate-pulse`}
            />
          </div>
          <div
            className={`h-4 w-20 rounded ${
              mode === "dark" ? "bg-gray-700" : "bg-gray-300"
            } animate-pulse`}
          />
        </div>
      </div>

      {/* Table Rows Skeleton */}
      <div className="divide-y divide-gray-200 dark:divide-gray-700">
        {[...Array(rows)].map((_, i) => (
          <div key={i} className="px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                {/* Checkbox */}
                <div
                  className={`h-4 w-4 rounded ${
                    mode === "dark" ? "bg-gray-700" : "bg-gray-300"
                  } animate-pulse`}
                />
                
                {/* Name */}
                <div className="space-y-1">
                  <div
                    className={`h-4 w-32 rounded ${
                      mode === "dark" ? "bg-gray-700" : "bg-gray-300"
                    } animate-pulse`}
                  />
                  <div
                    className={`h-3 w-40 rounded ${
                      mode === "dark" ? "bg-gray-700" : "bg-gray-300"
                    } animate-pulse`}
                  />
                </div>
                
                {/* Opening */}
                <div
                  className={`h-4 w-24 rounded ${
                    mode === "dark" ? "bg-gray-700" : "bg-gray-300"
                  } animate-pulse`}
                />
                
                {/* Status */}
                <div
                  className={`h-6 w-20 rounded-full ${
                    mode === "dark" ? "bg-gray-700" : "bg-gray-300"
                  } animate-pulse`}
                />
                
                {/* Tier */}
                <div
                  className={`h-6 w-16 rounded-full ${
                    mode === "dark" ? "bg-gray-700" : "bg-gray-300"
                  } animate-pulse`}
                />
                
                {/* Date */}
                <div
                  className={`h-4 w-20 rounded ${
                    mode === "dark" ? "bg-gray-700" : "bg-gray-300"
                  } animate-pulse`}
                />
              </div>
              
              {/* Actions */}
              <div className="flex items-center space-x-2">
                <div
                  className={`h-8 w-8 rounded ${
                    mode === "dark" ? "bg-gray-700" : "bg-gray-300"
                  } animate-pulse`}
                />
                <div
                  className={`h-8 w-8 rounded ${
                    mode === "dark" ? "bg-gray-700" : "bg-gray-300"
                  } animate-pulse`}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
