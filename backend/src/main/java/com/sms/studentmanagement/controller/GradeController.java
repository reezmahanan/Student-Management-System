package com.sms.studentmanagement.controller;

import com.sms.studentmanagement.dto.ApiResponse;
import com.sms.studentmanagement.dto.GradeDTO;
import com.sms.studentmanagement.service.GradeService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/grades")
@RequiredArgsConstructor
@Slf4j
public class GradeController {

    private final GradeService gradeService;

    @PostMapping
    public ResponseEntity<ApiResponse<GradeDTO>> recordGrade(@Valid @RequestBody GradeDTO dto) {
        log.info("Recording grade for student {} in course {}", dto.getStudentId(), dto.getCourseId());
        GradeDTO saved = gradeService.recordGrade(dto);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Grade recorded successfully", saved));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<GradeDTO>> updateGrade(
            @PathVariable Long id,
            @Valid @RequestBody GradeDTO dto) {
        log.info("Updating grade {}", id);
        GradeDTO updated = gradeService.updateGrade(id, dto);
        return ResponseEntity.ok(ApiResponse.success("Grade updated successfully", updated));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteGrade(@PathVariable Long id) {
        gradeService.deleteGrade(id);
        return ResponseEntity.ok(ApiResponse.success("Grade deleted successfully", null));
    }

    @GetMapping("/student/{studentId}")
    public ResponseEntity<ApiResponse<List<GradeDTO>>> getGradesByStudent(@PathVariable Long studentId) {
        List<GradeDTO> list = gradeService.getGradesByStudent(studentId);
        return ResponseEntity.ok(ApiResponse.success("Student grades retrieved", list));
    }

    @GetMapping("/course/{courseId}")
    public ResponseEntity<ApiResponse<List<GradeDTO>>> getGradesByCourse(@PathVariable Long courseId) {
        List<GradeDTO> list = gradeService.getGradesByCourse(courseId);
        return ResponseEntity.ok(ApiResponse.success("Course grades retrieved", list));
    }

    @GetMapping("/student/{studentId}/gpa")
    public ResponseEntity<ApiResponse<Double>> getStudentGPA(@PathVariable Long studentId) {
        Double gpa = gradeService.calculateStudentGPA(studentId);
        return ResponseEntity.ok(ApiResponse.success("Student GPA retrieved", gpa));
    }
}
