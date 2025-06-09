import { Icon } from "@iconify/react";

export default function OpenEndedOptions({
  maxAnswers,
  setMaxAnswers,
  maxWords,
  setMaxWords,
  answerStructure,
  setAnswerStructure,
  skippable,
  setSkippable,
  hasLinks,
  setHasLinks,
  mode,
}) {
  const inputStyles = `w-full p-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300 ${
    mode === "dark"
      ? "bg-gray-700/50 border-gray-600 text-white hover:border-blue-500/50"
      : "bg-gray-50 border-gray-300 text-[#231812] hover:border-blue-500/50"
  }`;

  const checkboxStyles = `inline-flex items-center gap-3 p-3 rounded-xl transition-all duration-300 cursor-pointer group ${
    mode === "dark"
      ? "hover:bg-gray-700/50"
      : "hover:bg-gray-50"
  }`;

  return (
    <div className="space-y-6 p-4 rounded-xl bg-gradient-to-br from-gray-50/50 to-gray-100/50 dark:from-gray-800/50 dark:to-gray-900/50 backdrop-blur-sm">
      <div className="flex flex-col gap-2">
        <label
          htmlFor="max-answers"
          className={`block text-sm font-medium ${
            mode === "dark" ? "text-gray-300" : "text-[#231812]"
          }`}
        >
          Maximum Answers
          <span className="text-xs text-gray-500 ml-1">(Optional)</span>
        </label>
        <div className="relative">
          <input
            type="number"
            value={maxAnswers}
            onChange={(e) => setMaxAnswers(e.target.value)}
            className={inputStyles}
            placeholder="E.g., 3"
            min="1"
            id="max-answers"
          />
          <Icon
            icon="mdi:numeric"
            className={`absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 ${
              mode === "dark" ? "text-gray-400" : "text-gray-500"
            }`}
          />
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <label
          htmlFor="max-words"
          className={`block text-sm font-medium ${
            mode === "dark" ? "text-gray-300" : "text-[#231812]"
          }`}
        >
          Maximum Words
          <span className="text-xs text-gray-500 ml-1">(Optional)</span>
        </label>
        <div className="relative">
          <input
            type="number"
            value={maxWords}
            onChange={(e) => setMaxWords(e.target.value)}
            className={inputStyles}
            placeholder="E.g., 150"
            min="1"
            id="max-words"
          />
          <Icon
            icon="mdi:format-text"
            className={`absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 ${
              mode === "dark" ? "text-gray-400" : "text-gray-500"
            }`}
          />
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <label
          htmlFor="answer-structure"
          className={`block text-sm font-medium ${
            mode === "dark" ? "text-gray-300" : "text-[#231812]"
          }`}
        >
          Answer Structure
          <span className="text-xs text-gray-500 ml-1">(Optional)</span>
        </label>
        <div className="relative">
          <select
            value={answerStructure}
            onChange={(e) => setAnswerStructure(e.target.value)}
            className={`${inputStyles} appearance-none pr-10`}
            id="answer-structure"
          >
            <option value="">None</option>
            <option value="client_references">
              Client References (Name, Role, Email)
            </option>
            <option value="case_studies">
              Case Studies (Project, Role, Client/Agency)
            </option>
            <option value="testimonials_references">
              Testimonials References (Name, Email, Phone, Country, Link to work
              done)
            </option>
          </select>
          <Icon
            icon="mdi:chevron-down"
            className={`absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 pointer-events-none ${
              mode === "dark" ? "text-gray-400" : "text-gray-500"
            }`}
          />
        </div>
      </div>

      <div className="space-y-3 pt-2">
        <label
          className={checkboxStyles}
          htmlFor="skippable-checkbox"
        >
          <input
            type="checkbox"
            checked={skippable}
            onChange={(e) => setSkippable(e.target.checked)}
            className="hidden"
            id="skippable-checkbox"
          />
          <div className={`p-1 rounded-lg transition-all duration-300 ${
            skippable 
              ? "bg-blue-500 text-white" 
              : mode === "dark" 
                ? "bg-gray-700 text-gray-400" 
                : "bg-gray-200 text-gray-500"
          }`}>
            <Icon
              icon={skippable ? "mdi:checkbox-marked" : "mdi:checkbox-blank-outline"}
              width={20}
              height={20}
              className="transition-transform duration-300 group-hover:scale-110"
            />
          </div>
          <span className={`text-sm font-medium ${
            mode === "dark" ? "text-gray-300" : "text-[#231812]"
          }`}>
            Allow skipping this question
          </span>
        </label>

        {maxAnswers && parseInt(maxAnswers) > 1 && (
          <label
            className={checkboxStyles}
            htmlFor="has-links-checkbox"
          >
            <input
              type="checkbox"
              checked={hasLinks}
              onChange={(e) => setHasLinks(e.target.checked)}
              className="hidden"
              id="has-links-checkbox"
            />
            <div className={`p-1 rounded-lg transition-all duration-300 ${
              hasLinks 
                ? "bg-blue-500 text-white" 
                : mode === "dark" 
                  ? "bg-gray-700 text-gray-400" 
                  : "bg-gray-200 text-gray-500"
            }`}>
              <Icon
                icon={hasLinks ? "mdi:checkbox-marked" : "mdi:checkbox-blank-outline"}
                width={20}
                height={20}
                className="transition-transform duration-300 group-hover:scale-110"
              />
            </div>
            <span className={`text-sm font-medium ${
              mode === "dark" ? "text-gray-300" : "text-[#231812]"
            }`}>
              Include optional link fields for answers
            </span>
          </label>
        )}
      </div>
    </div>
  );
}
