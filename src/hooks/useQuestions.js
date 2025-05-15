import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { toast } from "react-hot-toast";

export const useQuestions = (jobType = "agencies") => {
  const [questions, setQuestions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortField, setSortField] = useState("order");
  const [sortDirection, setSortDirection] = useState("asc");

  useEffect(() => {
    fetchQuestions();
    fetchCategories();
  }, [sortField, sortDirection, jobType]);

  const fetchQuestions = async () => {
    let query = supabase
      .from("interview_questions")
      .select(
        "id, text, description, options, is_multi_select, other_option_text, is_open_ended, is_country_select, order, category, max_answers, depends_on_question_id, depends_on_answer, max_words, skippable, text_input_option, text_input_max_answers, structured_answers, has_links, job_type, category:question_categories(name)"
      );

    if (jobType !== "all") {
      query = query.eq("job_type", jobType);
    }

    query = query.order(sortField, { ascending: sortDirection === "asc" });

    const { data, error } = await query;

    if (error) {
      console.error("Error fetching questions:", error);
      toast.error("Failed to load questions: " + error.message);
    } else {
      const validQuestions = data.filter(
        (q) => q.id && q.job_type && Number.isInteger(q.order)
      );
      console.log(
        "Fetched questions:",
        validQuestions.map((q) => ({
          id: q.id,
          text: q.text,
          job_type: q.job_type,
          order: q.order,
        }))
      );
      if (data.length !== validQuestions.length) {
        console.warn(
          "Filtered out invalid questions:",
          data.filter((q) => !q.id || !q.job_type || !Number.isInteger(q.order))
        );
      }
      setQuestions(validQuestions);
    }
  };

  const fetchCategories = async () => {
    const { data, error } = await supabase
      .from("question_categories")
      .select("id, name, job_type, is_mandatory")
      .order("name", { ascending: true });

    if (error) {
      console.error("Error fetching categories:", error);
      toast.error("Failed to load categories: " + error.message);
    } else {
      console.log(
        "Fetched categories:",
        data.map((c) => ({ id: c.id, name: c.name, job_type: c.job_type }))
      );
      setCategories(data || []);
    }
  };

  const addQuestion = async (questionData) => {
    console.log("addQuestion called with:", questionData);
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
          job_type: job_type || (jobType === "all" ? "agencies" : jobType),
        },
      ])
      .select();

    if (error) {
      console.error("Error adding question:", error);
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
    console.log("editQuestion called with ID:", id, "data:", questionData);
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

    const { data, error } = await supabase
      .from("interview_questions")
      .update({
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
        job_type: job_type || (jobType === "all" ? "agencies" : jobType),
      })
      .eq("id", parseInt(id))
      .select();

    if (error) {
      console.error("Error editing question:", error);
      toast.error("Failed to update question: " + error.message);
      return false;
    } else {
      toast.success(`Question "${data[0].text}" updated successfully!`, {
        icon: "✅",
      });
      fetchQuestions();
      return true;
    }
  };

  const deleteQuestion = async (id, text) => {
    const { error } = await supabase
      .from("interview_questions")
      .delete()
      .eq("id", id);
    if (error) {
      console.error("Error deleting question:", error);
      toast.error("Failed to delete question: " + error.message);
      return false;
    } else {
      toast.success(`Question "${text}" deleted successfully!`, { icon: "🗑️" });
      fetchQuestions();
      return true;
    }
  };

  const moveQuestion = async (fromIndex, toIndex) => {
    console.log("moveQuestion called:", {
      fromIndex,
      toIndex,
      questions: questions.map((q) => ({
        id: q.id,
        order: q.order,
        job_type: q.job_type,
      })),
    });
    const updatedQuestions = [...questions];
    const [movedQuestion] = updatedQuestions.splice(fromIndex, 1);
    updatedQuestions.splice(toIndex, 0, movedQuestion);

    const reorderedQuestions = updatedQuestions.map((q, idx) => ({
      ...q,
      order: idx,
    }));

    // Validate job_type
    const invalidQuestions = reorderedQuestions.filter((q) => !q.job_type);
    if (invalidQuestions.length > 0) {
      console.error(
        "Questions with missing job_type:",
        invalidQuestions.map((q) => ({ id: q.id, text: q.text }))
      );
      toast.error("Cannot reorder: Some questions have missing job_type.");
      return false;
    }

    setQuestions(reorderedQuestions);

    const updates = reorderedQuestions.map((q) => ({
      id: q.id,
      order: q.order,
      job_type: q.job_type, // Explicitly include job_type
    }));

    console.log("Updating question order:", updates);

    const { error } = await supabase
      .from("interview_questions")
      .upsert(updates, {
        onConflict: "id",
      });

    if (error) {
      console.error("Error reordering questions:", error);
      toast.error("Failed to reorder questions: " + error.message);
      fetchQuestions();
      return false;
    }

    console.log(
      "Questions reordered successfully, new order:",
      reorderedQuestions.map((q) => ({ id: q.id, order: q.order }))
    );
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
