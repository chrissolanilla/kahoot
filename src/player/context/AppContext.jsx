import { createContext, useContext, useEffect, useRef, useState } from "react";
import useBanner from "../hooks/useBanner";
import useDirectorySocket from "../hooks/useDirectorySocket";
import useRoomSocket from "../hooks/useRoomSocket";

const AppContext = createContext(null);

export function useApp() {
    return useContext(AppContext);
}

function parseQset(qset) {
    const items = qset?.data?.items || qset?.items || [];
    console.log("My items: ", items);
    return items.map((item, i) => ({
        itemId: item.id,
        prompt: item.questions?.[0]?.text || "",
        choices: (item.answers || []).map((a, j) => ({
            id: String(j),
            text: a.text,
            correct: a.value === 100,
        })),
        timeLimitMs: item.options?.time || 30000,
        questionNumber: i + 1,
        totalQuestions: items.length,
    }));
}

const initialGame = {
    questions: [],
    questionIndex: 0,
    currentQuestion: null,
    timeRemaining: 0,
    selectedAnswer: null,
    submitted: false,
    answeredCount: 0,
    leaderboard: [],
    lastResult: null,
    gameOver: false,
    submittedToMateria: false,
};

export function AppProvider({ children, qset }) {
    const [screen, setScreen] = useState("landing");
    const [name, setName] = useState("");
    const nameRef = useRef(name);
    nameRef.current = name;
    const [game, setGame] = useState(initialGame);

    const { banner, setBanner, clearBanner } = useBanner();

    function navigate(target) {
        clearBanner();
        setScreen(target);
    }

    const {
        room,
        joinRoom,
        leaveLobby,
        startGame,
        sendQuestion,
        sendAnswer,
        cleanup: cleanupRoom,
    } = useRoomSocket({ setBanner, clearBanner, navigate, setGame, loadGame });

    const { connected, rooms, refreshRooms, createRoom } = useDirectorySocket({
        setBanner,
        onRoomCreated: (code) => {
            joinRoom(code, nameRef.current.trim(), true);
            setScreen("admin");
        },
    });

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

    function loadGame() {
        const questions = parseQset(qset);
        if (questions.length === 0) return;
        const first = questions[0];
        setGame({
            ...initialGame,
            questions,
            currentQuestion: first,
            timeRemaining: Math.floor(first.timeLimitMs / 1000),
        });
        sendQuestion(first);
    }

    function nextQuestion() {
        setGame((prev) => {
            const nextIndex = prev.questionIndex + 1;
            if (nextIndex >= prev.questions.length) {
                navigate("gameOver");
                return { ...prev, gameOver: true };
            }
            const next = prev.questions[nextIndex];
            sendQuestion(next);
            navigate("adminQuestion");
            return {
                ...prev,
                questionIndex: nextIndex,
                currentQuestion: next,
                timeRemaining: Math.floor(next.timeLimitMs / 1000),
                selectedAnswer: null,
                submitted: false,
                answeredCount: 0,
            };
        });
    }

    function logQuestionToMateria(choiceIdOrNull, wasCorrect) {
        const q = game.currentQuestion;
        if (!q?.itemId) return;
        const answerText =
            choiceIdOrNull == null
                ? "TIME_UP"
                : q.choices.find((c) => c.id === choiceIdOrNull)?.text ?? "";
        const score = wasCorrect ? 100 : 0;

        window.Materia?.Score?.submitQuestionForScoring?.(q.itemId, answerText, score);
    }

    function submitAnswer(choiceId) {
        if (game.submitted) return;

        setGame((prev) => {
            if (prev.submitted) return prev;

            const q = prev.currentQuestion;
            if (q?.itemId) {
                const fullQ = prev.questions.find((qq) => qq.itemId === q.itemId);
                const wasCorrect = !!fullQ?.choices.find((c) => c.id === choiceId)?.correct;
                const answerText = q.choices.find((c) => c.id === choiceId)?.text ?? "";

                window.Materia?.Score?.submitQuestionForScoring?.(
                    q.itemId,
                    answerText,
                    wasCorrect ? 100 : 0
                );
            }

            return {
                ...prev,
                selectedAnswer: choiceId,
                submitted: true,
                submittedToMateria: true,
            };
        });

        sendAnswer(choiceId);
    }
    function resetGame() {
        setGame(initialGame);
    }

    useEffect(() => {
        if (!qset) return;
        const questions = parseQset(qset);
        setGame((prev) => ({ ...prev, questions }));
        // return () => cleanupRoom();
    }, [qset]);

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
        sendQuestion,
        game,
        setGame,
        loadGame,
        nextQuestion,
        submitAnswer,
        resetGame,
    };

    return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}
