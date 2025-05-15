import dynamic from "next/dynamic";

const EditorComponent = dynamic(() => import("@/components/EditorComponent"), {
  ssr: false,
});

export default function QuestionTextEditor({
  text,
  description,
  handleTextBlur,
  handleDescriptionBlur,
  mode,
}) {
  return (
    <>
      <div className="flex flex-col">
        <label
          htmlFor="question-text"
          className={`block text-sm font-medium mb-2 ${
            mode === "dark" ? "text-gray-300" : "text-[#231812]"
          }`}
        >
          Question Text <span className="text-red-500">*</span>
        </label>
        <EditorComponent
          initialValue={text}
          defaultView="rich"
          onBlur={handleTextBlur}
          mode={mode}
          holderId="jodit-editor-question-form"
          className="w-full"
          id="question-text"
        />
      </div>
      <div className="flex flex-col">
        <label
          htmlFor="question-description"
          className={`block text-sm font-medium mb-2 ${
            mode === "dark" ? "text-gray-300" : "text-[#231812]"
          }`}
        >
          Description (Optional)
        </label>
        <EditorComponent
          initialValue={description}
          defaultView="rich"
          onBlur={handleDescriptionBlur}
          mode={mode}
          holderId="jodit-editor-description-form"
          className="w-full"
          id="question-description"
        />
      </div>
    </>
  );
}
