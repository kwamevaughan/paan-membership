import { useMemo } from 'react';
import { Icon } from '@iconify/react';
import { motion } from 'framer-motion';

export default function QuestionsProgress({
  currentCategoryIndex,
  currentQuestionIndex,
  categories,
  questions,
  mode,
  formData,
}) {
  // Calculate total questions and answered questions
  const progress = useMemo(() => {
    const relevantQuestions = questions.filter(
      (q) => q && q.id && q.job_type === formData.job_type
    );
    const totalQuestions = relevantQuestions.length;
    
    // Count answered questions and calculate time estimates
    let answeredQuestions = 0;
    let totalEstimatedMinutes = 0;
    let remainingEstimatedMinutes = 0;

    relevantQuestions.forEach((q) => {
      const answers = formData.answers[q.id - 1] || [];
      const isAnswered = answers.length > 0;
      
      // Calculate base time estimate based on question type and job type
      let questionTimeEstimate = 1; // Default 1 minute
      
      // Adjust base time based on job type and question complexity
      if (formData.job_type === 'freelancer') {
        if (q.is_open_ended) {
          questionTimeEstimate = q.structured_answers ? 2 : 1.5;
        } else if (q.text_input_option) {
          questionTimeEstimate = 1;
        } else if (q.is_multi_select) {
          questionTimeEstimate = 0.8;
        }
      } else {
        if (q.is_open_ended) {
          questionTimeEstimate = q.structured_answers ? 3 : 2;
        } else if (q.text_input_option) {
          questionTimeEstimate = 1.5;
        } else if (q.is_multi_select) {
          questionTimeEstimate = 1;
        }
      }

      // Add category-specific time adjustments
      const category = categories.find(cat => cat.id === q.category);
      if (category) {
        const isFreelancer = formData.job_type === 'freelancer';
        switch (category.name.toLowerCase()) {
          case 'experience':
          case 'portfolio':
            questionTimeEstimate += isFreelancer ? 1 : 2; // Add fixed time instead of multiplying
            break;
          case 'preferences':
          case 'availability':
            questionTimeEstimate += isFreelancer ? 0.5 : 1; // Add fixed time instead of multiplying
            break;
          default:
            questionTimeEstimate += isFreelancer ? 0.5 : 1; // Add fixed time instead of multiplying
        }
      }

      if (isAnswered) {
        answeredQuestions++;
        // For answered questions, use a more conservative estimate
        totalEstimatedMinutes += Math.min(questionTimeEstimate, 5); // Cap at 5 minutes per question
      } else {
        remainingEstimatedMinutes += questionTimeEstimate;
      }
    });

    // Calculate progress percentage
    const progressPercentage = (answeredQuestions / totalQuestions) * 100;

    return {
      totalQuestions,
      answeredQuestions,
      progressPercentage,
      estimatedMinutes: Math.ceil(remainingEstimatedMinutes),
      totalEstimatedMinutes: Math.ceil(totalEstimatedMinutes),
      remainingQuestions: totalQuestions - answeredQuestions,
    };
  }, [questions, formData, currentCategoryIndex, currentQuestionIndex, categories]);

  // Get current category and next categories
  const categoryProgress = useMemo(() => {
    const validCategories = categories.filter(
      (cat) =>
        cat &&
        cat.id &&
        cat.job_type === formData.job_type &&
        questions.some((q) => q && q.category === cat.id)
    ).sort((a, b) => {
      const aMinOrder = Math.min(
        ...questions.filter((q) => q && q.category === a.id).map((q) => q.order)
      );
      const bMinOrder = Math.min(
        ...questions.filter((q) => q && q.category === b.id).map((q) => q.order)
      );
      return aMinOrder - bMinOrder;
    });

    const currentCategory = validCategories[currentCategoryIndex];
    const remainingCategories = validCategories.slice(currentCategoryIndex + 1);
    const completedCategories = validCategories.slice(0, currentCategoryIndex);

    // Calculate category completion status
    const getCategoryCompletionStatus = (category) => {
      const categoryQuestions = questions.filter(
        (q) => q && q.category === category.id && q.job_type === formData.job_type
      );
      const answeredQuestions = categoryQuestions.filter((q) => {
        const answers = formData.answers[q.id - 1] || [];
        return answers.length > 0;
      });
      return (answeredQuestions.length / categoryQuestions.length) * 100;
    };

    return {
      currentCategory,
      remainingCategories,
      completedCategories,
      getCategoryCompletionStatus,
    };
  }, [categories, questions, currentCategoryIndex, formData.job_type, formData.answers]);

  return (
    <div
      className={`h-full p-6 rounded-2xl ${
        mode === 'dark'
          ? 'bg-gray-800/50 backdrop-blur-sm border border-gray-700'
          : 'bg-white/80 backdrop-blur-sm border border-gray-200'
      }`}
    >
      <div className="space-y-6">
        {/* Progress Overview */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3
              className={`text-lg font-semibold ${
                mode === 'dark' ? 'text-gray-100' : 'text-gray-900'
              }`}
            >
              Progress Overview
            </h3>
            <span
              className={`text-sm ${
                mode === 'dark' ? 'text-gray-400' : 'text-gray-600'
              }`}
            >
              {progress.answeredQuestions} of {progress.totalQuestions} questions
            </span>
          </div>

          {/* Progress Bar */}
          <div className="relative h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <motion.div
              className="absolute top-0 left-0 h-full bg-gradient-to-r from-blue-500 to-sky-600"
              initial={{ width: 0 }}
              animate={{ width: `${progress.progressPercentage}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
        </div>

        {/* Time Estimate */}
        <div
          className={`p-4 rounded-xl ${
            mode === 'dark'
              ? 'bg-blue-500/10 border border-blue-400/20'
              : 'bg-blue-50 border border-blue-100'
          }`}
        >
          <div className="flex items-center gap-3">
            <Icon
              icon="solar:clock-circle-bold-duotone"
              className={`w-5 h-5 ${
                mode === 'dark' ? 'text-blue-400' : 'text-blue-600'
              }`}
            />
            <div>
              <p
                className={`text-sm font-medium ${
                  mode === 'dark' ? 'text-blue-300' : 'text-blue-700'
                }`}
              >
                Estimated time to complete remaining questions
              </p>
              <p
                className={`text-lg font-semibold ${
                  mode === 'dark' ? 'text-blue-200' : 'text-blue-800'
                }`}
              >
                {progress.estimatedMinutes} minutes
              </p>
            </div>
          </div>
        </div>

        {/* Category Progress */}
        <div className="space-y-4">
          <h4
            className={`text-sm font-medium ${
              mode === 'dark' ? 'text-gray-400' : 'text-gray-600'
            }`}
          >
            Categories
          </h4>
          <div className="space-y-3">
            {/* Completed Categories */}
            {categoryProgress.completedCategories.map((category) => (
              <div
                key={category.id}
                className={`p-3 rounded-lg ${
                  mode === 'dark'
                    ? 'bg-green-500/20 border border-green-400/30'
                    : 'bg-green-50 border border-green-200'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Icon
                    icon="mdi:check-circle"
                    className={`w-4 h-4 ${
                      mode === 'dark' ? 'text-green-400' : 'text-green-600'
                    }`}
                  />
                  <span
                    className={`text-sm font-medium ${
                      mode === 'dark' ? 'text-green-300' : 'text-green-700'
                    }`}
                  >
                    {category.name}
                  </span>
                </div>
              </div>
            ))}

            {/* Current Category */}
            {categoryProgress.currentCategory && (
              <div
                className={`p-3 rounded-lg ${
                  mode === 'dark'
                    ? 'bg-blue-500/20 border border-blue-400/30'
                    : 'bg-blue-50 border border-blue-200'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Icon
                    icon="solar:play-circle-bold-duotone"
                    className={`w-4 h-4 ${
                      mode === 'dark' ? 'text-blue-400' : 'text-blue-600'
                    }`}
                  />
                  <div className="flex-1">
                    <span
                      className={`text-sm font-medium ${
                        mode === 'dark' ? 'text-blue-300' : 'text-blue-700'
                      }`}
                    >
                      {categoryProgress.currentCategory.name}
                    </span>
                    <div className="mt-1 h-1 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                      <motion.div
                        className="h-full bg-blue-500"
                        initial={{ width: 0 }}
                        animate={{
                          width: `${categoryProgress.getCategoryCompletionStatus(
                            categoryProgress.currentCategory
                          )}%`,
                        }}
                        transition={{ duration: 0.5 }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Remaining Categories */}
            {categoryProgress.remainingCategories.map((category) => (
              <div
                key={category.id}
                className={`p-3 rounded-lg ${
                  mode === 'dark'
                    ? 'bg-gray-700/50 border border-gray-600'
                    : 'bg-gray-50 border border-gray-200'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Icon
                    icon="solar:clock-circle-linear"
                    className={`w-4 h-4 ${
                      mode === 'dark' ? 'text-gray-400' : 'text-gray-500'
                    }`}
                  />
                  <span
                    className={`text-sm ${
                      mode === 'dark' ? 'text-gray-300' : 'text-gray-600'
                    }`}
                  >
                    {category.name}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
} 