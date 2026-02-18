export default function PlayerList({ players }) {
    if (!players.length) {
        return <p className="text-muted">Waiting for players...</p>;
    }

    return (
        <ul className="player-list">
            {players.map((p) => (
                <li key={p.id} className="player-list__item">
                    <span className="player-list__avatar">
                        {p.name.charAt(0).toUpperCase()}
                    </span>
                    <span className="player-list__name">{p.name}</span>
                </li>
            ))}
        </ul>
    );
}
