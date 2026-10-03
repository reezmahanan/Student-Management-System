import api from './axios';

export const getAllStudents = (page = 0, size = 10, search = '') => {
  const params = { page, size };
  if (search) params.search = search;
  return api.get('/students', { params });
};

export const getStudentById = (id) => api.get(`/students/${id}`);

export const createStudent = (data) => api.post('/students', data);

export const updateStudent = (id, data) => api.put(`/students/${id}`, data);

export const deleteStudent = (id) => api.delete(`/students/${id}`);

export const enrollInCourse = (studentId, courseId) =>
  api.post(`/students/${studentId}/courses/${courseId}`);

export const unenrollFromCourse = (studentId, courseId) =>
  api.delete(`/students/${studentId}/courses/${courseId}`);
