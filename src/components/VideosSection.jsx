import { Icon } from "@iconify/react";

export default function VideosSection({ mode, videoMetrics }) {
  return (
    <div
      className={`p-5 rounded-xl ${
        mode === "dark"
          ? "bg-gray-800 border border-gray-700"
          : "bg-white border border-gray-100 shadow-sm"
      }`}
    >
      <div className="flex items-center justify-between mb-4">
        <h3
          className={`text-lg font-semibold ${
            mode === "dark" ? "text-white" : "text-gray-800"
          }`}
        >
          Video Resources
        </h3>
        <div
          className={`px-3 py-1 rounded-full text-xs font-medium ${
            mode === "dark"
              ? "bg-pink-900/30 text-pink-400"
              : "bg-pink-100 text-pink-600"
          }`}
        >
          20 Videos
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        {[videoMetrics.slice(0, 2), videoMetrics.slice(2, 4)].map(
          (videos, colIndex) => (
            <div key={colIndex} className="space-y-3">
              {videos.map((video, index) => (
                <div
                  key={index}
                  className={`p-3 rounded-lg ${
                    mode === "dark" ? "bg-gray-700" : "bg-gray-50"
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <p
                      className={`text-sm font-medium ${
                        mode === "dark" ? "text-white" : "text-gray-900"
                      }`}
                    >
                      {video.name}
                    </p>
                    <div
                      className={`px-2 py-1 rounded text-xs font-medium ${
                        mode === "dark"
                          ? "bg-blue-900/30 text-blue-400"
                          : "bg-blue-100 text-blue-600"
                      }`}
                    >
                      {video.engagement}% Engagement
                    </div>
                  </div>
                  <p
                    className={`text-xs mt-1 ${
                      mode === "dark" ? "text-gray-400" : "text-gray-500"
                    }`}
                  >
                    {video.views.toLocaleString()} views
                  </p>
                </div>
              ))}
            </div>
          )
        )}
      </div>
      <button
        className={`w-full mt-4 py-2 text-sm font-medium rounded-lg ${
          mode === "dark"
            ? "bg-gray-700 hover:bg-gray-600 text-gray-200"
            : "bg-gray-100 hover:bg-gray-200 text-gray-700"
        }`}
      >
        Manage Video Resources
      </button>
    </div>
  );
}
