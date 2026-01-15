import { useEffect, useState } from "react";
import { fetchStudentResults } from "../api/student";
import { useNavigate } from "react-router-dom";

import "./StudentDashboard.css";

/* ================= TYPES ================= */

interface StudentResult {
  quiz_id: number;
  title: string; // ✅ matches backend
  student_name?: string;
  score: number;
  total: number;
  submitted_at?: string | null;
}


/* ================= COMPONENT ================= */

export default function StudentResults() {
  const [results, setResults] = useState<StudentResult[]>([]);
  const navigate = useNavigate();


  useEffect(() => {
    const load = async () => {
      const data = await fetchStudentResults();
      setResults(data);
    };
    load();
  }, []);

  const getPercentage = (score: number, total: number) =>
    total > 0 ? Math.round((score / total) * 100) : 0;

  const getStatus = (percentage: number) =>
    percentage >= 40 ? "Passed" : "Failed";


  return (
    <div className="results-page">
      <h2 className="results-title">My Results</h2>

      <div className="results-grid">
        {results.map((r) => {
          console.log("RESULT:", r);
          const percentage = getPercentage(r.score, r.total);
          const status = getStatus(percentage);

          return (
            <div key={r.quiz_id} className="result-card">
              {/* STATUS BADGE */}
              <span className={`result-status ${status.toLowerCase()}`}>
                {status}
              </span>

              {/* QUIZ TITLE (SUBJECT NAME) */}
              <h3 className="quiz-title">{r.title}</h3>

              {/* STUDENT NAME */}
              <p className="student-name">{r.student_name}</p>

              {/* METRICS */}
              <div className="result-metrics">
                <div className="metric">
                  <span className="metric-value">
                    {r.score}/{r.total}
                  </span>
                  <span className="metric-label">Score</span>
                </div>

                <div className="metric">
                  <span className="metric-value">{percentage}%</span>
                  <span className="metric-label">Percentage</span>
                </div>
              </div>

              {/* DATE */}
              <p className="attempted-date">
                Attempted on{" "}
                {r.submitted_at
                  ? (() => {
                    const d = new Date(r.submitted_at);
                    const day = String(d.getDate()).padStart(2, "0");
                    const month = String(d.getMonth() + 1).padStart(2, "0");
                    const year = d.getFullYear();
                    return `${day}/${month}/${year}`;
                  })()
                  : "—"}
              </p>




              {/* VIEW RESULT BUTTON */}
              <button
                className="view-result-btn"
                onClick={() => navigate(`/student/results/${r.quiz_id}`)}
              >
                View Result
              </button>

            </div>
          );
        })}
      </div>
    </div>
  );
}
