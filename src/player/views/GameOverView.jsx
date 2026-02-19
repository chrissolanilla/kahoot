import { useApp } from "../context/AppContext";

export default function GameOverView() {
    const { game, navigate, resetGame, handleLeaveLobby } = useApp();
    const { leaderboard } = game;

    function handleBackToLanding() {
        resetGame();
        handleLeaveLobby();
    }

    return (
        <section className="game-over">
            <h2 className="view-title">Game Over</h2>
            <p className="text-muted">Final Standings</p>

            {leaderboard.length === 0 ? (
                <p className="text-muted">No scores available</p>
            ) : (
                <ol className="game-over__list">
                    {leaderboard.map((entry) => (
                        <li
                            key={entry.name}
                            className={
                                "game-over__item" +
                                (entry.rank <= 3 ? ` game-over__item--top${entry.rank}` : "")
                            }
                        >
                            <span className="game-over__rank">#{entry.rank}</span>
                            <span className="game-over__name">{entry.name}</span>
                            <span className="game-over__score">{entry.score}</span>
                        </li>
                    ))}
                </ol>
            )}

            <div className="game-over__actions">
                <button
                    type="button"
                    className="btn btn--primary btn--lg"
                    onClick={handleBackToLanding}
                >
                    Back to Home
                </button>
            </div>
        </section>
    );
}
