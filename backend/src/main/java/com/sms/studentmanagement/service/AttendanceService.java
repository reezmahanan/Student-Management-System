package com.sms.studentmanagement.service;

import com.sms.studentmanagement.dto.AttendanceDTO;

import java.time.LocalDate;
import java.util.List;

public interface AttendanceService {
    AttendanceDTO markAttendance(AttendanceDTO dto);
    List<AttendanceDTO> bulkMarkAttendance(List<AttendanceDTO> dtos);
    List<AttendanceDTO> getAttendanceByStudent(Long studentId);
    List<AttendanceDTO> getAttendanceByCourse(Long courseId);
    List<AttendanceDTO> getAttendanceByCourseAndDate(Long courseId, LocalDate date);
    double getStudentAttendanceRate(Long studentId);
}
