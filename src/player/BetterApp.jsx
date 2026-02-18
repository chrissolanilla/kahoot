import React from "react";
import { useKahootPlayer } from "./hooks/useKahootPlayer";
import Banner from "./components/Banner";
import HomeView from "./components/HomeView";
import LobbyView from "./components/LobbyView";

export default function App() {
  const state = useKahootPlayer();

  return (
    <div className="app">
      <header className="header">
        <h1>Kahoot</h1>
      </header>

      <Banner banner={state.banner} onClose={state.clearBanner} />

      {state.screen === "home" ? (
        <HomeView
          name={state.name}
          lobbyName={state.lobbyName}
          joinCode={state.joinCode}
          setName={state.setName}
          setLobbyName={state.setLobbyName}
          setJoinCode={state.setJoinCode}
          dirConnected={state.dirConnected}
          rooms={state.rooms}
          onHost={state.hostLobby}
          onRefresh={state.refreshRooms}
          onJoinByCode={state.joinByCode}
          onJoinExisting={state.joinExisting}
        />
      ) : (
        <LobbyView
          room={state.room}
          canStart={state.canStart}
          onLeave={state.leaveLobby}
          onStart={state.startGame}
        />
      )}
    </div>
  );
}

