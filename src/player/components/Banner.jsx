import { useApp } from "../context/AppContext";

export default function Banner() {
    const { banner, clearBanner } = useApp();

    if (!banner.text) return null;

    return (
        <div className={`banner banner--${banner.type}`}>
            <span className="banner__text">{banner.text}</span>
            <button type="button" className="banner__close" onClick={clearBanner}>
                &times;
            </button>
        </div>
    );
}
