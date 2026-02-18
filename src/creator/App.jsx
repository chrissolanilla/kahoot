import React, { useEffect, useRef, useState } from 'react';
import WelcomeModal from './components/WelcomeModal';
import QuestionEditor from './components/QuestionEditor';
import { createQuiz } from './lib/quizModel';
import { buildQset } from './lib/buildQset';

export default function App() {
    const [quiz, setQuiz] = useState(null);
    const quizRef = useRef(quiz);

    // keep ref in sync so Materia callbacks always see latest state
    useEffect(() => {
        quizRef.current = quiz;
    }, [quiz]);

    useEffect(() => {
        if (!window.Materia?.CreatorCore) return;

        window.Materia.CreatorCore.start({
            initNewWidget: () => {
                // you can choose to start with null (welcome modal),
                // or immediately create a default quiz:
                // setQuiz(createQuiz("My Kahoot"));
            },

            initExistingWidget: (title, widget, existingQset) => {
                // optional: load existing qset into state
                // for now just open editor with a title
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
