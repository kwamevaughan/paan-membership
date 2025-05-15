import { useState, useCallback, useEffect } from "react";
import HRSidebar from "@/layouts/hrSidebar";
import HRHeader from "@/layouts/hrHeader";
import useSidebar from "@/hooks/useSidebar";
import { Icon } from "@iconify/react";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { useQuestions } from "@/hooks/useQuestions";
import QuestionTable from "@/components/QuestionTable";
import QuestionForm from "@/components/QuestionForm";
import SimpleFooter from "@/layouts/simpleFooter";
import { supabase } from "@/lib/supabase";
import CategoryForm from "@/components/CategoryForm";
import CategoryTable from "@/components/CategoryTable";
import toast from "react-hot-toast";

export default function HRInterviewQuestions({
  mode = "light",
  toggleMode,
  initialQuestions,
  initialCategories,
  breadcrumbs,
}) {
  const { isSidebarOpen, toggleSidebar } = useSidebar();
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [selectedJobType, setSelectedJobType] = useState("agencies");

  const [isQuestionModalOpen, setIsQuestionModalOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState(null);
  const [sidebarState, setSidebarState] = useState({
    hidden: false,
    offset: 0,
  });

  const {
    questions,
    categories,
    searchQuery,
    setSearchQuery,
    sortField,
    sortDirection,
    handleSort,
    addQuestion,
    editQuestion,
    deleteQuestion,
    moveQuestion,
  } = useQuestions(selectedJobType);

  const handleMoveQuestion = async (fromIndex, toIndex) => {
    const success = await moveQuestion(fromIndex, toIndex);
    if (!success) {
      toast.error("Failed to reorder questions.");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("hr_session");
  };

  const startEditing = (question) => {
    console.log("startEditing question:", question);
    if (!question.id) {
      console.error("Question missing ID:", question);
      toast.error("Cannot edit question: Missing question ID.");
      return;
    }
    const normalizedQuestion = {
      ...question,
      category:
        typeof question.category === "object" && question.category?.id
          ? question.category.id
          : typeof question.category === "object" && question.category?.name
          ? categories.find((cat) => cat.name === question.category.name)?.id ||
            ""
          : typeof question.category === "string"
          ? question.category
          : "",
      job_type: question.job_type || selectedJobType,
    };
    setEditingQuestion(normalizedQuestion);
    setIsQuestionModalOpen(true);
  };

  const handleAddQuestion = () => {
    console.log(
      "Opening form for new question, selectedJobType:",
      selectedJobType
    );
    setEditingQuestion(null); // Ensure null for add operation
    setIsQuestionModalOpen(true);
  };

  const handleFormCancel = () => {
    console.log("Form cancelled, closing modal");
    setIsQuestionModalOpen(false);
    setEditingQuestion(null);
  };

  const totalQuestions = questions.length;

  const toggleCategoryTable = () => {
    setIsCategoryModalOpen(!isCategoryModalOpen);
  };

  useEffect(() => {
    const handleSidebarChange = (e) => {
      const newHidden = e.detail.hidden;
      setSidebarState((prev) => {
        if (prev.hidden === newHidden) return prev;
        return { ...prev, hidden: newHidden };
      });
    };
    document.addEventListener("sidebarVisibilityChange", handleSidebarChange);
    return () =>
      document.removeEventListener(
        "sidebarVisibilityChange",
        handleSidebarChange
      );
  }, []);

  const updateDragOffset = useCallback((offset) => {
    setSidebarState((prev) => {
      if (prev.offset === offset) return prev;
      return { ...prev, offset };
    });
  }, []);

  return (
    <DndProvider backend={HTML5Backend}>
      <div
        className={`min-h-screen flex flex-col ${
          mode === "dark"
            ? "bg-gradient-to-b from-gray-900 to-gray-800"
            : "bg-gradient-to-b from-gray-50 to-gray-100"
        }`}
      >
        <HRHeader
          toggleSidebar={toggleSidebar}
          isSidebarOpen={isSidebarOpen}
          sidebarState={sidebarState}
          mode={mode}
          toggleMode={toggleMode}
          onLogout={handleLogout}
          pageName=""
          pageDescription="."
          breadcrumbs={breadcrumbs}
        />
        <div className="flex flex-1">
          <HRSidebar
            isOpen={isSidebarOpen}
            isSidebarOpen={isSidebarOpen}
            mode={mode}
            toggleMode={toggleMode}
            onLogout={handleLogout}
            toggleSidebar={toggleSidebar}
            setDragOffset={updateDragOffset}
          />
          <div
            className={`content-container flex-1 p-10 pt-4 transition-all duration-300 overflow-hidden ${
              isSidebarOpen ? "sidebar-open" : ""
            } ${sidebarState.hidden ? "sidebar-hidden" : ""}`}
            style={{
              marginLeft: sidebarState.hidden
                ? "0px"
                : `${84 + (isSidebarOpen ? 120 : 0) + sidebarState.offset}px`,
            }}
          >
            <div className="max-w-7xl mx-auto">
              <div className="flex justify-between items-center mb-6 gap-4 flex-col md:flex-row">
                <div className="flex items-center gap-4 w-full md:w-auto">
                  <div className="flex items-center gap-2">
                    <label className="text-sm font-semibold text-[#231812]">
                      Job Type:
                    </label>
                    <select
                      value={selectedJobType}
                      onChange={(e) => setSelectedJobType(e.target.value)}
                      className={`px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#84c1d9] ${
                        mode === "dark"
                          ? "bg-gray-700 border-gray-600 text-white"
                          : "bg-gray-50 border-gray-300 text-[#231812]"
                      }`}
                    >
                      <option value="all">All</option>
                      <option value="agencies">Agencies</option>
                      <option value="freelancers">Freelancers</option>
                    </select>
                  </div>
                  <div className="flex-1 relative">
                    <Icon
                      icon="mdi:magnify"
                      className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#84c1d9]"
                    />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#84c1d9] transition duration-200 ${
                        mode === "dark"
                          ? "bg-gray-700 border-gray-600 text-white"
                          : "bg-gray-50 border-gray-300 text-[#231812]"
                      }`}
                      placeholder={`Search ${
                        selectedJobType === "all" ? "all" : selectedJobType
                      } questions...`}
                    />
                  </div>
                </div>
                <div className="flex gap-4">
                  <button
                    onClick={handleAddQuestion}
                    className="px-4 py-2 bg-[#84c1d9] text-white rounded-lg hover:bg-[#6da7c7] flex items-center gap-2 transition duration-200 shadow-md"
                  >
                    <Icon icon="mdi:plus" width={20} height={20} />
                    Add Question
                  </button>
                  <button
                    onClick={toggleCategoryTable}
                    className="px-4 py-2 bg-[#84c1d9] text-white rounded-lg hover:bg-[#6da7c7] flex items-center gap-2 transition duration-200 shadow-md"
                  >
                    <Icon icon="mdi:folder-open" width={20} height={20} />
                    Manage Categories
                  </button>
                </div>
              </div>

              <div className="mb-4 text-sm text-[#231812]">
                Showing {totalQuestions} question(s) for{" "}
                {selectedJobType === "all" ? "all job types" : selectedJobType}
              </div>

              <QuestionForm
                mode={mode}
                question={editingQuestion}
                categories={categories}
                questions={questions}
                onSubmit={
                  editingQuestion && editingQuestion.id
                    ? editQuestion
                    : addQuestion
                }
                onCancel={handleFormCancel}
                isOpen={isQuestionModalOpen}
                selectedJobType={selectedJobType}
                isLoading={false}
              />

              {isCategoryModalOpen && (
                <CategoryTable
                  categories={categories}
                  mode={mode}
                  onEdit={setEditingCategory}
                  deleteCategory={(id) => {
                    console.log("Delete category:", id);
                  }}
                />
              )}

              <QuestionTable
                questions={questions}
                categories={categories}
                mode={mode}
                onEdit={startEditing}
                moveQuestion={handleMoveQuestion}
                handleSort={handleSort}
                sortField={sortField}
                sortDirection={sortDirection}
                deleteQuestion={deleteQuestion}
              />
            </div>
          </div>
        </div>
        <SimpleFooter mode={mode} isSidebarOpen={isSidebarOpen} />
      </div>
    </DndProvider>
  );
}

export async function getServerSideProps(context) {
  const { req } = context;

  if (!req.cookies.hr_session) {
    return {
      redirect: {
        destination: "/hr/login",
        permanent: false,
      },
    };
  }

  try {
    console.time("fetchInterviewQuestions");
    const { data: questions, error } = await supabase
      .from("interview_questions")
      .select(
        "id, text, description, options, is_multi_select, other_option_text, is_open_ended, is_country_select, order, category, max_answers, depends_on_question_id, depends_on_answer, max_words, skippable, text_input_option, text_input_max_answers, structured_answers, has_links, job_type, category:question_categories(name)"
      )
      .order("order", { ascending: true });

    if (error) throw error;

    const { data: categories, error: catError } = await supabase
      .from("question_categories")
      .select("id, name, job_type, is_mandatory")
      .order("created_at", { ascending: false });

    if (catError) throw catError;

    return {
      props: {
        initialQuestions: questions || [],
        initialCategories: categories || [],
      },
    };
  } catch (error) {
    console.error("Error fetching interview questions:", error);
    return {
      props: {
        initialQuestions: [],
        initialCategories: [],
      },
    };
  } finally {
    console.timeEnd("fetchInterviewQuestions");
  }
}
