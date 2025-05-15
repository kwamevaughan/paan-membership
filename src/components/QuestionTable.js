import { Icon } from "@iconify/react";
import DraggableQuestion from "@/components/DraggableQuestion";
import { stripHtmlTags } from "@/../utils/questionUtils";

export default function QuestionTable({
  questions = [],
  categories = [],
  mode,
  onEdit,
  moveQuestion,
  handleSort,
  sortField,
  sortDirection,
  deleteQuestion,
}) {
  // Debug incoming questions
  console.log(
    "QuestionTable questions:",
    questions.map((q) => ({ id: q.id, job_type: q.job_type }))
  );

  const getCategoryName = (categoryId) => {
    if (!Array.isArray(categories) || categories.length === 0) {
      return "—";
    }

    if (typeof categoryId === "object" && categoryId?.name) {
      return categoryId.name;
    }

    const category = categories.find((cat) => cat.id === categoryId);
    return category ? category.name : "—";
  };

  const isQuestionComplete = (question) => {
    if (!question.text?.trim()) return false;
    if (
      !question.is_open_ended &&
      !question.is_country_select &&
      (!Array.isArray(question.options) || !question.options.length)
    ) {
      return false;
    }
    return true;
  };

  const formatOptions = (options) => {
    if (!Array.isArray(options) || options.length === 0) {
      return "—";
    }
    if (options.length <= 3) {
      return options.join(", ");
    }
    return `${options.slice(0, 3).join(", ")}, ...`;
  };

  const handleMobileDelete = (question) => {
    const cleanText = stripHtmlTags(question.text);
    console.log(
      `Delete Question? Are you sure you want to delete "${cleanText}"?`
    );
    const confirmed = window.confirm(
      `Are you sure you want to delete "${cleanText}"?`
    );
    if (confirmed) {
      deleteQuestion(question.id, question.text);
      console.log("Question deleted successfully!");
    }
  };

  return (
    <div
      className={`border-t-4 border-[#84c1d9] rounded-lg shadow-lg overflow-hidden ${
        mode === "dark" ? "bg-gray-800" : "bg-white"
      }`}
    >
      <div className="max-h-[500px] overflow-y-auto">
        {/* Table layout */}
        <table className="w-full hidden sm:table">
          <thead className="sticky top-0 z-10">
            <tr
              className={`${
                mode === "dark"
                  ? "bg-gray-700 text-gray-200"
                  : "bg-gray-100 text-gray-800"
              }`}
            >
              <th className="p-2 sm:p-4 w-8 sm:w-12"></th>
              <th
                className="flex p-2 sm:p-4 text-left text-xs sm:text-base font-semibold cursor-pointer"
                onClick={() => handleSort("order")}
              >
                Order{" "}
                {sortField === "order" && (
                  <Icon
                    icon={
                      sortDirection === "asc"
                        ? "mdi:arrow-up"
                        : "mdi:arrow-down"
                    }
                    width={14}
                    height={14}
                    className={`inline ${
                      mode === "dark" ? "text-gray-200" : "text-gray-800"
                    }`}
                  />
                )}
              </th>
              <th
                className="p-2 sm:p-4 text-left text-xs sm:text-base font-semibold cursor-pointer"
                onClick={() => handleSort("text")}
              >
                Question{" "}
                {sortField === "text" && (
                  <Icon
                    icon={
                      sortDirection === "asc"
                        ? "mdi:arrow-up"
                        : "mdi:arrow-down"
                    }
                    width={14}
                    height={14}
                    className={`inline ${
                      mode === "dark" ? "text-gray-200" : "text-gray-800"
                    }`}
                  />
                )}
              </th>
              <th className="p-2 sm:p-4 text-left text-xs sm:text-base font-semibold">
                Options
              </th>
              <th
                className="p-2 sm:p-4 text-left text-xs sm:text-base font-semibold cursor-pointer"
                onClick={() => handleSort("category")}
              >
                Category{" "}
                {sortField === "category" && (
                  <Icon
                    icon={
                      sortDirection === "asc"
                        ? "mdi:arrow-up"
                        : "mdi:arrow-down"
                    }
                    width={14}
                    height={14}
                    className={`inline ${
                      mode === "dark" ? "text-gray-200" : "text-gray-800"
                    }`}
                  />
                )}
              </th>
              <th
                className="p-2 sm:p-4 text-left text-xs sm:text-base font-semibold cursor-pointer"
                onClick={() => handleSort("job_type")}
              >
                Job Type{" "}
                {sortField === "job_type" && (
                  <Icon
                    icon={
                      sortDirection === "asc"
                        ? "mdi:arrow-up"
                        : "mdi:arrow-down"
                    }
                    width={14}
                    height={14}
                    className={`inline ${
                      mode === "dark" ? "text-gray-200" : "text-gray-800"
                    }`}
                  />
                )}
              </th>
              <th className="p-2 sm:p-4 text-left text-xs sm:text-base font-semibold">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {questions.map((question, index) => (
              <DraggableQuestion
                key={question.id}
                question={question}
                index={index}
                moveQuestion={moveQuestion}
                mode={mode}
                onEdit={onEdit}
                deleteQuestion={deleteQuestion}
                categories={categories}
                getCategoryName={getCategoryName}
                isComplete={isQuestionComplete(question)}
              />
            ))}
          </tbody>
        </table>

        {/* Card layout for mobile */}
        <div className="sm:hidden space-y-4 p-2">
          {questions.map((question) => (
            <div
              key={question.id}
              className={`p-3 rounded-lg border ${
                mode === "dark"
                  ? "bg-gray-700 border-gray-600 text-gray-200"
                  : "bg-gray-50 border-gray-200 text-gray-800"
              } ${!isQuestionComplete(question) ? "border-red-500" : ""}`}
            >
              <div className="flex items-center mb-2">
                <Icon
                  icon="mdi:drag"
                  width={16}
                  height={16}
                  className={`mr-2 ${
                    mode === "dark" ? "text-gray-400" : "text-gray-500"
                  }`}
                />
                <span className="text-xs font-semibold">
                  {question.order + 1}
                </span>
              </div>
              <div className="text-xs mb-1">
                <span className="font-medium">Question:</span>
                <div
                  className="prose max-w-none line-clamp-2 inline ml-1"
                  dangerouslySetInnerHTML={{ __html: question.text || "—" }}
                />
              </div>
              <div className="text-xs mb-1">
                <span className="font-medium">Options:</span>{" "}
                {formatOptions(question.options)}
              </div>
              <div className="text-xs mb-1">
                <span className="font-medium">Category:</span>{" "}
                {getCategoryName(question.category)}
              </div>
              <div className="text-xs mb-1">
                <span className="font-medium">Job Type:</span>{" "}
                {question.job_type
                  ? question.job_type.charAt(0).toUpperCase() +
                    question.job_type.slice(1)
                  : "Unknown"}
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => onEdit(question)}
                  className="px-2 py-1 bg-[#f05d23] text-white rounded-lg hover:bg-[#d94f1e] transition duration-200 flex items-center gap-1 text-xs"
                >
                  <Icon
                    icon="mdi:pencil"
                    width={14}
                    height={14}
                    className="text-white"
                  />
                  Edit
                </button>
                <button
                  onClick={() => handleMobileDelete(question)}
                  className="px-2 py-1 bg-red-500 text-white rounded-lg hover:bg-red-600 transition duration-200 flex items-center gap-1 text-xs"
                >
                  <Icon
                    icon="mdi:trash-can"
                    width={14}
                    height={14}
                    className="text-white"
                  />
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>

        {questions.length === 0 && (
          <p
            className={`text-center p-4 italic ${
              mode === "dark" ? "text-gray-400" : "text-gray-500"
            }`}
          >
            No questions available for this job type.
          </p>
        )}
      </div>
    </div>
  );
}
