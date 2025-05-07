import { Icon } from "@iconify/react";

export default function NonOpenEndedOptions({
  options,
  handleOptionChange,
  isMultiSelect,
  setIsMultiSelect,
  isOtherEnabled,
  setIsOtherEnabled,
  otherOptionText,
  setOtherOptionText,
  textInputOption,
  setTextInputOption,
  textInputPlaceholder,
  setTextInputPlaceholder,
  mode,
  textInputMaxAnswers,
  setTextInputMaxAnswers,
}) {
  return (
    <div>
      <label
        htmlFor="options-textarea"
        className={`block text-sm font-medium mb-2 ${
          mode === "dark" ? "text-gray-300" : "text-[#231812]"
        }`}
      >
        Options (one per line) <span className="text-red-500">*</span>
      </label>
      <textarea
        value={options}
        onChange={handleOptionChange}
        className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#f05d23] transition duration-200 min-h-[50px] ${
          mode === "dark"
            ? "bg-gray-700 border-gray-600 text-white"
            : "bg-gray-50 border-gray-300 text-[#231812]"
        }`}
        placeholder="Enter each option on a new line..."
        required
        id="options-textarea"
      />
      <label
        className={`inline-flex items-center gap-2 mt-4 mb-4 cursor-pointer hover:text-[#f05d23] ${
          mode === "dark" ? "text-gray-300" : "text-[#231812]"
        }`}
      >
        <input
          type="checkbox"
          checked={isMultiSelect}
          onChange={(e) => setIsMultiSelect(e.target.checked)}
          className="hidden"
          id="multi-select-checkbox"
        />
        <span>Allow multiple selections</span>
        <Icon
          icon={
            isMultiSelect ? "mdi:checkbox-marked" : "mdi:checkbox-blank-outline"
          }
          width={20}
          height={20}
        />
      </label>
      <label
        className={`inline-flex items-center gap-2 mt-4 mb-4 cursor-pointer hover:text-[#f05d23] ${
          mode === "dark" ? "text-gray-300" : "text-[#231812]"
        }`}
      >
        <input
          type="checkbox"
          checked={isOtherEnabled}
          onChange={(e) => setIsOtherEnabled(e.target.checked)}
          className="hidden"
          id="other-option-checkbox"
        />
        <span>Enable "Other" option</span>
        <Icon
          icon={
            isOtherEnabled
              ? "mdi:checkbox-marked"
              : "mdi:checkbox-blank-outline"
          }
          width={20}
          height={20}
        />
      </label>
      {isOtherEnabled && (
        <div className="flex flex-col gap-2 mt-4">
          <label
            htmlFor="other-option-text"
            className={`block text-sm font-medium ${
              mode === "dark" ? "text-gray-300" : "text-[#231812]"
            }`}
          >
            Placeholder for "Other" Text Input
          </label>
          <input
            type="text"
            value={otherOptionText}
            onChange={(e) => setOtherOptionText(e.target.value)}
            className={`w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#f05d23] transition duration-200 ${
              mode === "dark"
                ? "bg-gray-700 border-gray-600 text-white"
                : "bg-gray-50 border-gray-300 text-[#231812]"
            }`}
            placeholder="E.g., Specify your answer"
            id="other-option-text"
          />
        </div>
      )}
      {!isOtherEnabled && (
        <div className="space-y-4 mt-4">
          <div className="flex flex-col">
            <label
              htmlFor="text-input-option"
              className={`block text-sm font-medium mb-2 ${
                mode === "dark" ? "text-gray-300" : "text-[#231812]"
              }`}
            >
              Option Requiring Text Input (Optional)
            </label>
            <select
              value={textInputOption?.option || ""}
              onChange={(e) =>
                setTextInputOption({ option: e.target.value || null })
              }
              className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#f05d23] transition duration-200 ${
                mode === "dark"
                  ? "bg-gray-700 border-gray-600 text-white"
                  : "bg-gray-50 border-gray-300 text-[#231812]"
              }`}
              id="text-input-option"
            >
              <option value="">None</option>
              <option value="Any">Any</option>
              {options
                .split("\n")
                .map((opt) => opt.trim())
                .filter((opt) => opt)
                .map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
            </select>
          </div>
          {textInputOption?.option && (
            <>
              <div className="flex flex-col">
                <label
                  htmlFor="text-input-placeholder"
                  className={`block text-sm font-medium mb-2 ${
                    mode === "dark" ? "text-gray-300" : "text-[#231812]"
                  }`}
                >
                  Placeholder for Text Input
                </label>
                <input
                  type="text"
                  value={textInputPlaceholder}
                  onChange={(e) => setTextInputPlaceholder(e.target.value)}
                  className={`w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#f05d23] transition duration-200 ${
                    mode === "dark"
                      ? "bg-gray-700 border-gray-600 text-white"
                      : "bg-gray-50 border-gray-300 text-[#231812]"
                  }`}
                  placeholder="E.g., List certifications"
                  id="text-input-placeholder"
                />
              </div>
              <div className="flex flex-col">
                <label
                  htmlFor="text-input-max-answers"
                  className={`block text-sm font-medium mb-2 ${
                    mode === "dark" ? "text-gray-300" : "text-[#231812]"
                  }`}
                >
                  Maximum Number of Text Inputs (Optional)
                </label>
                <input
                  type="number"
                  value={textInputMaxAnswers}
                  onChange={(e) => setTextInputMaxAnswers(e.target.value)}
                  className={`w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#f05d23] transition duration-200 ${
                    mode === "dark"
                      ? "bg-gray-700 border-gray-600 text-white"
                      : "bg-gray-50 border-gray-300 text-[#231812]"
                  }`}
                  placeholder="E.g., 5"
                  min="1"
                  id="text-input-max-answers"
                />
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
