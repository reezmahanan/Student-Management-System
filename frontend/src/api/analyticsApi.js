import api from './axios';

export const getAtRiskStudents = () => api.get('/analytics/at-risk');

export const downloadStudentsExcel = () => {
  window.open('http://localhost:8080/api/export/students/excel', '_blank');
};

export const downloadStudentsCsv = () => {
  window.open('http://localhost:8080/api/export/students/csv', '_blank');
};
