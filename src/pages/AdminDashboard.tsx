import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    fetchQuizzes,
    createQuiz,
    addQuestion,
    fetchQuestions,
    updateQuestion,
    publishQuiz,
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

type View = "DASHBOARD" | "QUIZZES" | "CREATE" | "STUDENTS" | "LOGS";



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
    const [uploading, setUploading] = useState(false);
    const [bulkFile, setBulkFile] = useState<File | null>(null);
    const [bulkResult, setBulkResult] = useState<any[] | null>(null);
    const [studentClass, setStudentClass] = useState("");

    const [studentName, setStudentName] = useState("");
    const [studentEmail, setStudentEmail] = useState("");

    const [showPublishModal, setShowPublishModal] = useState(false);
    const [publishClass, setPublishClass] = useState("");
    const [publishAt, setPublishAt] = useState("");
    const [publishQuizId, setPublishQuizId] = useState<number | null>(null);

    const [logs, setLogs] = useState<any[]>([]);
    const [logFilter, setLogFilter] = useState<"ALL" | "SUCCESS" | "FAILED" | "INFO">("ALL");
    const [expandedLogId, setExpandedLogId] = useState<number | null>(null);
    const [search, setSearch] = useState("");

    const navigate = useNavigate();

    const getQuizStatus = (quiz: any) => {
        if (!quiz.publish_at) return "Draft";

        const now = new Date();
        const publishAt = new Date(quiz.publish_at);
        const visibleUntil = new Date(quiz.visible_until);

        if (now < publishAt) return `Scheduled (${publishAt.toLocaleString()})`;
        if (now > visibleUntil) return "Expired";

        return "Live";
    };

    /* ---------------- LOADERS ---------------- */
    const loadQuizzes = async () => {
        const data = await fetchQuizzes();
        setQuizzes(data);
    };
    const loadLogs = async () => {
        try {
            const res = await api.get("/auth/logs");
            setLogs(res.data);
        } catch (err) {
            console.error("Failed to load logs", err);
        }
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

        try {
            await createQuiz(newQuizTitle);
            setNewQuizTitle("");
            await loadQuizzes();

            // ✅ POPUP MESSAGE
            alert("Quiz created successfully (saved as Draft)");
        } catch (error) {
            alert("Failed to create quiz");
        }
    };


    const handleSelectQuiz = async (quiz: Quiz) => {
        setSelectedQuiz(quiz);
        setEditingQuestion(null);
        setQuestionText("");
        setOptions(["", "", "", ""]);
        setCorrectOption("");
        await loadQuestions(quiz.id);
    };

    const handleAddStudent = async () => {
        if (!studentName || !studentEmail) return;

        try {
            await api.post("/admin/students", {
                name: studentName,
                email: studentEmail,
                class: studentClass,
            });


            setStudentName("");
            setStudentEmail("");
            setStudentClass("");
            alert("Student added successfully");
        } catch (err: any) {
            const msg =
                err.response?.data?.message || "Failed to add student";

            alert(msg);
        }
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
    const filteredLogs = logs.filter((log) => {
  const searchText = search.toLowerCase();

  const matchesSearch =
  !searchText ||
  log.action?.toLowerCase().includes(searchText) ||
  log.message?.toLowerCase().includes(searchText) ||
  log.status?.toLowerCase().includes(searchText) ||

  // 👇 student-related
  log.metadata?.name?.toLowerCase().includes(searchText) ||
  log.metadata?.email?.toLowerCase().includes(searchText) ||
  log.metadata?.class?.toLowerCase().includes(searchText) ||

  // 👇 quiz-related (THIS WAS MISSING)
  log.metadata?.title?.toLowerCase().includes(searchText);


  const matchesStatus =
    logFilter === "ALL" || log.status === logFilter;

  return matchesSearch && matchesStatus;
});

    const groupedLogs = filteredLogs.reduce((acc: any, log: any) => {
  const dateKey = new Date(log.created_at).toLocaleDateString();

  if (!acc[dateKey]) acc[dateKey] = [];
  acc[dateKey].push(log);

  return acc;
}, {});


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
                <button
                    className={view === "LOGS" ? "active" : ""}
                    onClick={() => {
                        setView("LOGS");
                        loadLogs();
                    }}
                >
                    Logs
                </button>

                <div className="spacer" />
                <button className="logout" onClick={() => logout(navigate)}>
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

                        <input
                            placeholder="Class"
                            value={studentClass}
                            onChange={(e) => setStudentClass(e.target.value)}
                        />


                        <p className="muted">
                            Default password will be the student’s name
                        </p>

                        <button onClick={handleAddStudent}>
                            Add Student
                        </button>
                        <hr style={{ margin: "24px 0" }} />

                        <h3>Bulk Upload Students</h3>

                        <p className="muted">
                            Upload a CSV or Excel file containing <b>name</b> and <b>email</b>
                        </p>

                        <div className="bulk-upload-box">
                            <label className="file-picker">
                                <input
                                    type="file"
                                    accept=".csv,.xlsx"
                                    hidden
                                    disabled={uploading}
                                    onChange={(e) => {
                                        if (e.target.files?.[0]) {
                                            setBulkFile(e.target.files[0]);
                                        }
                                    }}
                                />

                                <span className="file-picker-btn">
                                    <i className="fa-solid fa-file-arrow-up" />
                                    Choose File
                                </span>
                            </label>

                            <span className="file-name">
                                {bulkFile ? bulkFile.name : "No file selected"}
                            </span>
                        </div>

                        <button
                            className="primary"
                            disabled={!bulkFile || uploading}
                            style={{ marginTop: 16 }}
                            onClick={async () => {
                                if (!bulkFile) return;

                                const formData = new FormData();
                                formData.append("file", bulkFile);

                                try {
                                    setUploading(true);

                                    const res = await api.post(
                                        "/admin/students/bulk",
                                        formData,
                                        {
                                            headers: {
                                                "Content-Type": "multipart/form-data",
                                            },
                                        }
                                    );

                                    setBulkResult(res.data.results);
                                    setBulkFile(null);

                                } catch (err: any) {
                                    alert(err.response?.data?.message || "Bulk upload failed");
                                } finally {
                                    setUploading(false);
                                }
                            }}
                        >
                            {uploading ? "Uploading…" : "Upload Students"}
                        </button>

                        <p className="hint">
                            Supported formats: <b>.csv</b>, <b>.xlsx</b>
                        </p>


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
                                                <span className={`quiz-status ${getQuizStatus(q).toLowerCase()}`}>
                                                    {getQuizStatus(q)}
                                                </span>

                                            </div>

                                            <div className="quiz-actions">
                                                {getQuizStatus(q) === "Draft" && (
                                                    <button
                                                        className="secondary"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            setPublishQuizId(q.id);
                                                            setPublishClass("");
                                                            setPublishAt("");
                                                            setShowPublishModal(true);
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
                {view === "LOGS" && (
                    <div className="logs-page">
                        {/* HEADER */}
                        <div className="logs-header">
                            <div>
                                <h2>System Logs</h2>
                                <p className="logs-subtitle">
                                    All admin and system level activities
                                </p>
                            </div>
                            <div className="logs-toolbar">
                                <div className="logs-search-bar">
                                    <svg
                                        className="logs-search-icon"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                    >
                                        <circle cx="11" cy="11" r="8" />
                                        <line x1="21" y1="21" x2="16.65" y2="16.65" />
                                    </svg>

                                    <input
                                        type="text"
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                        placeholder="Search by name, class, email, action or status"
                                        className="logs-search-input"
                                    />
                                </div>

                            </div>


                        </div>

                        <div className="logs-card">
                            {/* FILTERS */}
                            <div className="log-filters">
                                {["ALL", "SUCCESS", "FAILED", "INFO"].map((f) => (
                                    <button
                                        key={f}
                                        className={`filter-pill ${logFilter === f ? "active" : ""}`}
                                        onClick={() => setLogFilter(f as any)}
                                    >
                                        {f}
                                    </button>
                                ))}
                            </div>

                            {/* LOG LIST */}
                            {Object.keys(groupedLogs).length === 0 ? (
                                <p className="muted">No logs found</p>
                            ) : (
                                Object.entries(groupedLogs).map(([date, logs]) => (
                                    <div key={date} className="log-group">
                                        <h4>{date}</h4>

                                        {(logs as any[]).map((log) => (
                                            <div
                                                key={log.id}
                                                className="log-row"
                                                onClick={() =>
                                                    setExpandedLogId(
                                                        expandedLogId === log.id ? null : log.id
                                                    )
                                                }
                                            >
                                                {/* SINGLE LINE */}
                                                <div className="log-line">
                                                    <span className={`status-dot ${log.status.toLowerCase()}`} />

                                                    <div className="log-main">
                                                        <strong>{log.action}</strong>
                                                        <span className="log-text">
                                                            {log.metadata?.name ?? "System"} — {log.message}
                                                        </span>
                                                    </div>

                                                    <span className="log-time">
                                                        {new Date(log.created_at).toLocaleTimeString()}
                                                    </span>
                                                </div>

                                                {/* EXPANDED */}
                                                {expandedLogId === log.id && (
                                                    <div className="log-expanded">
                                                        <div className="log-detail-grid">
                                                            <div>
                                                                <span className="label">Action</span>
                                                                <span className="value">{log.action}</span>
                                                            </div>

                                                            <div>
                                                                <span className="label">Status</span>
                                                                <span className={`value status ${log.status.toLowerCase()}`}>
                                                                    {log.status}
                                                                </span>
                                                            </div>

                                                            <div>
                                                                <span className="label">Actor</span>
                                                                <span className="value">
                                                                    {log.actor_role ?? "SYSTEM"}{" "}
                                                                    {log.actor_id ? `(#${log.actor_id})` : ""}
                                                                </span>
                                                            </div>

                                                            <div>
                                                                <span className="label">Target</span>
                                                                <span className="value">
                                                                    {log.target_type ?? "-"}{" "}
                                                                    {log.target_id ? `(#${log.target_id})` : ""}
                                                                </span>
                                                            </div>

                                                            <div className="full">
                                                                <span className="label">Message</span>
                                                                <span className="value">{log.message}</span>
                                                            </div>

                                                            {log.metadata && (
                                                                <div className="full metadata">
                                                                    <span className="label">Metadata</span>
                                                                    <pre>{JSON.stringify(log.metadata, null, 2)}</pre>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                )}

                                            </div>
                                        ))}
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                )}


                {bulkResult && (
                    <div className="modal-overlay">
                        <div className="modal refined-modal">
                            {/* HEADER */}
                            <div className="modal-header">
                                <h3>Bulk Upload Result</h3>
                                <button
                                    className="close-btn"
                                    onClick={() => setBulkResult(null)}
                                >
                                    ✕
                                </button>
                            </div>

                            {/* SUMMARY */}
                            <div className="modal-summary">
                                <span className="success-badge">
                                    ✓ {bulkResult.filter(r => r.status === "SUCCESS").length} Added
                                </span>
                                <span className="failed-badge">
                                    ✕ {bulkResult.filter(r => r.status === "FAILED").length} Failed
                                </span>
                            </div>

                            {/* LIST */}
                            <div className="result-list refined-list">
                                {bulkResult.map((r, i) => (
                                    <div
                                        key={i}
                                        className={`result-row refined-row ${r.status === "SUCCESS" ? "success" : "failed"}`}
                                    >
                                        <div className="student-info">
                                            <strong>{r.name}</strong>
                                            <span className="email-text">{r.email}</span>
                                        </div>

                                        <span className={`status-pill ${r.status.toLowerCase()}`}>
                                            {r.status === "SUCCESS" ? "Added" : r.reason}
                                        </span>
                                    </div>
                                ))}
                            </div>

                            {/* FOOTER */}
                            <div className="modal-footer">
                                <button
                                    className="primary"
                                    onClick={() => setBulkResult(null)}
                                >
                                    Done
                                </button>
                            </div>
                        </div>
                    </div>
                )}
                {showPublishModal && (
                    <div className="modal-overlay">
                        <div className="publish-modal">
                            {/* Header */}
                            <div className="publish-header">
                                <h3>Publish Quiz</h3>
                                <p className="publish-subtitle">
                                    Choose who can access this quiz and when it becomes live
                                </p>
                            </div>

                            {/* Form */}
                            <div className="publish-form">
                                {/* Class Selection */}
                                <div className="form-group">
                                    <label>Target Class</label>
                                    <select
                                        value={publishClass}
                                        onChange={(e) => setPublishClass(e.target.value)}
                                    >
                                        <option value="">Select class</option>
                                        <option value="6">Class 6</option>
                                        <option value="7">Class 7</option>
                                        <option value="8">Class 8</option>
                                        <option value="9">Class 9</option>
                                        <option value="10">Class 10</option>
                                    </select>
                                </div>

                                {/* Date Time */}
                                <div className="form-group">
                                    <label>Publish Date & Time</label>

                                    <div className="datetime-wrapper">
                                        <input
                                            type="datetime-local"
                                            value={publishAt}
                                            onChange={(e) => setPublishAt(e.target.value)}
                                            className="datetime-input"
                                        />
                                    </div>

                                    <span className="hint-text">
                                        Quiz will be available for 1 hour from this time
                                    </span>
                                </div>

                            </div>

                            {/* Footer */}
                            <div className="publish-actions">
                                <button
                                    className="btn-secondary"
                                    onClick={() => setShowPublishModal(false)}
                                >
                                    Cancel
                                </button>

                                <button
                                    className="btn-primary"
                                    disabled={!publishClass || !publishAt}
                                    onClick={async () => {
                                        if (!publishQuizId) return;

                                        await publishQuiz(publishQuizId, {
                                            targetClass: publishClass,
                                            publishAt,
                                        });

                                        setShowPublishModal(false);
                                        await loadQuizzes();
                                    }}
                                >
                                    Schedule Quiz
                                </button>
                            </div>
                        </div>
                    </div>

                )}


            </main>
        </div>
    );
}
