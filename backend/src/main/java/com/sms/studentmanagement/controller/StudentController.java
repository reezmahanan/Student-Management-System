package com.sms.studentmanagement.controller;

import com.sms.studentmanagement.dto.ApiResponse;
import com.sms.studentmanagement.dto.StudentDTO;
import com.sms.studentmanagement.service.StudentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/students")
@RequiredArgsConstructor
@Slf4j
public class StudentController {

    private final StudentService studentService;

    /**
     * GET /api/students?page=0&size=10&search=
     * Retrieve paginated list of students with optional search.
     */
    @GetMapping
    public ResponseEntity<ApiResponse<Page<StudentDTO>>> getAllStudents(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "") String search) {

        log.info("GET /api/students - page={}, size={}, search='{}'", page, size, search);
        Page<StudentDTO> students = studentService.getAllStudents(page, size, search);
        return ResponseEntity.ok(ApiResponse.success("Students retrieved successfully", students));
    }

    /**
     * GET /api/students/{id}
     * Retrieve a single student by ID.
     */
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<StudentDTO>> getStudentById(@PathVariable Long id) {
        log.info("GET /api/students/{}", id);
        StudentDTO student = studentService.getStudentById(id);
        return ResponseEntity.ok(ApiResponse.success("Student retrieved successfully", student));
    }

    /**
     * POST /api/students
     * Create a new student.
     */
    @PostMapping
    public ResponseEntity<ApiResponse<StudentDTO>> createStudent(
            @Valid @RequestBody StudentDTO dto) {

        log.info("POST /api/students - email: {}", dto.getEmail());
        StudentDTO created = studentService.createStudent(dto);
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ApiResponse.success("Student created successfully", created));
    }

    /**
     * PUT /api/students/{id}
     * Update an existing student.
     */
    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<StudentDTO>> updateStudent(
            @PathVariable Long id,
            @Valid @RequestBody StudentDTO dto) {

        log.info("PUT /api/students/{}", id);
        StudentDTO updated = studentService.updateStudent(id, dto);
        return ResponseEntity.ok(ApiResponse.success("Student updated successfully", updated));
    }

    /**
     * DELETE /api/students/{id}
     * Delete a student.
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteStudent(@PathVariable Long id) {
        log.info("DELETE /api/students/{}", id);
        studentService.deleteStudent(id);
        return ResponseEntity.ok(ApiResponse.success("Student deleted successfully", null));
    }

    /**
     * POST /api/students/{studentId}/courses/{courseId}
     * Enroll a student in a course.
     */
    @PostMapping("/{studentId}/courses/{courseId}")
    public ResponseEntity<ApiResponse<StudentDTO>> enrollInCourse(
            @PathVariable Long studentId,
            @PathVariable Long courseId) {

        log.info("POST /api/students/{}/courses/{} - enrolling", studentId, courseId);
        StudentDTO updated = studentService.enrollInCourse(studentId, courseId);
        return ResponseEntity.ok(ApiResponse.success("Student enrolled in course successfully", updated));
    }

    /**
     * DELETE /api/students/{studentId}/courses/{courseId}
     * Unenroll a student from a course.
     */
    @DeleteMapping("/{studentId}/courses/{courseId}")
    public ResponseEntity<ApiResponse<StudentDTO>> unenrollFromCourse(
            @PathVariable Long studentId,
            @PathVariable Long courseId) {

        log.info("DELETE /api/students/{}/courses/{} - unenrolling", studentId, courseId);
        StudentDTO updated = studentService.unenrollFromCourse(studentId, courseId);
        return ResponseEntity.ok(ApiResponse.success("Student unenrolled from course successfully", updated));
    }
}
