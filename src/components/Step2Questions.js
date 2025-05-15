import { useRef, useEffect, useState, useCallback, useMemo } from "react";
import { Icon } from "@iconify/react";
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
}) {
  const containerRef = useRef(null);
  const questionRefs = useRef({});
  const [currentCategoryIndex, setCurrentCategoryIndex] = useState(0);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [otherInputs, setOtherInputs] = useState({});
  const [dynamicAnswers, setDynamicAnswers] = useState({});
  const [errorMessages, setErrorMessages] = useState({});
  const isDynamicAnswersInitialized = useRef(false);

  const borderColors = [
    "border-red-500",
    "border-blue-500",
    "border-green-500",
    "border-yellow-500",
    "border-purple-500",
  ];

  const inferRequiredAnswers = (question) => {
    if (question.max_answers) return question.max_answers;
    const text = question.text.toLowerCase();
    const numberWords = ["one", "two", "three", "four", "five"];
    const numberDigits = ["1", "2", "3", "4", "5"];
    for (let i = 0; i < numberWords.length; i++) {
      if (text.includes(numberWords[i]) || text.includes(numberDigits[i])) {
        return i + 1;
      }
    }
    return 1;
  };

  const validCategories = useMemo(() => {
    const filteredCategories = categories.filter(
      (cat) =>
        cat &&
        cat.id &&
        cat.job_type === formData.job_type &&
        questions.some((q) => q && q.category === cat.id)
    );
    return filteredCategories.sort((a, b) => {
      const aMinOrder = Math.min(
        ...questions.filter((q) => q && q.category === a.id).map((q) => q.order)
      );
      const bMinOrder = Math.min(
        ...questions.filter((q) => q && q.category === b.id).map((q) => q.order)
      );
      return aMinOrder - bMinOrder;
    });
  }, [categories, questions, formData.job_type]);

  const currentCategory = validCategories[currentCategoryIndex];
  const currentQuestions = useMemo(
    () =>
      currentCategory
        ? questions
            .filter(
              (q) => q && q.id && q.text && q.category === currentCategory.id
            )
            .sort((a, b) => a.order - b.order)
        : [],
    [currentCategory, questions]
  );

  useEffect(() => {
    // Empty effect to match original code
  }, [questions, validCategories, currentQuestions]);

  useEffect(() => {
    if (isDynamicAnswersInitialized.current) return;

    const initialDynamicAnswers = {};
    questions.forEach((q) => {
      if (q && q.id && q.job_type === formData.job_type) {
        const answers = formData.answers[q.id - 1] || [];
        if (q.is_open_ended) {
          if (q.structured_answers) {
            const expectedAnswers = inferRequiredAnswers(q);
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
                  } catch {
                    return q.structured_answers.fields.reduce(
                      (acc, field) => ({
                        ...acc,
                        [field.name.toLowerCase()]: "",
                      }),
                      {}
                    );
                  }
                })
              : Array.from({ length: expectedAnswers }, () =>
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
        } else {
          initialDynamicAnswers[q.id] = answers.length
            ? answers
            : q.is_multi_select
            ? []
            : [""];
        }
      }
    });
    setDynamicAnswers(initialDynamicAnswers);
    isDynamicAnswersInitialized.current = true;
  }, [questions, formData.answers, formData.job_type]);

  const checkQuestionComplete = useCallback(
    (qId) => {
      const q = questions.find((q) => q && q.id === qId);
      if (!q) {
        return false;
      }

      const answers = formData.answers[qId - 1] || [];
      const dynamic = dynamicAnswers[qId] || [];

      if (q.skippable && !answers.length) {
        return true;
      }

      if (!answers.length && !q.skippable) {
        return false;
      }

      if (q.is_open_ended) {
        if (q.structured_answers) {
          const requiredAnswers = inferRequiredAnswers(q);
          const answerCount = dynamic.filter((ans) =>
            q.structured_answers.fields.every(
              (field) =>
                ans[field.name.toLowerCase()] !== undefined &&
                typeof ans[field.name.toLowerCase()] === "string" &&
                ans[field.name.toLowerCase()].trim() !== ""
            )
          ).length;
          const isComplete = q.skippable
            ? answerCount === 0 || answerCount >= requiredAnswers
            : answerCount >= requiredAnswers;
          return isComplete;
        }
        const answerCount = dynamic.filter(
          (ans) => typeof ans.text === "string" && ans.text.trim() !== ""
        ).length;
        const isComplete = q.skippable
          ? answerCount === 0 || answerCount >= (q.max_answers || 1)
          : answerCount >= (q.max_answers || 1);
        return isComplete;
      }

      if (q.text_input_option) {
        const requiredAnswers = q.text_input_max_answers || 1;
        const hasTextOption = answers.some((ans) =>
          typeof ans === "string"
            ? ans === q.text_input_option.option
            : ans.option === q.text_input_option.option
        );
        if (hasTextOption) {
          const answerCount = dynamic.filter(
            (ans) => typeof ans.text === "string" && ans.text.trim() !== ""
          ).length;
          const isValid = answers.every((ans) => {
            const isTextOption =
              (typeof ans === "string" && ans === q.text_input_option.option) ||
              (typeof ans === "object" &&
                ans.option === q.text_input_option.option);
            if (isTextOption) {
              const customText =
                typeof ans === "object" && typeof ans.customText === "string"
                  ? ans.customText
                  : dynamic[0]?.text || "";
              return customText.trim() !== "";
            }
            return true;
          });
          const isComplete = isValid && answerCount >= requiredAnswers;
          return isComplete;
        }
        const isComplete = answers.every((ans) =>
          typeof ans === "string"
            ? ans !== q.text_input_option.option
            : (ans.option || null) !== q.text_input_option.option
        );
        return isComplete;
      }

      const isComplete = answers.every((ans) =>
        typeof ans === "string"
          ? ans.trim() !== ""
          : ans.option || ans.customText?.trim()
      );
      return isComplete;
    },
    [questions, formData.answers, dynamicAnswers]
  );

  const handleTextInputChange = useCallback(
    (qId, idx, value) => {
      setDynamicAnswers((prev) => {
        const updatedAnswers = [...(prev[qId] || [{ text: "" }])];
        updatedAnswers[idx] = { text: value };
        return { ...prev, [qId]: updatedAnswers };
      });

      const selectedOption = formData.answers[qId - 1]?.[0]?.option;
      const question = questions.find((q) => q && q.id === qId);
      if (selectedOption) {
        const updatedAnswers = (dynamicAnswers[qId] || [{ text: "" }]).map(
          (ans, i) => ({
            option: selectedOption,
            customText: i === idx ? value : ans.text,
          })
        );
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

  const handleStructuredInputChange = useCallback(
    (qId, idx, fieldName, value) => {
      setDynamicAnswers((prev) => {
        const updatedAnswers = [...(prev[qId] || [])];
        updatedAnswers[idx] = {
          ...updatedAnswers[idx],
          [fieldName.toLowerCase()]: value,
        };
        return { ...prev, [qId]: updatedAnswers };
      });

      const question = questions.find((q) => q && q.id === qId);
      if (question?.structured_answers) {
        const updatedAnswers = (dynamicAnswers[qId] || []).map((ans) => ({
          customText: JSON.stringify(ans),
        }));
        handleOptionToggle(
          qId - 1,
          null,
          updatedAnswers,
          question?.is_multi_select || false
        );
      }
    },
    [dynamicAnswers, handleOptionToggle, questions]
  );

  const handleOptionToggleWrapper = useMemo(
    () =>
      function (qIndex, option, answers) {
        const question = questions.find((q) => q && q.id === qIndex + 1);
        handleOptionToggle(
          qIndex,
          option,
          answers,
          question?.is_multi_select || false
        );
      },
    [handleOptionToggle, questions]
  );

  const areCurrentQuestionsComplete = useMemo(
    () => currentQuestions.every((q) => checkQuestionComplete(q.id)),
    [currentQuestions, checkQuestionComplete]
  );

  const areAllQuestionsComplete = useMemo(() => {
    const relevantQuestions = questions.filter(
      (q) => q && q.id && q.job_type === formData.job_type
    );
    const complete = relevantQuestions.every((q) =>
      checkQuestionComplete(q.id)
    );
    return complete;
  }, [questions, checkQuestionComplete, formData.job_type]);

  const handleUploadCVClick = () => {
    setErrorMessages({});
    if (!areAllQuestionsComplete) {
      const incompleteQuestion = questions.find(
        (q) =>
          q &&
          q.id &&
          q.job_type === formData.job_type &&
          !checkQuestionComplete(q.id)
      );
      if (incompleteQuestion) {
        const category = categories.find(
          (cat) => cat.id === incompleteQuestion.category
        );
        if (incompleteQuestion.is_open_ended && !incompleteQuestion.skippable) {
          const requiredAnswers = inferRequiredAnswers(incompleteQuestion);
          const answerCount = (
            dynamicAnswers[incompleteQuestion.id] || []
          ).filter((ans) => {
            if (incompleteQuestion.structured_answers) {
              return incompleteQuestion.structured_answers.fields.every(
                (field) =>
                  ans[field.name.toLowerCase()] !== undefined &&
                  typeof ans[field.name.toLowerCase()] === "string" &&
                  ans[field.name.toLowerCase()].trim() !== ""
              );
            }
            return typeof ans.text === "string" && ans.text.trim() !== "";
          }).length;
          if (answerCount < requiredAnswers) {
            setErrorMessages({
              [incompleteQuestion.id]: `Please provide ${requiredAnswers} complete answers for "${incompleteQuestion.text}".`,
            });
            if (questionRefs.current[incompleteQuestion.id]) {
              questionRefs.current[incompleteQuestion.id].scrollIntoView({
                behavior: "smooth",
                block: "center",
              });
            }
            return;
          }
        } else if (
          !incompleteQuestion.is_open_ended &&
          incompleteQuestion.text_input_option &&
          incompleteQuestion.text_input_max_answers
        ) {
          const answerCount = (
            dynamicAnswers[incompleteQuestion.id] || []
          ).filter(
            (ans) => typeof ans.text === "string" && ans.text.trim() !== ""
          ).length;
          if (answerCount < incompleteQuestion.text_input_max_answers) {
            setErrorMessages({
              [incompleteQuestion.id]: `Please provide ${incompleteQuestion.text_input_max_answers} details for "${incompleteQuestion.text}".`,
            });
            if (questionRefs.current[incompleteQuestion.id]) {
              questionRefs.current[incompleteQuestion.id].scrollIntoView({
                behavior: "smooth",
                block: "center",
              });
            }
            return;
          }
        } else if (category?.is_mandatory) {
          setErrorMessages({
            [incompleteQuestion.id]: `Please agree to "${incompleteQuestion.text}".`,
          });
          if (questionRefs.current[incompleteQuestion.id]) {
            questionRefs.current[incompleteQuestion.id].scrollIntoView({
              behavior: "smooth",
              block: "center",
            });
          }
          return;
        }
        setErrorMessages({
          [incompleteQuestion.id]: incompleteQuestion.is_open_ended
            ? `Please answer "${incompleteQuestion.text}".`
            : `Select an option and provide details for "${incompleteQuestion.text}".`,
        });
        if (questionRefs.current[incompleteQuestion.id]) {
          questionRefs.current[incompleteQuestion.id].scrollIntoView({
            behavior: "smooth",
            block: "center",
          });
        }
        return;
      }
    }
    onComplete();
  };

  const handleNext = () => {
    setErrorMessages({});
    const currentQuestion = currentQuestions[currentQuestionIndex];
    if (!checkQuestionComplete(currentQuestion?.id)) {
      const category = categories.find(
        (cat) => cat.id === currentQuestion.category
      );
      setErrorMessages({
        [currentQuestion.id]: category?.is_mandatory
          ? `Please agree to "${currentQuestion.text}".`
          : currentQuestion.is_open_ended
          ? `Please answer "${currentQuestion.text}".`
          : `Select an option and provide details for "${currentQuestion.text}".`,
      });
      if (questionRefs.current[currentQuestion.id]) {
        questionRefs.current[currentQuestion.id].scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
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
    setErrorMessages({});
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex((prev) => prev - 1);
      containerRef.current?.scrollTo({ top: 0, behavior: "smooth" });
    } else if (currentCategoryIndex > 0) {
      setCurrentCategoryIndex((prev) => prev - 1);
      const prevCategory = validCategories[currentCategoryIndex - 1];
      const prevQuestions = questions
        .filter((q) => q && q.id && q.text && q.category === prevCategory.id)
        .sort((a, b) => a.order - b.order);
      setCurrentQuestionIndex(prevQuestions.length - 1);
      containerRef.current?.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleSkip = (qId) => {
    setErrorMessages({});
    const question = questions.find((q) => q && q.id === qId);
    const category = categories.find((cat) => cat.id === question.category);
    if (category?.is_mandatory) {
      setErrorMessages({
        [qId]: `You must agree to "${question.text}".`,
      });
      return;
    }
    setDynamicAnswers((prev) => ({ ...prev, [qId]: [] }));
    setOtherInputs((prev) => ({ ...prev, [qId]: "" }));
    handleOptionToggle(qId - 1, null, [], question?.is_multi_select || false);
    if (currentQuestionIndex < currentQuestions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
      containerRef.current?.scrollTo({ top: 0, behavior: "smooth" });
    } else if (currentCategoryIndex < validCategories.length - 1) {
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

  const buttonText =
    currentCategoryIndex === validCategories.length - 1 &&
    currentQuestionIndex === currentQuestions.length - 1 &&
    formData.job_type === "freelancer"
      ? "Submit"
      : "Next";

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
            No questions available for this application type.
          </p>
          <button onClick={handleUploadCVClick} className={buttonStyles}>
            {formData.job_type === "freelancer" ? "Submit" : "Next"}
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
      <div className="space-y-6">
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
              handleStructuredInputChange={handleStructuredInputChange}
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
                    ? "Answer all questions to proceed"
                    : buttonText
                }
              >
                {buttonText}
              </button>
              {isNextDisabled && (
                <div className="absolute hidden group-hover:block top-[-40px] left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-sm rounded p-2 whitespace-nowrap z-10">
                  Answer all questions to proceed.
                </div>
              )}
            </div>
          </div>
          {Object.values(errorMessages).map((msg, idx) => (
            <p
              key={idx}
              className={`mt-2 text-sm text-red-500 ${
                mode === "dark" ? "text-red-400" : ""
              }`}
            >
              {msg}
            </p>
          ))}
        </div>
      </div>
    </div>
  );
}