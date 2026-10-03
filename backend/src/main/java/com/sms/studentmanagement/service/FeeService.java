package com.sms.studentmanagement.service;

import com.sms.studentmanagement.dto.FeePaymentDTO;
import com.sms.studentmanagement.entity.PaymentStatus;

import java.util.List;

public interface FeeService {
    FeePaymentDTO createInvoice(FeePaymentDTO dto);
    FeePaymentDTO markAsPaid(Long id, String paymentMethod);
    FeePaymentDTO updatePaymentStatus(Long id, PaymentStatus status);
    List<FeePaymentDTO> getFeesByStudent(Long studentId);
    List<FeePaymentDTO> getAllFees();
    void deleteFee(Long id);
}
