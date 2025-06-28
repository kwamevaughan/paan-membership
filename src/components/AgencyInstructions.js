import { Icon } from "@iconify/react";

export default function AgencyInstructions({ mode }) {
  return (
    <div
      className={`space-y-6 p-4 overflow-y-auto border rounded-lg max-h-[75vh] ${
        mode === "dark" 
          ? "bg-gray-800/50 border-gray-700" 
          : "bg-gray-50 border-blue-200"
      }`}
    >
      {/* Header Section */}
      <div className="flex items-center gap-3 pb-4 border-b border-gray-200 dark:border-gray-700">
        <div className="p-2 bg-paan-blue rounded-lg">
          <Icon icon="lucide:file-text" className="w-6 h-6 text-white" />
        </div>
        <div>
          <h3 className="text-xl font-normal text-paan-deep-blue">
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

      {/* Required Documents Section */}
      {/* <div className="space-y-4">
        <div className="flex items-center gap-2 mb-3">
          <Icon icon="lucide:check-circle" className="w-5 h-5 text-paan-yellow" />
          <h4 className={`font-semibold text-paan-deep-blue`}>Required Documents</h4>
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
                className="w-5 h-5 text-paan-blue mt-0.5"
              />
              <div>
                <h5 className={`font-medium mb-1 ${mode === "dark" ? "text-gray-100" : "text-gray-900"}`}>Company Registration</h5>
                <p
                  className={`text-sm ${
                    mode === "dark" ? "text-gray-300" : "text-gray-600"
                  }`}
                >
                  Official registration certificate or business license
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
                className="w-5 h-5 text-paan-blue mt-0.5"
              />
              <div>
                <h5 className={`font-medium mb-1 ${mode === "dark" ? "text-gray-100" : "text-gray-900"}`}>Company Profile</h5>
                <p
                  className={`text-sm ${
                    mode === "dark" ? "text-gray-300" : "text-gray-600"
                  }`}
                >
                  Detailed overview of your agency&apos;s services and
                  capabilities
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
                className="w-5 h-5 text-paan-blue mt-0.5"
              />
              <div>
                <h5 className={`font-medium mb-1 ${mode === "dark" ? "text-gray-100" : "text-gray-900"}`}>Portfolio</h5>
                <p
                  className={`text-sm ${
                    mode === "dark" ? "text-gray-300" : "text-gray-600"
                  }`}
                >
                  Examples of your agency&apos;s previous work or projects
                </p>
              </div>
            </div>
          </div>
        </div>
      </div> */}

      {/* Process Information */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 mb-3">
          <Icon icon="lucide:info" className="w-5 h-5 text-paan-blue" />
          <h4 className={`font-semibold text-paan-deep-blue`}>Process Information</h4>
        </div>
        <div
          className={`p-4 rounded-lg border ${
            mode === "dark" 
              ? "bg-paan-blue/10 border-paan-blue/20" 
              : "bg-paan-blue/10 border-paan-blue/20"
          }`}
        >
          <ul className="space-y-3">
            <li className="flex items-start gap-2">
              <Icon
                icon="lucide:clock"
                className="w-5 h-5 text-paan-blue mt-0.5"
              />
              <p
                className={`text-sm ${
                  mode === "dark" ? "text-paan-deep-blue" : "text-paan-deep-blue"
                }`}
              >
                <strong>Time Estimate:</strong> Complete the form in about 5
                minutes
              </p>
            </li>
            <li className="flex items-start gap-2">
              <Icon
                icon="lucide:save"
                className="w-5 h-5 text-paan-blue mt-0.5"
              />
              <p
                className={`text-sm ${
                  mode === "dark" ? "text-paan-deep-blue" : "text-paan-deep-blue"
                }`}
              >
                <strong>Auto-Save:</strong> Your progress is automatically saved
              </p>
            </li>
            <li className="flex items-start gap-2">
              <Icon
                icon="lucide:shield-check"
                className="w-5 h-5 text-paan-blue mt-0.5"
              />
              <p
                className={`text-sm ${
                  mode === "dark" ? "text-paan-deep-blue" : "text-paan-deep-blue"
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
          <Icon icon="lucide:help-circle" className="w-5 h-5 text-paan-blue" />
          <h4 className={`font-semibold text-paan-deep-blue`}>Need Help?</h4>
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
                  ? "text-paan-blue hover:text-paan-blue" 
                  : "text-paan-blue hover:text-paan-blue"
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
