package com.sms.studentmanagement.repository;

import com.sms.studentmanagement.entity.FeePayment;
import com.sms.studentmanagement.entity.PaymentStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

@Repository
public interface FeePaymentRepository extends JpaRepository<FeePayment, Long> {
    List<FeePayment> findByStudentId(Long studentId);
    List<FeePayment> findByStatus(PaymentStatus status);
    Optional<FeePayment> findByInvoiceNumber(String invoiceNumber);

    @Query("SELECT COALESCE(SUM(f.amount), 0) FROM FeePayment f WHERE f.status = :status")
    BigDecimal sumAmountByStatus(@Param("status") PaymentStatus status);

    @Query("SELECT COALESCE(SUM(f.amount), 0) FROM FeePayment f")
    BigDecimal sumTotalAmount();
}
