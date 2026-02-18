import React, { useEffect, useMemo, useRef, useState } from "react";

const scheme = location.protocol === "https:" ? "wss" : "ws";
const directoryUrl = `${scheme}://${location.host}/ws/kahoot/`;

function safeJsonParse(text) {
    try {
        return JSON.parse(text);
    } catch {
        return null;
    }
}

function wsSend(ws, message) {
    if (!ws) return;
    if (ws.readyState !== WebSocket.OPEN) return;
    ws.send(JSON.stringify(message));
}

export default function App() {
    // ui state
    const [screen, setScreen] = useState("home"); // "home" | "lobby"
    const [name, setName] = useState("");
    const [lobbyName, setLobbyName] = useState("");
    const [joinCode, setJoinCode] = useState("");

    const [banner, setBannerState] = useState({ text: "", type: "info" });
    const setBanner = (text, type = "info") => setBannerState({ text, type });
    const clearBanner = () => setBannerState({ text: "", type: "info" });

    // directory socket state
    const dirWsRef = useRef(null);
    const [dirConnected, setDirConnected] = useState(false);
    const [rooms, setRooms] = useState([]);

    // room socket state
    const roomWsRef = useRef(null);
    const [room, setRoom] = useState({
        code: "",
        players: [],
        started: false,
        isHost: false,
    });

    const canStart = useMemo(
        () => screen === "lobby" && room.isHost && !room.started,
        [screen, room.isHost, room.started],
    );

    function connectDirectory() {
        const ws = new WebSocket(directoryUrl);
        dirWsRef.current = ws;

        ws.onopen = () => {
            setDirConnected(true);
            wsSend(ws, { event: "list_rooms" });
        };

        ws.onclose = () => setDirConnected(false);

        ws.onmessage = (e) => {
            const msg = safeJsonParse(e.data);
            if (!msg) return;

            if (msg.event === "rooms") {
                const list = msg.payload?.rooms || [];
                setRooms(list.filter((r) => !r.started));
                return;
            }

            if (msg.event === "room_created") {
                setRoom((prev) => ({ ...prev, isHost: true }));
                joinRoom(msg.payload?.code, true);
                return;
            }

            if (msg.event === "error") {
                setBanner(msg.payload?.message || "unknown error", "error");
            }
        };
    }

    function refreshRooms() {
        clearBanner();
        wsSend(dirWsRef.current, { event: "list_rooms" });
    }

    function hostLobby() {
        clearBanner();

        if (!name.trim()) return setBanner("enter your name first", "error");
        if (!lobbyName.trim())
            return setBanner("enter a lobby name to host", "error");

        wsSend(dirWsRef.current, {
            event: "create_room",
            payload: { name: lobbyName.trim() },
        });
    }

    function connectRoomSocket(code, playerName) {
        const roomUrl = `${scheme}://${location.host}/ws/kahoot/${code}/`;
        const ws = new WebSocket(roomUrl);
        roomWsRef.current = ws;

        ws.onopen = () => {
            wsSend(ws, { event: "join", payload: { name: playerName } });
        };

        ws.onmessage = (e) => {
            const msg = safeJsonParse(e.data);
            if (!msg) return;

            if (msg.event === "lobby_state" || msg.event === "lobby_update") {
                const payload = msg.payload || {};
                setRoom((prev) => ({
                    ...prev,
                    players: payload.players || [],
                    started: !!payload.started,
                }));
                return;
            }

            if (msg.event === "game_started") {
                setRoom((prev) => ({ ...prev, started: true }));
                setBanner("game started!", "success");
                return;
            }

            if (msg.event === "error") {
                setBanner(msg.payload?.message || "error", "error");
            }
        };
    }

    function joinRoom(code, fromCreate = false) {
        clearBanner();

        const playerName = name.trim();
        if (!playerName) return setBanner("enter your name first", "error");

        const normalized = (code || "").trim().toUpperCase();
        if (!normalized) return setBanner("enter a room code", "error");

        // close previous room ws
        if (roomWsRef.current) {
            try {
                wsSend(roomWsRef.current, { event: "leave" });
                roomWsRef.current.close();
            } catch {}
            roomWsRef.current = null;
        }

        setRoom((prev) => ({
            ...prev,
            code: normalized,
            players: [],
            started: false,
            // if we created it, we are host; otherwise keep whatever caller set
            isHost: fromCreate ? true : prev.isHost,
        }));

        setScreen("lobby");
        connectRoomSocket(normalized, playerName);
    }

    function joinByCode() {
        setRoom((prev) => ({ ...prev, isHost: false }));
        joinRoom(joinCode);
    }

    function joinExisting(code) {
        setRoom((prev) => ({ ...prev, isHost: false }));
        joinRoom(code);
    }

    function leaveLobby() {
        clearBanner();

        if (roomWsRef.current) {
            try {
                wsSend(roomWsRef.current, { event: "leave" });
                roomWsRef.current.close();
            } catch {}
            roomWsRef.current = null;
        }

        setScreen("home");
        setRoom({ code: "", players: [], started: false, isHost: false });
        refreshRooms();
    }

    function startGame() {
        clearBanner();
        const ws = roomWsRef.current;
        if (!ws) return;

        if (!room.isHost) return setBanner("only the host can start", "error");

        wsSend(ws, { event: "start" });
    }

    // lifecycle
    useEffect(() => {
        connectDirectory();
        return () => {
            try {
                dirWsRef.current?.close();
            } catch {}
            try {
                roomWsRef.current?.close();
            } catch {}
        };
    }, []);

    return (
        <div className="app">
            <header className="header">
                <h1>Kahoot</h1>
            </header>

            {banner.text && (
                <div className="banner" data-type={banner.type}>
                    <span>{banner.text}</span>
                    <button
                        type="button"
                        className="banner__close"
                        onClick={clearBanner}
                    >
                        ×
                    </button>
                </div>
            )}

            {screen === "home" ? (
                <section className="panel">
                    <div className="field">
                        <label htmlFor="name">Your name</label>
                        <input
                            id="name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="bustopher"
                            autoComplete="off"
                        />
                    </div>

                    <div className="row">
                        <div className="field grow">
                            <label htmlFor="lobbyName">Lobby name</label>
                            <input
                                id="lobbyName"
                                value={lobbyName}
                                onChange={(e) => setLobbyName(e.target.value)}
                                placeholder="Test Lobby"
                                autoComplete="off"
                            />
                        </div>

                        <button
                            type="button"
                            onClick={hostLobby}
                            disabled={!dirConnected}
                        >
                            Host
                        </button>

                        <button
                            type="button"
                            onClick={refreshRooms}
                            disabled={!dirConnected}
                        >
                            Refresh
                        </button>
                    </div>

                    <div className="row">
                        <div className="field grow">
                            <label htmlFor="joinCode">Join by code</label>
                            <input
                                id="joinCode"
                                value={joinCode}
                                onChange={(e) => setJoinCode(e.target.value)}
                                placeholder="ABCD"
                                autoComplete="off"
                                onKeyDown={(e) => {
                                    if (e.key === "Enter") {
                                        e.preventDefault();
                                        joinByCode();
                                    }
                                }}
                            />
                        </div>

                        <button
                            type="button"
                            onClick={joinByCode}
                            disabled={!dirConnected}
                        >
                            Join
                        </button>
                    </div>

                    <h3 className="sectionTitle">Lobbies</h3>

                    {!rooms.length ? (
                        <p className="muted">(no lobbies yet)</p>
                    ) : (
                        rooms.map((r) => (
                            <div key={r.code} className="lobbyRow">
                                <div className="lobbyRow__label">
                                    {r.name} ({r.code}) — {r.players} player(s)
                                </div>
                                <button
                                    type="button"
                                    onClick={() => joinExisting(r.code)}
                                >
                                    Join
                                </button>
                            </div>
                        ))
                    )}
                </section>
            ) : (
                <section className="panel">
                    <div className="row">
                        <div>
                            <strong>Lobby:</strong> {room.code}
                        </div>
                        <div className="spacer" />
                        {room.isHost && <span className="pill">host</span>}
                        {room.started && (
                            <span className="pill pill--started">started</span>
                        )}
                        <button type="button" onClick={leaveLobby}>
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
                        <button
                            type="button"
                            className="primary"
                            onClick={startGame}
                        >
                            Start
                        </button>
                    ) : room.isHost && room.started ? (
                        <p className="muted">Game already started.</p>
                    ) : null}
                </section>
            )}
        </div>
    );
}

