import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { toast } from "react-hot-toast";

export const useQuestions = (jobType = "agency") => {
  const [questions, setQuestions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortField, setSortField] = useState("order");
  const [sortDirection, setSortDirection] = useState("asc");

  const normalizeJobType = (jt) => {
    if (!jt) return "agency";
    if (jt === "agencies") return "agency";
    if (jt === "freelancers") return "freelancer";
    if (jt === "all") return "all";
    return jt;
  };

  useEffect(() => {
    fetchQuestions();
    fetchCategories();
  }, [sortField, sortDirection, jobType, fetchQuestions]);

  const fetchQuestions = useCallback(async () => {
    const normalized = normalizeJobType(jobType);
    console.log("[useQuestions] fetchQuestions start", { normalized, sortField, sortDirection });

    let query = supabase
      .from("interview_questions")
      .select(
        "id, text, description, options, is_multi_select, other_option_text, is_open_ended, is_country_select, order, category, max_answers, depends_on_question_id, depends_on_answer, max_words, skippable, text_input_option, text_input_max_answers, structured_answers, has_links, job_type, updated_at, category:question_categories(name)"
      );

    if (normalized !== "all") {
      query = query.eq("job_type", normalized);
    }

    query = query.order(sortField, { ascending: sortDirection === "asc" });

    const { data, error } = await query;

    if (error) {
      console.error("[useQuestions] Error fetching questions:", error);
      toast.error("Failed to load questions: " + error.message);
    } else {
      const validQuestions = data.filter(
        (q) => q.id && q.job_type && Number.isInteger(q.order)
      );
      console.log("[useQuestions] fetched count:", data.length, "valid:", validQuestions.length);
      console.table(
        validQuestions.map((q) => ({
          id: q.id,
          job_type: q.job_type,
          order: q.order,
          updated_at: q.updated_at,
          options_last: Array.isArray(q.options) ? q.options[q.options.length - 1] : null,
        }))
      );
      setQuestions(validQuestions);
    }
  }, [jobType, sortField, sortDirection]);

  const fetchCategories = async () => {
    const { data, error } = await supabase
      .from("question_categories")
      .select("id, name, job_type, is_mandatory")
      .order("name", { ascending: true });

    if (error) {
      console.error("[useQuestions] Error fetching categories:", error);
      toast.error("Failed to load categories: " + error.message);
    } else {
      setCategories(data || []);
    }
  };

  const addQuestion = async (questionData) => {
    console.log("[useQuestions] addQuestion", questionData);
    if (!questionData || typeof questionData !== "object") {
      console.error("Invalid questionData:", questionData);
      toast.error("Cannot add question: Invalid question data.");
      return false;
    }

    const {
      text,
      description,
      options,
      isMultiSelect,
      otherOptionText,
      categoryId,
      isOpenEnded,
      isCountrySelect,
      maxAnswers,
      dependsOnQuestionId,
      dependsOnAnswer,
      hasLinks,
      textInputOption,
      textInputMaxAnswers,
      maxWords,
      skippable,
      structuredAnswers,
      job_type,
    } = questionData;

    if (
      !text ||
      (!isOpenEnded && !isCountrySelect && (!options || options.length === 0))
    ) {
      toast.error("Please provide a question and required fields.");
      return false;
    }

    const { data, error } = await supabase
      .from("interview_questions")
      .insert([
        {
          text,
          description,
          options,
          is_multi_select: isMultiSelect || false,
          other_option_text: otherOptionText || "",
          is_open_ended: isOpenEnded || false,
          is_country_select: isCountrySelect || false,
          order: questions.length,
          category: categoryId,
          max_answers: maxAnswers || null,
          depends_on_question_id: dependsOnQuestionId || null,
          depends_on_answer: dependsOnAnswer || null,
          has_links: hasLinks || false,
          text_input_option: textInputOption || null,
          text_input_max_answers: textInputMaxAnswers || null,
          max_words: maxWords || null,
          skippable: skippable || false,
          structured_answers: structuredAnswers || null,
          job_type: normalizeJobType(job_type) || normalizeJobType(jobType),
        },
      ])
      .select();

    if (error) {
      console.error("[useQuestions] Error adding question:", error);
      toast.error("Failed to add question: " + error.message);
      return false;
    } else {
      toast.success(`Question "${data[0].text}" added successfully!`, {
        icon: "✅",
      });
      fetchQuestions();
      return true;
    }
  };

  const editQuestion = async (id, questionData) => {
    console.log("[useQuestions] editQuestion", { id, questionData });
    if (!id || isNaN(parseInt(id))) {
      console.error("Invalid question ID:", id);
      toast.error("Cannot edit question: Invalid question ID.");
      return false;
    }

    const {
      text,
      description,
      options,
      isMultiSelect,
      otherOptionText,
      categoryId,
      isOpenEnded,
      isCountrySelect,
      maxAnswers,
      dependsOnQuestionId,
      dependsOnAnswer,
      hasLinks,
      textInputOption,
      textInputMaxAnswers,
      maxWords,
      skippable,
      structuredAnswers,
      job_type,
    } = questionData;

    if (
      !text ||
      (!isOpenEnded && !isCountrySelect && (!options || options.length === 0))
    ) {
      toast.error("Please provide a question and required fields.");
      return false;
    }

    const updatePayload = {
      text,
      description,
      options,
      is_multi_select: isMultiSelect || false,
      other_option_text: otherOptionText || "",
      is_open_ended: isOpenEnded || false,
      is_country_select: isCountrySelect || false,
      updated_at: new Date().toISOString(),
      category: categoryId,
      max_answers: maxAnswers || null,
      depends_on_question_id: dependsOnQuestionId || null,
      depends_on_answer: dependsOnAnswer || null,
      has_links: hasLinks || false,
      text_input_option: textInputOption || null,
      text_input_max_answers: textInputMaxAnswers || null,
      max_words: maxWords || null,
      skippable: skippable || false,
      structured_answers: structuredAnswers || null,
      job_type: normalizeJobType(job_type) || normalizeJobType(jobType),
    };

    console.log("[useQuestions] Submitting update payload:", updatePayload);

    const { data, error, status } = await supabase
      .from("interview_questions")
      .update(updatePayload)
      .eq("id", parseInt(id))
      .select();

    console.log("[useQuestions] Update response:", { status, error, data });

    if (error) {
      console.error("[useQuestions] Error editing question:", error);
      toast.error("Failed to update question: " + error.message);
      return false;
    }

    if (!data || data.length === 0) {
      console.error("[useQuestions] No rows were updated for question ID:", id);
      toast.error("Failed to update question: No rows were affected.");
      return false;
    }

    setQuestions((prev) => {
      const next = prev.map((q) => (q.id === parseInt(id) ? { ...q, ...data[0] } : q));
      console.log("[useQuestions] Optimistic state updated for id", id, {
        new_last_option: Array.isArray(data[0]?.options) ? data[0].options[data[0].options.length - 1] : null,
      });
      return next;
    });

    toast.success(`Question "${data[0].text}" updated successfully!`, {
      icon: "✅",
    });
    fetchQuestions();
    return true;
  };

  const deleteQuestion = async (id, text) => {
    const { error } = await supabase
      .from("interview_questions")
      .delete()
      .eq("id", id);
    if (error) {
      console.error("[useQuestions] Error deleting question:", error);
      toast.error("Failed to delete question: " + error.message);
      return false;
    } else {
      toast.success(`Question "${text}" deleted successfully!`, { icon: "🗑️" });
      fetchQuestions();
      return true;
    }
  };

  const moveQuestion = async (fromIndex, toIndex) => {
    console.log("[useQuestions] moveQuestion", { fromIndex, toIndex });
    const updatedQuestions = [...questions];
    const [movedQuestion] = updatedQuestions.splice(fromIndex, 1);
    updatedQuestions.splice(toIndex, 0, movedQuestion);

    const reorderedQuestions = updatedQuestions.map((q, idx) => ({
      ...q,
      order: idx,
    }));

    const invalidQuestions = reorderedQuestions.filter((q) => !q.job_type);
    if (invalidQuestions.length > 0) {
      console.error("[useQuestions] Missing job_type in", invalidQuestions);
      toast.error("Cannot reorder: Some questions have missing job_type.");
      return false;
    }

    setQuestions(reorderedQuestions);

    const updates = reorderedQuestions.map((q) => ({
      id: q.id,
      order: q.order,
      job_type: normalizeJobType(q.job_type),
    }));

    const { error } = await supabase
      .from("interview_questions")
      .upsert(updates, {
        onConflict: "id",
      });

    if (error) {
      console.error("[useQuestions] Error reordering questions:", error);
      toast.error("Failed to reorder questions: " + error.message);
      fetchQuestions();
      return false;
    }

    return true;
  };

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const filteredQuestions = questions.filter((q) =>
    q.text.toLowerCase().includes(searchQuery.toLowerCase())
  );

  useEffect(() => {
    console.log("[useQuestions] filteredQuestions updated", {
      count: filteredQuestions.length,
      ids: filteredQuestions.map((q) => q.id),
    });
  }, [filteredQuestions]);

  return {
    questions: filteredQuestions,
    categories,
    searchQuery,
    setSearchQuery,
    sortField,
    sortDirection,
    handleSort,
    fetchQuestions,
    addQuestion,
    editQuestion,
    deleteQuestion,
    moveQuestion,
  };
};
