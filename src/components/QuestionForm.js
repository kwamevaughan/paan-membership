"use client";

import { useState, useEffect } from "react";
import { Icon } from "@iconify/react";
import toast from "react-hot-toast";
import QuestionTextEditor from "./QuestionTextEditor";
import OpenEndedOptions from "./OpenEndedOptions";
import NonOpenEndedOptions from "./NonOpenEndedOptions";
import DependencyFields from "./DependencyFields";
import { useCountry } from "@/hooks/useCountry";

export default function QuestionForm({
  mode,
  question,
  onSubmit,
  onCancel,
  isOpen,
  categories = [],
  questions = [],
  isLoading,
  selectedJobType,
}) {
  const [text, setText] = useState("");
  const [description, setDescription] = useState("");
  const [options, setOptions] = useState("");
  const [isMultiSelect, setIsMultiSelect] = useState(false);
  const [isOtherEnabled, setIsOtherEnabled] = useState(false);
  const [otherOptionText, setOtherOptionText] = useState("");
  const [category, setCategory] = useState("");
  const [isOpenEnded, setIsOpenEnded] = useState(false);
  const [isCountrySelect, setIsCountrySelect] = useState(false);
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
  const [jobType, setJobType] = useState(
    selectedJobType === "all" ? "agencies" : selectedJobType
  );

  const { countryOptions } = useCountry();

  // Debug question and categories
  useEffect(() => {
    const filteredCategories = categories.filter(
      (cat) => cat.job_type === jobType || !cat.job_type
    );
    
    // Reset category if current category is not valid for new jobType
    if (category && !filteredCategories.some((cat) => cat.id === category)) {
      setCategory("");
    }
  }, [selectedJobType, jobType, categories, category, question]);

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
        setIsCountrySelect(question.is_country_select || false);
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
          question.structured_answers?.fields?.some((f) => f.name === "Project")
            ? "case_studies"
            : question.structured_answers?.fields?.some(
                (f) =>
                  f.name === "Name" &&
                  f.type === "text" &&
                  question.structured_answers?.fields?.some(
                    (f) => f.name === "Link to work done"
                  )
              )
            ? "testimonials_references"
            : question.structured_answers?.fields?.some(
                (f) => f.name === "Name" && f.type === "text"
              )
            ? "client_references"
            : ""
        );
        setJobType(
          question.job_type ||
            (selectedJobType === "all" ? "agencies" : selectedJobType)
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
        setIsCountrySelect(false);
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
        setJobType(selectedJobType === "all" ? "agencies" : selectedJobType);
      }
    }
  }, [isOpen, question, selectedJobType]);

  // Filter categories by jobType
  const filteredCategories = categories.filter(
    (cat) => cat.job_type === jobType || !cat.job_type
  );

  const handleOptionChange = (e) => setOptions(e.target.value);
  const handleTextBlur = (newText) => setText(newText);
  const handleDescriptionBlur = (newDescription) =>
    setDescription(newDescription);

  const handleFormSubmit = async (e) => {
    e.preventDefault();

    let optionsArray = [];
    if (isCountrySelect) {
      optionsArray = countryOptions.map((opt) => opt.value);
    } else if (isOpenEnded) {
      optionsArray = [];
    } else {
      optionsArray = options
        .split("\n")
        .map((opt) => opt.trim())
        .filter((opt) => opt);
      if (isOtherEnabled) {
        optionsArray.push("Other");
      }
    }

    const isTextEmpty =
      !text ||
      text.trim() === "" ||
      text === "<p><br></p>" ||
      text === "<p> </p>";

    if (isTextEmpty) {
      toast.error("Question text is required.");
      return;
    }

    if (!isOpenEnded && !isCountrySelect && optionsArray.length === 0) {
      toast.error(
        "Please provide at least one option for non-open-ended questions."
      );
      return;
    }

    if (!category) {
      toast.error("Please select a category.");
      return;
    }

    if (!filteredCategories.some((cat) => cat.id === category)) {
      toast.error("Selected category is not valid for the chosen job type.");
      return;
    }

    if (isOpenEnded && maxAnswers) {
      const maxAnswersNum = parseInt(maxAnswers);
      if (isNaN(maxAnswersNum) || maxAnswersNum <= 0) {
        toast.error("Maximum answers must be a positive number.");
        return;
      }
    }

    if (isOpenEnded && maxWords && isNaN(parseInt(maxWords))) {
      toast.error("Maximum words must be a number.");
      return;
    }

    if (textInputMaxAnswers && isNaN(parseInt(textInputMaxAnswers))) {
      toast.error("Maximum text inputs must be a number.");
      return;
    }

    if (
      !isOtherEnabled &&
      textInputOption?.option &&
      textInputOption.option !== "Any" &&
      !optionsArray.includes(textInputOption.option) &&
      !isCountrySelect
    ) {
      toast.error(
        "Selected text input option must be one of the provided options or 'Any'."
      );
      return;
    }

    if (dependsOnQuestionId) {
      const questionIds = questions.map((q) => q.id);
      if (!questionIds.includes(parseInt(dependsOnQuestionId))) {
        toast.error(
          "Dependency question ID must reference an existing question."
        );
        return;
      }
    }

    if (
      (answerStructure === "client_references" ||
        answerStructure === "case_studies" ||
        answerStructure === "testimonials_references") &&
      !isOpenEnded
    ) {
      toast.error(
        "Structured answers are only supported for open-ended questions."
      );
      return;
    }

    if (
      isCountrySelect &&
      (isOpenEnded || isOtherEnabled || textInputOption?.option)
    ) {
      toast.error(
        "Country select questions cannot be open-ended or have other/text input options."
      );
      return;
    }

    const questionData = {
      text,
      description,
      options: optionsArray,
      isMultiSelect: isCountrySelect
        ? true
        : isOpenEnded
        ? false
        : isMultiSelect,
      otherOptionText:
        isOpenEnded || isCountrySelect
          ? ""
          : isOtherEnabled
          ? otherOptionText
          : "",
      categoryId: category,
      isOpenEnded,
      isCountrySelect,
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
        !isOpenEnded &&
        !isOtherEnabled &&
        textInputOption?.option &&
        !isCountrySelect
          ? {
              option: textInputOption.option,
              placeholder: textInputPlaceholder,
            }
          : null,
      textInputMaxAnswers:
        !isOpenEnded &&
        textInputOption?.option &&
        textInputMaxAnswers &&
        !isCountrySelect
          ? parseInt(textInputMaxAnswers)
          : null,
      maxWords: isOpenEnded && maxWords ? parseInt(maxWords) : null,
      skippable: isOpenEnded ? skippable : false,
      structuredAnswers:
        isOpenEnded && answerStructure
          ? answerStructure === "client_references"
            ? {
                fields: [
                  { name: "Name", type: "text" },
                  { name: "Role", type: "text" },
                  { name: "Email", type: "email" },
                ],
              }
            : answerStructure === "case_studies"
            ? {
                fields: [
                  { name: "Project", type: "text" },
                  { name: "Role", type: "text" },
                  { name: "Client/Agency", type: "text" },
                ],
              }
            : answerStructure === "testimonials_references"
            ? {
                fields: [
                  { name: "Name", type: "text" },
                  { name: "Email", type: "text" },
                  { name: "Phone", type: "text" },
                  { name: "Country", type: "text" },
                  { name: "Link to work done", type: "text" },
                ],
              }
            : null
          : null,
      answerStructure: isOpenEnded && answerStructure ? answerStructure : null,
      job_type: jobType,
    };

    console.log(
      "Submitting questionData:",
      JSON.stringify(questionData, null, 2)
    );
    try {
      console.log(
        "Calling onSubmit, isEdit:",
        question && question.id,
        "questionId:",
        question?.id
      );
      const success =
        question && question.id
          ? await onSubmit(question.id, questionData)
          : await onSubmit(questionData);
      console.log(
        question && question.id
          ? "Editing question with ID: " + question.id
          : "Adding new question"
      );
      if (success) {
        toast.success(
          question && question.id
            ? "Question updated successfully!"
            : "Question added successfully!"
        );
        onCancel();
      } else {
        console.error("Failed to submit question:", questionData);
        toast.error("Failed to save question. Please try again.");
      }
    } catch (error) {
      console.error("Submission error:", error.message);
      toast.error("An error occurred while saving the question.");
    }
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
              className="text-[#f05d23] font-bold hover:text-gray-700 focus:outline-none p-2 transition-all duration-100 ease-in-out transform hover:scale-105 sticky top-0 z-[10000]"
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

          <div className="space-y-2">
            <label
              className={`inline-flex items-center gap-2 cursor-pointer hover:text-[#f05d23] ${
                mode === "dark" ? "text-gray-300" : "text-[#231812]"
              }`}
            >
              <input
                type="checkbox"
                checked={isOpenEnded}
                onChange={(e) => {
                  setIsOpenEnded(e.target.checked);
                  if (e.target.checked) setIsCountrySelect(false);
                }}
                className="hidden"
                id="open-ended-checkbox"
                disabled={isCountrySelect}
              />
              <span>Open-ended question (no predefined options)</span>
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

            <label
              className={`inline-flex items-center gap-2 cursor-pointer hover:text-[#f05d23] ${
                mode === "dark" ? "text-gray-300" : "text-[#231812]"
              }`}
            >
              <input
                type="checkbox"
                checked={isCountrySelect}
                onChange={(e) => {
                  setIsCountrySelect(e.target.checked);
                  if (e.target.checked) setIsOpenEnded(false);
                }}
                className="hidden"
                id="country-select-checkbox"
                disabled={isOpenEnded}
              />
              <span>Country select question (multi-select dropdown)</span>
              <Icon
                icon={
                  isCountrySelect
                    ? "mdi:checkbox-marked"
                    : "mdi:checkbox-blank-outline"
                }
                width={20}
                height={20}
              />
            </label>
          </div>

          <div className="flex flex-col">
            <label
              htmlFor="job-type-select"
              className={`block text-sm font-medium mb-2 ${
                mode === "dark" ? "text-gray-300" : "text-[#231812]"
              }`}
            >
              Job Type <span className="text-red-500">*</span>
            </label>
            <select
              value={jobType}
              onChange={(e) => setJobType(e.target.value)}
              className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#f05d23] transition duration-200 ${
                mode === "dark"
                  ? "bg-gray-700 border-gray-600 text-white"
                  : "bg-gray-50 border-gray-300 text-[#231812]"
              }`}
              required
              id="job-type-select"
            >
              <option value="agencies">Agencies</option>
              <option value="freelancers">Freelancers</option>
            </select>
          </div>

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
          ) : isCountrySelect ? null : (
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
              ) : filteredCategories.length > 0 ? (
                filteredCategories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))
              ) : (
                <option disabled>
                  No categories available for this job type
                </option>
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
