package com.sms.studentmanagement.controller;

import com.sms.studentmanagement.service.AcademicAdvisorService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.io.InputStreamResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.io.ByteArrayInputStream;

@RestController
@RequestMapping("/api/export")
@RequiredArgsConstructor
@Slf4j
public class ExportController {

    private final AcademicAdvisorService advisorService;

    @GetMapping("/students/excel")
    public ResponseEntity<InputStreamResource> exportStudentsExcel() {
        log.info("Exporting Sri Lankan students directory to Excel...");
        ByteArrayInputStream in = advisorService.exportStudentsToExcel();

        HttpHeaders headers = new HttpHeaders();
        headers.add("Content-Disposition", "attachment; filename=srilanka_students_registry.xlsx");

        return ResponseEntity.ok()
                .headers(headers)
                .contentType(MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"))
                .body(new InputStreamResource(in));
    }

    @GetMapping("/students/pdf")
    public ResponseEntity<InputStreamResource> exportStudentsPdf() {
        log.info("Generating Ministry of Education Sri Lanka Student Registry PDF...");
        ByteArrayInputStream in = advisorService.exportStudentsToPdf();

        HttpHeaders headers = new HttpHeaders();
        headers.add("Content-Disposition", "attachment; filename=srilanka_students_official_registry.pdf");

        return ResponseEntity.ok()
                .headers(headers)
                .contentType(MediaType.APPLICATION_PDF)
                .body(new InputStreamResource(in));
    }

    @GetMapping("/student/{studentId}/transcript-pdf")
    public ResponseEntity<InputStreamResource> exportStudentTranscriptPdf(@PathVariable Long studentId) {
        log.info("Generating Sri Lankan Official Academic Transcript PDF for student: {}", studentId);
        ByteArrayInputStream in = advisorService.generateStudentTranscriptPdf(studentId);

        HttpHeaders headers = new HttpHeaders();
        headers.add("Content-Disposition", "attachment; filename=student_" + studentId + "_transcript.pdf");

        return ResponseEntity.ok()
                .headers(headers)
                .contentType(MediaType.APPLICATION_PDF)
                .body(new InputStreamResource(in));
    }
}
