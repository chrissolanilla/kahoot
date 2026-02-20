import { AppProvider, useApp } from './context/AppContext';
import Header from './components/Header';
import Banner from './components/Banner';
import LandingView from './views/LandingView';
import CreateRoomView from './views/CreateRoomView';
import ViewRoomsView from './views/ViewRoomsView';
import LobbyView from './views/LobbyView';
import AdminView from './views/AdminView';
import QuestionView from './views/QuestionView';
import LeaderboardView from './views/LeaderboardView';
import GameOverView from './views/GameOverView';
import AdminQuestionView from './views/AdminQuestionView';

function AppContent() {
    const { screen } = useApp();
    console.log('new');

    return (
        <div className="app">
            <Header />
            <Banner />
            <main className="app__content">
                {screen === 'landing' && <LandingView />}
                {screen === 'createRoom' && <CreateRoomView />}
                {screen === 'viewRooms' && <ViewRoomsView />}
                {screen === 'lobby' && <LobbyView />}
                {screen === 'admin' && <AdminView />}
                {screen === 'adminQuestion' && <AdminQuestionView />}
                {screen === 'question' && <QuestionView />}
                {screen === 'leaderboard' && <LeaderboardView />}
                {screen === 'gameOver' && <GameOverView />}
            </main>
        </div>
    );
}

export default function App({ qset }) {
    return (
        <AppProvider qset={qset}>
            <AppContent />
        </AppProvider>
    );
}
