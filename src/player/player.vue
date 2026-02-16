<script setup>
import { computed, onMounted, onBeforeUnmount, reactive, ref } from "vue";

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

//ui state
const screen = ref("home");
const name = ref("");
const lobbyName = ref("");
const joinCode = ref("");

const banner = reactive({
// "info"  "error"  "success"
    text: "",
    type: "info",
});

function setBanner(text, type = "info") {
    banner.text = text;
    banner.type = type;
}

function clearBanner() {
    banner.text = "";
    banner.type = "info";
}

//dir socket state
const dir = reactive({
    ws: null,
    connected: false,
});

const rooms = ref([]);

//room socket state
const room = reactive({
    ws: null,
    code: "",
    players: [],
    started: false,
	//basic forntend perms
    isHost: false,
});

const canStart = computed(() => {
    return screen.value === "lobby" && room.isHost && !room.started;
});

function connectDirectory() {
    dir.ws = new WebSocket(directoryUrl);

    dir.ws.onopen = () => {
        dir.connected = true;
        wsSend(dir.ws, { event: "list_rooms" });
    };

    dir.ws.onclose = () => {
        dir.connected = false;
    };

    dir.ws.onmessage = (e) => {
        const msg = safeJsonParse(e.data);
        if (!msg) return;

        if (msg.event === "rooms") {
            const list = msg.payload?.rooms || [];
			//hide rooms already started
            rooms.value = list.filter((r) => !r.started);
            return;
        }

        if (msg.event === "room_created") {
            room.isHost = true;
            joinRoom(msg.payload?.code);
            return;
        }

        if (msg.event === "error") {
            setBanner(msg.payload?.message || "unknown error", "error");
        }
    };
}

function refreshRooms() {
    clearBanner();
    wsSend(dir.ws, { event: "list_rooms" });
}

function hostLobby() {
    clearBanner();

    if (!name.value.trim()) {
        setBanner("enter your name first", "error");
        return;
    }

    if (!lobbyName.value.trim()) {
        setBanner("enter a lobby name to host", "error");
        return;
    }

    wsSend(dir.ws, {
        event: "create_room",
        payload: { name: lobbyName.value.trim() },
    });
}

//room logic
function connectRoomSocket(code) {
    const roomUrl = `${scheme}://${location.host}/ws/kahoot/${code}/`;
    room.ws = new WebSocket(roomUrl);

    room.ws.onopen = () => {
        wsSend(room.ws, {
            event: "join",
            payload: { name: name.value.trim() },
        });
    };

    room.ws.onmessage = (e) => {
        const msg = safeJsonParse(e.data);
        if (!msg) return;

        if (msg.event === "lobby_state" || msg.event === "lobby_update") {
            const payload = msg.payload || {};
            room.players = payload.players || [];
            room.started = !!payload.started;
            return;
        }

        if (msg.event === "game_started") {
            room.started = true;
            setBanner("game started!", "success");
            return;
        }

        if (msg.event === "error") {
            setBanner(msg.payload?.message || "error", "error");
        }
    };

    room.ws.onclose = () => {
        //could kick everyone when the lobby is closed
        // if (screen.value === "lobby") leaveLobby();
    };
}

function joinRoom(code) {
    clearBanner();

    const playerName = name.value.trim();
    if (!playerName) {
        setBanner("enter your name first", "error");
        return;
    }

    const normalized = (code || "").trim().toUpperCase();
    if (!normalized) {
        setBanner("enter a room code", "error");
        return;
    }

    //close any previous room socket
    if (room.ws) {
        try {
            wsSend(room.ws, { event: "leave" });
            room.ws.close();
        } catch {
            //uh
        }
        room.ws = null;
    }

    room.code = normalized;
    room.players = [];
    room.started = false;

    screen.value = "lobby";
    connectRoomSocket(normalized);
}

function joinByCode() {
    room.isHost = false;
    joinRoom(joinCode.value);
}

function joinExisting(code) {
    room.isHost = false;
    joinRoom(code);
}

function leaveLobby() {
    clearBanner();

    if (room.ws) {
        try {
            wsSend(room.ws, { event: "leave" });
            room.ws.close();
        } catch {
            //idk
        }
        room.ws = null;
    }

    screen.value = "home";
    room.code = "";
    room.players = [];
    room.started = false;
    room.isHost = false;

    refreshRooms();
}

function startGame() {
    clearBanner();

    if (!room.ws) return;

    //frontend persm
    if (!room.isHost) {
        setBanner("only the host can start", "error");
        return;
    }

    wsSend(room.ws, { event: "start" });
}

