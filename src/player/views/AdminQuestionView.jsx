import { useApp } from "../context/AppContext";

export default function AdminQuestionView() {
    const { game, nextQuestion, navigate, room } = useApp();
    const { currentQuestion, timeRemaining, questionIndex, gameOver, answeredCount } = game;

    console.log("Current question:", currentQuestion);
    console.log("Question index:", questionIndex);
    console.log("Game: ", game);

    if (gameOver) {
        navigate("gameOver");
        return null;
    }

    if (!currentQuestion) {
        return (
            <section className="admin-question">
                <p className="text-muted">No questions loaded</p>
            </section>
        );
    }

    const { prompt, choices, questionNumber, totalQuestions } = currentQuestion;
    const playerCount = Math.max(0, room.players.length - 1);

    return (
        <section className="admin-question">
            <div className="admin-question__bar">
                <span className="admin__code">Room: {room.code}</span>
                <span className="admin-question__counter">
                    {questionNumber} / {totalQuestions}
                </span>
            </div>

            <div className="admin-question__stats">
                <div className="admin-question__timer">{timeRemaining}s</div>
                <div className="admin-question__answered">
                    {answeredCount} / {playerCount} answered
                </div>
            </div>

            <div className="admin-question__prompt">
                <h2 className="admin-question__prompt-text">{prompt}</h2>
            </div>

            <div className="admin-question__choices">
                {choices.map((choice) => (
                    <div
                        key={choice.id}
                        className={
                            "admin-question__choice" +
                            (choice.correct ? " admin-question__choice--correct" : "")
                        }
                    >
                        <span className="admin-question__choice-text">{choice.text}</span>
                        {choice.correct && (
                            <span className="admin-question__choice-badge">Correct</span>
                        )}
                    </div>
                ))}
            </div>

            <div className="admin-question__actions">
                <button
                    type="button"
                    className="btn btn--primary btn--lg"
                    onClick={nextQuestion}
                >
                    {questionNumber < totalQuestions ? "Next Question" : "End Game"}
                </button>
            </div>
        </section>
    );
}
