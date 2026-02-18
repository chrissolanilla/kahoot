import React from 'react';

export default function Question({ index, question, onChange, onDelete, disableDelete }) {
    const choicesCount = question.choices.length;

    function setPrompt(prompt) {
        onChange({ prompt });
    }

    function setTimeLimitSec(timeLimitSec) {
        onChange({ timeLimitSec });
    }

    function setSwagPoints(swagPoints) {
        onChange({ swagPoints });
    }

    function setChoiceText(choiceIndex, text) {
        const next = question.choices.map((c, i) => (i === choiceIndex ? { ...c, text } : c));
        onChange({ choices: next });
    }

    function toggleCorrect(choiceIndex, checked) {
        // single-correct version: selecting one correct clears others
        const next = question.choices.map((c, i) => ({
            ...c,
            correct: i === choiceIndex ? checked : false,
        }));
        onChange({ choices: next });
    }

    function incrementChoices() {
        if (choicesCount >= 4) return;

        const nextId = String(Date.now() + Math.random());
        const next = [...question.choices, { id: nextId, text: '', correct: false }];
        onChange({ choices: next });
    }

    function decrementChoices() {
        if (choicesCount <= 2) return;

        const next = question.choices.slice(0, choicesCount - 1);
        onChange({ choices: next });
    }

    return (
        <div className="questionCard">
            <div className="questionHeader">
                <h3>Question {index + 1}</h3>

                <button type="button" onClick={onDelete} disabled={disableDelete}>
                    Delete
                </button>
            </div>

            <label>
                Prompt
                <input
                    value={question.prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="Question title"
                />
            </label>

            <div className="metaRow">
                <label>
                    Time (sec)
                    <input
                        type="number"
                        min={5}
                        max={300}
                        value={question.timeLimitSec}
                        onChange={(e) => setTimeLimitSec(Number(e.target.value))}
                    />
                </label>

                <label>
                    Swag points
                    <input
                        type="number"
                        min={0}
                        max={100000}
                        value={question.swagPoints}
                        onChange={(e) => setSwagPoints(Number(e.target.value))}
                    />
                </label>

                <div className="choiceButtons">
                    <button type="button" onClick={decrementChoices} disabled={choicesCount <= 2}>
                        - Choice
                    </button>
                    <button type="button" onClick={incrementChoices} disabled={choicesCount >= 4}>
                        + Choice
                    </button>
                </div>
            </div>

            <div className="choicesList">
                {question.choices.map((c, i) => (
                    <div key={c.id} className="choiceRow">
                        <input
                            value={c.text}
                            onChange={(e) => setChoiceText(i, e.target.value)}
                            placeholder={`Choice ${i + 1}`}
                        />

                        <label>
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
    );
}
