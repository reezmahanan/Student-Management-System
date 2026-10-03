import api from './axios';

export const markAttendance = (data) => api.post('/attendance', data);
export const bulkMarkAttendance = (data) => api.post('/attendance/bulk', data);
export const getAttendanceByStudent = (studentId) => api.get(`/attendance/student/${studentId}`);
export const getAttendanceByCourse = (courseId, date) =>
  api.get(`/attendance/course/${courseId}${date ? `?date=${date}` : ''}`);
export const getStudentAttendanceRate = (studentId) => api.get(`/attendance/student/${studentId}/rate`);
