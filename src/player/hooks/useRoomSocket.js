import { useRef, useState } from 'react';
import { roomUrl, safeJsonParse, wsSend } from '../constants';

export default function useRoomSocket({ setBanner, clearBanner, navigate, setGame, loadGame }) {
    const wsRef = useRef(null);
    const isHostRef = useRef(false);
    const intentionallyCloseWS = useRef(false);
    const callbacksRef = useRef({ navigate, loadGame, setBanner, clearBanner, setGame });
    callbacksRef.current = { navigate, loadGame, setBanner, clearBanner, setGame };
    const [room, setRoom] = useState({
        code: '',
        players: [],
        started: false,
        isHost: false,
    });

    function connectRoomSocket(code, playerName) {
        console.log('Player name:', playerName);
        const ws = new WebSocket(roomUrl(code));
        wsRef.current = ws;

        ws.onopen = () => {
            intentionallyCloseWS.current = false;
            wsSend(ws, { event: 'join', payload: { name: playerName } });
        };

        ws.onmessage = (e) => {
            const msg = safeJsonParse(e.data);
            if (!msg) return;
            const cb = callbacksRef.current;

            if (msg.event === 'lobby_state' || msg.event === 'lobby_update') {
                const payload = msg.payload || {};
                setRoom((prev) => ({
                    // ...prev, doing this causes some client side rendering bugs.
                    // when host leaves transfer ownership to a player
                    code: prev.code,
                    isHost: prev.isHost,
                    players: payload.players || [],
                    started: !!payload.started,
                }));
                return;
            }

            if (msg.event === 'game_started') {
                setRoom((prev) => ({ ...prev, started: true }));
                if (isHostRef.current) {
                    cb.loadGame();
                    cb.navigate('adminQuestion');
                } else {
                    cb.navigate('question');
                }
                return;
            }

            if (msg.event === 'game_ended') {
                cb.setGame((prev) => ({
                    ...prev,
                    gameOver: true,
                    timeRemaining: 0,
                    submitted: false,
                    answeredCount: 0,
                }));
                cb.navigate('gameOver');
                return;
            }

            if (msg.event === 'question') {
                const q = msg.payload;
                cb.setGame((prev) => ({
                    ...prev,
                    currentQuestion: q,
                    timeRemaining: Math.floor((q.timeLimitMs || 30000) / 1000),
                    selectedAnswer: null,
                    submitted: false,
                    answeredCount: 0,
                    submittedToMateria: false,
                }));
                if (!isHostRef.current) {
                    cb.navigate('question');
                }
                return;
            }

            if (msg.event === 'time_update') {
                cb.setGame((prev) => ({
                    ...prev,
                    timeRemaining: msg.payload?.remaining ?? prev.timeRemaining,
                }));
                return;
            }

            if (msg.event === 'time_up') {
                cb.setGame((prev) => ({ ...prev, timeRemaining: 0 }));
                return;
            }

            if (msg.event === 'leaderboard') {
                const correctIds = msg.payload?.correctIds || [];
                cb.setGame((prev) => {
                    const wasCorrect = correctIds.includes(prev.selectedAnswer);
                    return {
                        ...prev,
                        leaderboard: msg.payload?.leaderboard || [],
                        lastResult:
                            prev.selectedAnswer == null
                                ? 'unanswered'
                                : wasCorrect
                                ? 'correct'
                                : 'wrong',
                    };
                });
                cb.navigate('leaderboard');
                return;
            }

            if (msg.event === 'answer_count') {
                cb.setGame((prev) => ({
                    ...prev,
                    answeredCount: msg.payload?.count || 0,
                }));
                return;
            }

            if (msg.event === 'error') {
                cb.setBanner(msg.payload?.message || 'error', 'error');
            }
        };

        ws.onclose = () => {
            if (!intentionallyCloseWS.current && code) {
                callbacksRef.current.setBanner?.('disconnected from lobby', 'error');
            }
        };
    }

    function joinRoom(code, playerName, isHost = false) {
        console.log('Joining room with code:', code, 'and player name:', playerName);
        clearBanner();

        // close previous room ws
        intentionallyCloseWS.current = true;
        if (wsRef.current) {
            try {
                wsSend(wsRef.current, { event: 'leave' });
                wsRef.current.close();
            } catch {}
            wsRef.current = null;
        }

        const normalized = (code || '').trim().toUpperCase();

        isHostRef.current = isHost;
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

        intentionallyCloseWS.current = true;
        if (wsRef.current) {
            try {
                wsSend(wsRef.current, { event: 'leave' });
                wsRef.current.close();
            } catch {}
            wsRef.current = null;
        }

        setRoom({ code: '', players: [], started: false, isHost: false });
    }

    function startGame() {
        clearBanner();
        if (!room.isHost) {
            setBanner('only the host can start', 'error');
            return;
        }
        wsSend(wsRef.current, { event: 'start' });
    }

    function sendAnswer(choiceId) {
        if (!wsRef.current) return;
        wsSend(wsRef.current, { event: 'submit_answer', payload: { choiceId } });
    }

    function sendQuestion(question) {
        if (!wsRef.current) return;
        // send correct IDs to server for scoring, strip from player-facing data
        const correctIds = question.choices.filter((c) => c.correct).map((c) => c.id);
        const clean = {
            ...question,
            itemId: question.itemId,
            choices: question.choices.map(({ id, text }) => ({ id, text })),
        };
        wsSend(wsRef.current, {
            event: 'admin_send_question',
            payload: { question: clean, correctIds },
        });
    }

    function cleanup() {
        intentionallyCloseWS.current = true;
        try {
            wsRef.current?.close();
        } catch {}
    }

    return { room, joinRoom, leaveLobby, startGame, sendQuestion, sendAnswer, cleanup };
}
