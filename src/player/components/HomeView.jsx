import React from "react";
import LobbyList from "./LobbyList";
import Field from "./Field";

export default function HomeView({
  name, lobbyName, joinCode,
  setName, setLobbyName, setJoinCode,
  dirConnected, rooms,
  onHost, onRefresh, onJoinByCode, onJoinExisting,
}) {
  return (
    <section className="panel">
      <Field
        id="name"
        label="Your name"
        value={name}
        onChange={setName}
        placeholder="bustopher"
      />

      <div className="row">
        <div className="grow">
          <Field
            id="lobbyName"
            label="Lobby name"
            value={lobbyName}
            onChange={setLobbyName}
            placeholder="Test Lobby"
          />
        </div>

        <button type="button" onClick={onHost} disabled={!dirConnected}>
          Host
        </button>

        <button type="button" onClick={onRefresh} disabled={!dirConnected}>
          Refresh
        </button>
      </div>

      <div className="row">
        <div className="grow">
          <Field
            id="joinCode"
            label="Join by code"
            value={joinCode}
            onChange={(v) => setJoinCode(v.toUpperCase())}
            placeholder="ABCD"
            onEnter={onJoinByCode}
          />
        </div>

        <button type="button" onClick={onJoinByCode} disabled={!dirConnected}>
          Join
        </button>
      </div>

      <h3 className="sectionTitle">Lobbies</h3>

      <LobbyList rooms={rooms} onJoin={(code) => onJoinExisting(code)} />
    </section>
  );
}

