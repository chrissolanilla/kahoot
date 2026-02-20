import { useApp } from "../context/AppContext";

export default function LandingView() {
    const { name, setName, navigate, setBanner, connected } = useApp();

    function go(target) {
        if (!name.trim()) {
            setBanner("enter your name first", "error");
            return;
        }
        navigate(target);
    }

    return (
        <section className="landing">
            <div className="landing__hero">
                <h2 className="landing__title">Classroom Clash</h2>
                <p className="landing__tagline">Real-time quiz battles for the classroom</p>
            </div>

            <div className="landing__form">
                <label className="input-label" htmlFor="playerName">
                    Your Name
                </label>
                <input
                    id="playerName"
                    className="input"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter your name"
                    autoComplete="off"
                />
            </div>

            <div className="landing__actions">
                <button
                    type="button"
                    className="btn btn--primary btn--lg"
                    disabled={!connected}
                    onClick={() => go("createRoom")}
                >
                    Create a Room
                </button>
                <button
                    type="button"
                    className="btn btn--secondary btn--lg"
                    disabled={!connected}
                    onClick={() => go("viewRooms")}
                >
                    Browse Rooms
                </button>
            </div>

            {!connected && <p className="landing__status text-muted">Connecting...</p>}
        </section>
    );
}
