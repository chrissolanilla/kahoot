import { useApp } from "../context/AppContext";

export default function AdminView() {
    const { room, handleLeaveLobby, startGame } = useApp();

    return (
        <section className="admin">
            <div className="admin__header">
                <h2 className="view-title">Admin Panel</h2>
                <span className="admin__code">Room: {room.code}</span>
            </div>

            <div className="admin__players">
                <p className="text-muted">Players ({room.players.length})</p>
            </div>

            {!room.started ? (
                <button
                    type="button"
                    className="btn btn--primary btn--lg"
                    disabled={room.players.length === 0}
                    onClick={startGame}
                >
                    Start Game
                </button>
            ) : (
                <p className="text-muted">Game in progress</p>
            )}

            <button type="button" className="btn btn--ghost" onClick={handleLeaveLobby}>
                Close Room
            </button>
        </section>
    );
}
