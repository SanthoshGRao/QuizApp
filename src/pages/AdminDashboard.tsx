import { useEffect, useState } from "react";
import {
    fetchQuizzes,
    createQuiz,
    addQuestion,
    fetchQuestions,
    updateQuestion,
    toggleQuizPublish,
    deleteQuestion,
    deleteQuiz,
} from "../api/admin";
import { logout } from "../auth/auth";
import "./AdminDashboard.css";
import api from "../api/axios";

interface Quiz {
    id: number;
    title: string;
    is_active: boolean;
    has_submissions: boolean;
}

interface Question {
    id: number;
    question_text: string;
    option_a: string;
    option_b: string;
    option_c: string;
    option_d: string;
}

type View = "DASHBOARD" | "QUIZZES" | "CREATE" | "STUDENTS";


export default function AdminDashboard() {
    const [view, setView] = useState<View>("DASHBOARD");

    const [quizzes, setQuizzes] = useState<Quiz[]>([]);
    const [selectedQuiz, setSelectedQuiz] = useState<Quiz | null>(null);

    const [questions, setQuestions] = useState<Question[]>([]);
    const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);

    const [newQuizTitle, setNewQuizTitle] = useState("");

    const [questionText, setQuestionText] = useState("");
    const [options, setOptions] = useState<string[]>(["", "", "", ""]);
    const [correctOption, setCorrectOption] = useState("");

    const [studentName, setStudentName] = useState("");
    const [studentEmail, setStudentEmail] = useState("");


    /* ---------------- LOADERS ---------------- */
    const loadQuizzes = async () => {
        const data = await fetchQuizzes();
        setQuizzes(data);
    };

    const loadQuestions = async (quizId: number) => {
        const data = await fetchQuestions(quizId);
        setQuestions(data);
    };

    useEffect(() => {
        loadQuizzes();
    }, []);

    /* ---------------- HANDLERS ---------------- */
    const handleCreateQuiz = async () => {
        if (!newQuizTitle.trim()) return;
        await createQuiz(newQuizTitle);
        setNewQuizTitle("");
        await loadQuizzes();
    };

    const handleSelectQuiz = async (quiz: Quiz) => {
        setSelectedQuiz(quiz);
        setEditingQuestion(null);
        setQuestionText("");
        setOptions(["", "", "", ""]);
        setCorrectOption("");
        await loadQuestions(quiz.id);
    };

    const handleTogglePublish = async (quiz: Quiz) => {
        await toggleQuizPublish(quiz.id, !quiz.is_active);
        await loadQuizzes();
    };
    const handleAddStudent = async () => {
        if (!studentName || !studentEmail) return;

        await api.post("/admin/students", {
            name: studentName,
            email: studentEmail,
        });

        setStudentName("");
        setStudentEmail("");
        alert("Student added");
    };


    const handleAddQuestion = async () => {
        if (!selectedQuiz) return;

        await addQuestion({
            quizId: selectedQuiz.id,
            question: questionText,
            options,
            correctOption,
        });

        setQuestionText("");
        setOptions(["", "", "", ""]);
        setCorrectOption("");

        await loadQuestions(selectedQuiz.id);
    };

    const handleEditSave = async () => {
        if (!editingQuestion || !selectedQuiz) return;

        await updateQuestion(editingQuestion.id, {
            question: questionText,
            options,
            correctOption,
        });

        setEditingQuestion(null);
        setQuestionText("");
        setOptions(["", "", "", ""]);
        setCorrectOption("");

        await loadQuestions(selectedQuiz.id);
    };

    const startEditing = (q: Question) => {
        setEditingQuestion(q);
        setQuestionText(q.question_text);
        setOptions([q.option_a, q.option_b, q.option_c, q.option_d]);
        setCorrectOption("");
    };

    /* ---------------- UI ---------------- */
    return (
        <div className="admin-container">
            {/* SIDEBAR */}
            <aside className="sidebar">
                <h2>Admin Panel</h2>

                <button
                    className={view === "DASHBOARD" ? "active" : ""}
                    onClick={() => {
                        setView("DASHBOARD");
                        setSelectedQuiz(null);
                    }}
                >
                    Dashboard
                </button>

                <button
                    className={view === "QUIZZES" ? "active" : ""}
                    onClick={() => setView("QUIZZES")}
                >
                    Quizzes
                </button>

                <button
                    className={view === "CREATE" ? "active" : ""}
                    onClick={() => setView("CREATE")}
                >
                    Create Quiz
                </button>
                <button
                    className={view === "STUDENTS" ? "active" : ""}
                    onClick={() => setView("STUDENTS")}
                >
                    Students
                </button>


                <div className="spacer" />
                <button className="logout" onClick={logout}>
                    Logout
                </button>
            </aside>

            {/* MAIN */}
            <main className="content">
                {view === "STUDENTS" && (
                    <div className="card" style={{ maxWidth: 500 }}>
                        <h3>Add Student</h3>

                        <input
                            placeholder="Student name"
                            value={studentName}
                            onChange={(e) => setStudentName(e.target.value)}
                        />

                        <input
                            placeholder="Student email"
                            value={studentEmail}
                            onChange={(e) => setStudentEmail(e.target.value)}
                        />

                        <p className="muted">
                            Default password will be the student’s name
                        </p>

                        <button onClick={handleAddStudent}>
                            Add Student
                        </button>
                    </div>
                )}

                <div className="page">
                    {/* DASHBOARD */}
                    {view === "DASHBOARD" && (
                        <>
                            <h2>Dashboard</h2>
                            <div className="stats">
                                <div className="stat-card">
                                    <span>Total Quizzes</span>
                                    <h4>{quizzes.length}</h4>
                                </div>
                                <div className="stat-card">
                                    <span>Published</span>
                                    <h4>{quizzes.filter((q) => q.is_active).length}</h4>
                                </div>
                            </div>
                        </>
                    )}

                    {/* CREATE */}
                    {view === "CREATE" && (
                        <div className="card" style={{ maxWidth: 480 }}>
                            <h3>Create New Quiz</h3>
                            <input
                                placeholder="Quiz title"
                                value={newQuizTitle}
                                onChange={(e) => setNewQuizTitle(e.target.value)}
                            />
                            <button onClick={handleCreateQuiz}>Create Quiz (Draft)</button>
                        </div>
                    )}

                    {/* QUIZZES */}
                    {view === "QUIZZES" && (
                        <div className="quiz-split-layout">
                            {/* LEFT */}
                            <div className="quiz-left">
                                <h3>Quizzes</h3>
                                <div className="quiz-list">
                                    {quizzes.map((q) => (
                                        <div
                                            key={q.id}
                                            className={`quiz-card ${selectedQuiz?.id === q.id ? "active" : ""
                                                } ${q.is_active ? "published" : "draft"}`}
                                            onClick={() => handleSelectQuiz(q)}
                                        >
                                            <div className="quiz-info">
                                                <h4>{q.title}</h4>
                                                <span>{q.is_active ? "Published" : "Draft"}</span>
                                            </div>

                                            <div className="quiz-actions">
                                                {!q.is_active && (
                                                    <button
                                                        className="secondary"
                                                        onClick={(e) => {
                                                            e.stopPropagation();

                                                            const confirmPublish = window.confirm(
                                                                "⚠️ Publishing is final.\n\n" +
                                                                "• You cannot edit questions\n" +
                                                                "• You cannot delete this quiz\n\n" +
                                                                "Do you want to publish?"
                                                            );

                                                            if (!confirmPublish) return;

                                                            handleTogglePublish(q);
                                                        }}
                                                    >
                                                        Publish
                                                    </button>
                                                )}


                                                {!q.is_active && !q.has_submissions && (
                                                    <button
                                                        className="danger"
                                                        onClick={async (e) => {
                                                            e.stopPropagation();
                                                            if (!window.confirm("Delete this quiz?")) return;

                                                            await deleteQuiz(q.id);
                                                            await loadQuizzes();
                                                            setSelectedQuiz(null);
                                                        }}
                                                    >
                                                        Delete
                                                    </button>
                                                )}

                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* RIGHT */}
                            <div className="quiz-right">
                                {!selectedQuiz ? (
                                    <div className="empty-state">
                                        <h3>Select a quiz</h3>
                                        <p>Choose a quiz to see questions</p>
                                    </div>

                                ) : (
                                    <>
                                        <span className={`badge ${selectedQuiz.is_active ? "published" : "draft"}`}>
                                            {selectedQuiz.is_active ? "Published" : "Draft"}
                                        </span>

                                        <h2>{selectedQuiz.title}</h2>

                                        <div className="questions-container">
                                            <h3>Questions</h3>

                                            {questions.length === 0 && (
                                                <p className="muted">No questions added yet.</p>
                                            )}

                                            {questions.map((q, i) => (
                                                <div key={q.id} className="question-card">
                                                    <div className="question-header">
                                                        <strong>Q{i + 1}.</strong> {q.question_text}
                                                    </div>

                                                    <ul className="options">
                                                        <li>A. {q.option_a}</li>
                                                        <li>B. {q.option_b}</li>
                                                        <li>C. {q.option_c}</li>
                                                        <li>D. {q.option_d}</li>
                                                    </ul>

                                                    <div className="question-actions">
                                                        {!selectedQuiz.is_active && !selectedQuiz.has_submissions && (
                                                            <button
                                                                className="secondary"
                                                                onClick={() => startEditing(q)}
                                                            >
                                                                Edit
                                                            </button>
                                                        )}



                                                        {!selectedQuiz.is_active && !selectedQuiz.has_submissions && (
                                                            <button
                                                                className="danger"
                                                                onClick={async () => {
                                                                    if (!window.confirm("Delete this question?")) return;
                                                                    await deleteQuestion(q.id);
                                                                    await loadQuestions(selectedQuiz.id);
                                                                }}
                                                            >
                                                                Delete
                                                            </button>
                                                        )}


                                                    </div>
                                                </div>
                                            ))}
                                        </div>

                                        {!selectedQuiz.is_active && !selectedQuiz.has_submissions && (
                                            <div className="card add-question-card">

                                                <h3>
                                                    {editingQuestion ? "Edit Question" : "Add Question"}
                                                </h3>

                                                <input
                                                    placeholder="Question text"
                                                    value={questionText}
                                                    onChange={(e) => setQuestionText(e.target.value)}
                                                />

                                                {options.map((opt, i) => (
                                                    <input
                                                        key={i}
                                                        placeholder={`Option ${i + 1}`}
                                                        value={opt}
                                                        onChange={(e) => {
                                                            const copy = [...options];
                                                            copy[i] = e.target.value;
                                                            setOptions(copy);
                                                        }}
                                                    />
                                                ))}

                                                <input
                                                    placeholder="Correct option (exact text)"
                                                    value={correctOption}
                                                    onChange={(e) => setCorrectOption(e.target.value)}
                                                />

                                                {editingQuestion ? (
                                                    <button onClick={handleEditSave}>Save Changes</button>
                                                ) : (
                                                    <button onClick={handleAddQuestion}>Add Question</button>
                                                )}
                                            </div>
                                        )}
                                    </>
                                )}
                            </div>
                        </div>
                    )}

                </div>

            </main>
        </div>
    );
}
