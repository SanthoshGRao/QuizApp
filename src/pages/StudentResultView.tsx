import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { fetchQuizResult } from "../api/student";
import { hashAnswer } from "../utils/hashAnswer";
import "./StudentDashboard.css";

export default function StudentResultView() {
  const { quizId } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    if (quizId) {
      fetchQuizResult(Number(quizId)).then(setData);
    }
  }, [quizId]);

  if (!data) return <p>Loading result...</p>;

  return (
    <div className="result-view">
      <div className="result-header">
        <h2>Result Summary</h2>
        <p className="score-text">
          Score: <strong>{data.score}</strong> / {data.total}
        </p>
        <p className="percent-text">
          Percentage:{" "}
          {Math.round((data.score / data.total) * 100)}%
        </p>
      </div>

      {data.questions.map((q: any, index: number) => (
        <div key={q.id} className="question-review">
          <h4>
            {index + 1}. {q.question_text}
          </h4>

          {[q.option_a, q.option_b, q.option_c, q.option_d].map((opt: string) => {
            const optHash = hashAnswer(opt);
            const isCorrect = optHash === q.correct_answer_hash;
            const isSelected = optHash === q.selected_answer_hash;

            let className = "review-option";
            if (isCorrect) className += " correct";
            else if (isSelected) className += " wrong";

            return (
              <div key={opt} className={className}>
                {opt}
              </div>
            );
          })}
        </div>
      ))}

      <button
        className="back-btn"
        onClick={() => navigate("/student/results")}
      >
        ← Back to Results
      </button>
    </div>
  );
}
