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
import CategoryForm from "@/components/CategoryForm";
import CategoryTable from "@/components/CategoryTable";
import toast, { Toaster } from "react-hot-toast";
import useAuthSession from "@/hooks/useAuthSession";
import useLogout from "@/hooks/useLogout";
import { createSupabaseServerClient } from "@/lib/supabaseServer";


export default function HRInterviewQuestions({
  mode = "light",
  toggleMode,
  initialQuestions,
  initialCategories,
  breadcrumbs,
}) {
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [selectedJobType, setSelectedJobType] = useState("agency");

  const [isQuestionModalOpen, setIsQuestionModalOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState(null);

  useAuthSession();

  const { isSidebarOpen, toggleSidebar, sidebarState, updateDragOffset } =
    useSidebar();
  const handleLogout = useLogout();

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
  } = useQuestions(selectedJobType, initialQuestions, initialCategories);

  const handleMoveQuestion = async (fromIndex, toIndex) => {
    const success = await moveQuestion(fromIndex, toIndex);
    if (!success) {
      toast.error("Failed to reorder questions.");
    }
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
    setEditingQuestion(null);
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

  return (
    <DndProvider backend={HTML5Backend}>
      <div
        className={`min-h-screen flex flex-col ${
          mode === "dark" ? "bg-gray-900" : "bg-gray-50"
        }`}
      >
        <Toaster />
        <HRHeader
          toggleSidebar={toggleSidebar}
          isSidebarOpen={isSidebarOpen}
          sidebarState={sidebarState}
          mode={mode}
          toggleMode={toggleMode}
          onLogout={handleLogout}
          pageName="Interview Questions"
          pageDescription="Manage questions for candidate interviews."
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
            className={`content-container flex-1 p-6 transition-all duration-300 overflow-hidden ${
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
                      <option value="agency">Agency</option>
                      <option value="freelancer">Freelancer</option>
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

export async function getServerSideProps({ req, res }) {
  console.log(
    "[HRInterviewQuestions] Starting session check at",
    new Date().toISOString()
  );
  try {
    const supabaseServer = createSupabaseServerClient(req, res);

    const {
      data: { session },
      error: sessionError,
    } = await supabaseServer.auth.getSession();

    console.log("[HRInterviewQuestions] Session Response:", {
      session: session ? "present" : null,
      sessionError: sessionError ? sessionError.message : null,
    });

    if (sessionError || !session) {
      console.log(
        "[HRInterviewQuestions] No valid Supabase session, redirecting to login"
      );
      return {
        redirect: {
          destination: "/hr/login",
          permanent: false,
        },
      };
    }

    // Verify user is in hr_users
    const { data: hrUser, error: hrUserError } = await supabaseServer
      .from("hr_users")
      .select("id")
      .eq("id", session.user.id)
      .single();
    console.log("[HRInterviewQuestions] HR User Check:", {
      hrUser,
      hrUserError: hrUserError ? hrUserError.message : null,
    });

    if (hrUserError || !hrUser) {
      console.error(
        "[HRInterviewQuestions] HR User Error:",
        hrUserError?.message || "User not in hr_users"
      );
      await supabaseServer.auth.signOut();
      return {
        redirect: {
          destination: "/hr/login",
          permanent: false,
        },
      };
    }

    console.time("fetchInterviewQuestions");
    const { data: questions, error: questionsError } = await supabaseServer
      .from("interview_questions")
      .select(
        "id, text, description, options, is_multi_select, other_option_text, is_open_ended, is_country_select, order, category, max_answers, depends_on_question_id, depends_on_answer, max_words, skippable, text_input_option, text_input_max_answers, structured_answers, has_links, job_type, category:question_categories(name)"
      )
      .order("order", { ascending: true });

    if (questionsError) throw questionsError;

    const { data: categories, error: catError } = await supabaseServer
      .from("question_categories")
      .select("id, name, job_type, is_mandatory")
      .order("created_at", { ascending: false });

    if (catError) throw catError;

    console.log("[HRInterviewQuestions] Fetched Data:", {
      questions: questions?.length || 0,
      categories: categories?.length || 0,
      sampleQuestions: questions?.slice(0, 2) || [],
      sampleCategories: categories?.slice(0, 2) || [],
    });

    return {
      props: {
        initialQuestions: questions || [],
        initialCategories: categories || [],
        breadcrumbs: [
          { label: "Dashboard", href: "/admin" },
          { label: "Interview Questions" },
        ],
      },
    };
  } catch (error) {
    console.error("[HRInterviewQuestions] Error:", error.message);
    return {
      redirect: {
        destination: "/hr/login",
        permanent: false,
      },
    };
  } finally {
    console.timeEnd("fetchInterviewQuestions");
  }
}
