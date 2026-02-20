from scoring.module import ScoreModule
import json

from core.models import WidgetQset

class KahootScoreModule(ScoreModule):
    def check_answer(self, log):
        question = self.get_question_by_item_id(log.item_id)
        print("Question", question)
        if not question:
            return 0

        submitted_text = log.text if hasattr(log, "text") else log.get("text", "")
        submitted_text = (submitted_text or "").strip()
        print("Submitted text: ", submitted_text)

        if submitted_text in ("TIME_UP", ""):
            return 0

        # find best answer value
        answers = question.get("answers", [])
        if not answers:
            return 0
        max_val = max(int(a.get("value", 0)) for a in answers)

        correct_texts = {
                (a.get("text") or "").strip() for a in answers if int(a.get("value", 0)) == max_val
        }
        print("Correct texts", correct_texts)

        return 100 if submitted_text in correct_texts else 0
