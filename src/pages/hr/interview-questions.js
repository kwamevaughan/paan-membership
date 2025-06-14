import { useState, useCallback, useEffect } from "react";
import HRSidebar from "@/layouts/hrSidebar";
import HRHeader from "@/layouts/hrHeader";
import useSidebar from "@/hooks/useSidebar";
import { Icon } from "@iconify/react";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { useQuestions } from "@/hooks/useQuestions";
import { useCategories } from "@/hooks/useCategories";
import QuestionTable from "@/components/QuestionTable";
import QuestionForm from "@/components/QuestionForm";
import SimpleFooter from "@/layouts/simpleFooter";
import CategoryTable from "@/components/CategoryTable";
import CategoryForm from "@/components/CategoryForm";
import ItemActionModal from "@/components/ItemActionModal";
import toast, { Toaster } from "react-hot-toast";
import useAuthSession from "@/hooks/useAuthSession";
import useLogout from "@/hooks/useLogout";
import { getInterviewQuestionsProps } from "utils/getPropsUtils";

export default function HRInterviewQuestions({
  mode = "light",
  toggleMode,
  initialQuestions,
  initialCategories,
  breadcrumbs,
}) {
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [isCategoryFormOpen, setIsCategoryFormOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [selectedJobType, setSelectedJobType] = useState("agency");

  const [isQuestionModalOpen, setIsQuestionModalOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState(null);

  useAuthSession();

  const {
    isSidebarOpen,
    toggleSidebar,
    sidebarState,
    updateDragOffset,
    isMobile,
    isHovering,
    handleMouseEnter,
    handleMouseLeave,
    handleOutsideClick,
  } = useSidebar();

  const handleLogout = useLogout();

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
  } = useQuestions(selectedJobType, initialQuestions, initialCategories);

  const {
    categories,
    isLoading: isCategoriesLoading,
    addCategory,
    editCategory,
    deleteCategory,
  } = useCategories(initialCategories);

  const handleMoveQuestion = async (fromIndex, toIndex) => {
    const success = await moveQuestion(fromIndex, toIndex);
    if (!success) {
      toast.error("Failed to reorder questions.");
    }
  };

  const startEditing = (question) => {
    if (!question.id) {
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
    setEditingQuestion(null);
    setIsQuestionModalOpen(true);
  };

  const handleFormCancel = () => {
    setIsQuestionModalOpen(false);
    setEditingQuestion(null);
  };

  const handleCategoryFormCancel = () => {
    setIsCategoryFormOpen(false);
    setEditingCategory(null);
  };

  const handleAddCategory = () => {
    setEditingCategory(null);
    setIsCategoryFormOpen(true);
  };

  const handleEditCategory = (category) => {
    setEditingCategory(category);
    setIsCategoryFormOpen(true);
  };

  const handleAddCategorySubmit = async (categoryData) => {
    try {
      await addCategory(categoryData);
      return true;
    } catch (error) {
      toast.error("Failed to add category.");
      return false;
    }
  };

  const handleEditCategorySubmit = async (id, categoryData) => {
    try {
      await editCategory({ id, ...categoryData });
      return true;
    } catch (error) {
      toast.error("Failed to update category.");
      return false;
    }
  };

  const totalQuestions = questions.length;

  const toggleCategoryModal = () => {
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
            isSidebarOpen={isSidebarOpen}
            mode={mode}
            toggleMode={toggleMode}
            toggleSidebar={toggleSidebar}
            onLogout={handleLogout}
            setDragOffset={updateDragOffset}
            user={{ name: "PAAN Admin" }}
            isMobile={isMobile}
            isHovering={isHovering}
            handleMouseEnter={handleMouseEnter}
            handleMouseLeave={handleMouseLeave}
            handleOutsideClick={handleOutsideClick}
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
                    className="px-4 py-2 bg-sky-900 text-white rounded-lg hover:bg-sky-800 flex items-center gap-2 transition duration-200 shadow-md"
                  >
                    <Icon icon="mdi:plus" width={20} height={20} />
                    Add Question
                  </button>
                  <button
                    onClick={toggleCategoryModal}
                    className="px-4 py-2 bg-sky-900 text-white rounded-lg hover:bg-sky-800 flex items-center gap-2 transition duration-200 shadow-md"
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
                isLoading={isCategoriesLoading}
              />

              <ItemActionModal
                isOpen={isCategoryModalOpen}
                onClose={toggleCategoryModal}
                title="Manage Categories"
                mode={mode}
              >
                <CategoryTable
                  categories={categories}
                  mode={mode}
                  onEdit={handleEditCategory}
                  onAdd={handleAddCategory}
                  onDelete={deleteCategory}
                />
              </ItemActionModal>

              <CategoryForm
                mode={mode}
                category={editingCategory}
                onSubmit={
                  editingCategory && editingCategory.id
                    ? handleEditCategorySubmit
                    : handleAddCategorySubmit
                }
                onCancel={handleCategoryFormCancel}
                isOpen={isCategoryFormOpen}
              />

              <QuestionTable
                categories={categories}
                questions={questions}
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

export { getInterviewQuestionsProps as getServerSideProps };