onMounted(() => {
    connectDirectory();
});

onBeforeUnmount(() => {
    if (dir.ws) dir.ws.close();
    if (room.ws) room.ws.close();
});
</script>

<template>
    <div class="app">
        <header class="header">
            <h1>Kahoot</h1>
        </header>

		<!-- maybe us js alerts? -->
        <div v-if="banner.text" class="banner" :data-type="banner.type">
            <span>{{ banner.text }}</span>
            <button type="button" class="banner__close" @click="clearBanner">
                ×
            </button>
        </div>

        <!-- home screen -->
        <section v-if="screen === 'home'" class="panel">
            <div class="field">
                <label for="name">Your name</label>
                <input
                    id="name"
                    v-model.trim="name"
                    placeholder="bustopher"
                    autocomplete="off"
                />
            </div>

            <div class="row">
                <div class="field grow">
                    <label for="lobbyName">Lobby name</label>
                    <input
                        id="lobbyName"
                        v-model.trim="lobbyName"
                        placeholder="Test Lobby"
                        autocomplete="off"
                    />
                </div>

                <button
                    type="button"
                    @click="hostLobby"
                    :disabled="!dir.connected"
                >
                    Host
                </button>

                <button
                    type="button"
                    @click="refreshRooms"
                    :disabled="!dir.connected"
                >
                    Refresh
                </button>
            </div>

            <div class="row">
                <div class="field grow">
                    <label for="joinCode">Join by code</label>
                    <input
                        id="joinCode"
                        v-model.trim="joinCode"
                        placeholder="ABCD"
                        autocomplete="off"
                        @keydown.enter.prevent="joinByCode"
                    />
                </div>
                <button
                    type="button"
                    @click="joinByCode"
                    :disabled="!dir.connected"
                >
                    Join
                </button>
            </div>

            <h3 class="sectionTitle">Lobbies</h3>

            <p v-if="!rooms.length" class="muted">(no lobbies yet)</p>

            <div v-for="r in rooms" :key="r.code" class="lobbyRow">
                <div class="lobbyRow__label">
                    {{ r.name }} ({{ r.code }}) — {{ r.players }} player(s)
                </div>
                <button type="button" @click="joinExisting(r.code)">
                    Join
                </button>
            </div>
        </section>

        <!-- lobby -->
        <section v-else class="panel">
            <div class="row">
                <div><strong>Lobby:</strong> {{ room.code }}</div>
                <div class="spacer"></div>

                <span v-if="room.isHost" class="pill">host</span>
                <span v-if="room.started" class="pill pill--started"
                    >started</span
                >

                <button type="button" @click="leaveLobby">Leave</button>
            </div>

            <h3 class="sectionTitle">Players</h3>

            <ul class="players">
                <li v-for="p in room.players" :key="p.id">{{ p.name }}</li>
            </ul>

            <button
                v-if="canStart"
                type="button"
                class="primary"
                @click="startGame"
            >
                Start
            </button>

            <p v-else-if="room.isHost && room.started" class="muted">
                Game already started.
            </p>
        </section>
    </div>
</template>

<style scoped>
.app {
    font-family: Lato, system-ui, sans-serif;
    padding: 16px;
}
.header {
    margin-bottom: 8px;
}
.panel {
    border: 1px solid #ddd;
    border-radius: 10px;
    padding: 12px;
    max-width: 700px;
}
.row {
    display: flex;
    gap: 8px;
    align-items: flex-end;
    margin-top: 12px;
}
.field {
    display: flex;
    flex-direction: column;
    gap: 6px;
}
.grow {
    flex: 1;
}
.sectionTitle {
    margin-top: 18px;
}
.muted {
    opacity: 0.7;
}
.spacer {
    flex: 1;
}
.lobbyRow {
    display: flex;
    gap: 8px;
    align-items: center;
    margin: 8px 0;
}
.lobbyRow__label {
    flex: 1;
}
.players {
    margin: 8px 0;
    padding-left: 18px;
}
.banner {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 10px;
    padding: 10px;
    border-radius: 10px;
    margin: 10px 0;
    border: 1px solid #ddd;
}
.banner[data-type="error"] {
    border-color: #d88;
}
.banner[data-type="success"] {
    border-color: #8d8;
}
.banner__close {
    font-size: 18px;
    line-height: 1;
}
.pill {
    font-size: 12px;
    padding: 3px 8px;
    border: 1px solid #ddd;
    border-radius: 999px;
    opacity: 0.9;
}
.pill--started {
    border-color: #8d8;
}
.primary {
    font-weight: 700;
}
</style>

