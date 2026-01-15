import api from "./axios";

export const fetchQuizzes = async () => {
  const res = await api.get("/student/quizzes");
  return res.data;
};

export const fetchQuizDetails = async (quizId: number) => {
  const res = await api.get(`/student/quiz/${quizId}`);
  return res.data;
};

export const submitQuiz = async (data: {
  quizId: number;
  answers: { questionId: number; selectedOption: string }[];
}) => {
  const res = await api.post("/student/submit", data);
  return res.data;
};
export const fetchQuizResult = async (quizId: number) => {
  const res = await api.get(`/student/quiz/${quizId}/result`);
  return res.data;
};


export const fetchStudentDashboard = async () => {
  const res = await api.get("/student/dashboard");
  return res.data;
};
export const fetchStudentResults = async () => {
  const res = await api.get("/student/results");
  return res.data;
};
export const logViolation = async (data: {
  quizId: number;
  type: string;
}) => {
  await api.post("/student/violation", data);
};
