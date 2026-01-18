import { Outlet, NavLink } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { logout } from "../auth/auth";
import "./StudentDashboard.css";

export default function StudentLayout() {
  const userName = localStorage.getItem("name") || "Student";
  const userRole = localStorage.getItem("role") || "STUDENT";
  const navigate = useNavigate();

  return (
    <div className="student-container">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="logo">QuizApp</div>

        <nav className="nav">
          <NavLink to="/student" end className="nav-link">
            Dashboard
          </NavLink>

          <NavLink to="/student/quizzes" className="nav-link">
            Quizzes
          </NavLink>

          <NavLink to="/student/results" className="nav-link">
            Results
          </NavLink>
        </nav>

        {/* Logout */}
        <div className="sidebar-footer">
          <button className="logout-btn" onClick={() => logout(navigate)}>
            <i className="fa-solid fa-right-from-bracket" />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="main">
        {/* Header */}
        <header className="header">
          <div className="header-title">Student Portal</div>

          <div className="header-right">
            <div className="profile">
              <div className="avatar">
                {userName.charAt(0).toUpperCase()}
              </div>

              <div className="profile-info">
                <span className="profile-name">
                  {userName.charAt(0).toUpperCase() + userName.slice(1)}
                </span>
                <span className="profile-role">
                  {userRole === "STUDENT" ? "Student" : userRole}
                </span>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
