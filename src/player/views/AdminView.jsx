import { useApp } from "../context/AppContext";

export default function AdminView() {
    const { room, handleLeaveLobby } = useApp();

    return (
        <section className="admin">
            <div className="admin__header">
                <h2 className="view-title">Admin Panel</h2>
                <span className="admin__code">Room: {room.code}</span>
            </div>

            <div className="admin__placeholder">
                <p className="text-muted">Admin controls coming soon</p>
            </div>

            <button
                type="button"
                className="btn btn--ghost"
                onClick={handleLeaveLobby}
            >
                Close Room
            </button>
        </section>
    );
}
