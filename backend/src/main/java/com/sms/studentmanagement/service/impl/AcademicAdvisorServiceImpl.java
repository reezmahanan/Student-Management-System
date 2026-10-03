package com.sms.studentmanagement.service.impl;

import com.sms.studentmanagement.dto.DashboardStatsDTO;
import com.sms.studentmanagement.entity.Student;
import com.sms.studentmanagement.repository.GradeRepository;
import com.sms.studentmanagement.repository.StudentRepository;
import com.sms.studentmanagement.service.AcademicAdvisorService;
import com.sms.studentmanagement.service.AttendanceService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.PrintWriter;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class AcademicAdvisorServiceImpl implements AcademicAdvisorService {

    private final StudentRepository studentRepository;
    private final AttendanceService attendanceService;
    private final GradeRepository gradeRepository;

    @Override
    @Transactional(readOnly = true)
    public List<DashboardStatsDTO.AtRiskStudentDTO> assessAtRiskStudents() {
        List<Student> students = studentRepository.findAll();
        List<DashboardStatsDTO.AtRiskStudentDTO> atRiskList = new ArrayList<>();

        for (Student student : students) {
            double attRate = attendanceService.getStudentAttendanceRate(student.getId());
            Double avgScore = gradeRepository.calculateAverageScorePercentageByStudentId(student.getId());

            boolean lowAttendance = attRate < 75.0;
            boolean lowScores = avgScore != null && avgScore < 60.0;

            if (lowAttendance || lowScores) {
                StringBuilder reasons = new StringBuilder();
                StringBuilder advice = new StringBuilder();

                if (lowAttendance) {
                    reasons.append(String.format("Low Attendance (%.1f%%). ", attRate));
                    advice.append("Schedule 1-on-1 counseling to address absenteeism. ");
                }
                if (lowScores) {
                    reasons.append(String.format("Critical Academic Score (Avg: %.1f%%). ", avgScore));
                    advice.append("Assign peer tutoring and supplemental study workshops. ");
                }

                atRiskList.add(DashboardStatsDTO.AtRiskStudentDTO.builder()
                        .studentId(student.getId())
                        .studentName(student.getFirstName() + " " + student.getLastName())
                        .email(student.getEmail())
                        .attendancePercentage(attRate)
                        .averageScore(avgScore != null ? Math.round(avgScore * 10.0) / 10.0 : null)
                        .riskReason(reasons.toString().trim())
                        .aiRecommendation(advice.toString().trim())
                        .build());
            }
        }

        return atRiskList;
    }

    @Override
    public ByteArrayInputStream exportStudentsToExcel() {
        try (Workbook workbook = new XSSFWorkbook(); ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            Sheet sheet = workbook.createSheet("Students Directory");

            // Header Style
            Font headerFont = workbook.createFont();
            headerFont.setBold(true);
            headerFont.setColor(IndexedColors.WHITE.getIndex());

            CellStyle headerCellStyle = workbook.createCellStyle();
            headerCellStyle.setFont(headerFont);
            headerCellStyle.setFillForegroundColor(IndexedColors.ROYAL_BLUE.getIndex());
            headerCellStyle.setFillPattern(FillPatternType.SOLID_FOREGROUND);

            String[] columns = {"ID", "First Name", "Last Name", "Email", "Phone", "Gender", "Enrollment Date", "Courses Enrolled"};
            Row headerRow = sheet.createRow(0);

            for (int col = 0; col < columns.length; col++) {
                Cell cell = headerRow.createCell(col);
                cell.setCellValue(columns[col]);
                cell.setCellStyle(headerCellStyle);
            }

            int rowIdx = 1;
            for (Student student : studentRepository.findAll()) {
                Row row = sheet.createRow(rowIdx++);
                row.createCell(0).setCellValue(student.getId());
                row.createCell(1).setCellValue(student.getFirstName());
                row.createCell(2).setCellValue(student.getLastName());
                row.createCell(3).setCellValue(student.getEmail());
                row.createCell(4).setCellValue(student.getPhone() != null ? student.getPhone() : "");
                row.createCell(5).setCellValue(student.getGender() != null ? student.getGender() : "");
                row.createCell(6).setCellValue(student.getEnrollmentDate() != null ? student.getEnrollmentDate().toString() : "");
                row.createCell(7).setCellValue(student.getCourses().size());
            }

            for (int col = 0; col < columns.length; col++) {
                sheet.autoSizeColumn(col);
            }

            workbook.write(out);
            return new ByteArrayInputStream(out.toByteArray());
        } catch (Exception e) {
            log.error("Failed to export students to Excel: {}", e.getMessage());
            throw new RuntimeException("Excel export failed", e);
        }
    }

    @Override
    public ByteArrayInputStream exportStudentsToCsv() {
        ByteArrayOutputStream out = new ByteArrayOutputStream();
        try (PrintWriter writer = new PrintWriter(out)) {
            writer.println("ID,First Name,Last Name,Email,Phone,Gender,Enrollment Date,Courses Enrolled");

            for (Student student : studentRepository.findAll()) {
                writer.printf("%d,\"%s\",\"%s\",\"%s\",\"%s\",\"%s\",\"%s\",%d%n",
                        student.getId(),
                        student.getFirstName().replace("\"", "\"\""),
                        student.getLastName().replace("\"", "\"\""),
                        student.getEmail().replace("\"", "\"\""),
                        student.getPhone() != null ? student.getPhone() : "",
                        student.getGender() != null ? student.getGender() : "",
                        student.getEnrollmentDate() != null ? student.getEnrollmentDate().toString() : "",
                        student.getCourses().size()
                );
            }
            writer.flush();
            return new ByteArrayInputStream(out.toByteArray());
        }
    }
}
