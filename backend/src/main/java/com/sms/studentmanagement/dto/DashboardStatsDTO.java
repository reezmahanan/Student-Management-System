package com.sms.studentmanagement.dto;

import lombok.*;

import java.math.BigDecimal;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DashboardStatsDTO {
    private long totalStudents;
    private long totalCourses;
    private long totalEnrollments;
    private double overallAverageGpa;
    private double overallAttendanceRate;
    private BigDecimal totalFeesCollected;
    private BigDecimal pendingFees;
    private long atRiskStudentsCount;

    private List<StudentDTO> recentStudents;
    private List<AtRiskStudentDTO> atRiskStudents;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class AtRiskStudentDTO {
        private Long studentId;
        private String studentName;
        private String email;
        private double attendancePercentage;
        private Double averageScore;
        private String riskReason;
        private String aiRecommendation;
    }
}
