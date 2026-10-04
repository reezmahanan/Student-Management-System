import api from './axios';

export const getAtRiskStudents = () => api.get('/analytics/at-risk');

export const downloadStudentsExcel = () => {
  window.open('http://localhost:8080/api/export/students/excel', '_blank');
};

export const downloadStudentsPdf = () => {
  window.open('http://localhost:8080/api/export/students/pdf', '_blank');
};

export const downloadStudentTranscriptPdf = (studentId) => {
  window.open(`http://localhost:8080/api/export/student/${studentId}/transcript-pdf`, '_blank');
};
