import React from "react";
import Question from "./Question";
import { createQuestion } from "../lib/quizModel";

export default function QuestionEditor({ quiz, setQuiz }) {
  function setTitle(nextTitle) {
    setQuiz({ ...quiz, title: nextTitle });
  }

  function addQuestion() {
    setQuiz({ ...quiz, questions: [...quiz.questions, createQuestion()] });
  }

  function deleteQuestion(questionId) {
    const next = quiz.questions.filter((q) => q.id !== questionId);
    setQuiz({ ...quiz, questions: next.length ? next : [createQuestion()] });
  }

  function updateQuestion(questionId, patch) {
    const nextQuestions = quiz.questions.map((q) =>
      q.id === questionId ? { ...q, ...patch } : q
    );
    setQuiz({ ...quiz, questions: nextQuestions });
  }

  return (
    <div className="questionEditor">
      <div className="topBar">
        <label>
          Title
          <input
            value={quiz.title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="My Kahoot"
          />
        </label>

        <button type="button" onClick={addQuestion}>
          + Add Question
        </button>
      </div>

      <div className="questions">
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

