import React, { useEffect, useRef, useState } from 'react';
import WelcomeModal from './components/WelcomeModal';
import QuestionEditor from './components/QuestionEditor';
import { createQuiz } from './lib/quizModel';
import { buildQset } from './lib/buildQset';

export default function App() {
    const [quiz, setQuiz] = useState(null);
    const quizRef = useRef(quiz);

    useEffect(() => {
        quizRef.current = quiz;
    }, [quiz]);

    useEffect(() => {
        if (!window.Materia?.CreatorCore) return;

        window.Materia.CreatorCore.start({
            initNewWidget: () => {
				//show the modal if new widget
            },

            initExistingWidget: (title, widget, existingQset) => {
                //for now just open editor with a title
				//probably dont show modal if its existing widget
                setQuiz(createQuiz(title || 'My Kahoot'));
            },

            onSaveClicked: () => {
                const current = quizRef.current;

                if (!current) {
                    window.Materia.CreatorCore.cancelSave('Create a quiz first.');
                    return;
                }

                const qset = buildQset(current);

                console.log('Saving qset:', qset);

                window.Materia.CreatorCore.save(current.title.trim() || 'Kahoot', qset);
            },
        });
    }, []);

    return (
        <div className="app creator">
            <header className="header">
                <h1>Kahoot</h1>
            </header>

            {quiz == null ? (
                <WelcomeModal onCreate={setQuiz} />
            ) : (
                <QuestionEditor quiz={quiz} setQuiz={setQuiz} />
            )}
        </div>
    );
}
