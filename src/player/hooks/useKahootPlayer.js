import { useEffect, useMemo, useRef, useState } from "react";

const scheme = location.protocol === "https:" ? "wss" : "ws";
const directoryUrl = `${scheme}://${location.host}/ws/kahoot/`;

function safeJsonParse(text) {
  try { return JSON.parse(text); } catch { return null; }
}

function wsSend(ws, message) {
  if (!ws) return;
  if (ws.readyState !== WebSocket.OPEN) return;
  ws.send(JSON.stringify(message));
}

export function useKahootPlayer() {
  // ui state
  const [screen, setScreen] = useState("home");
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
    [screen, room.isHost, room.started]
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
        // mark host + join created room
        setRoom((prev) => ({ ...prev, isHost: true }));
        joinRoom(msg.payload?.code, { fromCreate: true });
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
    if (!lobbyName.trim()) return setBanner("enter a lobby name to host", "error");

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

  function joinRoom(code, opts = {}) {
    const { fromCreate = false, forceHost = false } = opts;

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
      isHost: forceHost ? true : fromCreate ? true : prev.isHost,
    }));

    setScreen("lobby");
    connectRoomSocket(normalized, playerName);
  }

  function joinByCode() {
    setRoom((prev) => ({ ...prev, isHost: false }));
    joinRoom(joinCode, { forceHost: false });
  }

  function joinExisting(code) {
    setRoom((prev) => ({ ...prev, isHost: false }));
    joinRoom(code, { forceHost: false });
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

  useEffect(() => {
    connectDirectory();
    return () => {
      try { dirWsRef.current?.close(); } catch {}
      try { roomWsRef.current?.close(); } catch {}
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    // state
    screen, name, lobbyName, joinCode, banner,
    dirConnected, rooms, room, canStart,

    // setters
    setName, setLobbyName, setJoinCode,

    // actions
    clearBanner, refreshRooms, hostLobby,
    joinByCode, joinExisting, leaveLobby, startGame,
  };
}

