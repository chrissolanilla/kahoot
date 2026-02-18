import { useRef, useState } from "react";
import { roomUrl, safeJsonParse, wsSend } from "../constants";

export default function useRoomSocket({ setBanner, clearBanner }) {
    const wsRef = useRef(null);
    const [room, setRoom] = useState({
        code: "",
        players: [],
        started: false,
        isHost: false,
    });

    function connectRoomSocket(code, playerName) {
        const ws = new WebSocket(roomUrl(code));
        wsRef.current = ws;

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

    function joinRoom(code, playerName, isHost = false) {
        clearBanner();

        // close previous room ws
        if (wsRef.current) {
            try {
                wsSend(wsRef.current, { event: "leave" });
                wsRef.current.close();
            } catch {}
            wsRef.current = null;
        }

        const normalized = (code || "").trim().toUpperCase();

        setRoom({
            code: normalized,
            players: [],
            started: false,
            isHost,
        });

        connectRoomSocket(normalized, playerName);
    }

    function leaveLobby() {
        clearBanner();

        if (wsRef.current) {
            try {
                wsSend(wsRef.current, { event: "leave" });
                wsRef.current.close();
            } catch {}
            wsRef.current = null;
        }

        setRoom({ code: "", players: [], started: false, isHost: false });
    }

    function startGame() {
        clearBanner();
        if (!room.isHost) {
            setBanner("only the host can start", "error");
            return;
        }
        wsSend(wsRef.current, { event: "start" });
    }

    function cleanup() {
        try { wsRef.current?.close(); } catch {}
    }

    return { room, joinRoom, leaveLobby, startGame, cleanup };
}
