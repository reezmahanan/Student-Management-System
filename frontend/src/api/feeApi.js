import api from './axios';

export const getAllFees = () => api.get('/fees');
export const createInvoice = (data) => api.post('/fees', data);
export const getFeesByStudent = (studentId) => api.get(`/fees/student/${studentId}`);
export const markFeeAsPaid = (id, paymentMethod) =>
  api.patch(`/fees/${id}/pay`, { paymentMethod });
export const updateFeeStatus = (id, status) =>
  api.patch(`/fees/${id}/status?status=${status}`);
export const deleteFee = (id) => api.delete(`/fees/${id}`);
