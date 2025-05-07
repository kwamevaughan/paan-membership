import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { toast } from "react-hot-toast";

export const useQuestions = () => {
  const [questions, setQuestions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortField, setSortField] = useState("order");
  const [sortDirection, setSortDirection] = useState("asc");

  useEffect(() => {
    fetchQuestions();
    fetchCategories();
  }, [sortField, sortDirection]);

  const fetchQuestions = async () => {
    const { data, error } = await supabase
      .from("interview_questions")
      .select(
        "*, category:question_categories(name), max_answers, depends_on_question_id, depends_on_answer, max_words, skippable, text_input_option, text_input_max_answers, structured_answers, has_links"
      )
      .order(sortField, { ascending: sortDirection === "asc" });

    if (error) {
      console.error("Error fetching questions:", error);
      toast.error("Failed to load questions: " + error.message);
    } else {
      setQuestions(data);
    }
  };

  const fetchCategories = async () => {
    const { data, error } = await supabase
      .from("question_categories")
      .select("id, name");
    if (error) {
      console.error("Error fetching categories:", error);
      toast.error("Failed to load categories: " + error.message);
    } else {
      setCategories(data);
    }
  };

  const addQuestion = async (questionData) => {
    const {
      text,
      description,
      options,
      isMultiSelect,
      otherOptionText,
      categoryId,
      isOpenEnded,
      maxAnswers,
      dependsOnQuestionId,
      dependsOnAnswer,
      hasLinks,
      textInputOption,
      textInputMaxAnswers,
      maxWords,
      skippable,
      structuredAnswers,
    } = questionData;

    if (!text || (!isOpenEnded && (!options || options.length === 0))) {
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
    const {
      text,
      description,
      options,
      isMultiSelect,
      otherOptionText,
      categoryId,
      isOpenEnded,
      maxAnswers,
      dependsOnQuestionId,
      dependsOnAnswer,
      hasLinks,
      textInputOption,
      textInputMaxAnswers,
      maxWords,
      skippable,
      structuredAnswers,
    } = questionData;

    if (!text || (!isOpenEnded && (!options || options.length === 0))) {
      toast.error("Please provide a question and required fields.");
      return false;
    }

    console.log("Editing question ID:", id, "with data:", questionData);

    const { data, error } = await supabase
      .from("interview_questions")
      .update({
        text,
        description,
        options,
        is_multi_select: isMultiSelect || false,
        other_option_text: otherOptionText || "",
        is_open_ended: isOpenEnded || false,
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
      })
      .eq("id", id)
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
    const updatedQuestions = [...questions];
    const [movedQuestion] = updatedQuestions.splice(fromIndex, 1);
    updatedQuestions.splice(toIndex, 0, movedQuestion);

    const reorderedQuestions = updatedQuestions.map((q, idx) => ({
      ...q,
      order: idx,
    }));

    setQuestions(reorderedQuestions);

    const updates = reorderedQuestions.map((q) => ({
      id: q.id,
      text: q.text,
      description: q.description,
      options: q.options,
      is_multi_select: q.is_multi_select || false,
      other_option_text: q.other_option_text || "",
      is_open_ended: q.is_open_ended || false,
      order: q.order,
      created_at: q.created_at,
      updated_at: q.updated_at,
      category: q.category,
      max_answers: q.max_answers || null,
      depends_on_question_id: q.depends_on_question_id || null,
      depends_on_answer: q.depends_on_answer || null,
      has_links: q.has_links || false,
      text_input_option: q.text_input_option || null,
      text_input_max_answers: q.text_input_max_answers || null,
      max_words: q.max_words || null,
      skippable: q.skippable || false,
      structured_answers: q.stuctured_answers || null,
    }));

    const { error } = await supabase
      .from("interview_questions")
      .upsert(updates);
    if (error) {
      console.error("Error reordering questions:", error);
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
