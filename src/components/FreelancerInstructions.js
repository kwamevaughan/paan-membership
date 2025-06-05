import { Icon } from "@iconify/react";

export default function FreelancerInstructions({ mode, setIsInstructionsOpen }) {
  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div
        className={`flex items-center gap-3 pb-4 border-b ${
          mode === "dark" ? "border-gray-500" : "border-gray-200"
        }`}
      >
        <div className="p-2 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg">
          <Icon icon="lucide:file-text" className="w-6 h-6 text-white" />
        </div>
        <div>
          <h3 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-blue-500 bg-clip-text text-transparent">
            Prepare for Your Application
          </h3>
          <p
            className={`text-sm ${
              mode === "dark" ? "text-gray-300" : "text-gray-600"
            }`}
          >
            Submission takes less than 5 minutes
          </p>
        </div>
      </div>


      {/* Process Information */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 mb-3">
          <Icon icon="lucide:info" className="w-5 h-5 text-blue-500" />
          <h4
            className={`font-semibold ${
              mode === "dark" ? "text-gray-100" : "text-gray-900"
            }`}
          >
            What to Expect
          </h4>
        </div>

        <div className="space-y-3">
          {[
            {
              icon: "lucide:clock",
              text: "Complete registration in approximately 5 minutes",
              highlight: "5 minutes",
            },
            {
              icon: "lucide:save",
              text: "Progress automatically saved for same-device resume",
              highlight: "automatically saved",
            },
            {
              icon: "lucide:check-circle",
              text: "Ensure all required fields are completed before submission",
              highlight: "required fields",
            },
          ].map((item, index) => (
            <div key={index} className="flex items-center gap-3">
              <Icon
                icon={item.icon}
                className="w-4 h-4 text-blue-500 flex-shrink-0"
              />
              <p
                className={`text-sm ${
                  mode === "dark" ? "text-gray-300" : "text-gray-700"
                }`}
              >
                {item.text.split(item.highlight).map((part, i) =>
                  i === 0 ? (
                    part
                  ) : (
                    <span key={i}>
                      <span
                        className={`font-semibold ${
                          mode === "dark" ? "text-blue-400" : "text-blue-600"
                        }`}
                      >
                        {item.highlight}
                      </span>
                      {part}
                    </span>
                  )
                )}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Contact Section */}
      <div
        className={`p-4 rounded-lg border ${
          mode === "dark"
            ? "bg-gray-900/20 border-blue-800"
            : "bg-gradient-to-r from-blue-50 to-orange-50 border-blue-200"
        }`}
      >
        <div className="flex items-start gap-3">
          <Icon
            icon="lucide:help-circle"
            className="w-5 h-5 text-orange-500 flex-shrink-0 mt-0.5"
          />
          <div>
            <p
              className={`text-sm ${
                mode === "dark" ? "text-gray-300" : "text-gray-700"
              } mb-2`}
            >
              Need assistance? We&apos;re here to help!
            </p>
            <a
              href="mailto:support@paan.africa"
              className={`inline-flex items-center gap-2 text-sm font-medium ${
                mode === "dark"
                  ? "text-blue-400 hover:text-blue-300"
                  : "text-blue-600 hover:text-blue-700"
              } transition-colors`}
            >
              <Icon icon="lucide:mail" className="w-4 h-4" />
              support@paan.africa
            </a>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div
        className={`flex gap-3 pt-4 border-t ${
          mode === "dark" ? "border-gray-700" : "border-gray-200"
        }`}
      >
        <button
          onClick={() => setIsInstructionsOpen(false)}
          className={`flex-1 px-4 py-2.5 rounded-lg font-medium transition-colors ${
            mode === "dark"
              ? "bg-gray-700 text-gray-300 hover:bg-gray-600"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          }`}
        >
          Close
        </button>
        <button
          onClick={() => {
            setIsInstructionsOpen(false);
            // Add logic to proceed to application
          }}
          className={`flex-1 px-4 py-2.5 rounded-lg font-medium transition-all flex items-center justify-center gap-2 ${
            mode === "dark"
              ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700"
              : "bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700"
          }`}
        >
          <span>Start Application</span>
          <Icon icon="lucide:arrow-right" className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
