import React, { useState } from "react";
import WelcomeModal from "./components/WelcomeModal";
import QuestionEditor from "./components/QuestionEditor";

export default function App() {
  const [quiz, setQuiz] = useState(null);

  return (
    <div className="app creator">
      <header className="header">
        <h1>Kahoot</h1>
      </header>

      {quiz == null ? (
        <WelcomeModal onCreate={setQuiz} />
      ) : (
        <QuestionEditor quiz={quiz} setQuiz={setQuiz} />
      )}
    </div>
  );
}

