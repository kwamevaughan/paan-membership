export default function DependencyFields({
  dependsOnQuestionId,
  setDependsOnQuestionId,
  dependsOnAnswer,
  setDependsOnAnswer,
  questions,
  question,
  mode,
}) {
  return (
    <>
      <div className="flex flex-col">
        <label
          htmlFor="depends-on-question"
          className={`block text-sm font-medium mb-2 ${
            mode === "dark" ? "text-gray-300" : "text-[#231812]"
          }`}
        >
          Depends on Question (Optional)
        </label>
        <select
          value={dependsOnQuestionId}
          onChange={(e) => setDependsOnQuestionId(e.target.value)}
          className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#f05d23] transition duration-200 ${
            mode === "dark"
              ? "bg-gray-700 border-gray-600 text-white"
              : "bg-gray-50 border-gray-300 text-[#231812]"
          }`}
          id="depends-on-question"
        >
          <option value="">None</option>
          {questions
            .filter((q) => q.id !== question?.id)
            .map((q) => (
              <option key={q.id} value={q.id}>
                {q.text}
              </option>
            ))}
        </select>
      </div>
      {dependsOnQuestionId && (
        <div className="flex flex-col">
          <label
            htmlFor="depends-on-answer"
            className={`block text-sm font-medium mb-2 ${
              mode === "dark" ? "text-gray-300" : "text-[#231812]"
            }`}
          >
            Depends on Answer
          </label>
          <input
            type="text"
            value={dependsOnAnswer}
            onChange={(e) => setDependsOnAnswer(e.target.value)}
            className={`w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#f05d23] transition duration-200 ${
              mode === "dark"
                ? "bg-gray-700 border-gray-600 text-white"
                : "bg-gray-50 border-gray-300 text-[#231812]"
            }`}
            placeholder="E.g., Yes"
            id="depends-on-answer"
          />
        </div>
      )}
    </>
  );
}
