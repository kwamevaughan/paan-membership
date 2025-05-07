import { useRef, useEffect, useState, useCallback } from "react";
import { Icon } from "@iconify/react";
import toast from "react-hot-toast";
import QuestionCard from "./QuestionCard";

export default function Step2Questions({
  formData,
  setFormData,
  handleOptionToggle,
  questions,
  categories = [],
  isLoading = false,
  onComplete,
  mode,
  initializeAnswers,
}) {
  const containerRef = useRef(null);
  const questionRefs = useRef({});
  const [currentCategoryIndex, setCurrentCategoryIndex] = useState(0);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [otherInputs, setOtherInputs] = useState({});
  const [dynamicAnswers, setDynamicAnswers] = useState({});
  const borderColors = [
    "border-red-500",
    "border-blue-500",
    "border-green-500",
    "border-yellow-500",
    "border-purple-500",
  ];

  const validCategories = categories.filter(
    (cat) => cat && cat.id && questions.some((q) => q && q.category === cat.id)
  );
  const currentCategory = validCategories[currentCategoryIndex];
  const currentQuestions = currentCategory
    ? questions.filter(
        (q) => q && q.id && q.text && q.category === currentCategory.id
      )
    : [];

  useEffect(() => {
    const initialDynamicAnswers = {};
    questions.forEach((q) => {
      if (q && q.id) {
        const answers = formData.answers[q.id - 1] || [];
        if (q.is_open_ended) {
          if (q.structured_answers) {
            initialDynamicAnswers[q.id] = answers.length
              ? answers.map((ans) => {
                  try {
                    const parsed = JSON.parse(ans.customText || "{}");
                    return q.structured_answers.fields.reduce(
                      (acc, field) => ({
                        ...acc,
                        [field.name.toLowerCase()]:
                          typeof parsed[field.name.toLowerCase()] === "string"
                            ? parsed[field.name.toLowerCase()]
                            : "",
                      }),
                      {}
                    );
                  } catch (e) {
                    console.error(
                      `Failed to parse structured answer for q.id=${q.id}`,
                      e
                    );
                    return q.structured_answers.fields.reduce(
                      (acc, field) => ({
                        ...acc,
                        [field.name.toLowerCase()]: "",
                      }),
                      {}
                    );
                  }
                })
              : Array.from({ length: q.max_answers || 1 }, () =>
                  q.structured_answers.fields.reduce(
                    (acc, field) => ({
                      ...acc,
                      [field.name.toLowerCase()]: "",
                    }),
                    {}
                  )
                );
          } else {
            initialDynamicAnswers[q.id] = answers.length
              ? answers.map((ans) => ({
                  text:
                    typeof ans.customText === "string" ? ans.customText : "",
                  link: ans.link || "",
                }))
              : q.max_answers && q.max_answers > 1
              ? Array.from({ length: q.max_answers }, () => ({
                  text: "",
                  link: "",
                }))
              : [{ text: "", link: "" }];
          }
        } else if (q.text_input_option) {
          initialDynamicAnswers[q.id] = answers.length
            ? answers.map((ans) => ({
                text: typeof ans.customText === "string" ? ans.customText : "",
              }))
            : q.text_input_max_answers && q.text_input_max_answers > 1
            ? Array.from({ length: q.text_input_max_answers }, () => ({
                text: "",
              }))
            : [{ text: "" }];
        }
      }
    });
    console.log("Initializing dynamicAnswers:", initialDynamicAnswers);
    setDynamicAnswers(initialDynamicAnswers);

    if (formData.answers.length < questions.length) {
      setFormData((prev) => ({
        ...prev,
        answers: Array.from({ length: questions.length }, () => []),
      }));
    }
  }, [questions, setDynamicAnswers, setFormData]);

  const checkQuestionComplete = (qId) => {
    const q = questions.find((q) => q && q.id === qId);
    if (!q) {
      console.log(`No question found for qId=${qId}`);
      return false;
    }

    if (q.skippable && !formData.answers[qId - 1]?.length) {
      console.log(`q.id=${qId} is skippable and has no answers`);
      return true;
    }

    const answers = formData.answers[qId - 1] || [];
    if (q.is_open_ended) {
      const dynamic = dynamicAnswers[qId] || [];
      if (q.structured_answers) {
        const answerCount = dynamic.filter((ans) =>
          q.structured_answers.fields.every(
            (field) =>
              typeof ans[field.name.toLowerCase()] === "string" &&
              ans[field.name.toLowerCase()].trim() !== ""
          )
        ).length;
        console.log(`Structured answers validation for q.id=${qId}:`, {
          answerCount,
          dynamic,
          requiredFields: q.structured_answers.fields,
          requiredAnswers: q.max_answers || 1,
        });
        return q.skippable
          ? answerCount === 0 || answerCount >= 1
          : q.max_answers && q.max_answers > 1
          ? answerCount >= q.max_answers
          : answerCount >= 1;
      }
      const answerCount = dynamic.filter(
        (ans) => typeof ans.text === "string" && ans.text.trim()
      ).length;
      
      return q.skippable
        ? answerCount === 0 || answerCount >= 1
        : q.max_answers && q.max_answers > 1
        ? answerCount >= q.max_answers
        : answerCount >= 1;
    }

    if (!answers.length) {
      console.log(`No answers for q.id=${qId}`, { answers });
      return false;
    }

    if (q.text_input_option) {
      const dynamic = dynamicAnswers[qId] || [{ text: "" }];
      const requiredAnswers = q.text_input_max_answers || 1;
      const answerCount = dynamic.filter(
        (ans) => typeof ans.text === "string" && ans.text.trim()
      ).length;
      const isValid = answers.every((ans) => {
        if (typeof ans === "string") {
          return ans.trim() !== "";
        }
        const customText =
          typeof ans.customText === "string" ? ans.customText : "";
        if (
          q.text_input_option?.option &&
          q.text_input_option.option !== "Any"
        ) {
          return (
            ans.option === q.text_input_option.option &&
            customText.trim() !== ""
          );
        }
        return ans.option && customText.trim() !== "";
      });
      console.log(`Text input validation for q.id=${qId}:`, {
        isValid,
        answerCount,
        answers,
        dynamic,
        requiredAnswers,
      });
      return isValid && answerCount >= requiredAnswers;
    }

    const isValid = answers.every((ans) => {
      if (typeof ans === "string") {
        return ans.trim() !== "";
      }
      const customText =
        typeof ans.customText === "string" ? ans.customText : "";
      return ans.option || customText.trim() !== "";
    });
    
    return isValid;
  };

  const handleTextInputChange = useCallback(
    (qId, idx, value) => {
      setDynamicAnswers((prev) => {
        const updatedAnswers = [...(prev[qId] || [{ text: "" }])];
        updatedAnswers[idx] = { text: value };
        console.log(`handleTextInputChange for q.id=${qId}, idx=${idx}`, {
          value,
          updatedAnswers,
        });
        return { ...prev, [qId]: updatedAnswers };
      });

      const selectedOption = formData.answers[qId - 1]?.[0]?.option;
      const question = questions.find((q) => q.id === qId);
      if (selectedOption) {
        const updatedAnswers = (dynamicAnswers[qId] || [{ text: "" }]).map(
          (ans, i) => ({
            option: selectedOption,
            customText: i === idx ? value : ans.text,
          })
        );
        console.log(`Updating formData.answers for q.id=${qId}`, {
          selectedOption,
          updatedAnswers,
        });
        handleOptionToggle(
          qId - 1,
          selectedOption,
          updatedAnswers,
          question?.is_multi_select || false
        );
      }
    },
    [dynamicAnswers, formData.answers, handleOptionToggle, questions]
  );

  const areCurrentQuestionsComplete = currentQuestions.every((q) =>
    checkQuestionComplete(q.id)
  );
  const areAllQuestionsComplete = questions
    .filter((q) => q && q.id)
    .every((q) => checkQuestionComplete(q.id));

  const handleOptionToggleWrapper = (qIndex, option, answers) => {
    const question = questions.find((q) => q && q.id === qIndex + 1);
    const isMultiSelect = question?.is_multi_select || false;
    
    handleOptionToggle(qIndex, option, answers, isMultiSelect);
  };

  const handleUploadCVClick = () => {
    if (!areAllQuestionsComplete) {
      const incompleteQuestion = questions.find(
        (q) => q && q.id && !checkQuestionComplete(q.id)
      );
      if (incompleteQuestion) {
        if (
          incompleteQuestion.is_open_ended &&
          !incompleteQuestion.skippable &&
          incompleteQuestion.max_answers &&
          incompleteQuestion.max_answers > 1
        ) {
          const answerCount = (
            dynamicAnswers[incompleteQuestion.id] || []
          ).filter((ans) => ans.text?.trim()).length;
          if (answerCount < incompleteQuestion.max_answers) {
            toast.error(
              `Please provide ${incompleteQuestion.max_answers} answers for "${incompleteQuestion.text}".`,
              { icon: "⚠️" }
            );
            return;
          }
        } else if (
          !incompleteQuestion.is_open_ended &&
          incompleteQuestion.text_input_option &&
          incompleteQuestion.text_input_max_answers &&
          incompleteQuestion.text_input_max_answers > 1
        ) {
          const answerCount = (
            dynamicAnswers[incompleteQuestion.id] || []
          ).filter((ans) => ans.text?.trim()).length;
          if (answerCount < incompleteQuestion.text_input_max_answers) {
            toast.error(
              `Please provide ${incompleteQuestion.text_input_max_answers} details for "${incompleteQuestion.text}".`,
              { icon: "⚠️" }
            );
            return;
          }
        }
        toast.error(
          incompleteQuestion.is_open_ended
            ? `Please answer "${incompleteQuestion.text}".`
            : `Select an option and provide details for "${incompleteQuestion.text}".`,
          { icon: "⚠️" }
        );
        if (questionRefs.current[incompleteQuestion.id]) {
          questionRefs.current[incompleteQuestion.id].scrollIntoView({
            behavior: "smooth",
            block: "center",
          });
        }
      }
      return;
    }
    onComplete();
  };

  const handleNext = () => {
    const currentQuestion = currentQuestions[currentQuestionIndex];
    if (!checkQuestionComplete(currentQuestion?.id)) {
      if (currentQuestion) {
        toast.error(
          currentQuestion.is_open_ended
            ? `Please answer "${currentQuestion.text}".`
            : `Select an option and provide details for "${currentQuestion.text}".`,
          { icon: "⚠️" }
        );
        if (questionRefs.current[currentQuestion.id]) {
          questionRefs.current[currentQuestion.id].scrollIntoView({
            behavior: "smooth",
            block: "center",
          });
        }
      }
      return;
    }
    if (currentQuestionIndex < currentQuestions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
      containerRef.current?.scrollTo({ top: 0, behavior: "smooth" });
    } else if (currentCategoryIndex < validCategories.length - 1) {
      setCurrentCategoryIndex((prev) => prev + 1);
      setCurrentQuestionIndex(0);
      containerRef.current?.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleBack = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex((prev) => prev - 1);
      containerRef.current?.scrollTo({ top: 0, behavior: "smooth" });
    } else if (currentCategoryIndex > 0) {
      setCurrentCategoryIndex((prev) => prev - 1);
      const prevCategory = validCategories[currentCategoryIndex - 1];
      const prevQuestions = questions.filter(
        (q) => q && q.id && q.text && q.category === prevCategory.id
      );
      setCurrentQuestionIndex(prevQuestions.length - 1);
      containerRef.current?.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleSkip = (qId) => {
    const question = questions.find((q) => q && q.id === qId);
    const isMultiSelect = question?.is_multi_select || false;
    setDynamicAnswers((prev) => ({ ...prev, [qId]: [] }));
    setOtherInputs((prev) => ({ ...prev, [qId]: "" }));
    handleOptionToggle(qId - 1, null, [], isMultiSelect);
    if (currentQuestionIndex < currentQuestions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
      containerRef.current?.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      setCurrentCategoryIndex((prev) => prev + 1);
      setCurrentQuestionIndex(0);
      containerRef.current?.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const buttonStyles = `px-6 py-2 bg-[#f05d23] text-white rounded-lg hover:bg-[#d94f1e] transition shadow-md`;
  const isNextDisabled =
    currentCategoryIndex === validCategories.length - 1 &&
    currentQuestionIndex === currentQuestions.length - 1
      ? !areAllQuestionsComplete
      : !checkQuestionComplete(currentQuestions[currentQuestionIndex]?.id);

  if (validCategories.length === 0 && !isLoading) {
    return (
      <div className="h-[70vh] flex items-center justify-center p-4">
        <div className="text-center">
          <Icon
            icon="mdi:alert-circle-outline"
            className="w-12 h-12 text-[#f05d23] mx-auto mb-4"
          />
          <p
            className={`text-lg ${
              mode === "dark" ? "text-gray-300" : "text-gray-600"
            }`}
          >
            No questions available.
          </p>
          <button onClick={handleUploadCVClick} className={buttonStyles}>
            Submit Document
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="h-[70vh] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100"
    >
      <div className="space-y-6 p-4">
        {isLoading ? (
          <div>Loading...</div>
        ) : (
          <div className="flex items-center mb-4">
            <Icon
              icon="mdi:folder-outline"
              className="w-6 h-6 text-[#f05d23] mr-2"
            />
            <span
              className={`text-2xl font-bold ${
                mode === "dark" ? "text-gray-400" : "text-gray-900"
              }`}
            >
              {currentCategory?.name || "Category"}
            </span>
          </div>
        )}

        {currentQuestions.length > 0 && (
          <div
            key={currentQuestions[currentQuestionIndex].id}
            ref={(el) =>
              (questionRefs.current[currentQuestions[currentQuestionIndex].id] =
                el)
            }
          >
            <QuestionCard
              q={currentQuestions[currentQuestionIndex]}
              mode={mode}
              formData={formData}
              handleOptionToggle={handleOptionToggleWrapper}
              dynamicAnswers={dynamicAnswers}
              setDynamicAnswers={setDynamicAnswers}
              otherInputs={otherInputs}
              setOtherInputs={setOtherInputs}
              borderColors={borderColors}
              isComplete={checkQuestionComplete(
                currentQuestions[currentQuestionIndex].id
              )}
              onSkip={() =>
                handleSkip(currentQuestions[currentQuestionIndex].id)
              }
              handleTextInputChange={handleTextInputChange}
            />
          </div>
        )}

        <div className="sticky bottom-0 bg-white dark:bg-gray-800 p-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex justify-between items-center">
            <button
              onClick={handleBack}
              disabled={
                currentCategoryIndex === 0 && currentQuestionIndex === 0
              }
              className={`${buttonStyles} ${
                currentCategoryIndex === 0 && currentQuestionIndex === 0
                  ? "opacity-50 cursor-not-allowed"
                  : ""
              }`}
            >
              Back
            </button>
            <div className="relative group">
              <button
                onClick={
                  currentCategoryIndex === validCategories.length - 1 &&
                  currentQuestionIndex === currentQuestions.length - 1
                    ? handleUploadCVClick
                    : handleNext
                }
                disabled={isNextDisabled}
                className={`${buttonStyles} ${
                  isNextDisabled ? "opacity-50 cursor-not-allowed" : ""
                }`}
                aria-label={
                  isNextDisabled
                    ? currentCategoryIndex === validCategories.length - 1 &&
                      currentQuestionIndex === currentQuestions.length - 1
                      ? "Answer all questions to submit"
                      : "Answer all questions to proceed"
                    : currentCategoryIndex === validCategories.length - 1 &&
                      currentQuestionIndex === currentQuestions.length - 1
                    ? "Submit Document"
                    : "Next"
                }
              >
                {currentCategoryIndex === validCategories.length - 1 &&
                currentQuestionIndex === currentQuestions.length - 1
                  ? "Submit Document"
                  : "Next"}
              </button>
              {isNextDisabled && (
                <div className="absolute hidden group-hover:block top-[-40px] left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-sm rounded p-2 whitespace-nowrap z-10">
                  {currentCategoryIndex === validCategories.length - 1 &&
                  currentCategoryIndex === validCategories.length - 1 &&
                  currentQuestionIndex === currentQuestions.length - 1
                    ? "Answer all questions to submit"
                    : "Answer all questions to proceed"}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
