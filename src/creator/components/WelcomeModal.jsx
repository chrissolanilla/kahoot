import { useEffect, useRef, useState } from 'react';
import { createQuiz } from '../lib/quizModel';

export default function WelcomeModal({ onCreate }) {
    const dialogRef = useRef(null);
    const [title, setTitle] = useState('My Quiz');

    useEffect(() => {
        dialogRef.current?.showModal();
    }, []);

    function create() {
        onCreate(createQuiz(title.trim() || 'My Quiz'));
        dialogRef.current?.close();
    }

    return (
        <dialog ref={dialogRef} className="welcome-dialog">
            <div className="welcome-dialog__content">
                <h2 className="welcome-dialog__title">Welcome to Classroom Clash</h2>
                <p className="text-muted">Create a new quiz for your class</p>

                <div className="welcome-dialog__field">
                    <label className="input-label" htmlFor="quizTitle">
                        Quiz Title
                    </label>
                    <input
                        id="quizTitle"
                        className="input"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="e.g. Bio 101 Midterm Review"
                        autoComplete="off"
                    />
                </div>

                <button type="button" className="btn btn--primary btn--lg" onClick={create}>
                    Create Quiz
                </button>
            </div>
        </dialog>
    );
}
