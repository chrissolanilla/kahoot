import React from "react";

export default function LobbyView({ room, canStart, onLeave, onStart }) {
  return (
    <section className="panel">
      <div className="row">
        <div>
          <strong>Lobby:</strong> {room.code}
        </div>

        <div className="spacer" />

        {room.isHost && <span className="pill">host</span>}
        {room.started && <span className="pill pill--started">started</span>}

        <button type="button" onClick={onLeave}>
          Leave
        </button>
      </div>

      <h3 className="sectionTitle">Players</h3>

      <ul className="players">
        {room.players.map((p) => (
          <li key={p.id}>{p.name}</li>
        ))}
      </ul>

      {canStart ? (
        <button type="button" className="primary" onClick={onStart}>
          Start
        </button>
      ) : room.isHost && room.started ? (
        <p className="muted">Game already started.</p>
      ) : null}
    </section>
  );
}

