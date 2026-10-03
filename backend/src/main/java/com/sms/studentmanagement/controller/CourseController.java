package com.sms.studentmanagement.controller;

import com.sms.studentmanagement.dto.ApiResponse;
import com.sms.studentmanagement.dto.CourseDTO;
import com.sms.studentmanagement.service.CourseService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/courses")
@RequiredArgsConstructor
@Slf4j
public class CourseController {

    private final CourseService courseService;

    /**
     * GET /api/courses
     * Retrieve all courses.
     */
    @GetMapping
    public ResponseEntity<ApiResponse<List<CourseDTO>>> getAllCourses() {
        log.info("GET /api/courses");
        List<CourseDTO> courses = courseService.getAllCourses();
        return ResponseEntity.ok(ApiResponse.success("Courses retrieved successfully", courses));
    }

    /**
     * GET /api/courses/{id}
     * Retrieve a single course by ID.
     */
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<CourseDTO>> getCourseById(@PathVariable Long id) {
        log.info("GET /api/courses/{}", id);
        CourseDTO course = courseService.getCourseById(id);
        return ResponseEntity.ok(ApiResponse.success("Course retrieved successfully", course));
    }

    /**
     * POST /api/courses
     * Create a new course.
     */
    @PostMapping
    public ResponseEntity<ApiResponse<CourseDTO>> createCourse(
            @Valid @RequestBody CourseDTO dto) {

        log.info("POST /api/courses - code: {}", dto.getCourseCode());
        CourseDTO created = courseService.createCourse(dto);
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ApiResponse.success("Course created successfully", created));
    }

    /**
     * PUT /api/courses/{id}
     * Update an existing course.
     */
    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<CourseDTO>> updateCourse(
            @PathVariable Long id,
            @Valid @RequestBody CourseDTO dto) {

        log.info("PUT /api/courses/{}", id);
        CourseDTO updated = courseService.updateCourse(id, dto);
        return ResponseEntity.ok(ApiResponse.success("Course updated successfully", updated));
    }

    /**
     * DELETE /api/courses/{id}
     * Delete a course.
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteCourse(@PathVariable Long id) {
        log.info("DELETE /api/courses/{}", id);
        courseService.deleteCourse(id);
        return ResponseEntity.ok(ApiResponse.success("Course deleted successfully", null));
    }
}
