import { useMemo } from "react";
import { useApp } from "../context/AppContext";
import PlayerList from "../components/PlayerList";

export default function LobbyView() {
    const { room, handleLeaveLobby, startGame } = useApp();

    const canStart = useMemo(() => room.isHost && !room.started, [room.isHost, room.started]);

    return (
        <section className="lobby">
            <div className="lobby__code-section">
                <p className="text-muted">Room Code</p>
                <div className="lobby__code">{room.code}</div>
                <p className="text-muted">Share this code with your classmates</p>
            </div>

            <div className="lobby__status">
                {room.isHost && <span className="pill pill--host">Host</span>}
                {room.started && <span className="pill pill--started">In Progress</span>}
            </div>

            <div className="lobby__players">
                <h3 className="lobby__players-title">Players ({room.players.length})</h3>
                <PlayerList players={room.players} />
            </div>

            <div className="lobby__actions">
                {canStart && (
                    <button type="button" className="btn btn--primary btn--lg" onClick={startGame}>
                        Start Game
                    </button>
                )}
                {room.isHost && room.started && <p className="text-muted">Game in progress</p>}
                <button type="button" className="btn btn--ghost" onClick={handleLeaveLobby}>
                    Leave Lobby
                </button>
            </div>
        </section>
    );
}
