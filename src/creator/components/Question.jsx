export default function Question({ index, question, onChange, onDelete, disableDelete }) {
    const choicesCount = question.choices.length;

    function setChoiceText(choiceIndex, text) {
        const next = question.choices.map((c, i) => (i === choiceIndex ? { ...c, text } : c));
        onChange({ choices: next });
    }

    function toggleCorrect(choiceIndex, checked) {
        const next = question.choices.map((c, i) => ({
            ...c,
            correct: i === choiceIndex ? checked : false,
        }));
        onChange({ choices: next });
    }

    function incrementChoices() {
        if (choicesCount >= 4) return;
        const nextId = String(Date.now() + Math.random());
        onChange({ choices: [...question.choices, { id: nextId, text: "", correct: false }] });
    }

    function decrementChoices() {
        if (choicesCount <= 2) return;
        onChange({ choices: question.choices.slice(0, choicesCount - 1) });
    }

    return (
        <div className="question-card">
            <div className="question-card__header">
                <h3 className="question-card__number">Question {index + 1}</h3>
                <button
                    type="button"
                    className="btn btn--ghost btn--sm"
                    onClick={onDelete}
                    disabled={disableDelete}
                >
                    Delete
                </button>
            </div>

            <div className="question-card__body">
                <label className="input-label" htmlFor={`prompt-${question.id}`}>
                    Prompt
                </label>
                <input
                    id={`prompt-${question.id}`}
                    className="input"
                    value={question.prompt}
                    onChange={(e) => onChange({ prompt: e.target.value })}
                    placeholder="Enter your question"
                />

                <div className="question-card__meta">
                    <div className="question-card__meta-field">
                        <label className="input-label" htmlFor={`time-${question.id}`}>
                            Time (sec)
                        </label>
                        <input
                            id={`time-${question.id}`}
                            className="input"
                            type="number"
                            min={5}
                            max={300}
                            value={question.timeLimitSec}
                            onChange={(e) => onChange({ timeLimitSec: Number(e.target.value) })}
                        />
                    </div>

                    <div className="question-card__meta-field">
                        <label className="input-label" htmlFor={`points-${question.id}`}>
                            Points
                        </label>
                        <input
                            id={`points-${question.id}`}
                            className="input"
                            type="number"
                            min={0}
                            max={100000}
                            value={question.swagPoints}
                            onChange={(e) => onChange({ swagPoints: Number(e.target.value) })}
                        />
                    </div>

                    <div className="question-card__choice-controls">
                        <button
                            type="button"
                            className="btn btn--secondary btn--sm"
                            onClick={decrementChoices}
                            disabled={choicesCount <= 2}
                        >
                            - Choice
                        </button>
                        <button
                            type="button"
                            className="btn btn--secondary btn--sm"
                            onClick={incrementChoices}
                            disabled={choicesCount >= 4}
                        >
                            + Choice
                        </button>
                    </div>
                </div>

                <div className="question-card__choices">
                    {question.choices.map((c, i) => (
                        <div key={c.id} className="choice-row">
                            <input
                                className="input choice-row__input"
                                value={c.text}
                                onChange={(e) => setChoiceText(i, e.target.value)}
                                placeholder={`Choice ${i + 1}`}
                            />
                            <label className="choice-row__radio">
                                <input
                                    type="radio"
                                    name={`correct-${question.id}`}
                                    checked={c.correct}
                                    onChange={(e) => toggleCorrect(i, e.target.checked)}
                                />
                                Correct
                            </label>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
