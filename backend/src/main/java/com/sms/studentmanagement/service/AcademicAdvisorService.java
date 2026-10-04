package com.sms.studentmanagement.service;

import com.sms.studentmanagement.dto.DashboardStatsDTO;

import java.io.ByteArrayInputStream;
import java.util.List;

public interface AcademicAdvisorService {
    List<DashboardStatsDTO.AtRiskStudentDTO> assessAtRiskStudents();
    ByteArrayInputStream exportStudentsToExcel();
    ByteArrayInputStream exportStudentsToPdf();
    ByteArrayInputStream generateStudentTranscriptPdf(Long studentId);
}
