import React, { useEffect, useRef, useState } from 'react';
import { createQuiz } from '../lib/quizModel';

export default function WelcomeModal({ onCreate }) {
    const dialogRef = useRef(null);
    const [title, setTitle] = useState('My Kahoot');

    useEffect(() => {
        dialogRef.current?.showModal();
    }, []);

    function create() {
        onCreate(createQuiz(title.trim() || 'My Kahoot'));
        dialogRef.current?.close();
    }

    return (
        <dialog ref={dialogRef}>
            <h1>Welcome to Classroom Clash</h1>
            <label>
                Quiz title
                <input value={title} onChange={(e) => setTitle(e.target.value)} />
            </label>
            <button type="button" onClick={create}>
                Create
            </button>
        </dialog>
    );
}
