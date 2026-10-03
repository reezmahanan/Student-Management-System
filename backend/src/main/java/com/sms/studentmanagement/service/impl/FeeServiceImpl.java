package com.sms.studentmanagement.service.impl;

import com.sms.studentmanagement.dto.FeePaymentDTO;
import com.sms.studentmanagement.entity.FeePayment;
import com.sms.studentmanagement.entity.PaymentStatus;
import com.sms.studentmanagement.entity.Student;
import com.sms.studentmanagement.exception.ResourceNotFoundException;
import com.sms.studentmanagement.repository.FeePaymentRepository;
import com.sms.studentmanagement.repository.StudentRepository;
import com.sms.studentmanagement.service.FeeService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class FeeServiceImpl implements FeeService {

    private final FeePaymentRepository feePaymentRepository;
    private final StudentRepository studentRepository;

    @Override
    @Transactional
    public FeePaymentDTO createInvoice(FeePaymentDTO dto) {
        Student student = studentRepository.findById(dto.getStudentId())
                .orElseThrow(() -> new ResourceNotFoundException("Student", "id", dto.getStudentId()));

        String invoiceNo = dto.getInvoiceNumber() != null ? dto.getInvoiceNumber() :
                "INV-" + LocalDate.now().getYear() + "-" + UUID.randomUUID().toString().substring(0, 6).toUpperCase();

        PaymentStatus status = dto.getStatus() != null ? dto.getStatus() : PaymentStatus.PENDING;
        if (dto.getDueDate().isBefore(LocalDate.now()) && status == PaymentStatus.PENDING) {
            status = PaymentStatus.OVERDUE;
        }

        FeePayment fee = FeePayment.builder()
                .student(student)
                .invoiceNumber(invoiceNo)
                .title(dto.getTitle())
                .amount(dto.getAmount())
                .dueDate(dto.getDueDate())
                .paidDate(dto.getPaidDate())
                .status(status)
                .paymentMethod(dto.getPaymentMethod())
                .notes(dto.getNotes())
                .build();

        return toDTO(feePaymentRepository.save(fee));
    }

    @Override
    @Transactional
    public FeePaymentDTO markAsPaid(Long id, String paymentMethod) {
        FeePayment fee = feePaymentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("FeePayment", "id", id));

        fee.setStatus(PaymentStatus.PAID);
        fee.setPaidDate(LocalDate.now());
        fee.setPaymentMethod(paymentMethod != null ? paymentMethod : "CARD");

        return toDTO(feePaymentRepository.save(fee));
    }

    @Override
    @Transactional
    public FeePaymentDTO updatePaymentStatus(Long id, PaymentStatus status) {
        FeePayment fee = feePaymentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("FeePayment", "id", id));

        fee.setStatus(status);
        if (status == PaymentStatus.PAID && fee.getPaidDate() == null) {
            fee.setPaidDate(LocalDate.now());
        }

        return toDTO(feePaymentRepository.save(fee));
    }

    @Override
    @Transactional(readOnly = true)
    public List<FeePaymentDTO> getFeesByStudent(Long studentId) {
        return feePaymentRepository.findByStudentId(studentId).stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<FeePaymentDTO> getAllFees() {
        return feePaymentRepository.findAll().stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public void deleteFee(Long id) {
        if (!feePaymentRepository.existsById(id)) {
            throw new ResourceNotFoundException("FeePayment", "id", id);
        }
        feePaymentRepository.deleteById(id);
    }

    private FeePaymentDTO toDTO(FeePayment f) {
        return FeePaymentDTO.builder()
                .id(f.getId())
                .studentId(f.getStudent().getId())
                .studentName(f.getStudent().getFirstName() + " " + f.getStudent().getLastName())
                .studentEmail(f.getStudent().getEmail())
                .invoiceNumber(f.getInvoiceNumber())
                .title(f.getTitle())
                .amount(f.getAmount())
                .dueDate(f.getDueDate())
                .paidDate(f.getPaidDate())
                .status(f.getStatus())
                .paymentMethod(f.getPaymentMethod())
                .notes(f.getNotes())
                .build();
    }
}
