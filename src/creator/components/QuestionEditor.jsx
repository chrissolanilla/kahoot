import Question from "./Question";
import { createQuestion } from "../lib/quizModel";

export default function QuestionEditor({ quiz, setQuiz }) {
    function addQuestion() {
        setQuiz({ ...quiz, questions: [...quiz.questions, createQuestion()] });
    }

    function updateQuestion(id, patch) {
        setQuiz({
            ...quiz,
            questions: quiz.questions.map((q) => (q.id === id ? { ...q, ...patch } : q)),
        });
    }

    function deleteQuestion(id) {
        if (quiz.questions.length <= 1) return;
        setQuiz({
            ...quiz,
            questions: quiz.questions.filter((q) => q.id !== id),
        });
    }

    return (
        <div className="editor">
            <div className="editor__top-bar">
                <div className="editor__title-field">
                    <label className="input-label" htmlFor="quizTitle">
                        Quiz Title
                    </label>
                    <input
                        id="quizTitle"
                        className="input"
                        value={quiz.title}
                        onChange={(e) => setQuiz({ ...quiz, title: e.target.value })}
                        placeholder="Quiz title"
                    />
                </div>
                <button type="button" className="btn btn--primary" onClick={addQuestion}>
                    + Add Question
                </button>
            </div>

            <div className="editor__questions">
                {quiz.questions.map((q, idx) => (
                    <Question
                        key={q.id}
                        index={idx}
                        question={q}
                        onChange={(patch) => updateQuestion(q.id, patch)}
                        onDelete={() => deleteQuestion(q.id)}
                        disableDelete={quiz.questions.length <= 1}
                    />
                ))}
            </div>
        </div>
    );
}
