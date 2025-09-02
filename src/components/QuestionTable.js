import { Icon } from "@iconify/react";
import DraggableQuestion from "@/components/DraggableQuestion";
import { stripHtmlTags } from "@/../utils/questionUtils";
import { useState } from "react";
import ItemActionModal from "@/components/ItemActionModal";

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
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [questionToDelete, setQuestionToDelete] = useState(null);

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

  const fullOptions = (options) => {
    if (!Array.isArray(options) || options.length === 0) return "—";
    return options.join(", ");
  };

  const handleDelete = (question) => {
    setQuestionToDelete(question);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = () => {
    if (questionToDelete) {
      deleteQuestion(questionToDelete.id, questionToDelete.text);
      console.log("Question deleted successfully!");
    }
    setIsDeleteModalOpen(false);
    setQuestionToDelete(null);
  };

  const cancelDelete = () => {
    setIsDeleteModalOpen(false);
    setQuestionToDelete(null);
  };

  const SortIcon = ({ field, className = "" }) =>
    sortField === field && (
      <Icon
        icon={
          sortDirection === "asc"
            ? "solar:sort-vertical-bold"
            : "solar:sort-vertical-bold"
        }
        width={16}
        height={16}
        className={`ml-2 transition-transform duration-200 ${
          sortDirection === "desc" ? "rotate-180" : ""
        } ${className}`}
      />
    );

  return (
    <div className="w-full relative group mt-6 mb-10">
      {/* Glassmorphic background */}
      <div
        className={`absolute inset-0 rounded-3xl backdrop-blur-xl ${
          mode === "dark"
            ? "bg-gradient-to-br from-slate-800/60 via-slate-900/40 to-slate-800/60 border-white/10"
            : "bg-gradient-to-br from-white/80 via-white/20 to-white/80 border-white/20"
        } border shadow-2xl group-hover:shadow-3xl transition-all duration-500`}
      ></div>

      {/* Floating decorative elements */}
      <div
        className={`absolute -top-1 sm:-top-2 -right-1 sm:-right-2 w-3 sm:w-4 h-3 sm:h-4 bg-[#85c2da] rounded-full opacity-60 z-20`}
      ></div>
      <div
        className={`absolute -bottom-1 -left-1 w-2 sm:w-3 h-2 sm:h-3 bg-[#f3584a] rounded-full opacity-40 animate-pulse delay-1000 z-20`}
      ></div>
      <div
        className={`absolute top-2 right-2 w-12 sm:w-16 h-12 sm:h-16 rounded-full bg-gradient-to-br ${
          mode === "dark"
            ? "from-violet-500 to-purple-600"
            : "from-violet-400 to-purple-500"
        } opacity-20 z-10`}
      ></div>

      <div className="relative z-10">
        {/* Bottom gradient accent */}
        <div
          className={`absolute bottom-0 left-0 right-0 h-1 ${
            mode === "dark"
              ? "bg-gradient-to-r from-purple-500 via-pink-500 to-blue-500"
              : "bg-gradient-to-r from-[#3c82f6] to-[#dbe9fe]"
          }`}
        ></div>

        <div className="max-h-[600px] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600">
          {/* Desktop Table */}
          <table className="w-full hidden lg:table">
            <thead className="sticky top-0 z-10 backdrop-blur-md">
              <tr
                className={`${
                  mode === "dark"
                    ? "bg-slate-900/50 text-gray-100 border-white/10"
                    : "bg-white/50 text-gray-900 border-white/20"
                } border-b`}
              >
                <th className="p-4 w-12">
                  <Icon
                    icon="solar:hamburger-menu-linear"
                    width={20}
                    height={20}
                    className="opacity-50"
                  />
                </th>
                <th
                  className="p-4 text-left font-semibold cursor-pointer hover:bg-opacity-50 transition-all duration-200 group"
                  onClick={() => handleSort("order")}
                >
                  <div className="flex items-center">
                    <span className="text-sm font-medium">Order</span>
                    <SortIcon field="order" className="group-hover:scale-110" />
                  </div>
                </th>
                <th
                  className="p-4 text-left font-semibold cursor-pointer hover:bg-opacity-50 transition-all duration-200 group"
                  onClick={() => handleSort("text")}
                >
                  <div className="flex items-center">
                    <span className="text-sm font-medium">Question</span>
                    <SortIcon field="text" className="group-hover:scale-110" />
                  </div>
                </th>
                <th className="p-4 text-left font-semibold">
                  <span className="text-sm font-medium">Options</span>
                </th>
                <th
                  className="p-4 text-left font-semibold cursor-pointer hover:bg-opacity-50 transition-all duration-200 group"
                  onClick={() => handleSort("category")}
                >
                  <div className="flex items-center">
                    <span className="text-sm font-medium">Category</span>
                    <SortIcon
                      field="category"
                      className="group-hover:scale-110"
                    />
                  </div>
                </th>
                <th
                  className="p-4 text-left font-semibold cursor-pointer hover:bg-opacity-50 transition-all duration-200 group"
                  onClick={() => handleSort("job_type")}
                >
                  <div className="flex items-center">
                    <span className="text-sm font-medium">Job Type</span>
                    <SortIcon
                      field="job_type"
                      className="group-hover:scale-110"
                    />
                  </div>
                </th>
                <th className="p-4 text-left font-semibold">
                  <span className="text-sm font-medium">Actions</span>
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
                  deleteQuestion={() => handleDelete(question)}
                  categories={categories}
                  getCategoryName={getCategoryName}
                  isComplete={isQuestionComplete(question)}
                  className={`group hover:bg-opacity-70 hover:shadow-lg hover:scale-[1.01] transition-all duration-200 ${
                    mode === "dark"
                      ? "bg-slate-800/40 border-white/10"
                      : "bg-white/40 border-white/20"
                  } ${
                    !isQuestionComplete(question)
                      ? "border-red-400/30 ring-2 ring-red-400/20"
                      : ""
                  }`}
                />
              ))}
            </tbody>
          </table>

          {/* Mobile/Tablet Card Layout */}
          <div className="lg:hidden p-6 space-y-6">
            {questions.map((question, index) => (
              <div
                key={question.id}
                className={`relative group overflow-hidden rounded-2xl border transition-all duration-300 hover:shadow-xl hover:scale-[1.02] ${
                  mode === "dark"
                    ? "bg-gradient-to-br from-slate-800/50 to-slate-900/50 border-white/10"
                    : "bg-gradient-to-br from-white/60 to-gray-50/60 border-white/20"
                } ${
                  !isQuestionComplete(question)
                  ? "border-red-400/30 ring-2 ring-red-400/20"
                  : ""
                }`}
              >
                {/* Status Indicator */}
                <div
                  className={`absolute top-0 right-0 w-3 h-3 rounded-bl-lg ${
                    isQuestionComplete(question)
                      ? "bg-gradient-to-br from-green-400 to-green-600"
                      : "bg-gradient-to-br from-red-400 to-red-600"
                  }`}
                />
                {/* Floating Circle */}
                <div
                  className={`absolute top-2 right-2 w-12 sm:w-16 h-12 sm:h-16 rounded-full bg-gradient-to-br ${
                    mode === "dark"
                      ? "from-violet-500 to-purple-600"
                      : "from-violet-400 to-purple-500"
                  } opacity-20 z-10`}
                ></div>

                <div className="p-6">
                  {/* Header */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div
                        className={`p-2 rounded-lg ${
                          mode === "dark"
                            ? "bg-gradient-to-br from-amber-400/20 to-orange-500/20 border border-amber-400/30"
                            : "bg-gradient-to-br from-amber-100 to-orange-100 border border-amber-200"
                        }`}
                      >
                        <Icon
                          icon="solar:hamburger-menu-linear"
                          width={16}
                          height={16}
                          className={`${
                            mode === "dark"
                              ? "text-amber-400"
                              : "text-amber-600"
                          } animate-bounce`}
                          style={{
                            animationDuration: "2s",
                            animationIterationCount: "infinite",
                          }}
                        />
                      </div>
                      <div className="flex flex-col">
                        <span
                          className={`text-xs font-medium ${
                            mode === "dark" ? "text-gray-400" : "text-gray-500"
                          }`}
                        >
                          Question #{question.order + 1}
                        </span>
                        <span
                          className={`text-xs px-2 py-1 rounded-full font-medium ${
                            question.job_type === "full-time"
                              ? mode === "dark"
                                ? "bg-blue-500/20 border border-blue-400/30 text-blue-300"
                                : "bg-blue-50 border border-blue-200 text-blue-800"
                              : question.job_type === "part-time"
                              ? mode === "dark"
                                ? "bg-green-500/20 border border-green-400/30 text-green-300"
                                : "bg-green-50 border border-green-200 text-green-800"
                              : mode === "dark"
                              ? "bg-gray-500/20 border border-gray-400/30 text-gray-300"
                              : "bg-gray-50 border border-gray-200 text-gray-800"
                          }`}
                        >
                          {question.job_type
                            ? question.job_type.charAt(0).toUpperCase() +
                              question.job_type.slice(1)
                            : "Unknown"}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Question Content */}
                  <div className="space-y-4">
                    <div>
                      <h4
                        className={`text-sm font-medium ${
                          mode === "dark" ? "text-gray-400" : "text-gray-500"
                        } mb-2`}
                      >
                        Question Text
                      </h4>
                      <div
                        className={`prose prose-sm max-w-none line-clamp-3 ${
                          mode === "dark" ? "text-gray-100" : "text-gray-900"
                        }`}
                        dangerouslySetInnerHTML={{
                          __html: question.text || "—",
                        }}
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <h4
                          className={`text-sm font-medium ${
                            mode === "dark" ? "text-gray-400" : "text-gray-500"
                          } mb-2`}
                        >
                          Options
                        </h4>
                        <p
                          title={fullOptions(question.options)}
                          className={`text-sm rounded-lg p-3 ${
                            mode === "dark"
                              ? "bg-blue-500/20 border border-blue-400/30 text-blue-300"
                              : "bg-blue-50 border border-blue-200 text-gray-700"
                          }`}
                        >
                          {formatOptions(question.options)}
                        </p>
                      </div>
                      <div>
                        <h4
                          className={`text-sm font-medium ${
                            mode === "dark" ? "text-gray-400" : "text-gray-500"
                          } mb-2`}
                        >
                          Category
                        </h4>
                        <p
                          className={`text-sm rounded-lg p-3 ${
                            mode === "dark"
                              ? "bg-blue-500/20 border border-blue-400/30 text-blue-300"
                              : "bg-blue-50 border border-blue-200 text-gray-700"
                          }`}
                        >
                          {getCategoryName(question.category)}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-3 mt-6 pt-4 border-t border-white/10 dark:border-white/10">
                    <button
                      onClick={() => onEdit(question)}
                      className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-medium text-sm shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 ${
                        mode === "dark"
                          ? "bg-gradient-to-r from-orange-500/80 to-red-500/80 text-white hover:from-orange-600/80 hover:to-red-600/80"
                          : "bg-gradient-to-r from-blue-500 to-sky-500 text-white hover:from-blue-600 hover:to-sky-600"
                      }`}
                    >
                      <Icon icon="solar:pen-bold" width={16} height={16} />
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(question)}
                      className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-medium text-sm shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 ${
                        mode === "dark"
                          ? "bg-gradient-to-r from-red-500/80 to-pink-500/80 text-white hover:from-red-600/80 hover:to-pink-600/80"
                          : "bg-gradient-to-r from-red-500 to-pink-500 text-white hover:from-red-600 hover:to-pink-600"
                      }`}
                    >
                      <Icon
                        icon="solar:trash-bin-trash-bold"
                        width={16}
                        height={16}
                      />
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Empty State */}
          {questions.length === 0 && (
            <div className="text-center py-16 px-4 relative">
              <div
                className={`absolute top-2 right-2 w-12 sm:w-16 h-12 sm:h-16 rounded-full bg-gradient-to-br ${
                  mode === "dark"
                    ? "from-violet-500 to-purple-600"
                    : "from-violet-400 to-purple-500"
                } opacity-20 z-10`}
              ></div>
              <div
                className={`inline-flex items-center justify-center w-16 h-16 rounded-full mb-4 ${
                  mode === "dark"
                    ? "bg-gradient-to-br from-amber-400/20 to-orange-500/20 border border-amber-400/30"
                    : "bg-gradient-to-br from-amber-100 to-orange-100 border border-amber-200"
                }`}
              >
                <Icon
                  icon="solar:document-text-linear"
                  width={32}
                  height={32}
                  className={`${
                    mode === "dark" ? "text-amber-400" : "text-amber-600"
                  } animate-bounce`}
                  style={{
                    animationDuration: "2s",
                    animationIterationCount: "infinite",
                  }}
                />
              </div>
              <h3
                className={`text-lg font-medium mb-2 ${
                  mode === "dark" ? "text-gray-300" : "text-gray-700"
                }`}
              >
                No questions available
              </h3>
              <p
                className={`text-sm ${
                  mode === "dark" ? "text-gray-500" : "text-gray-500"
                }`}
              >
                Questions for this job type will appear here once added.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Modern Delete Confirmation Modal */}
      <ItemActionModal
        isOpen={isDeleteModalOpen}
        onClose={cancelDelete}
        title="Delete Question"
        mode={mode}
      >
        <div className="space-y-6">
          <div className="flex items-start gap-4">
            <div
              className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center ${
                mode === "dark"
                  ? "bg-gradient-to-br from-red-400/20 to-pink-500/20 border border-red-400/30"
                  : "bg-gradient-to-br from-red-100 to-pink-100 border border-red-200"
              }`}
            >
              <Icon
                icon="solar:trash-bin-trash-bold"
                width={24}
                height={24}
                className={`${
                  mode === "dark" ? "text-red-400" : "text-red-600"
                } animate-bounce`}
                style={{
                  animationDuration: "2s",
                  animationIterationCount: "infinite",
                }}
              />
            </div>
            <div className="flex-1">
              <h3
                className={`text-lg font-semibold mb-2 ${
                  mode === "dark" ? "text-gray-100" : "text-gray-900"
                }`}
              >
                Are you sure you want to delete this question?
              </h3>
              <p
                className={`text-sm ${
                  mode === "dark" ? "text-gray-400" : "text-gray-600"
                }`}
              >
                This action cannot be undone. The question will be permanently
                removed.
              </p>
              {questionToDelete && (
                <div
                  className={`mt-3 p-3 rounded-lg ${
                    mode === "dark"
                      ? "bg-blue-500/20 border border-blue-400/30 text-blue-300"
                      : "bg-blue-50 border border-blue-200 text-gray-700"
                  }`}
                >
                  <p
                    className={`text-sm font-medium ${
                      mode === "dark" ? "text-gray-300" : "text-gray-700"
                    }`}
                  >
                    &quot;{stripHtmlTags(questionToDelete.text)}&quot;
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              onClick={cancelDelete}
              className={`flex-1 px-4 py-3 rounded-xl font-medium transition-all duration-200 ${
                mode === "dark"
                  ? "bg-gradient-to-br from-gray-700/80 to-gray-600/80 text-gray-300 hover:bg-gray-600"
                  : "bg-gradient-to-br from-gray-100 to-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              Cancel
            </button>
            <button
              onClick={confirmDelete}
              className={`flex-1 px-4 py-3 rounded-xl font-medium shadow-lg hover:shadow-xl transition-all duration-200 ${
                mode === "dark"
                  ? "bg-gradient-to-r from-red-500/80 to-pink-500/80 text-white hover:from-red-600/80 hover:to-pink-600/80"
                  : "bg-gradient-to-r from-red-500 to-pink-500 text-white hover:from-red-600 hover:to-pink-600"
              }`}
            >
              Delete Question
            </button>
          </div>
        </div>
      </ItemActionModal>
    </div>
  );
}
