"use client";

import { useState, useEffect } from "react";
import { Icon } from "@iconify/react";
import toast from "react-hot-toast";
import QuestionTextEditor from "./QuestionTextEditor";
import OpenEndedOptions from "./OpenEndedOptions";
import NonOpenEndedOptions from "./NonOpenEndedOptions";
import DependencyFields from "./DependencyFields";

export default function QuestionForm({
  mode,
  question,
  onSubmit,
  onCancel,
  isOpen,
  categories = [],
  questions = [],
  isLoading,
}) {
  const [text, setText] = useState("");
  const [description, setDescription] = useState("");
  const [options, setOptions] = useState("");
  const [isMultiSelect, setIsMultiSelect] = useState(false);
  const [isOtherEnabled, setIsOtherEnabled] = useState(false);
  const [otherOptionText, setOtherOptionText] = useState("");
  const [category, setCategory] = useState("");
  const [isOpenEnded, setIsOpenEnded] = useState(false);
  const [maxAnswers, setMaxAnswers] = useState("");
  const [dependsOnQuestionId, setDependsOnQuestionId] = useState("");
  const [dependsOnAnswer, setDependsOnAnswer] = useState("");
  const [hasLinks, setHasLinks] = useState(false);
  const [textInputOption, setTextInputOption] = useState({ option: null });
  const [textInputPlaceholder, setTextInputPlaceholder] = useState("");
  const [textInputMaxAnswers, setTextInputMaxAnswers] = useState("");
  const [maxWords, setMaxWords] = useState("");
  const [skippable, setSkippable] = useState(false);
  const [answerStructure, setAnswerStructure] = useState("");

  useEffect(() => {
    if (isOpen) {
      if (question) {
        setText(question.text || "");
        setDescription(question.description || "");
        const categoryId =
          typeof question.category === "object" && question.category?.id
            ? question.category.id
            : typeof question.category === "string" && question.category
            ? question.category
            : "";
        setCategory(categoryId);
        setOptions(
          question.options?.filter((opt) => opt !== "Other").join("\n") || ""
        );
        setIsMultiSelect(question.is_multi_select || false);
        setIsOtherEnabled(question.options?.includes("Other") || false);
        setOtherOptionText(question.other_option_text || "");
        setIsOpenEnded(question.is_open_ended || false);
        setMaxAnswers(question.max_answers?.toString() || "");
        setDependsOnQuestionId(
          question.depends_on_question_id?.toString() || ""
        );
        setDependsOnAnswer(question.depends_on_answer || "");
        setHasLinks(question.has_links || false);
        setTextInputOption({
          option: question.text_input_option?.option || null,
        });
        setTextInputPlaceholder(question.text_input_option?.placeholder || "");
        setTextInputMaxAnswers(
          question.text_input_max_answers?.toString() || ""
        );
        setMaxWords(question.max_words?.toString() || "");
        setSkippable(question.skippable || false);
        setAnswerStructure(
          question.structured_answers ? "client_references" : ""
        );
      } else {
        setText("");
        setDescription("");
        setCategory("");
        setOptions("");
        setIsMultiSelect(false);
        setIsOtherEnabled(false);
        setOtherOptionText("");
        setIsOpenEnded(false);
        setMaxAnswers("");
        setDependsOnQuestionId("");
        setDependsOnAnswer("");
        setHasLinks(false);
        setTextInputOption({ option: null });
        setTextInputPlaceholder("");
        setTextInputMaxAnswers("");
        setMaxWords("");
        setSkippable(false);
        setAnswerStructure("");
      }
    }
  }, [isOpen, question]);

  const handleOptionChange = (e) => setOptions(e.target.value);
  const handleTextBlur = (newText) => setText(newText);
  const handleDescriptionBlur = (newDescription) =>
    setDescription(newDescription);

  const handleFormSubmit = async (e) => {
    e.preventDefault();

    const optionsArray = isOpenEnded
      ? []
      : options
          .split("\n")
          .map((opt) => opt.trim())
          .filter((opt) => opt);

    if (isOtherEnabled && !isOpenEnded) {
      optionsArray.push("Other");
    }

    const isTextEmpty =
      !text ||
      text.trim() === "" ||
      text === "<p><br></p>" ||
      text === "<p> </p>";

    if (isTextEmpty || (!isOpenEnded && optionsArray.length === 0)) {
      toast.error("Please provide a question and required fields.");
      return;
    }

    if (isOpenEnded && maxAnswers && isNaN(maxAnswers)) {
      toast.error("Maximum answers must be a number.");
      return;
    }

    if (isOpenEnded && maxWords && isNaN(maxWords)) {
      toast.error("Maximum words must be a number.");
      return;
    }

    if (textInputMaxAnswers && isNaN(textInputMaxAnswers)) {
      toast.error("Maximum text inputs must be a number.");
      return;
    }

    if (
      !isOtherEnabled &&
      textInputOption?.option &&
      textInputOption.option !== "Any" &&
      !optionsArray.includes(textInputOption.option)
    ) {
      toast.error(
        "Selected text input option must be one of the provided options."
      );
      return;
    }

    const questionData = {
      text,
      description,
      options: optionsArray,
      isMultiSelect: isOpenEnded ? false : isMultiSelect,
      otherOptionText: isOpenEnded ? "" : isOtherEnabled ? otherOptionText : "",
      categoryId: category,
      isOpenEnded,
      maxAnswers: isOpenEnded && maxAnswers ? parseInt(maxAnswers) : null,
      dependsOnQuestionId: dependsOnQuestionId
        ? parseInt(dependsOnQuestionId)
        : null,
      dependsOnAnswer: dependsOnAnswer || null,
      hasLinks:
        isOpenEnded && maxAnswers && parseInt(maxAnswers) > 1
          ? hasLinks
          : false,
      textInputOption:
        !isOpenEnded && !isOtherEnabled && textInputOption?.option
          ? {
              option: textInputOption.option,
              placeholder: textInputPlaceholder,
            }
          : null,
      textInputMaxAnswers:
        !isOpenEnded && textInputOption?.option && textInputMaxAnswers
          ? parseInt(textInputMaxAnswers)
          : null,
      maxWords: isOpenEnded && maxWords ? parseInt(maxWords) : null,
      skippable: isOpenEnded ? skippable : false,
      structuredAnswers:
        isOpenEnded && answerStructure === "client_references"
          ? {
              fields: [
                { name: "Name", type: "text" },
                { name: "Role", type: "text" },
                { name: "Email", type: "email" },
              ],
            }
          : null,
    };

    console.log("Submitting questionData:", questionData);
    const success = question
      ? await onSubmit(question.id, questionData)
      : await onSubmit(questionData);

    if (success) onCancel();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-[9999]">
      <div
        className={`p-6 rounded-lg shadow-lg border-t-4 border-[#f05d23] max-w-3xl w-full mx-4 max-h-[90vh] overflow-y-auto ${
          mode === "dark" ? "bg-gray-800" : "bg-white"
        }`}
      >
        <div className="flex justify-between items-center mb-4">
          <h4
            className={`text-lg font-semibold ${
              mode === "dark" ? "text-white" : "text-[#231812]"
            }`}
          >
            {question ? "Edit Question" : "Add New Question"}
          </h4>
          <div className="relative group">
            <button
              type="button"
              onClick={onCancel}
              className="text-[#f05d23] font-bold hover:text-gray-700 focus:outline-none p-2 transition-all duration-100 ease-in-out transform hover:scale-105"
              aria-label="Cancel"
            >
              <Icon icon="mdi:close" width={30} height={30} />
            </button>
            <span className="absolute left-1/2 transform -translate-x-1/2 bottom-full text-xs text-white bg-black rounded px-4 py-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200 ease-in-out">
              Cancel
            </span>
          </div>
        </div>

        <form onSubmit={handleFormSubmit} className="space-y-6">
          <QuestionTextEditor
            text={text}
            description={description}
            handleTextBlur={handleTextBlur}
            handleDescriptionBlur={handleDescriptionBlur}
            mode={mode}
          />

          <label
            className={`inline-flex items-center gap-2 mt-4 mb-2 cursor-pointer hover:text-[#f05d23] ${
              mode === "dark" ? "text-gray-300" : "text-[#231812]"
            }`}
          >
            <input
              type="checkbox"
              checked={isOpenEnded}
              onChange={(e) => setIsOpenEnded(e.target.checked)}
              className="hidden"
              id="open-ended-checkbox"
            />
            <span>This is an open-ended question (no predefined options)</span>
            <Icon
              icon={
                isOpenEnded
                  ? "mdi:checkbox-marked"
                  : "mdi:checkbox-blank-outline"
              }
              width={20}
              height={20}
            />
          </label>

          {isOpenEnded ? (
            <OpenEndedOptions
              maxAnswers={maxAnswers}
              setMaxAnswers={setMaxAnswers}
              maxWords={maxWords}
              setMaxWords={setMaxWords}
              answerStructure={answerStructure}
              setAnswerStructure={setAnswerStructure}
              skippable={skippable}
              setSkippable={setSkippable}
              hasLinks={hasLinks}
              setHasLinks={setHasLinks}
              mode={mode}
            />
          ) : (
            <NonOpenEndedOptions
              options={options}
              handleOptionChange={handleOptionChange}
              isMultiSelect={isMultiSelect}
              setIsMultiSelect={setIsMultiSelect}
              isOtherEnabled={isOtherEnabled}
              setIsOtherEnabled={setIsOtherEnabled}
              otherOptionText={otherOptionText}
              setOtherOptionText={setOtherOptionText}
              textInputOption={textInputOption}
              setTextInputOption={setTextInputOption}
              textInputPlaceholder={textInputPlaceholder}
              setTextInputPlaceholder={setTextInputPlaceholder}
              textInputMaxAnswers={textInputMaxAnswers}
              setTextInputMaxAnswers={setTextInputMaxAnswers}
              mode={mode}
            />
          )}

          <div className="flex flex-col">
            <label
              htmlFor="category-select"
              className={`block text-sm font-medium mb-2 ${
                mode === "dark" ? "text-gray-300" : "text-[#231812]"
              }`}
            >
              Category <span className="text-red-500">*</span>
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#f05d23] transition duration-200 ${
                mode === "dark"
                  ? "bg-gray-700 border-gray-600 text-white"
                  : "bg-gray-50 border-gray-300 text-[#231812]"
              }`}
              required
              id="category-select"
            >
              <option value="">Select a category</option>
              {isLoading ? (
                <option disabled>Loading categories...</option>
              ) : categories && categories.length > 0 ? (
                categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))
              ) : (
                <option disabled>No categories available</option>
              )}
            </select>
          </div>

          <DependencyFields
            dependsOnQuestionId={dependsOnQuestionId}
            setDependsOnQuestionId={setDependsOnQuestionId}
            dependsOnAnswer={dependsOnAnswer}
            setDependsOnAnswer={setDependsOnAnswer}
            questions={questions}
            question={question}
            mode={mode}
          />

          <div className="flex justify-end gap-4">
            <button
              type="button"
              onClick={onCancel}
              className="text-[#f05d23] hover:text-gray-700 font-semibold p-3 rounded-lg transition-all duration-200 transform hover:scale-105"
              aria-label="Cancel"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bg-[#f05d23] text-white font-semibold px-6 py-3 rounded-lg transition-all duration-200 transform hover:scale-105"
              aria-label="Save question"
            >
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
