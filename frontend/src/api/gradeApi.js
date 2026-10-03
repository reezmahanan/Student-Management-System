import api from './axios';

export const recordGrade = (data) => api.post('/grades', data);
export const updateGrade = (id, data) => api.put(`/grades/${id}`, data);
export const deleteGrade = (id) => api.delete(`/grades/${id}`);
export const getGradesByStudent = (studentId) => api.get(`/grades/student/${studentId}`);
export const getGradesByCourse = (courseId) => api.get(`/grades/course/${courseId}`);
export const getStudentGPA = (studentId) => api.get(`/grades/student/${studentId}/gpa`);
