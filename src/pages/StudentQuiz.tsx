import { useEffect, useRef, useState } from "react";
import {
  fetchQuizzes,
  fetchQuizDetails,
  submitQuiz,
  fetchStudentResults,
} from "../api/student";
import "./StudentDashboard.css";

/* ================= TYPES ================= */

interface Quiz {
  id: number;
  title: string;
}

interface Question {
  id: number;
  question_text: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  shuffledOptions?: string[];
}

/* ================= CONSTANTS ================= */

const QUESTION_TIME = 30;

/* ================= COMPONENT ================= */

export default function StudentQuiz() {
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [attempted, setAttempted] = useState<any[]>([]);

  const [selectedQuiz, setSelectedQuiz] = useState<Quiz | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});

  const [timeLeft, setTimeLeft] = useState(QUESTION_TIME);
  const [showSuccess, setShowSuccess] = useState(false);

  const timerRef = useRef<number | null>(null);

  const currentQuestion = questions[currentIndex];

  /* ================= HELPERS ================= */

  const shuffleArray = <T,>(arr: T[]) =>
    [...arr].sort(() => Math.random() - 0.5);

  /* ================= LOAD DATA ================= */

  const loadData = async () => {
    const allQuizzes = await fetchQuizzes();
    const results = await fetchStudentResults();
    setQuizzes(allQuizzes);
    setAttempted(results);
  };

  useEffect(() => {
    loadData();
  }, []);

  /* ================= TIMER ================= */

  useEffect(() => {
    if (!currentQuestion || showSuccess) return;

    setTimeLeft(QUESTION_TIME);

    if (timerRef.current) clearInterval(timerRef.current);

    timerRef.current = window.setInterval(() => {
      setTimeLeft((t) => t - 1);
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [currentIndex, currentQuestion, showSuccess]);

  useEffect(() => {
    if (!currentQuestion) return;

    if (timeLeft <= 0) {
      if (currentIndex === questions.length - 1) {
        handleSubmit();
      } else {
        setCurrentIndex((i) => i + 1);
      }
    }
  }, [timeLeft]);

  /* ================= QUIZ FLOW ================= */

  const openQuiz = async (quiz: Quiz) => {
    setSelectedQuiz(quiz);
    setCurrentIndex(0);
    setAnswers({});
    setShowSuccess(false);

    const data = await fetchQuizDetails(quiz.id);
    setQuestions(
      data.questions.map((q: Question) => ({
        ...q,
        shuffledOptions: shuffleArray([
          q.option_a,
          q.option_b,
          q.option_c,
          q.option_d,
        ]),
      }))
    );
  };

  const handleSubmit = async () => {
    if (!selectedQuiz) return;

    if (timerRef.current) clearInterval(timerRef.current);

    await submitQuiz({
      quizId: selectedQuiz.id,
      answers: questions.map((q) => ({
        questionId: q.id,
        selectedOption: answers[q.id] ?? "",
      })),
    });

    setShowSuccess(true);
    setSelectedQuiz(null);
    setQuestions([]);
    await loadData();
  };

  /* ================= UI ================= */

  return (
    <div className="quiz-page">
      {showSuccess && (
        <div className="success-overlay">
          <div className="success-card">
            <h3>🎉 Quiz Submitted</h3>
            <p>Your answers were submitted successfully.</p>
            <button onClick={() => setShowSuccess(false)}>Continue</button>
          </div>
        </div>
      )}

      {!selectedQuiz && !showSuccess && (
        <div className="quiz-list-page">
  <h2>Available Quizzes</h2>

  {quizzes.filter((q) => !attempted.some((a) => a.quiz_id === q.id)).length === 0 ? (
    <div className="no-quiz-card">
      <p className="no-quiz-text">You don't have any quizzes for now</p>
    </div>
  ) : (
    <div className="quiz-list-grid">
      {quizzes
        .filter((q) => !attempted.some((a) => a.quiz_id === q.id))
        .map((q) => (
          <div key={q.id} className="quiz-card">
            <h3>{q.title}</h3>
            <span className="quiz-tag">MCQ</span>
            <button onClick={() => openQuiz(q)}>Start Quiz</button>
          </div>
        ))}
    </div>
  )}
</div>

      )}

      {currentQuestion && !showSuccess && (
        <div className="quiz-fullscreen">
          <div className="question-card">
            <div className="question-header">
              <div className="timer-wrapper">
                <div
                  className="timer-bar"
                  style={{
                    width: `${(timeLeft / QUESTION_TIME) * 100}%`,
                  }}
                />
                <span>{timeLeft}s</span>
              </div>

              <span className="question-count">
                Question {currentIndex + 1} / {questions.length}
              </span>
            </div>

            <p className="question-text">
              {currentQuestion.question_text}
            </p>

            <div className="options-grid">
              {currentQuestion.shuffledOptions?.map((opt, idx) => (
                <div
                  key={opt}
                  className={`option ${
                    answers[currentQuestion.id] === opt ? "selected" : ""
                  }`}
                  onClick={() =>
                    setAnswers({
                      ...answers,
                      [currentQuestion.id]: opt,
                    })
                  }
                >
                  <span className="option-label">
                    {String.fromCharCode(65 + idx)}
                  </span>
                  {opt}
                </div>
              ))}
            </div>

            <div className="quiz-nav">
              <button
                disabled={currentIndex === 0}
                onClick={() => setCurrentIndex((i) => i - 1)}
              >
                Previous
              </button>

              <button
                onClick={() =>
                  currentIndex === questions.length - 1
                    ? handleSubmit()
                    : setCurrentIndex((i) => i + 1)
                }
              >
                {currentIndex === questions.length - 1
                  ? "Submit"
                  : "Next"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
