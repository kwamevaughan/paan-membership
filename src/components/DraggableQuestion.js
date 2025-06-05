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
}) => {
  const ref = useCallback((node) => {
    if (!node) return;
    drop(node);
    drag(node);
  }, []);

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


  return (
    <tr
      ref={ref}
      className={`border-b ${
        mode === "dark"
          ? "border-gray-700 bg-gray-800 text-gray-200"
          : "border-gray-200 bg-white text-[#231812]"
      } ${isDragging ? "opacity-50" : ""} ${
        !isComplete ? "border-red-500" : ""
      }`}
    >
      <td className="p-2 sm:p-4 w-8 sm:w-12">
        <Icon
          icon="mdi:drag"
          className="cursor-move text-gray-500"
          width={14}
          height={14}
        />
      </td>
      <td className="p-2 sm:p-4">{question.order + 1}</td>
      <td className="p-2 sm:p-4">
        <div
          className="prose max-w-none line-clamp-2"
          dangerouslySetInnerHTML={{ __html: question.text || "—" }}
        />
      </td>
      <td className="p-2 sm:p-4">
        {Array.isArray(question.options) && question.options.length > 0
          ? question.options.length <= 3
            ? question.options.join(", ")
            : `${question.options.slice(0, 3).join(", ")}, ...`
          : "—"}
      </td>
      <td className="p-2 sm:p-4">{getCategoryName(question.category)}</td>
      <td className="p-2 sm:p-4">
        {question.job_type
          ? question.job_type.charAt(0).toUpperCase() +
            question.job_type.slice(1)
          : "Unknown"}
      </td>
      <td className="p-2 sm:p-4">
        <div className="flex gap-2">
          <button
            onClick={() => onEdit(question)}
            className="p-1 text-[#f05d23] hover:text-[#d94f1e]"
            aria-label="Edit question"
          >
            <Icon icon="mdi:pencil" width={14} height={14} />
          </button>
          <button
            onClick={() => deleteQuestion(question)}
            className="p-1 text-red-500 hover:text-red-600"
            aria-label="Delete question"
          >
            <Icon icon="mdi:delete" width={14} height={14} />
          </button>
        </div>
      </td>
    </tr>
  );
};

export default DraggableQuestion;
