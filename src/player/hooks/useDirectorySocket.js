import { useEffect, useRef, useState } from 'react';
import { DIRECTORY_URL, safeJsonParse, wsSend } from '../constants';

export default function useDirectorySocket({ setBanner, onRoomCreated }) {
    const wsRef = useRef(null);
    const [connected, setConnected] = useState(false);
    const [rooms, setRooms] = useState([]);

    function connect() {
        const ws = new WebSocket(DIRECTORY_URL);
        wsRef.current = ws;

        ws.onopen = () => {
            setConnected(true);
            wsSend(ws, { event: 'list_rooms' });
        };

        ws.onclose = () => setConnected(false);

        ws.onmessage = (e) => {
            const msg = safeJsonParse(e.data);
            if (!msg) return;

            if (msg.event === 'rooms') {
                const list = msg.payload?.rooms || [];
                setRooms(list.filter((r) => !r.started));
                return;
            }

            if (msg.event === 'room_created') {
                onRoomCreated(msg.payload?.code);
                return;
            }

            if (msg.event === 'error') {
                setBanner(msg.payload?.message || 'unknown error', 'error');
            }
        };
    }

    function refreshRooms() {
        wsSend(wsRef.current, { event: 'list_rooms' });
    }

    function createRoom(lobbyName) {
        wsSend(wsRef.current, {
            event: 'create_room',
            payload: { name: lobbyName.trim() },
        });
    }

    useEffect(() => {
        connect();
        return () => {
            try {
                wsRef.current?.close();
            } catch {}
        };
    }, []);

    return { connected, rooms, refreshRooms, createRoom };
}
