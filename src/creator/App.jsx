import { useEffect, useRef, useState } from 'react';
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
            initNewWidget: () => {},

            initExistingWidget: (title, widget, existingQset) => {
                setQuiz(createQuiz(title || 'My Quiz'));
            },

            onSaveClicked: () => {
                const current = quizRef.current;

                if (!current) {
                    window.Materia.CreatorCore.cancelSave('Create a quiz first.');
                    return;
                }

                const qset = buildQset(current);
                window.Materia.CreatorCore.save(current.title.trim() || 'Classroom Clash', qset);
            },
        });
    }, []);

    return (
        <div className="app">
            <header className="header">
                <h1 className="header__title">Classroom Clash</h1>
            </header>

            <main className="app__content">
                {quiz == null ? (
                    <WelcomeModal onCreate={setQuiz} />
                ) : (
                    <QuestionEditor quiz={quiz} setQuiz={setQuiz} />
                )}
            </main>
        </div>
    );
}
