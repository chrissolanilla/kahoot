export const WS_SCHEME = location.protocol === "https:" ? "wss" : "ws";
export const DIRECTORY_URL = `${WS_SCHEME}://${location.host}/ws/kahoot/`;
export const roomUrl = (code) => `${WS_SCHEME}://${location.host}/ws/kahoot/${code}/`;

export function safeJsonParse(text) {
    try {
        return JSON.parse(text);
    } catch {
        return null;
    }
}

export function wsSend(ws, message) {
    if (!ws) return;
    if (ws.readyState !== WebSocket.OPEN) return;
    ws.send(JSON.stringify(message));
}
