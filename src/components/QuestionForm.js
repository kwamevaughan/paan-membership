"use client";

import { useState, useEffect } from "react";
import { Icon } from "@iconify/react";
import toast from "react-hot-toast";
import QuestionTextEditor from "./QuestionTextEditor";
import OpenEndedOptions from "./OpenEndedOptions";
import NonOpenEndedOptions from "./NonOpenEndedOptions";
import DependencyFields from "./DependencyFields";
import { useCountry } from "@/hooks/useCountry";
import ItemActionModal from "@/components/ItemActionModal";

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
  }, [selectedJobType, jobType, categories, category]);

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
      regionalOptions: isCountrySelect ? [
        "All of Africa",
        "All of Europe",
        "All of Asia",
        "All of North America",
        "All of South America",
        "All of Oceania",
        "Global (All Regions)"
      ] : null,
    };

    try {
      const success =
        question && question.id
          ? await onSubmit(question.id, questionData)
          : await onSubmit(questionData);
      if (success) {
        toast.success(
          question && question.id
            ? "Question updated successfully!"
            : "Question added successfully!"
        );
        onCancel();
      } else {
        toast.error("Failed to save question. Please try again.");
      }
    } catch (error) {
      toast.error("An error occurred while saving the question.");
    }
  };

  return (
    <ItemActionModal
      isOpen={isOpen}
      onClose={onCancel}
      title={question ? "Edit Question" : "Add New Question"}
      mode={mode}
    >
      <div className="relative">        

        <form onSubmit={handleFormSubmit} className="space-y-6 relative z-10">
          <QuestionTextEditor
            text={text}
            description={description}
            handleTextBlur={handleTextBlur}
            handleDescriptionBlur={handleDescriptionBlur}
            mode={mode}
          />

          <div className="space-y-2">
            <label
              className={`inline-flex items-center gap-2 cursor-pointer hover:text-sky-900 transition-all duration-200 ${
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
                className={`${
                  mode === "dark" ? "text-amber-400" : "text-sky-600"
                } transition-all duration-200`}
              />
            </label>

            <label
              className={`inline-flex items-center gap-2 cursor-pointer hover:text-sky-900 transition-all duration-200 ${
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
                className={`${
                  mode === "dark" ? "text-amber-400" : "text-sky-600"
                } `}
              />
            </label>
          </div>

          <div
            className={`relative p-4 rounded-xl backdrop-blur-sm border transition-all duration-200 hover:shadow-lg ${
              mode === "dark"
                ? "bg-blue-500/20 border-blue-400/30 text-blue-300"
                : "bg-blue-50 border-blue-200 text-gray-700"
            }`}
          >
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
              className={`w-full p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-900 transition-all duration-200 backdrop-blur-sm ${
                mode === "dark"
                  ? "bg-gradient-to-br from-slate-800/50 to-slate-900/50 border-white/10 text-gray-100"
                  : "bg-gradient-to-br from-white/60 to-gray-50/60 border-white/20 text-[#231812]"
              } hover:bg-opacity-70`}
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

          <div
            className={`relative p-4 rounded-xl backdrop-blur-sm border transition-all duration-200 hover:shadow-lg ${
              mode === "dark"
                ? "bg-blue-500/20 border-blue-400/30 text-blue-300"
                : "bg-blue-50 border-blue-200 text-gray-700"
            }`}
          >
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
              className={`w-full p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-skly-900 transition-all duration-200 backdrop-blur-sm ${
                mode === "dark"
                  ? "bg-gradient-to-br from-slate-800/50 to-slate-900/50 border-white/10 text-gray-100"
                  : "bg-gradient-to-br from-white/60 to-gray-50/60 border-white/20 text-[#231812]"
              } hover:bg-opacity-70`}
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

          <div className="flex justify-end gap-4 pt-4">
            <button
              type="button"
              onClick={onCancel}
              className={`px-6 py-3 rounded-xl font-medium transition-all duration-200 transform hover:scale-105 ${
                mode === "dark"
                  ? "bg-gradient-to-br from-gray-700/80 to-gray-600/80 text-gray-300 hover:bg-gray-600"
                  : "bg-gradient-to-br from-gray-100 to-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
              aria-label="Cancel"
            >
              Cancel
            </button>
            <button
              type="submit"
              className={`px-6 py-3 rounded-xl font-medium shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 ${
                mode === "dark"
                  ? "bg-gradient-to-r from-orange-500/80 to-red-500/80 text-white hover:from-orange-600/80 hover:to-red-600/80"
                  : "bg-gradient-to-r from-blue-400 to-sky-600 text-white hover:from-blue-600 hover:to-sky-600"
              }`}
              aria-label="Save question"
            >
              Save
            </button>
          </div>
        </form>
      </div>
    </ItemActionModal>
  );
}
