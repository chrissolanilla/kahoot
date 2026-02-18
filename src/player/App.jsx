import { AppProvider, useApp } from "./context/AppContext";
import Header from "./components/Header";
import Banner from "./components/Banner";
import LandingView from "./views/LandingView";
import CreateRoomView from "./views/CreateRoomView";
import ViewRoomsView from "./views/ViewRoomsView";
import LobbyView from "./views/LobbyView";
import AdminView from "./views/AdminView";

function AppContent() {
    const { screen } = useApp();

    return (
        <div className="app">
            <Header />
            <Banner />
            <main className="app__content">
                {screen === "landing" && <LandingView />}
                {screen === "createRoom" && <CreateRoomView />}
                {screen === "viewRooms" && <ViewRoomsView />}
                {screen === "lobby" && <LobbyView />}
                {screen === "admin" && <AdminView />}
            </main>
        </div>
    );
}

export default function App() {
    return (
        <AppProvider>
            <AppContent />
        </AppProvider>
    );
}
