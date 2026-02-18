import { createContext, useContext, useEffect, useState } from "react";
import useBanner from "../hooks/useBanner";
import useDirectorySocket from "../hooks/useDirectorySocket";
import useRoomSocket from "../hooks/useRoomSocket";

const AppContext = createContext(null);

export function useApp() {
    return useContext(AppContext);
}

export function AppProvider({ children }) {
    const [screen, setScreen] = useState("landing");
    const [name, setName] = useState("");

    const { banner, setBanner, clearBanner } = useBanner();

    const { room, joinRoom, leaveLobby, startGame, cleanup: cleanupRoom } =
        useRoomSocket({ setBanner, clearBanner });

    const { connected, rooms, refreshRooms, createRoom } =
        useDirectorySocket({
            setBanner,
            onRoomCreated: (code) => {
                joinRoom(code, name.trim(), true);
                setScreen("admin");
            },
        });

    function navigate(target) {
        clearBanner();
        setScreen(target);
    }

    function handleCreateRoom(lobbyName) {
        clearBanner();
        if (!name.trim()) {
            setBanner("enter your name first", "error");
            return;
        }
        if (!lobbyName.trim()) {
            setBanner("enter a lobby name", "error");
            return;
        }
        createRoom(lobbyName);
    }

    function handleJoinRoom(code) {
        clearBanner();
        if (!name.trim()) {
            setBanner("enter your name first", "error");
            return;
        }
        const normalized = (code || "").trim().toUpperCase();
        if (!normalized) {
            setBanner("enter a room code", "error");
            return;
        }
        joinRoom(normalized, name.trim(), false);
        setScreen("lobby");
    }

    function handleLeaveLobby() {
        leaveLobby();
        setScreen("landing");
        refreshRooms();
    }

    useEffect(() => {
        return () => cleanupRoom();
    }, []);

    const value = {
        screen,
        navigate,
        name,
        setName,
        banner,
        setBanner,
        clearBanner,
        connected,
        rooms,
        refreshRooms,
        handleCreateRoom,
        handleJoinRoom,
        handleLeaveLobby,
        room,
        startGame,
    };

    return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}
