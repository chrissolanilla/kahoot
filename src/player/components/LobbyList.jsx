import React from "react";

export default function LobbyList({ rooms, onJoin }) {
  if (!rooms?.length) return <p className="muted">(no lobbies yet)</p>;

  return rooms.map((r) => (
    <div key={r.code} className="lobbyRow">
      <div className="lobbyRow__label">
        {r.name} ({r.code}) — {r.players} player(s)
      </div>
      <button type="button" onClick={() => onJoin(r.code)}>
        Join
      </button>
    </div>
  ));
}

