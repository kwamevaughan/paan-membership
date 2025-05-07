import { Icon } from "@iconify/react";
import { useDrag, useDrop } from "react-dnd";
import toast from "react-hot-toast";
import { ItemType, stripHtmlTags } from "@/../utils/questionUtils";

const DraggableQuestion = ({
  question,
  index,
  moveQuestion,
  mode,
  onEdit,
  deleteQuestion,
  categories,
  getCategoryName,
}) => {
  console.log("onEdit in DraggableQuestion:", onEdit); // Debug
  const [, drag] = useDrag({
    type: ItemType.QUESTION,
    item: { index },
  });

  const [{ isOver }, drop] = useDrop({
    accept: ItemType.QUESTION,
    hover(item) {
      if (item.index !== index) {
        moveQuestion(item.index, index);
        item.index = index;
      }
    },
  });

  const handleDelete = () => {
    const cleanText = stripHtmlTags(question.text);
    toast.custom(
      (t) => (
        <div
          className={`${
            t.visible ? "animate-enter" : "animate-leave"
          } max-w-md w-full bg-white shadow-lg rounded-lg pointer-events-auto flex ring-1 ring-black ring-opacity-5`}
        >
          <div className="flex-1 w-0 p-4">
            <div className="flex items-start">
              <div className="ml-3 flex-1">
                <p className="text-xl font-medium text-gray-900">
                  Delete Question?
                </p>
                <p className="mt-2 text-base text-gray-500">
                  Are you sure you want to delete the question "{cleanText}"?
                </p>
              </div>
            </div>
          </div>
          <div className="flex border-l border-gray-200">
            <button
              onClick={async () => {
                toast.dismiss(t.id);
                deleteQuestion(question.id, question.text);
                toast.success("Question deleted successfully!", { icon: "🗑️" });
              }}
              className="w-full border border-transparent rounded-none rounded-r-lg p-4 flex items-center justify-center text-sm font-medium text-[#f05d23] hover:text-[#d94f1e] hover:bg-[#ffe0b3] transition-colors focus:outline-none"
            >
              Yes
            </button>
            <button
              onClick={() => toast.dismiss(t.id)}
              className="w-full border border-transparent rounded-none rounded-r-lg p-4 flex items-center justify-center text-sm font-medium text-gray-600 hover:text-gray-500 hover:bg-[#f3f4f6] transition-colors focus:outline-none"
            >
              No
            </button>
          </div>
        </div>
      ),
      { duration: Infinity }
    );
  };

  return (
    <tr
      ref={(node) => drag(drop(node))}
      className={`border-b hover:bg-opacity-80 transition duration-200 cursor-move ${
        mode === "dark"
          ? `border-gray-700 hover:bg-gray-700 ${
              isOver ? "bg-gray-600" : ""
            } text-gray-200`
          : `border-gray-200 hover:bg-gray-50 ${
              isOver ? "bg-gray-200" : ""
            } text-gray-800`
      }`}
    >
      <td className="p-2 sm:p-4 w-8 sm:w-12">
        <Icon
          icon="mdi:drag"
          width={16}
          height={16}
          className={mode === "dark" ? "text-gray-400" : "text-gray-500"}
        />
      </td>
      <td className="p-2 sm:p-4 text-xs sm:text-base">{question.order + 1}</td>
      <td className="p-2 sm:p-4 text-xs sm:text-base">
        <div
          className={`prose max-w-none line-clamp-2 ${
            mode === "dark" ? "text-gray-200" : "text-gray-800"
          }`}
          dangerouslySetInnerHTML={{ __html: question.text }}
        />
      </td>
      <td className="p-2 sm:p-4 text-xs sm:text-base">
        {question.options.join("; ")}
      </td>
      <td className="p-2 sm:p-4 text-xs sm:text-base">
        {getCategoryName(question.category)}
      </td>
      <td className="p-2 sm:p-4 text-xs sm:text-base flex flex-col sm:flex-row gap-2">
        <button
          onClick={(e) => {
            e.stopPropagation();
            console.log("Edit button clicked for question:", question);
            onEdit(question);
          }}
          className="px-2 sm:px-3 py-1 bg-[#f05d23] text-white rounded-lg hover:bg-[#d94f1e] transition duration-200 flex items-center gap-1 sm:gap-2 text-xs sm:text-sm"
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
          onClick={handleDelete}
          className="px-2 sm:px-3 py-1 bg-red-500 text-white rounded-lg hover:bg-red-600 transition duration-200 flex items-center gap-1 sm:gap-2 text-xs sm:text-sm"
        >
          <Icon
            icon="mdi:trash-can"
            width={14}
            height={14}
            className="text-white"
          />
          Delete
        </button>
      </td>
    </tr>
  );
};

export default DraggableQuestion;
