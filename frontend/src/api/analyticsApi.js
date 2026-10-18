import api from './axios';

export const getAtRiskStudents = () => api.get('/analytics/at-risk');

export const downloadStudentsExcel = () => {
  window.open('/api/export/students/excel', '_blank');
};

export const downloadStudentsPdf = () => {
  window.open('/api/export/students/pdf', '_blank');
};

export const downloadStudentTranscriptPdf = (studentId) => {
  window.open(`/api/export/student/${studentId}/transcript-pdf`, '_blank');
};
