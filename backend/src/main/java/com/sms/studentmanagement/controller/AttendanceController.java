package com.sms.studentmanagement.controller;

import com.sms.studentmanagement.dto.ApiResponse;
import com.sms.studentmanagement.dto.AttendanceDTO;
import com.sms.studentmanagement.service.AttendanceService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/attendance")
@RequiredArgsConstructor
@Slf4j
public class AttendanceController {

    private final AttendanceService attendanceService;

    @PostMapping
    public ResponseEntity<ApiResponse<AttendanceDTO>> markAttendance(
            @Valid @RequestBody AttendanceDTO dto) {
        log.info("Marking attendance for student {} in course {}", dto.getStudentId(), dto.getCourseId());
        AttendanceDTO result = attendanceService.markAttendance(dto);
        return ResponseEntity.ok(ApiResponse.success("Attendance recorded successfully", result));
    }

    @PostMapping("/bulk")
    public ResponseEntity<ApiResponse<List<AttendanceDTO>>> bulkMarkAttendance(
            @RequestBody List<@Valid AttendanceDTO> dtos) {
        log.info("Bulk marking attendance for {} entries", dtos.size());
        List<AttendanceDTO> result = attendanceService.bulkMarkAttendance(dtos);
        return ResponseEntity.ok(ApiResponse.success("Bulk attendance recorded successfully", result));
    }

    @GetMapping("/student/{studentId}")
    public ResponseEntity<ApiResponse<List<AttendanceDTO>>> getAttendanceByStudent(@PathVariable Long studentId) {
        List<AttendanceDTO> list = attendanceService.getAttendanceByStudent(studentId);
        return ResponseEntity.ok(ApiResponse.success("Student attendance records retrieved", list));
    }

    @GetMapping("/course/{courseId}")
    public ResponseEntity<ApiResponse<List<AttendanceDTO>>> getAttendanceByCourse(
            @PathVariable Long courseId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        List<AttendanceDTO> list = date != null
                ? attendanceService.getAttendanceByCourseAndDate(courseId, date)
                : attendanceService.getAttendanceByCourse(courseId);
        return ResponseEntity.ok(ApiResponse.success("Course attendance records retrieved", list));
    }

    @GetMapping("/student/{studentId}/rate")
    public ResponseEntity<ApiResponse<Double>> getStudentAttendanceRate(@PathVariable Long studentId) {
        double rate = attendanceService.getStudentAttendanceRate(studentId);
        return ResponseEntity.ok(ApiResponse.success("Attendance rate retrieved", rate));
    }
}
