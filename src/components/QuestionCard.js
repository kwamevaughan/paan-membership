import { useState, useEffect, useRef } from "react";
import { Icon } from "@iconify/react";
import toast from "react-hot-toast";
import Select from "react-select";
import { useCountry } from "@/hooks/useCountry";

// Debounce utility to prevent multiple toast triggers
const debounce = (func, wait) => {
  let timeout;
  return (...args) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

export default function QuestionCard({
  q,
  mode,
  formData,
  handleOptionToggle,
  dynamicAnswers,
  setDynamicAnswers,
  otherInputs,
  setOtherInputs,
  borderColors,
  isComplete,
  onSkip,
  handleTextInputChange,
}) {
  const { countryOptions } = useCountry();
  const inputStyles = `w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-800 transition ${
    mode === "dark"
      ? "bg-gray-700 border-gray-600 text-white"
      : "bg-gray-50 border-gray-300 text-[#231812]"
  } ${!isComplete ? "border-red-500" : ""} min-h-[40px] resize-none`;

  // Debounced toast function
  const debouncedToast = useRef(
    debounce((message, options) => {
      toast.dismiss(options.id); // Clear any existing toast for this question
      toast.success(message, options);
    }, 100)
  ).current;

  useEffect(() => {
    if (q.is_open_ended && !dynamicAnswers[q.id]) {
      const initialAnswers = q.structured_answers
        ? Array.from({ length: q.max_answers || 1 }, () =>
            q.structured_answers.fields.reduce(
              (acc, field) => ({
                ...acc,
                [field.name.toLowerCase()]: "",
              }),
              {}
            )
          )
        : q.max_answers && q.max_answers > 1
        ? Array.from({ length: q.max_answers }, () => ({
            text: "",
            link: "",
          }))
        : [{ text: "", link: "" }];
      setDynamicAnswers((prev) => ({ ...prev, [q.id]: initialAnswers }));
    }
    if (
      !q.is_open_ended &&
      q.text_input_option &&
      formData.answers[q.id - 1]?.some(
        (ans) =>
          (typeof ans === "string" && ans === q.text_input_option.option) ||
          (typeof ans === "object" && ans.option === q.text_input_option.option)
      )
    ) {
      const currentAnswers = dynamicAnswers[q.id] || [];
      const requiredAnswers = q.text_input_max_answers || 1;
      if (currentAnswers.length < requiredAnswers) {
        const initialAnswers = Array.from(
          { length: requiredAnswers },
          (_, idx) => ({
            text: currentAnswers[idx]?.text || "",
          })
        );
        setDynamicAnswers((prev) => ({ ...prev, [q.id]: initialAnswers }));
      }
    }
  }, [q, dynamicAnswers, setDynamicAnswers, formData.answers]);

  const countWords = (text) => {
    return text.trim() === "" ? 0 : text.trim().split(/\s+/).length;
  };

  const handleOtherInputChange = (qId, value) => {
    setOtherInputs((prev) => ({ ...prev, [qId]: value }));
    const selectedOption = formData.answers[qId - 1]?.[0]?.option || "Other";
    handleOptionToggle(qId - 1, selectedOption, value);
  };

  const handleDynamicInputChange = (qId, idx, updatedAnswer) => {
    if (q.max_words && countWords(updatedAnswer.text) > q.max_words) {
      toast.error(`Answer ${idx + 1} cannot exceed ${q.max_words} words.`);
      return;
    }
    setDynamicAnswers((prev) => {
      const updatedAnswers = [...(prev[qId] || [{ text: "", link: "" }])];
      updatedAnswers[idx] = updatedAnswer;
      return { ...prev, [qId]: updatedAnswers };
    });
    const updatedFormAnswers = (dynamicAnswers[qId] || []).map((ans) => ({
      option: null,
      customText: ans.text,
      link: ans.link,
    }));
    updatedFormAnswers[idx] = {
      option: null,
      customText: updatedAnswer.text,
      link: updatedAnswer.link,
    };
    handleOptionToggle(qId - 1, null, updatedFormAnswers);
  };

  const handleStructuredInputChange = (qId, idx, field, value) => {
    setDynamicAnswers((prev) => {
      const updatedAnswers = [...(prev[qId] || [{}])];
      updatedAnswers[idx] = { ...updatedAnswers[idx], [field]: value };
      const updatedFormAnswers = updatedAnswers.map((ans) => ({
        option: null,
        customText: JSON.stringify(ans),
        link: "",
      }));

      handleOptionToggle(qId - 1, null, updatedFormAnswers);
      return { ...prev, [qId]: updatedAnswers };
    });
  };

  const handleSingleAnswerChange = (qId, value) => {
    if (q.max_words && countWords(value) > q.max_words) {
      toast.error(`Answer cannot exceed ${q.max_words} words.`);
      return;
    }
    setDynamicAnswers((prev) => ({
      ...prev,
      [qId]: [{ text: value, link: "" }],
    }));
    handleOptionToggle(qId - 1, null, [
      { option: null, customText: value, link: "" },
    ]);
  };

  const handleAddTextInputAnswer = (qId, maxAnswers) => {
    setDynamicAnswers((prev) => {
      const currentAnswers = prev[qId] || [{ text: "" }];
      if (currentAnswers.length >= maxAnswers) {
        toast.error(`Maximum ${maxAnswers} answers allowed.`);
        return prev;
      }
      return { ...prev, [qId]: [...currentAnswers, { text: "" }] };
    });
  };

  const handleRemoveTextInputAnswer = (qId, idx) => {
    setDynamicAnswers((prev) => {
      const updatedAnswers = [...(prev[qId] || [{ text: "" }])];
      if (updatedAnswers.length <= 1) return prev;
      updatedAnswers.splice(idx, 1);
      return { ...prev, [qId]: updatedAnswers };
    });
    const selectedOption = formData.answers[qId - 1]?.[0]?.option;
    const updatedFormAnswers = (dynamicAnswers[qId] || [])
      .filter((_, i) => i !== idx)
      .map((ans) => ({
        option: selectedOption,
        customText: ans.text,
      }));
    handleOptionToggle(qId - 1, selectedOption, updatedFormAnswers);
  };

  const handleAddAnswer = (qId, maxAnswers) => {
    setDynamicAnswers((prev) => {
      const currentAnswers = prev[qId] || [{}];
      if (currentAnswers.length >= maxAnswers) {
        toast.error(`Maximum ${maxAnswers} answers allowed.`);
        return prev;
      }
      const newAnswer = q.structured_answers
        ? q.structured_answers.fields.reduce(
            (acc, field) => ({
              ...acc,
              [field.name.toLowerCase()]: "",
            }),
            {}
          )
        : { text: "", link: "" };
      return { ...prev, [qId]: [...currentAnswers, newAnswer] };
    });
  };

  const handleRemoveAnswer = (qId, idx) => {
    setDynamicAnswers((prev) => {
      const updatedAnswers = [...(prev[qId] || [{}])];
      if (updatedAnswers.length <= 1) return prev;
      updatedAnswers.splice(idx, 1);
      const updatedFormAnswers = updatedAnswers.map((ans) => ({
        option: null,
        customText: q.structured_answers ? JSON.stringify(ans) : ans.text || "",
        link: ans.link || "",
      }));
      handleOptionToggle(qId - 1, null, updatedFormAnswers);
      return { ...prev, [qId]: updatedAnswers };
    });
  };

  const handleCountrySelectChange = (qId, selectedOptions) => {
    const selectedValues = selectedOptions
      ? selectedOptions.map((opt) => opt.value)
      : [];
    if (selectedValues.length === 0) {
      toast.error("Please select at least one country.");
      handleOptionToggle(qId - 1, null, []);
      return;
    }
    handleOptionToggle(qId - 1, null, selectedValues);
    debouncedToast(`Selected ${selectedValues.length} countries.`, {
      id: `select-${qId}-countries`,
    });
  };

  const handleOptionToggleWrapper = (qIndex, option, customText) => {
    const currentAnswers = formData.answers[qIndex] || [];
    let updatedAnswers;

    if (q.is_multi_select) {
      const isSelected = currentAnswers.some(
        (ans) => ans.option === option || ans === option
      );
      if (isSelected) {
        updatedAnswers = currentAnswers.filter(
          (ans) => ans.option !== option && ans !== option
        );
      } else {
        updatedAnswers = [
          ...currentAnswers,
          customText !== undefined && typeof customText === "string"
            ? { option, customText }
            : { option },
        ];
        debouncedToast(`${option} selected.`, {
          id: `select-${q.id}-${option}`,
        });
      }
    } else {
      const wasPreviouslySelected = currentAnswers.some(
        (ans) => ans.option === option || ans === option
      );
      const isTextInputOption =
        q.text_input_option?.option === option ||
        q.text_input_option?.option === "Any";
      updatedAnswers = [
        isTextInputOption &&
        customText !== undefined &&
        typeof customText === "string"
          ? { option, customText }
          : { option },
      ];
      setOtherInputs((prev) => ({ ...prev, [q.id]: "" }));
      if (!wasPreviouslySelected) {
        debouncedToast(`${option} selected.`, {
          id: `select-${q.id}-${option}`,
        });
      }
    }

    handleOptionToggle(qIndex, option, updatedAnswers, q.is_multi_select);
  };

  const handleSkip = (qId) => {
    setDynamicAnswers((prev) => ({ ...prev, [qId]: [] }));
    setOtherInputs((prev) => ({ ...prev, [qId]: "" }));
    handleOptionToggle(qId - 1, null, []);
    toast.success("Question skipped.", {
      id: `skip-${qId}`,
    });
    onSkip();
  };

  const isSingleAnswer =
    q.is_open_ended &&
    (!q.max_answers || q.max_answers <= 1) &&
    !q.structured_answers;

  const selectedTextInputOption = q.options.find((opt) => {
    const isTextInputOption =
      q.text_input_option?.option === "Any" ||
      q.text_input_option?.option === opt;
    const isSelected = q.is_multi_select
      ? formData.answers[q.id - 1]?.some((ans) =>
          typeof ans === "object" ? ans.option === opt : ans === opt
        )
      : formData.answers[q.id - 1]?.[0]?.option === opt ||
        formData.answers[q.id - 1]?.[0] === opt;
    return isTextInputOption && isSelected && opt !== "Other";
  });

  const selectStyles = {
    control: (provided) => ({
      ...provided,
      backgroundColor: mode === "dark" ? "#374151" : "#F9FAFB",
      borderColor: !isComplete
        ? "#EF4444"
        : mode === "dark"
        ? "#4B5563"
        : "#D1D5DB",
      color: mode === "dark" ? "#FFFFFF" : "#231812",
      minHeight: "40px",
      "&:hover": { borderColor: "#4B5563" },
      boxShadow: "none",
    }),
    menu: (provided) => ({
      ...provided,
      backgroundColor: mode === "dark" ? "#374151" : "#FFFFFF",
      color: mode === "dark" ? "#FFFFFF" : "#231812",
    }),
    option: (provided, state) => ({
      ...provided,
      backgroundColor: state.isSelected
        ? "#4B5563"
        : state.isFocused
        ? mode === "dark"
          ? "#4B5563"
          : "#F3F4F6"
        : "transparent",
      color: state.isSelected
        ? "#FFFFFF"
        : mode === "dark"
        ? "#FFFFFF"
        : "#231812",
      "&:hover": {
        backgroundColor: mode === "dark" ? "#4B5563" : "#F3F4F6",
      },
    }),
    multiValue: (provided) => ({
      ...provided,
      backgroundColor: "#4B5563",
    }),
    multiValueLabel: (provided) => ({
      ...provided,
      color: "#FFFFFF",
    }),
    multiValueRemove: (provided) => ({
      ...provided,
      color: "#FFFFFF",
      "&:hover": {
        backgroundColor: "#D94F1E",
        color: "#FFFFFF",
      },
    }),
    placeholder: (provided) => ({
      ...provided,
      color: mode === "dark" ? "#9CA3AF" : "#6B7280",
    }),
    singleValue: (provided) => ({
      ...provided,
      color: mode === "dark" ? "#FFFFFF" : "#231812",
    }),
  };

  // Get selected country labels for display
  const selectedCountries = formData.answers[q.id - 1]?.length
    ? formData.answers[q.id - 1].map((value) => {
        const country = countryOptions.find((opt) => opt.value === value);
        return country ? country.label : value;
      })
    : [];

  return (
    <div
      className={`rounded-xl py-4 transition-all duration-300 backdrop-blur-sm ${
        mode === "dark" ? "bg-gradient-to-br from-gray-800/90 to-gray-900/90" : "bg-gradient-to-br from-white to-gray-50"
      } ${!isComplete ? "border-red-500" : ""}`}
    >
      <div className="mb-6">
        <div className="flex items-start gap-4 mb-4">
          <div className={`p-3 rounded-xl ${mode === "dark" ? "bg-gradient-to-br from-blue-500/20 to-purple-500/20" : "bg-gradient-to-br from-blue-50 to-purple-50"} backdrop-blur-sm`}>
            <Icon
              icon="mdi:question-mark-circle"
              className={`w-7 h-7 ${mode === "dark" ? "text-blue-400" : "text-blue-600"}`}
            />
          </div>
          <div className="flex-1">
            <span
              className={`text-xl font-semibold leading-relaxed bg-gradient-to-r ${mode === "dark" ? "from-gray-100 to-gray-300" : "from-gray-900 to-gray-700"} bg-clip-text text-transparent`}
              dangerouslySetInnerHTML={{ __html: q.text }}
            />
            {q.description && (
              <div
                className={`mt-2 text-base leading-relaxed ${
                  mode === "dark" ? "text-gray-400" : "text-gray-600"
                }`}
                dangerouslySetInnerHTML={{ __html: q.description }}
              />
            )}
          </div>
        </div>
      </div>

      {q.is_country_select ? (
        <div className="space-y-4">
          <label
            htmlFor={`q-${q.id}-country-select`}
            className={`text-sm font-medium ${
              mode === "dark" ? "text-gray-300" : "text-[#231812]"
            }`}
          >
            Select Countries
          </label>
          <div className="relative">
            <Select
              id={`q-${q.id}-country-select`}
              options={countryOptions}
              isMulti
              value={countryOptions.filter((opt) =>
                formData.answers[q.id - 1]?.includes(opt.value)
              )}
              onChange={(selected) => handleCountrySelectChange(q.id, selected)}
              placeholder="Select geographic markets served"
              styles={{
                ...selectStyles,
                menu: (provided) => ({
                  ...provided,
                  backgroundColor: mode === "dark" ? "#374151" : "#FFFFFF",
                  color: mode === "dark" ? "#FFFFFF" : "#231812",
                  position: "relative",
                  width: "100%",
                }),
                menuList: (provided) => ({
                  ...provided,
                  maxHeight: "400px"
                })
              }}
              classNamePrefix="react-select"
              aria-label="Select geographic markets served"
            />
          </div>
          {selectedCountries.length > 0 ? (
            <div
              className={`text-sm mt-2 p-3 rounded-lg bg-gradient-to-r ${mode === "dark" ? "from-gray-700/50 to-gray-800/50" : "from-gray-50 to-gray-100"} backdrop-blur-sm`}
              aria-live="polite"
            >
              <span className="font-medium">Selected Countries: </span>
              {selectedCountries.join(", ")}
            </div>
          ) : (
            <div
              className={`text-sm mt-2 p-3 rounded-lg bg-gradient-to-r ${mode === "dark" ? "from-gray-700/50 to-gray-800/50" : "from-gray-50 to-gray-100"} backdrop-blur-sm`}
              aria-live="polite"
            >
              No countries selected.
            </div>
          )}
        </div>
      ) : q.is_open_ended ? (
        q.structured_answers ? (
          <div className="space-y-6">
            <div className="flex flex-col gap-4 p-6 rounded-xl border border-gray-200 dark:border-gray-700 bg-gradient-to-br from-gray-50/50 to-gray-100/50 dark:from-gray-800/50 dark:to-gray-900/50 backdrop-blur-sm shadow-sm hover:shadow-md transition-all duration-300">
              <div className="flex items-center justify-between">
                <h4 className={`text-sm font-medium ${mode === "dark" ? "text-gray-300" : "text-[#231812]"}`}>
                  Reference {1}
                </h4>
                {dynamicAnswers[q.id]?.length > 1 && (
                  <button
                    onClick={() => handleRemoveAnswer(q.id, 0)}
                    className="text-red-500 hover:text-red-700 transition-all duration-300 transform hover:scale-110 active:scale-95"
                    aria-label="Remove reference"
                  >
                    <Icon icon="mdi:close" width={24} />
                  </button>
                )}
              </div>
              {q.structured_answers.fields.map((field) => (
                <div key={field.name} className="flex flex-col gap-2">
                  <label
                    htmlFor={`q-${q.id}-0-${field.name.toLowerCase()}`}
                    className={`text-sm font-medium ${
                      mode === "dark" ? "text-gray-300" : "text-[#231812]"
                    }`}
                  >
                    {field.name}
                  </label>
                  <input
                    type={field.type}
                    value={dynamicAnswers[q.id]?.[0]?.[field.name.toLowerCase()] || ""}
                    onChange={(e) =>
                      handleStructuredInputChange(
                        q.id,
                        0,
                        field.name.toLowerCase(),
                        e.target.value
                      )
                    }
                    className={`${inputStyles} focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300`}
                    placeholder={`Enter ${field.name}`}
                    id={`q-${q.id}-0-${field.name.toLowerCase()}`}
                    aria-labelledby={`q-${q.id}-0-${field.name.toLowerCase()}-label`}
                  />
                </div>
              ))}
            </div>

            {dynamicAnswers[q.id]?.length > 1 && (
              <div className="space-y-4">
                {(dynamicAnswers[q.id] || [{}])
                  .slice(1, q.max_answers || 1)
                  .map((ans, idx) => (
                    <div key={idx + 1} className="flex flex-col gap-4 p-6 rounded-xl border border-gray-200 dark:border-gray-700 bg-gradient-to-br from-gray-50/50 to-gray-100/50 dark:from-gray-800/50 dark:to-gray-900/50 backdrop-blur-sm shadow-sm hover:shadow-md transition-all duration-300">
                      <div className="flex items-center justify-between">
                        <h4 className={`text-sm font-medium ${mode === "dark" ? "text-gray-300" : "text-[#231812]"}`}>
                          Reference {idx + 2}
                        </h4>
                        <button
                          onClick={() => handleRemoveAnswer(q.id, idx + 1)}
                          className="text-red-500 hover:text-red-700 transition-all duration-300 transform hover:scale-110 active:scale-95"
                          aria-label={`Remove reference ${idx + 2}`}
                        >
                          <Icon icon="mdi:close" width={24} />
                        </button>
                      </div>
                      {q.structured_answers.fields.map((field) => (
                        <div key={field.name} className="flex flex-col gap-2">
                          <label
                            htmlFor={`q-${q.id}-${idx + 1}-${field.name.toLowerCase()}`}
                            className={`text-sm font-medium ${
                              mode === "dark" ? "text-gray-300" : "text-[#231812]"
                            }`}
                          >
                            {field.name}
                          </label>
                          <input
                            type={field.type}
                            value={ans[field.name.toLowerCase()] || ""}
                            onChange={(e) =>
                              handleStructuredInputChange(
                                q.id,
                                idx + 1,
                                field.name.toLowerCase(),
                                e.target.value
                              )
                            }
                            className={`${inputStyles} focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300`}
                            placeholder={`Enter ${field.name}`}
                            id={`q-${q.id}-${idx + 1}-${field.name.toLowerCase()}`}
                            aria-labelledby={`q-${q.id}-${idx + 1}-${field.name.toLowerCase()}-label`}
                          />
                        </div>
                      ))}
                    </div>
                  ))}
              </div>
            )}

            {q.max_answers > 1 &&
              (dynamicAnswers[q.id]?.length || 0) < q.max_answers && (
                <button
                  onClick={() => handleAddAnswer(q.id, q.max_answers)}
                  className="mt-2 text-blue-500 hover:text-blue-700 font-semibold flex items-center gap-2 transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98]"
                  aria-label="Add reference"
                >
                  <Icon icon="mdi:plus" width={20} />
                  Add Reference
                </button>
              )}
          </div>
        ) : isSingleAnswer ? (
          <div className="space-y-4">
            <label
              htmlFor={`q-${q.id}-input`}
              className={`text-sm font-medium ${
                mode === "dark" ? "text-gray-300" : "text-[#231812]"
              }`}
            >
              Answer
            </label>
            <textarea
              value={dynamicAnswers[q.id]?.[0]?.text || ""}
              onChange={(e) => handleSingleAnswerChange(q.id, e.target.value)}
              className={`${inputStyles} min-h-[120px] resize-y focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300`}
              placeholder="Enter your answer"
              id={`q-${q.id}-input`}
              aria-labelledby={`q-${q.id}-label`}
            />
            {q.max_words && (
              <div
                className={`text-sm p-2 rounded-lg ${
                  countWords(dynamicAnswers[q.id]?.[0]?.text || "") >
                  q.max_words
                    ? "text-red-500 bg-red-50 dark:bg-red-900/20"
                    : mode === "dark"
                    ? "text-gray-400 bg-gray-800/50"
                    : "text-gray-600 bg-gray-50"
                }`}
              >
                {countWords(dynamicAnswers[q.id]?.[0]?.text || "")}/
                {q.max_words} words
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-6">
            {(dynamicAnswers[q.id] || [{ text: "", link: "" }]).map(
              (ans, idx) => (
                <div key={idx} className="flex flex-col gap-4 p-6 rounded-xl border border-gray-200 dark:border-gray-700 bg-gradient-to-br from-gray-50/50 to-gray-100/50 dark:from-gray-800/50 dark:to-gray-900/50 backdrop-blur-sm shadow-sm hover:shadow-md transition-all duration-300">
                  <label
                    id={`q-${q.id}-label-${idx}`}
                    className={`text-sm font-medium ${
                      mode === "dark" ? "text-gray-300" : "text-[#231812]"
                    }`}
                  >
                    Answer {idx + 1}
                  </label>
                  <textarea
                    value={ans.text}
                    onChange={(e) =>
                      handleDynamicInputChange(q.id, idx, {
                        ...ans,
                        text: e.target.value,
                      })
                    }
                    className={`${inputStyles} min-h-[120px] resize-y focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300`}
                    placeholder={`Answer ${idx + 1}`}
                    aria-labelledby={`q-${q.id}-label-${idx}`}
                  />
                  {q.max_words && (
                    <div
                      className={`text-sm p-2 rounded-lg ${
                        countWords(ans.text || "") > q.max_words
                          ? "text-red-500 bg-red-50 dark:bg-red-900/20"
                          : mode === "dark"
                          ? "text-gray-400 bg-gray-800/50"
                          : "text-gray-600 bg-gray-50"
                      }`}
                    >
                      {countWords(ans.text || "")}/{q.max_words} words
                    </div>
                  )}
                  {q.has_links && (
                    <input
                      type="url"
                      value={ans.link}
                      onChange={(e) =>
                        handleDynamicInputChange(q.id, idx, {
                          ...ans,
                          link: e.target.value,
                        })
                      }
                      onKeyDown={(e) => e.key === "Enter" && e.preventDefault()}
                      className={`${inputStyles} min-h-0 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300`}
                      placeholder={`Link for answer ${idx + 1} (optional)`}
                      aria-labelledby={`q-${q.id}-label-${idx}`}
                    />
                  )}
                  {dynamicAnswers[q.id]?.length > 1 && (
                    <button
                      onClick={() => handleRemoveAnswer(q.id, idx)}
                      className="text-red-500 hover:text-red-700 self-end transition-all duration-300 transform hover:scale-110 active:scale-95"
                      aria-label={`Remove answer ${idx + 1}`}
                    >
                      <Icon icon="mdi:close" width={24} />
                    </button>
                  )}
                </div>
              )
            )}
            {q.max_answers > 1 &&
              (dynamicAnswers[q.id]?.length || 0) < q.max_answers && (
                <button
                  onClick={() => handleAddAnswer(q.id, q.max_answers)}
                  className="mt-2 text-blue-500 hover:text-blue-700 font-semibold flex items-center gap-2 transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98]"
                  aria-label="Add answer"
                >
                  <Icon icon="mdi:plus" width={20} />
                  Add Answer
                </button>
              )}
          </div>
        )
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {q.options.map((opt, optIdx) => {
              const isOther = opt === "Other";
              const isTextInputOption =
                q.text_input_option?.option === "Any" ||
                q.text_input_option?.option === opt;
              const isSelected = q.is_multi_select
                ? formData.answers[q.id - 1]?.some((ans) =>
                    typeof ans === "object" ? ans.option === opt : ans === opt
                  )
                : formData.answers[q.id - 1]?.[0]?.option === opt ||
                  formData.answers[q.id - 1]?.[0] === opt;

              return (
                <div key={opt} className="space-y-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleOptionToggleWrapper(
                        q.id - 1,
                        opt,
                        isTextInputOption && !isOther
                          ? dynamicAnswers[q.id]?.[0]?.text
                          : undefined
                      );
                    }}
                    className={`w-full p-4 rounded-xl border text-left text-sm font-medium transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] border-blue-400 ${
                      isSelected
                        ? "bg-gradient-to-r from-blue-300 to-sky-500 border-blue-500 text-white shadow-md"
                        : mode === "dark"
                        ? "bg-gradient-to-br from-gray-700/50 to-gray-800/50 text-white hover:from-gray-600 hover:to-gray-700 hover:border-blue-500"
                        : "bg-gradient-to-br from-gray-50 to-gray-100 text-[#231812] hover:from-gray-100 hover:to-gray-200 hover:border-blue-500"
                    }`}
                  >
                    <div className="flex items-center">
                      <Icon
                        icon={
                          isSelected
                            ? q.is_multi_select
                              ? "mdi:checkbox-marked"
                              : "mdi:radiobox-marked"
                            : q.is_multi_select
                            ? "mdi:checkbox-blank-outline"
                            : "mdi:radiobox-blank"
                        }
                        className={`w-5 h-5 mr-2 ${
                          !isSelected && mode === "dark" ? "text-gray-400" : ""
                        }`}
                      />
                      <span>{opt}</span>
                    </div>
                  </button>
                  {isOther && isSelected && (
                    <textarea
                      value={otherInputs[q.id] || ""}
                      onChange={(e) =>
                        handleOtherInputChange(q.id, e.target.value)
                      }
                      className={`${inputStyles} min-h-[120px] resize-y w-full focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300`}
                      placeholder={q.other_option_text || "Please specify"}
                      required
                      aria-label={`Specify ${opt} details`}
                    />
                  )}
                </div>
              );
            })}
          </div>
          {selectedTextInputOption && (
            <div className="mt-6 space-y-4">
              {(dynamicAnswers[q.id] || [{ text: "" }]).map((ans, idx) => (
                <div key={idx} className="flex flex-col gap-3 p-6 rounded-xl border border-gray-200 dark:border-gray-700 bg-gradient-to-br from-gray-50/50 to-gray-100/50 dark:from-gray-800/50 dark:to-gray-900/50 backdrop-blur-sm shadow-sm hover:shadow-md transition-all duration-300">
                  <label
                    id={`q-${q.id}-text-input-${idx}`}
                    className={`text-sm font-medium ${
                      mode === "dark" ? "text-gray-300" : "text-[#231812]"
                    }`}
                  >
                    {q.text_input_option?.option === "Any"
                      ? `${
                          q.text_input_option.placeholder || "Details"
                        } for ${selectedTextInputOption}`
                      : q.text_input_option.placeholder || "Details"}
                  </label>
                  <textarea
                    value={ans.text}
                    onChange={(e) =>
                      handleTextInputChange(q.id, idx, e.target.value)
                    }
                    className={`${inputStyles} min-h-[120px] resize-y w-full focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300`}
                    placeholder={
                      q.text_input_option?.placeholder || "Please specify"
                    }
                    required
                    aria-labelledby={`q-${q.id}-text-input-${idx}`}
                  />
                  {dynamicAnswers[q.id]?.length > 1 && (
                    <button
                      onClick={() => handleRemoveTextInputAnswer(q.id, idx)}
                      className="text-red-500 hover:text-red-700 self-end transition-all duration-300 transform hover:scale-110 active:scale-95"
                      aria-label={`Remove text input ${idx + 1}`}
                    >
                      <Icon icon="mdi:close" width={24} />
                    </button>
                  )}
                </div>
              ))}
              {q.text_input_max_answers > 1 &&
                (dynamicAnswers[q.id]?.length || 0) <
                  q.text_input_max_answers && (
                  <button
                    onClick={() =>
                      handleAddTextInputAnswer(q.id, q.text_input_max_answers)
                    }
                    className="mt-2 text-blue-500 hover:text-blue-700 font-semibold flex items-center gap-2 transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98]"
                    aria-label="Add text input"
                  >
                    <Icon icon="mdi:plus" width={20} />
                    Add Text Input
                  </button>
                )}
            </div>
          )}
        </>
      )}

      {q.skippable && (
        <button
          onClick={() => handleSkip(q.id)}
          className="mt-6 text-blue-500 hover:text-blue-700 font-semibold flex items-center gap-2 transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98]"
          aria-label="Skip question"
        >
          <Icon icon="mdi:skip-next" width={20} />
          Skip
        </button>
      )}
    </div>
  );
}
