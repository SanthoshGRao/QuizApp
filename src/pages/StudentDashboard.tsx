import { useEffect, useState } from "react";
import { fetchStudentDashboard } from "../api/student";
import "./StudentDashboard.css";
interface Recent {
  title: string;
  score: number;
  total: number;
}

interface DashboardData {
  totalQuizzes: number;
  completed: number;
  averageScore: number;
  recent: Recent[];
}

export default function StudentDashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ✅ ONLY ONE useEffect, ALWAYS CALLED
  useEffect(() => {
    fetchStudentDashboard()
      .then((res) => {
        console.log("Dashboard API response:", res);
        setData(res);
      })
      .catch((err) => {
        console.error("Dashboard API error:", err);
        setError("Failed to load dashboard");
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  // ✅ SAFE RETURNS (AFTER hooks)
  if (loading) {
    return (
      <div className="dashboard">
        <h1 className="page-title">Dashboard</h1>
        <p className="page-subtitle">Loading your data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard">
        <h1 className="page-title">Dashboard</h1>
        <p className="page-subtitle">{error}</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="dashboard">
        <h1 className="page-title">Dashboard</h1>
        <p className="page-subtitle">No data available</p>
      </div>
    );
  }

  // ✅ NORMAL RENDER
  return (
    <div className="dashboard">
      <h1 className="page-title">Dashboard</h1>
      <p className="page-subtitle">
        View your quizzes, progress, and recent activity
      </p>

      <div className="stats">
        <div className="stat-card">
          <span>Total Quizzes</span>
          <h4>{data.totalQuizzes}</h4>
        </div>

        <div className="stat-card">
          <span>Completed</span>
          <h4>{data.completed}</h4>
        </div>

        <div className="stat-card">
          <span>Average Score</span>
          <h4>{data.averageScore}%</h4>
        </div>
      </div>

      <div className="activity-card">
        <h3 className="activity-title">Recent Activity</h3>

        {data.recent.length === 0 ? (
          <p>No quiz attempts yet</p>
        ) : (
          data.recent.map((r, i) => (
            <div key={i} className="activity-item">
              <span>{r.title}</span>
              <span className="activity-score">
                {r.score} / {r.total}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
