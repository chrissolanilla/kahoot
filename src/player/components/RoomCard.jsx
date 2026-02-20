export default function RoomCard({ name, code, playerCount, isPrivate, onJoin }) {
    return (
        <div className="room-card">
            <div className="room-card__info">
                <span className="room-card__name">{name}</span>
                <span className="room-card__meta">
                    {code} &middot; {playerCount} player{playerCount !== 1 ? "s" : ""}
                </span>
            </div>
            {isPrivate ? (
                <span className="room-card__badge">Private</span>
            ) : (
                <button
                    type="button"
                    className="btn btn--secondary btn--sm"
                    onClick={() => onJoin(code)}
                >
                    Join
                </button>
            )}
        </div>
    );
}
