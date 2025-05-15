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
  return (
    <>
      <div className="flex flex-col">
        <label
          htmlFor="max-answers"
          className={`block text-sm font-medium mb-2 ${
            mode === "dark" ? "text-gray-300" : "text-[#231812]"
          }`}
        >
          Maximum Answers (Optional)
        </label>
        <input
          type="number"
          value={maxAnswers}
          onChange={(e) => setMaxAnswers(e.target.value)}
          className={`w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#f05d23] transition duration-200 ${
            mode === "dark"
              ? "bg-gray-700 border-gray-600 text-white"
              : "bg-gray-50 border-gray-300 text-[#231812]"
          }`}
          placeholder="E.g., 3"
          min="1"
          id="max-answers"
        />
      </div>
      <div className="flex flex-col">
        <label
          htmlFor="max-words"
          className={`block text-sm font-medium mb-2 ${
            mode === "dark" ? "text-gray-300" : "text-[#231812]"
          }`}
        >
          Maximum Words (Optional)
        </label>
        <input
          type="number"
          value={maxWords}
          onChange={(e) => setMaxWords(e.target.value)}
          className={`w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#f05d23] transition duration-200 ${
            mode === "dark"
              ? "bg-gray-700 border-gray-600 text-white"
              : "bg-gray-50 border-gray-300 text-[#231812]"
          }`}
          placeholder="E.g., 150"
          min="1"
          id="max-words"
        />
      </div>
      <div className="flex flex-col">
        <label
          htmlFor="answer-structure"
          className={`block text-sm font-medium mb-2 ${
            mode === "dark" ? "text-gray-300" : "text-[#231812]"
          }`}
        >
          Answer Structure (Optional)
        </label>
        <select
          value={answerStructure}
          onChange={(e) => setAnswerStructure(e.target.value)}
          className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#f05d23] transition duration-200 ${
            mode === "dark"
              ? "bg-gray-700 border-gray-600 text-white"
              : "bg-gray-50 border-gray-300 text-[#231812]"
          }`}
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
      </div>
      <label
        className={`inline-flex items-center gap-2 mt-4 mb-2 cursor-pointer hover:text-[#f05d23] ${
          mode === "dark" ? "text-gray-300" : "text-[#231812]"
        }`}
      >
        <input
          type="checkbox"
          checked={skippable}
          onChange={(e) => setSkippable(e.target.checked)}
          className="hidden"
          id="skippable-checkbox"
        />
        <span>Allow skipping this question</span>
        <Icon
          icon={
            skippable ? "mdi:checkbox-marked" : "mdi:checkbox-blank-outline"
          }
          width={20}
          height={20}
        />
      </label>
      {maxAnswers && parseInt(maxAnswers) > 1 && (
        <label
          className={`inline-flex items-center gap-2 mt-4 mb-2 cursor-pointer hover:text-[#f05d23] ${
            mode === "dark" ? "text-gray-300" : "text-[#231812]"
          }`}
        >
          <input
            type="checkbox"
            checked={hasLinks}
            onChange={(e) => setHasLinks(e.target.checked)}
            className="hidden"
            id="has-links-checkbox"
          />
          <span>Include optional link fields for answers</span>
          <Icon
            icon={
              hasLinks ? "mdi:checkbox-marked" : "mdi:checkbox-blank-outline"
            }
            width={20}
            height={20}
          />
        </label>
      )}
    </>
  );
}
