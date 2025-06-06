import { Icon } from "@iconify/react";

export default function FreelancerInstructions({ mode }) {
  return (
    <div
      className={`space-y-6 p-4 overflow-y-auto border rounded-lg ${
        mode === "dark" 
          ? "bg-gray-800/50 border-gray-700" 
          : "bg-gray-50 border-blue-200"
      }`}
    >
      {/* Header Section */}
      <div className="flex items-center gap-3 pb-4 border-b border-gray-200 dark:border-gray-700">
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
            Submission takes less than 10 minutes
          </p>
        </div>
      </div>

      {/* Required Documents Section */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 mb-3">
          <Icon icon="lucide:check-circle" className="w-5 h-5 text-green-500" />
          <h4 className={`font-semibold ${mode === "dark" ? "text-gray-100" : "text-gray-900"}`}>Required Documents</h4>
        </div>
        <div className="grid gap-3">
          <div
            className={`p-3 rounded-lg ${
              mode === "dark" ? "bg-gray-700/50 border border-gray-600" : "bg-white border border-gray-200"
            }`}
          >
            <div className="flex items-start gap-3">
              <Icon
                icon="lucide:file-text"
                className="w-5 h-5 text-blue-500 mt-0.5"
              />
              <div>
                <h5 className={`font-medium mb-1 ${mode === "dark" ? "text-gray-100" : "text-gray-900"}`}>Portfolio</h5>
                <p
                  className={`text-sm ${
                    mode === "dark" ? "text-gray-300" : "text-gray-600"
                  }`}
                >
                  Your best work samples or portfolio website
                </p>
              </div>
            </div>
          </div>
          <div
            className={`p-3 rounded-lg ${
              mode === "dark" ? "bg-gray-700/50 border border-gray-600" : "bg-white border border-gray-200"
            }`}
          >
            <div className="flex items-start gap-3">
              <Icon
                icon="lucide:file-text"
                className="w-5 h-5 text-blue-500 mt-0.5"
              />
              <div>
                <h5 className={`font-medium mb-1 ${mode === "dark" ? "text-gray-100" : "text-gray-900"}`}>Resume/CV</h5>
                <p
                  className={`text-sm ${
                    mode === "dark" ? "text-gray-300" : "text-gray-600"
                  }`}
                >
                  Updated professional resume or CV
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Process Information */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 mb-3">
          <Icon icon="lucide:info" className="w-5 h-5 text-blue-500" />
          <h4 className={`font-semibold ${mode === "dark" ? "text-gray-100" : "text-gray-900"}`}>Process Information</h4>
        </div>
        <div
          className={`p-4 rounded-lg border ${
            mode === "dark" 
              ? "bg-blue-500/10 border-blue-400/20" 
              : "bg-blue-50 border-blue-100"
          }`}
        >
          <ul className="space-y-3">
            <li className="flex items-start gap-2">
              <Icon
                icon="lucide:clock"
                className="w-5 h-5 text-blue-500 mt-0.5"
              />
              <p
                className={`text-sm ${
                  mode === "dark" ? "text-blue-300" : "text-blue-700"
                }`}
              >
                <strong>Time Estimate:</strong> Complete the form in about 10
                minutes
              </p>
            </li>
            <li className="flex items-start gap-2">
              <Icon
                icon="lucide:save"
                className="w-5 h-5 text-blue-500 mt-0.5"
              />
              <p
                className={`text-sm ${
                  mode === "dark" ? "text-blue-300" : "text-blue-700"
                }`}
              >
                <strong>Auto-Save:</strong> Your progress is automatically saved
              </p>
            </li>
            <li className="flex items-start gap-2">
              <Icon
                icon="lucide:shield-check"
                className="w-5 h-5 text-blue-500 mt-0.5"
              />
              <p
                className={`text-sm ${
                  mode === "dark" ? "text-blue-300" : "text-blue-700"
                }`}
              >
                <strong>Secure:</strong> Your information is encrypted and
                protected
              </p>
            </li>
          </ul>
        </div>
      </div>

      {/* Contact Section */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 mb-3">
          <Icon icon="lucide:help-circle" className="w-5 h-5 text-blue-500" />
          <h4 className={`font-semibold ${mode === "dark" ? "text-gray-100" : "text-gray-900"}`}>Need Help?</h4>
        </div>
        <div
          className={`p-4 rounded-lg border ${
            mode === "dark" 
              ? "bg-gray-700/50 border-gray-600" 
              : "bg-white border-gray-200"
          }`}
        >
          <p
            className={`text-sm ${
              mode === "dark" ? "text-gray-300" : "text-gray-600"
            }`}
          >
            If you need assistance, please contact us at{" "}
            <a
              href="mailto:support@paan.africa"
              className={`${
                mode === "dark" 
                  ? "text-blue-400 hover:text-blue-300" 
                  : "text-blue-500 hover:text-blue-600"
              } underline`}
            >
              support@paan.africa
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
