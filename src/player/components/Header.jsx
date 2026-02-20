import { useApp } from '../context/AppContext';

export default function Header() {
    const { screen, navigate } = useApp();
    const showBack = screen !== 'landing';

    return (
        <header className="header">
            {showBack && (
                <button
                    type="button"
                    className="header__back btn btn--ghost"
                    onClick={() => navigate('landing')}
                >
                    &larr; Back
                </button>
            )}
            <h1 className="header__title">Classroom Clash</h1>
        </header>
    );
}
