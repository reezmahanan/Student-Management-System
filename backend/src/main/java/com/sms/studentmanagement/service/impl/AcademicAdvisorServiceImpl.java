package com.sms.studentmanagement.service.impl;

import com.lowagie.text.*;
import com.lowagie.text.Font;
import com.lowagie.text.pdf.*;
import com.sms.studentmanagement.dto.DashboardStatsDTO;
import com.sms.studentmanagement.entity.Grade;
import com.sms.studentmanagement.entity.Student;
import com.sms.studentmanagement.exception.ResourceNotFoundException;
import com.sms.studentmanagement.repository.GradeRepository;
import com.sms.studentmanagement.repository.StudentRepository;
import com.sms.studentmanagement.service.AcademicAdvisorService;
import com.sms.studentmanagement.service.AttendanceService;
import com.sms.studentmanagement.service.GradeService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.awt.Color;
import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class AcademicAdvisorServiceImpl implements AcademicAdvisorService {

    private final StudentRepository studentRepository;
    private final AttendanceService attendanceService;
    private final GradeRepository gradeRepository;
    private final GradeService gradeService;

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
                    advice.append("Inform section head & arrange parent/guardian consultation. ");
                }
                if (lowScores) {
                    reasons.append(String.format("Critical Term Marks (Avg: %.1f%%). ", avgScore));
                    advice.append("Assign extra tutorial sessions and peer-mentor support. ");
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
            Sheet sheet = workbook.createSheet("Sri Lankan Student Directory");

            org.apache.poi.ss.usermodel.Font headerFont = workbook.createFont();
            headerFont.setBold(true);
            headerFont.setColor(IndexedColors.WHITE.getIndex());

            CellStyle headerCellStyle = workbook.createCellStyle();
            headerCellStyle.setFont(headerFont);
            headerCellStyle.setFillForegroundColor(IndexedColors.ROYAL_BLUE.getIndex());
            headerCellStyle.setFillPattern(FillPatternType.SOLID_FOREGROUND);

            String[] columns = {
                    "Admission No", "Full Name", "NIC No", "Email", "Phone",
                    "Gender", "District", "Academic Stream", "Guardian Name", "Guardian Phone"
            };

            org.apache.poi.ss.usermodel.Row headerRow = sheet.createRow(0);
            for (int col = 0; col < columns.length; col++) {
                org.apache.poi.ss.usermodel.Cell cell = headerRow.createCell(col);
                cell.setCellValue(columns[col]);
                cell.setCellStyle(headerCellStyle);
            }

            int rowIdx = 1;
            for (Student student : studentRepository.findAll()) {
                org.apache.poi.ss.usermodel.Row row = sheet.createRow(rowIdx++);
                row.createCell(0).setCellValue(student.getAdmissionNo() != null ? student.getAdmissionNo() : ("ST/2026/" + student.getId()));
                row.createCell(1).setCellValue(student.getFullNameWithInitials() != null ? student.getFullNameWithInitials() : (student.getFirstName() + " " + student.getLastName()));
                row.createCell(2).setCellValue(student.getNicNo() != null ? student.getNicNo() : "—");
                row.createCell(3).setCellValue(student.getEmail());
                row.createCell(4).setCellValue(student.getPhone() != null ? student.getPhone() : "—");
                row.createCell(5).setCellValue(student.getGender() != null ? student.getGender() : "—");
                row.createCell(6).setCellValue(student.getDistrict() != null ? student.getDistrict() : "—");
                row.createCell(7).setCellValue(student.getAcademicStream() != null ? student.getAcademicStream() : "General");
                row.createCell(8).setCellValue(student.getGuardianName() != null ? student.getGuardianName() : "—");
                row.createCell(9).setCellValue(student.getGuardianPhone() != null ? student.getGuardianPhone() : "—");
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
    public ByteArrayInputStream exportStudentsToPdf() {
        Document document = new Document(PageSize.A4.rotate(), 20, 20, 30, 30);
        ByteArrayOutputStream out = new ByteArrayOutputStream();

        try {
            PdfWriter.getInstance(document, out);
            document.open();

            // Document Header
            Font titleFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 16, new Color(13, 71, 161));
            Font subFont = FontFactory.getFont(FontFactory.HELVETICA, 10, Color.DARK_GRAY);
            Font tableHeaderFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 9, Color.WHITE);
            Font cellFont = FontFactory.getFont(FontFactory.HELVETICA, 9, Color.BLACK);

            Paragraph title = new Paragraph("MINISTRY OF EDUCATION — SRI LANKA", titleFont);
            title.setAlignment(Element.ALIGN_CENTER);
            document.add(title);

            Paragraph institute = new Paragraph("National Student Information Management System (SIS) • Official Registry", subFont);
            institute.setAlignment(Element.ALIGN_CENTER);
            institute.setSpacingAfter(15);
            document.add(institute);

            // Table Layout
            PdfPTable table = new PdfPTable(8);
            table.setWidthPercentage(100);
            table.setWidths(new float[]{2.2f, 3.5f, 2.5f, 3.5f, 2.2f, 2.0f, 2.8f, 2.0f});

            String[] headers = {
                    "Admission No", "Student Name", "NIC No", "Email", "Phone", "Gender", "District / Province", "Courses"
            };

            for (String headerText : headers) {
                PdfPCell cell = new PdfPCell(new Phrase(headerText, tableHeaderFont));
                cell.setBackgroundColor(new Color(13, 71, 161));
                cell.setPadding(6);
                cell.setHorizontalAlignment(Element.ALIGN_CENTER);
                table.addCell(cell);
            }

            for (Student s : studentRepository.findAll()) {
                table.addCell(createCell(s.getAdmissionNo() != null ? s.getAdmissionNo() : ("ST/2026/" + s.getId()), cellFont));
                table.addCell(createCell(s.getFullNameWithInitials() != null ? s.getFullNameWithInitials() : (s.getFirstName() + " " + s.getLastName()), cellFont));
                table.addCell(createCell(s.getNicNo() != null ? s.getNicNo() : "—", cellFont));
                table.addCell(createCell(s.getEmail(), cellFont));
                table.addCell(createCell(s.getPhone() != null ? s.getPhone() : "—", cellFont));
                table.addCell(createCell(s.getGender() != null ? s.getGender() : "—", cellFont));
                table.addCell(createCell((s.getDistrict() != null ? s.getDistrict() : "Colombo") + ", " + (s.getProvince() != null ? s.getProvince() : "Western"), cellFont));
                table.addCell(createCell(String.valueOf(s.getCourses().size()), cellFont));
            }

            document.add(table);

            // Footer note
            Paragraph footer = new Paragraph(
                    "Generated on: " + LocalDate.now().format(DateTimeFormatter.ofPattern("dd-MMM-yyyy")) + " | Certified System Record",
                    FontFactory.getFont(FontFactory.HELVETICA_OBLIQUE, 8, Color.GRAY)
            );
            footer.setSpacingBefore(12);
            footer.setAlignment(Element.ALIGN_RIGHT);
            document.add(footer);

            document.close();
            return new ByteArrayInputStream(out.toByteArray());
        } catch (Exception e) {
            log.error("Failed to generate students PDF report: {}", e.getMessage());
            throw new RuntimeException("PDF generation failed", e);
        }
    }

    @Override
    public ByteArrayInputStream generateStudentTranscriptPdf(Long studentId) {
        Student student = studentRepository.findById(studentId)
                .orElseThrow(() -> new ResourceNotFoundException("Student", "id", studentId));

        List<Grade> grades = gradeRepository.findByStudentId(studentId);
        Double gpa = gradeService.calculateStudentGPA(studentId);
        double attRate = attendanceService.getStudentAttendanceRate(studentId);

        Document document = new Document(PageSize.A4, 30, 30, 30, 30);
        ByteArrayOutputStream out = new ByteArrayOutputStream();

        try {
            PdfWriter.getInstance(document, out);
            document.open();

            // National Header
            Font titleFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 18, new Color(13, 71, 161));
            Font subHeaderFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 12, Color.DARK_GRAY);
            Font textFont = FontFactory.getFont(FontFactory.HELVETICA, 10, Color.BLACK);
            Font boldFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 10, Color.BLACK);

            Paragraph p1 = new Paragraph("GOVERNMENT OF SRI LANKA — MINISTRY OF EDUCATION", titleFont);
            p1.setAlignment(Element.ALIGN_CENTER);
            document.add(p1);

            Paragraph p2 = new Paragraph("OFFICIAL ACADEMIC TRANSCRIPT & PROGRESS REPORT", subHeaderFont);
            p2.setAlignment(Element.ALIGN_CENTER);
            p2.setSpacingAfter(18);
            document.add(p2);

            // Student Bio Table
            PdfPTable bioTable = new PdfPTable(4);
            bioTable.setWidthPercentage(100);
            bioTable.setSpacingAfter(15);

            addBioRow(bioTable, "Admission No:", student.getAdmissionNo() != null ? student.getAdmissionNo() : ("ST/2026/" + student.getId()), "National ID (NIC):", student.getNicNo() != null ? student.getNicNo() : "—", boldFont, textFont);
            addBioRow(bioTable, "Student Name:", (student.getFullNameWithInitials() != null ? student.getFullNameWithInitials() : student.getFirstName() + " " + student.getLastName()), "District:", student.getDistrict() != null ? student.getDistrict() : "Colombo", boldFont, textFont);
            addBioRow(bioTable, "Academic Stream:", student.getAcademicStream() != null ? student.getAcademicStream() : "A/L Physical Science", "Province:", student.getProvince() != null ? student.getProvince() : "Western Province", boldFont, textFont);
            addBioRow(bioTable, "Attendance Standing:", String.format("%.1f%%", attRate), "Cumulative GPA:", String.format("%.2f / 4.0", gpa != null ? gpa : 0.0), boldFont, textFont);

            document.add(bioTable);

            // Grade Records Table
            Paragraph gradesHeader = new Paragraph("Examination & Continuous Assessment Records", subHeaderFont);
            gradesHeader.setSpacingAfter(8);
            document.add(gradesHeader);

            PdfPTable gradeTable = new PdfPTable(6);
            gradeTable.setWidthPercentage(100);
            gradeTable.setWidths(new float[]{3.5f, 2.5f, 2.0f, 2.0f, 2.0f, 2.0f});

            String[] gradeHeaders = {"Subject / Course", "Assessment", "Marks", "Out of", "Grade", "GPA Pt"};
            for (String gh : gradeHeaders) {
                PdfPCell cell = new PdfPCell(new Phrase(gh, FontFactory.getFont(FontFactory.HELVETICA_BOLD, 9, Color.WHITE)));
                cell.setBackgroundColor(new Color(13, 71, 161));
                cell.setPadding(5);
                cell.setHorizontalAlignment(Element.ALIGN_CENTER);
                gradeTable.addCell(cell);
            }

            if (grades.isEmpty()) {
                PdfPCell emptyCell = new PdfPCell(new Phrase("No examination records available for this student.", textFont));
                emptyCell.setColspan(6);
                emptyCell.setPadding(10);
                emptyCell.setHorizontalAlignment(Element.ALIGN_CENTER);
                gradeTable.addCell(emptyCell);
            } else {
                for (Grade g : grades) {
                    gradeTable.addCell(createCell(g.getCourse().getCourseName(), textFont));
                    gradeTable.addCell(createCell(g.getExamType(), textFont));
                    gradeTable.addCell(createCell(String.valueOf(g.getScore()), textFont));
                    gradeTable.addCell(createCell(String.valueOf(g.getMaxScore()), textFont));
                    gradeTable.addCell(createCell(g.getLetterGrade() != null ? g.getLetterGrade() : "—", boldFont));
                    gradeTable.addCell(createCell(g.getGpaPoint() != null ? String.format("%.1f", g.getGpaPoint()) : "—", textFont));
                }
            }

            document.add(gradeTable);

            // Signature Section
            Paragraph sign = new Paragraph("\n\n\n________________________                         ________________________\nClass Teacher / Advisor Signature                   Principal / Registrar Seal", boldFont);
            sign.setAlignment(Element.ALIGN_CENTER);
            document.add(sign);

            document.close();
            return new ByteArrayInputStream(out.toByteArray());
        } catch (Exception e) {
            log.error("Failed to generate student transcript PDF: {}", e.getMessage());
            throw new RuntimeException("Transcript PDF generation failed", e);
        }
    }

    private PdfPCell createCell(String text, Font font) {
        PdfPCell cell = new PdfPCell(new Phrase(text != null ? text : "", font));
        cell.setPadding(5);
        cell.setVerticalAlignment(Element.ALIGN_MIDDLE);
        return cell;
    }

    private void addBioRow(PdfPTable table, String label1, String val1, String label2, String val2, Font bold, Font normal) {
        PdfPCell c1 = new PdfPCell(new Phrase(label1, bold));
        c1.setBackgroundColor(new Color(245, 245, 245));
        c1.setPadding(4);
        table.addCell(c1);

        PdfPCell c2 = new PdfPCell(new Phrase(val1, normal));
        c2.setPadding(4);
        table.addCell(c2);

        PdfPCell c3 = new PdfPCell(new Phrase(label2, bold));
        c3.setBackgroundColor(new Color(245, 245, 245));
        c3.setPadding(4);
        table.addCell(c3);

        PdfPCell c4 = new PdfPCell(new Phrase(val2, normal));
        c4.setPadding(4);
        table.addCell(c4);
    }
}
