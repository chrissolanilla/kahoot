import { useState } from 'react';
import { useApp } from '../context/AppContext';
import RoomCard from '../components/RoomCard';

export default function ViewRoomsView() {
    const { rooms, refreshRooms, handleJoinRoom, connected } = useApp();
    const [joinCode, setJoinCode] = useState('');

    function onJoinByCode(e) {
        e.preventDefault();
        handleJoinRoom(joinCode);
    }

    const publicRooms = rooms.filter((r) => !r.private);

    return (
        <section className="view-rooms">
            <h2 className="view-title">Browse Rooms</h2>

            <div className="view-rooms__join-code">
                <p className="text-muted">Have a private room code?</p>
                <form className="view-rooms__code-form" onSubmit={onJoinByCode}>
                    <input
                        className="input"
                        value={joinCode}
                        onChange={(e) => setJoinCode(e.target.value)}
                        placeholder="Enter room code"
                        autoComplete="off"
                    />
                    <button type="submit" className="btn btn--primary" disabled={!connected}>
                        Join
                    </button>
                </form>
            </div>

            <div className="view-rooms__header">
                <h3 className="view-rooms__subtitle">Public Rooms</h3>
                <button
                    type="button"
                    className="btn btn--ghost btn--sm"
                    onClick={refreshRooms}
                    disabled={!connected}
                >
                    Refresh
                </button>
            </div>

            {!publicRooms.length ? (
                <div className="view-rooms__empty">
                    <p className="text-muted">No public rooms available right now</p>
                    <p className="text-muted">Create one or join with a code</p>
                </div>
            ) : (
                <div className="view-rooms__list">
                    {publicRooms.map((r) => (
                        <RoomCard
                            key={r.code}
                            name={r.name}
                            code={r.code}
                            playerCount={r.players}
                            isPrivate={r.private}
                            onJoin={handleJoinRoom}
                        />
                    ))}
                </div>
            )}
        </section>
    );
}
