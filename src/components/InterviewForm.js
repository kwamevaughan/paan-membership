// components/InterviewForm.js
import { useState } from "react";

export default function InterviewForm({ onSubmit }) {
    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [answers, setAnswers] = useState({});

    const questions = [
        {
            text: "Apart from English, which languages do you speak?",
            options: ["French", "German", "Portuguese", "Mandarin", "None"],
        },
        // Add other questions...
    ];

    const handleNext = () => {
        if (currentQuestion < questions.length - 1) {
            setCurrentQuestion(currentQuestion + 1);
        } else {
            onSubmit(answers);
        }
    };

    return (
        <div className="max-w-2xl mx-auto p-6 bg-white shadow-md rounded-lg">
            <h2 className="text-2xl font-bold mb-4">Question {currentQuestion + 1}/19</h2>
            <p className="text-lg mb-4">{questions[currentQuestion].text}</p>
            <div className="space-y-4">
                {questions[currentQuestion].options.map((option) => (
                    <label key={option} className="flex items-center p-2 hover:bg-gray-100 rounded">
                        <input
                            type="radio"
                            name={`q${currentQuestion}`}
                            value={option}
                            onChange={(e) => setAnswers({ ...answers, [currentQuestion]: e.target.value })}
                            className="mr-2"
                        />
                        {option}
                    </label>
                ))}
            </div>
            <div className="mt-6 flex justify-between">
                <button
                    onClick={() => setCurrentQuestion(currentQuestion - 1)}
                    disabled={currentQuestion === 0}
                    className="px-4 py-2 bg-gray-400 text-white rounded disabled:opacity-50"
                >
                    Back
                </button>
                <button
                    onClick={handleNext}
                    className="px-4 py-2 bg-blue-600 text-white rounded"
                >
                    {currentQuestion === questions.length - 1 ? "Submit" : "Next"}
                </button>
            </div>
        </div>
    );
}