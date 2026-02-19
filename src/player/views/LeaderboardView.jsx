import { useApp } from "../context/AppContext";

export default function LeaderboardView() {
    const { game, room, nextQuestion } = useApp();
    const { leaderboard, lastResult, gameOver } = game;

    return (
        <section className="leaderboard">
            <h2 className="view-title">Leaderboard</h2>

            {!room.isHost && lastResult && (
                <div className={`leaderboard__result leaderboard__result--${lastResult}`}>
                    {lastResult === "correct" && "Correct!"}
                    {lastResult === "wrong" && "Wrong!"}
                    {lastResult === "unanswered" && "No answer submitted"}
                </div>
            )}

            {leaderboard.length === 0 ? (
                <p className="text-muted">Waiting for scores...</p>
            ) : (
                <ol className="leaderboard__list">
                    {leaderboard.map((entry) => (
                        <li key={entry.name} className="leaderboard__item">
                            <span className="leaderboard__rank">#{entry.rank}</span>
                            <span className="leaderboard__name">{entry.name}</span>
                            <span className="leaderboard__score">{entry.score}</span>
                        </li>
                    ))}
                </ol>
            )}

            {!gameOver && room.isHost && (
                <div className="leaderboard__actions">
                    <button
                        type="button"
                        className="btn btn--primary btn--lg"
                        onClick={nextQuestion}
                    >
                        Next Question
                    </button>
                </div>
            )}

            {!gameOver && !room.isHost && (
                <p className="leaderboard__waiting text-muted">
                    Waiting for next question...
                </p>
            )}
        </section>
    );
}
