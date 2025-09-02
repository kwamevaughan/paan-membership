import { useRef, useEffect, useState, useCallback, useMemo } from "react";
import { Icon } from "@iconify/react";
import QuestionCard from "./QuestionCard";
import toast from "react-hot-toast";

export default function Step2Questions({
  formData,
  setFormData,
  handleOptionToggle,
  questions,
  categories = [],
  isLoading = false,
  onComplete,
  mode,
  initialCategoryIndex = 0,
  initialQuestionIndex = 0,
  onIndicesChange,
}) {
  const containerRef = useRef(null);
  const questionRefs = useRef({});
  const [currentCategoryIndex, setCurrentCategoryIndex] = useState(initialCategoryIndex);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(initialQuestionIndex);
  const [otherInputs, setOtherInputs] = useState({});
  const [dynamicAnswers, setDynamicAnswers] = useState({});
  const [errorMessages, setErrorMessages] = useState({});
  const isDynamicAnswersInitialized = useRef(false);

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
    } else if (currentCategoryIndex < validCategories.length - 1) {
      setCurrentCategoryIndex((prev) => prev + 1);
      setCurrentQuestionIndex(0);
    }
  };

  const handleBack = () => {
    setErrorMessages({});
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex((prev) => prev - 1);
    } else if (currentCategoryIndex > 0) {
      setCurrentCategoryIndex((prev) => prev - 1);
      const prevCategory = validCategories[currentCategoryIndex - 1];
      const prevQuestions = questions
        .filter((q) => q && q.id && q.text && q.category === prevCategory.id)
        .sort((a, b) => a.order - b.order);
      setCurrentQuestionIndex(prevQuestions.length - 1);
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
    setFormData((prev) => {
      const newAnswers = [...prev.answers];
      newAnswers[qId - 1] = [];
      return {
        ...prev,
        answers: newAnswers
      };
    });
    handleOptionToggle(qId - 1, null, [], question?.is_multi_select || false);
    
    const currentQuestionIndex = currentQuestions.findIndex(q => q.id === qId);
    if (currentQuestionIndex < currentQuestions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else if (currentCategoryIndex < validCategories.length - 1) {
      setCurrentCategoryIndex((prev) => prev + 1);
      setCurrentQuestionIndex(0);
    } else {
      onComplete();
    }
  };

  const buttonStyles = `px-6 py-2 bg-[#172840] text-white rounded-lg hover:bg-sky-900 transition shadow-md`;
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

  // Update parent component when indices change
  useEffect(() => {
    if (onIndicesChange) {
      onIndicesChange(currentCategoryIndex, currentQuestionIndex);
    }
  }, [currentCategoryIndex, currentQuestionIndex, onIndicesChange]);

  // Auto-scroll to question content when question changes
  useEffect(() => {
    if (currentQuestions.length > 0 && currentQuestions[currentQuestionIndex]) {
      const questionId = currentQuestions[currentQuestionIndex].id;
      // Use setTimeout to ensure the DOM has updated with the new question
      const scrollTimer = setTimeout(() => {
        if (questionRefs.current[questionId]) {
          questionRefs.current[questionId].scrollIntoView({
            behavior: "smooth",
            block: "start",
          });
        } else if (containerRef.current) {
          // Fallback: scroll to top of container
          containerRef.current.scrollTo({ top: 0, behavior: "smooth" });
        }
      }, 150); // Slightly longer delay to ensure DOM update and content rendering

      return () => clearTimeout(scrollTimer);
    }
  }, [currentCategoryIndex, currentQuestionIndex, currentQuestions]);

  // Auto-scroll when user interacts with form elements and there are more options below
  useEffect(() => {
    const handleFormInteraction = (e) => {
      // Only handle interactions within the current question
      const currentQuestionId = currentQuestions[currentQuestionIndex]?.id;
      if (!currentQuestionId || !containerRef.current) return;

      const questionElement = questionRefs.current[currentQuestionId];
      if (!questionElement) return;

      // Check if the interaction is within the current question
      if (!questionElement.contains(e.target)) return;

      // Get the container and element positions
      const containerRect = containerRef.current.getBoundingClientRect();
      const interactionElement = e.target;
      const elementRect = interactionElement.getBoundingClientRect();
      
      // Only scroll if the element extends below the container
      if (elementRect.bottom > containerRect.bottom - 10) { // 10px buffer
        // Use scrollIntoView to bring the element to the top of the container
        interactionElement.scrollIntoView({
          behavior: "smooth",
          block: "start",
          inline: "nearest"
        });
      }
    };

    // Add event listeners for form interactions
    const events = ['click', 'focus', 'input', 'change'];
    events.forEach(event => {
      document.addEventListener(event, handleFormInteraction, { passive: true });
    });

    return () => {
      events.forEach(event => {
        document.removeEventListener(event, handleFormInteraction);
      });
    };
  }, [currentQuestionIndex, currentQuestions]);

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
      className="h-[100vh] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 pb-48"
    >
      <div className="space-y-8">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <div className="relative">
              <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-paan-blue"></div>
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                <Icon icon="mdi:loading" className="w-8 h-8 text-blue" />
              </div>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-4 mb-8">
            <div className={`p-3 rounded-xl ${mode === "dark" ? "bg-paan-blue/10" : "bg-paan-blue/10"} backdrop-blur-sm`}>
              <Icon
                icon="mdi:folder-outline"
                className={`w-7 h-7 ${mode === "dark" ? "text-paan-deep-blue" : "text-paan-deep-blue"}`}
              />
            </div>
            <div>
              <span
                className={`text-2xl font-medium  ${mode === "dark" ? "text-gray-200" : "text-paan-deep-blue"} `}
              >
                {currentCategory?.name || "Category"}
              </span>
              <div className={`text-sm mt-1 ${mode === "dark" ? "text-gray-400" : "text-gray-600"}`}>
                Question {currentQuestionIndex + 1} of {currentQuestions.length}
              </div>
            </div>
          </div>
        )}

        {currentQuestions.length > 0 && (
          <div
            key={currentQuestions[currentQuestionIndex].id}
            ref={(el) =>
              (questionRefs.current[currentQuestions[currentQuestionIndex].id] =
                el)
            }
            className="animate-fadeIn transform transition-all duration-500 ease-out"
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
              borderColors={[]}
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

        <div className="relative bottom-0  backdrop-blur-md p-6 border-t border-gray-200 dark:border-gray-700 mt-8">
          <div className="flex justify-between items-center gap-4">
            <button
              onClick={handleBack}
              disabled={
                currentCategoryIndex === 0 && currentQuestionIndex === 0
              }
              className={`px-6 py-3 rounded-xl font-medium transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] ${
                currentCategoryIndex === 0 && currentQuestionIndex === 0
                  ? "opacity-50 cursor-not-allowed bg-gray-300 dark:bg-gray-700 text-gray-500 dark:text-gray-400"
                  : "bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-600 text-gray-700 dark:text-gray-300 hover:from-gray-200 hover:to-gray-300 dark:hover:from-gray-600 dark:hover:to-gray-500 shadow-md hover:shadow-lg"
              }`}
            >
              <div className="flex items-center gap-2">
                <Icon icon="mdi:arrow-left" className="w-5 h-5" />
                Back
              </div>
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
                className={`px-6 py-3 rounded-xl font-medium transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] ${
                  isNextDisabled
                    ? "opacity-50 cursor-not-allowed bg-gray-300 dark:bg-gray-700 text-gray-500 dark:text-gray-400"
                    : "bg-gradient-to-r from-[#172840] to-[#1e3a5f] text-white hover:from-[#1e3a5f] hover:to-[#2c5282] shadow-lg hover:shadow-xl"
                }`}
                aria-label={
                  isNextDisabled
                    ? "Answer all questions to proceed"
                    : buttonText
                }
              >
                <div className="flex items-center gap-2">
                  {buttonText}
                  <Icon icon="mdi:arrow-right" className="w-5 h-5" />
                </div>
              </button>
              {isNextDisabled && (
                <div className="absolute hidden group-hover:block top-[-40px] left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-gray-800 to-gray-900 text-white text-sm rounded-lg p-3 whitespace-nowrap z-10 shadow-lg animate-fadeIn">
                  <div className="flex items-center gap-2">
                    <Icon icon="mdi:alert-circle" className="w-5 h-5 text-yellow-400" />
                    Answer all questions to proceed
                  </div>
                </div>
              )}
            </div>
          </div>
          {Object.values(errorMessages).map((msg, idx) => (
            <div
              key={idx}
              className={`mt-4 p-4 rounded-lg bg-gradient-to-r from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20 border border-red-200 dark:border-red-800 animate-fadeIn ${
                mode === "dark" ? "text-red-400" : "text-red-600"
              }`}
            >
              <div className="flex items-center gap-2">
                <Icon icon="mdi:alert-circle" className="w-5 h-5" />
                {msg}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}