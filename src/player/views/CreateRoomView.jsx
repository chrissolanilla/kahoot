import { useState } from "react";
import { useApp } from "../context/AppContext";

export default function CreateRoomView() {
    const { handleCreateRoom, connected } = useApp();
    const [lobbyName, setLobbyName] = useState("");

    function onSubmit(e) {
        e.preventDefault();
        handleCreateRoom(lobbyName);
    }

    return (
        <section className="create-room">
            <h2 className="view-title">Create a Room</h2>
            <p className="text-muted">Set up a new game lobby for your class</p>

            <form className="create-room__form" onSubmit={onSubmit}>
                <label className="input-label" htmlFor="lobbyName">
                    Room Name
                </label>
                <input
                    id="lobbyName"
                    className="input"
                    value={lobbyName}
                    onChange={(e) => setLobbyName(e.target.value)}
                    placeholder="e.g. Bio 101 Review"
                    autoComplete="off"
                />

                <button type="submit" className="btn btn--primary btn--lg" disabled={!connected}>
                    Create Room
                </button>
            </form>
        </section>
    );
}
