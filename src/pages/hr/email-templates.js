import { useState } from "react";
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
import { useCategories } from "@/hooks/useCategories";

export default function HRInterviewQuestions({
  mode = "light",
  toggleMode,
  initialQuestions,
  initialCategories,
}) {
  const { isSidebarOpen, toggleSidebar } = useSidebar();
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const { categories, addCategory, editCategory, deleteCategory } =
    useCategories(initialCategories);
  const [isQuestionModalOpen, setIsQuestionModalOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState(null);
  const {
    questions,
    searchQuery,
    setSearchQuery,
    sortField,
    sortDirection,
    handleSort,
    addQuestion,
    editQuestion,
    deleteQuestion,
    moveQuestion,
  } = useQuestions(initialQuestions);

  const handleMoveQuestion = async (fromIndex, toIndex) => {
    await moveQuestion(fromIndex, toIndex);
  };

  const handleLogout = () => {
    localStorage.removeItem("hr_session");
  };

  const startEditing = (question) => {
    const normalizedQuestion = {
      ...question,
      category: typeof question.category === "string" ? question.category : "",
      options: Array.isArray(question.options) ? question.options : [],
    };
    setEditingQuestion(normalizedQuestion);
    setIsQuestionModalOpen(true);
  };

  const handleAddQuestion = () => {
    setEditingQuestion(null);
    setIsQuestionModalOpen(true);
  };

  const handleFormCancel = () => {
    setIsQuestionModalOpen(false);
    setEditingQuestion(null);
  };

  const totalQuestions = questions.length;

  // Log incomplete questions
  questions.forEach((q) => {
    if (!q.text?.trim()) {
      console.warn(`Question ID ${q.id} is incomplete: missing text`);
    }
    if (!q.is_open_ended && (!Array.isArray(q.options) || !q.options.length)) {
      console.warn(
        `Question ID ${q.id} is incomplete: missing options for non-open-ended question`
      );
    }
  });

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
          mode={mode}
          toggleMode={toggleMode}
          onLogout={handleLogout}
          pageName="Interview Questions"
          pageDescription={`Manage interview questions (Total: ${totalQuestions})`}
        />
        <div className="flex flex-1">
          <HRSidebar
            isOpen={isSidebarOpen}
            mode={mode}
            onLogout={handleLogout}
            toggleSidebar={toggleSidebar}
          />
          <div
            className={`content-container flex-1 p-6 transition-all duration-300 ${
              isSidebarOpen ? "md:ml-[300px]" : "md:ml-[80px]"
            }`}
          >
            <div className="max-w-7xl mx-auto">
              <div className="flex justify-end items-center mb-6 gap-4">
                <button
                  onClick={handleAddQuestion}
                  className="px-4 py-2 bg-[#84c1d9] text-white rounded-lg hover:bg-[#6da7c7] flex items-center gap-2 transition duration-200 shadow-md"
                >
                  <Icon icon="mdi:plus" width={20} height={20} />
                  Add Question
                </button>
                <button
                  onClick={() => setIsCategoryModalOpen(!isCategoryModalOpen)}
                  className="px-4 py-2 bg-[#84c1d9] text-white rounded-lg hover:bg-[#6da7c7] flex items-center gap-2 transition duration-200 shadow-md"
                >
                  <Icon icon="mdi:folder-open" width={20} height={20} />
                  Manage Categories
                </button>
              </div>

              <QuestionForm
                mode={mode}
                question={editingQuestion}
                categories={categories}
                onSubmit={editingQuestion ? editQuestion : addQuestion}
                onCancel={handleFormCancel}
                isOpen={isQuestionModalOpen}
              />

              <div className="mb-6 flex flex-col md:flex-row gap-4">
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
                    placeholder="Search questions..."
                  />
                </div>
              </div>

              {isCategoryModalOpen && (
                <CategoryTable
                  categories={categories}
                  mode={mode}
                  onEdit={setEditingCategory}
                  deleteCategory={deleteCategory}
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
    const { data: questions, error } = await supabase
      .from("interview_questions")
      .select(
        "*, max_answers, depends_on_question_id, depends_on_answer, has_links"
      )
      .order("id", { ascending: true });

    if (error) throw error;

    const { data: categories, error: catError } = await supabase
      .from("question_categories")
      .select("*")
      .order("created_at", { ascending: false });

    if (catError) throw catError;

    const normalizedQuestions = questions.map((question) => ({
      ...question,
      category: question.category?.id || question.category_id || "",
      options: Array.isArray(question.options) ? question.options : [],
    }));

    return {
      props: {
        initialQuestions: normalizedQuestions,
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
  }
}
