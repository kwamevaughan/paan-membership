import { useCallback } from "react";
import { Icon } from "@iconify/react";
import { useDrag, useDrop } from "react-dnd";

const DraggableQuestion = ({
  question,
  index,
  moveQuestion,
  mode,
  onEdit,
  deleteQuestion,
  getCategoryName,
  isComplete,
  className = "",
}) => {
  const [{ isDragging }, drag] = useDrag({
    type: "QUESTION",
    item: { index },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  const [, drop] = useDrop({
    accept: "QUESTION",
    hover: (item) => {
      if (item.index !== index) {
        moveQuestion(item.index, index);
        item.index = index;
      }
    },
  });

  const ref = useCallback((node) => {
    if (!node) return;
    drop(node);
    drag(node);
  }, [drag, drop]);

  return (
    <tr
      ref={ref}
      className={`relative group border-b ${
        mode === "dark"
          ? "bg-gradient-to-br from-slate-800/40 to-slate-900/40 border-white/10 text-gray-200"
          : "bg-gradient-to-br from-white/40 to-gray-50/40 border-white/20 text-[#231812]"
      } ${isDragging ? "opacity-50" : ""} ${
        !isComplete ? "border-red-400/30 ring-2 ring-red-400/20" : ""
      } hover:bg-opacity-70 hover:shadow-lg hover:scale-[1.01] transition-all duration-200 ${className}`}
    >

      

      <td className="p-2 sm:p-4 w-8 sm:w-12 relative">
        <Icon
          icon="mdi:drag"
          className={`cursor-move ${
            mode === "dark" ? "text-amber-400" : "text-amber-600"
          } `}
          width={20}
          height={20}
          style={{
            animationDuration: "2s",
            animationIterationCount: "infinite",
          }}
        />
      </td>
      <td className="p-2 sm:p-4 relative">
        <span
          className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
            mode === "dark"
              ? "bg-blue-500/20 border border-blue-400/30 text-blue-300"
              : "bg-blue-50 border border-blue-200 text-gray-700"
          }`}
        >
          {question.order + 1}
        </span>
      </td>
      <td className="p-2 sm:p-4 relative">
        <div
          className={`prose max-w-none line-clamp-2 ${
            mode === "dark" ? "text-gray-100" : "text-gray-900"
          }`}
          dangerouslySetInnerHTML={{ __html: question.text || "—" }}
        />
      </td>
      <td className="p-2 sm:p-4 relative">
        <span
          className={`inline-block px-2 py-1 rounded-md text-sm font-medium ${
            mode === "dark"
              ? "bg-blue-500/20 border border-blue-400/30 text-blue-300"
              : "bg-blue-50 border border-blue-200 text-gray-700"
          }`}
        >
          {Array.isArray(question.options) && question.options.length > 0
            ? question.options.length <= 3
              ? question.options.join(", ")
              : `${question.options.slice(0, 3).join(", ")}, ...`
            : "—"}
        </span>
      </td>
      <td className="p-2 sm:p-4 relative">
        <span
          className={`inline-block px-2 py-1 rounded-md text-sm font-medium ${
            mode === "dark"
              ? "bg-blue-500/20 border border-blue-400/30 text-blue-300"
              : "bg-blue-50 border border-blue-200 text-gray-700"
          }`}
        >
          {getCategoryName(question.category)}
        </span>
      </td>
      <td className="p-2 sm:p-4 relative">
        <span
          className={`inline-block px-2 py-1 rounded-full text-sm font-medium ${
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
      </td>
      <td className="p-2 sm:p-4 relative">
        <div className="flex gap-2">
          <button
            onClick={() => onEdit(question)}
            className={`p-1 rounded-lg font-medium text-sm transition-all duration-200 ${
              mode === "dark"
                ? "bg-gradient-to-r from-blue-500/80 to-sky-500/80 text-white hover:from-blue-600/80 hover:to-sky-600/80"
                : "bg-gradient-to-r from-blue-500 to-sky-500 text-white hover:from-blue-600 hover:to-sky-600"
            }`}
            aria-label="Edit question"
          >
            <Icon icon="mdi:pencil" width={44} height={14} />
          </button>
          <button
            onClick={() => deleteQuestion(question)}
            className={`p-1 rounded-lg font-medium text-sm transition-all duration-200 ${
              mode === "dark"
                ? "bg-gradient-to-r from-blue-500/80 to-sky-500/80 text-white hover:from-blue-600/80 hover:to-sky-600/80"
                : "bg-gradient-to-r from-blue-500 to-sky-500 text-white hover:from-blue-600 hover:to-sky-600"
            }`}
            aria-label="Delete question"
          >
            <Icon icon="mdi:delete" width={40} height={14} />
          </button>
        </div>
      </td>
    </tr>
  );
};

export default DraggableQuestion;
