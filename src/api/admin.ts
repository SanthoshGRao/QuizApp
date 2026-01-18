import api from "./axios";

export const createQuiz = async (title: string) => {
  const res = await api.post("/admin/quiz", { title });
  return res.data;
};

export const fetchQuizzes = async () => {
  const res = await api.get("/admin/quizzes");
  return res.data;
};

export const addQuestion = async (data: {
  quizId: number;
  question: string;
  options: string[];
  correctOption: string;
}) => {
  const res = await api.post("/admin/question", data);
  return res.data;
};

export const fetchQuestions = async (quizId: number) => {
  const res = await api.get(`/admin/quiz/${quizId}/questions`);
  return res.data;
};

export const updateQuestion = async (
  id: number,
  data: {
    question: string;
    options: string[];
    correctOption: string;
  }
) => {
  const res = await api.put(`/admin/question/${id}`, data);
  return res.data;
};

export const publishQuiz = async (
  quizId: number,
  data: {
    targetClass: string;
    publishAt: string;
  }
) => {
  const res = await api.patch(
    `/admin/quiz/${quizId}/publish`,
    data
  );
  return res.data;
};


export const deleteQuestion = async (id: number) => {
  const res = await api.delete(`/admin/question/${id}`);
  return res.data;
};

export const deleteQuiz = async (id: number) => {
  const res = await api.delete(`/admin/quiz/${id}`);
  return res.data;
};
