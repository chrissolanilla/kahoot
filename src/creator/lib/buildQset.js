export function buildQset(quiz, globalOptions = { showAnswers: true, lives: 3 }) {
    return {
        version: 1,
        data: {
            items: quiz.questions.map((q) => {
                return {
                    materiaType: 'question',
                    type: 'kahoot',
                    id: 0,
                    questions: [{ text: q.prompt.trim() }],
                    answers: q.choices.map((c) => ({
                        text: c.text.trim(),
                        value: c.correct ? 100 : 0,
                        swag_points: c.correct ? Number(q.swagPoints) : 0,
                    })),
                    options: {
                        time: Number(q.timeLimitSec) * 1000, // ms
                    },
                };
            }),
            options: {
                showAnswers: !!globalOptions.showAnswers,
                lives: Number(globalOptions.lives),
            },
        },
    };
}
