package com.sms.studentmanagement.controller;

import com.sms.studentmanagement.dto.ApiResponse;
import com.sms.studentmanagement.dto.FeePaymentDTO;
import com.sms.studentmanagement.entity.PaymentStatus;
import com.sms.studentmanagement.service.FeeService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/fees")
@RequiredArgsConstructor
@Slf4j
public class FeeController {

    private final FeeService feeService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<FeePaymentDTO>>> getAllFees() {
        List<FeePaymentDTO> list = feeService.getAllFees();
        return ResponseEntity.ok(ApiResponse.success("Fee payments retrieved", list));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<FeePaymentDTO>> createInvoice(@Valid @RequestBody FeePaymentDTO dto) {
        log.info("Creating fee invoice for student: {}", dto.getStudentId());
        FeePaymentDTO created = feeService.createInvoice(dto);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Invoice created successfully", created));
    }

    @GetMapping("/student/{studentId}")
    public ResponseEntity<ApiResponse<List<FeePaymentDTO>>> getFeesByStudent(@PathVariable Long studentId) {
        List<FeePaymentDTO> list = feeService.getFeesByStudent(studentId);
        return ResponseEntity.ok(ApiResponse.success("Student fees retrieved", list));
    }

    @PatchMapping("/{id}/pay")
    public ResponseEntity<ApiResponse<FeePaymentDTO>> markAsPaid(
            @PathVariable Long id,
            @RequestBody(required = false) Map<String, String> payload) {
        String method = (payload != null && payload.containsKey("paymentMethod"))
                ? payload.get("paymentMethod") : "ONLINE_CARD";
        FeePaymentDTO paid = feeService.markAsPaid(id, method);
        return ResponseEntity.ok(ApiResponse.success("Fee marked as paid", paid));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<ApiResponse<FeePaymentDTO>> updateStatus(
            @PathVariable Long id,
            @RequestParam PaymentStatus status) {
        FeePaymentDTO updated = feeService.updatePaymentStatus(id, status);
        return ResponseEntity.ok(ApiResponse.success("Payment status updated", updated));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteFee(@PathVariable Long id) {
        feeService.deleteFee(id);
        return ResponseEntity.ok(ApiResponse.success("Fee deleted successfully", null));
    }
}
