import { HashRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import AdminDashboard from "./pages/AdminDashboard";
import StudentQuiz from "./pages/StudentQuiz";
import ResetPassword from "./pages/ResetPassword";
import ProtectedRoute from "./auth/ProtectedRoute";
import PublicRoute from "./auth/PublicRoute";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPasswordToken from "./pages/ResetPasswordToken";
import StudentLayout from "./pages/StudentLayout";
import StudentDashboard from "./pages/StudentDashboard";
import StudentResults from "./pages/StudentResults";
import StudentResultView from "./pages/StudentResultView";

function App() {
  return (
    <HashRouter>
      <Routes>
        <Route
          path="/"
          element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          }
        />

        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password-token" element={<ResetPasswordToken />} />
        <Route path="/reset-password" element={<ResetPassword />} />

        <Route
          path="/admin"
          element={
            <ProtectedRoute role="ADMIN">
              <AdminDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/student"
          element={
            <ProtectedRoute role="STUDENT">
              <StudentLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<StudentDashboard />} />
          <Route path="quizzes" element={<StudentQuiz />} />
          <Route path="results" element={<StudentResults />} />
          <Route path="results/:quizId" element={<StudentResultView />} />
        </Route>
      </Routes>
    </HashRouter>
  );
}

export default App;
