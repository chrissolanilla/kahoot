export function createQuiz(title = "My Kahoot") {
  return {
    title,
    questions: [createQuestion()],
  };
}

export function createQuestion() {
  return {
    id: crypto?.randomUUID?.() ?? String(Date.now() + Math.random()),
    prompt: "",
    timeLimitSec: 20,
    swagPoints: 1000,
    choices: [
      { id: "a", text: "", correct: false },
      { id: "b", text: "", correct: false },
    ],
  };
}

