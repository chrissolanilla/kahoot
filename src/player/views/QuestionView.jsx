import { useEffect } from 'react';
import { useApp } from '../context/AppContext';

export default function QuestionView() {
    const { game, submitAnswer, room } = useApp();
    const {
		currentQuestion,
		timeRemaining,
		selectedAnswer,
		submitted,
		answeredCount,
		submittedToMateria,
	} = game;

    if (!currentQuestion) {
        return (
            <section className="question">
                <p className="text-muted">Waiting for question...</p>
            </section>
        );
    }

    const { prompt, choices, questionNumber, totalQuestions } = currentQuestion;

    useEffect(() => {
        if (!currentQuestion?.itemId) return;
        if (timeRemaining !== 0) return;
        if (submitted || submittedToMateria) return;

        //if we run out of time, send a time up log
        window.Materia?.Score?.submitQuestionForScoring?.(currentQuestion.itemId, 'TIME_UP', 0);

        setGame((prev) => ({ ...prev, submittedToMateria: true }));
    }, [currentQuestion?.itemId, timeRemaining, submitted, submittedToMateria, setGame]);

    return (
        <section className="question">
            <div className="question__header">
                <span className="question__number">
                    Question {questionNumber} of {totalQuestions}
                </span>
                <span className="question__timer">{timeRemaining}s</span>
            </div>

            <div className="question__prompt">
                <h2 className="question__prompt-text">{prompt}</h2>
            </div>

            <div className="question__choices">
                {choices.map((choice) => (
                    <button
                        key={choice.id}
                        type="button"
                        className={
                            'question__choice' +
                            (selectedAnswer === choice.id ? ' question__choice--selected' : '')
                        }
                        disabled={submitted}
                        onClick={() => submitAnswer(choice.id)}
                    >
                        {choice.text}
                    </button>
                ))}
            </div>

            <div className="question__status">
                <span className="question__answered">
                    {answeredCount} / {Math.max(0, room.players.length - 1)} answered
                </span>
            </div>

            {submitted && (
                <p className="question__submitted text-muted">
                    Answer submitted! Waiting for results...
                </p>
            )}
        </section>
    );
}
