import React, { useState } from "react";
import { createQuiz } from "../lib/quizModel";

export default function WelcomeModal({ onCreate }) {
  const [title, setTitle] = useState("");

  function submit(e) {
    e.preventDefault();
    onCreate(createQuiz(title.trim() || "My Kahoot"));
  }

  return (
    <div className="modal">
      <h2>Welcome to Classroom Clash</h2>

      <form onSubmit={submit}>
        <label>
          Quiz title
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="My Kahoot"
          />
        </label>

        <button type="submit">Create</button>
      </form>
    </div>
  );
}

