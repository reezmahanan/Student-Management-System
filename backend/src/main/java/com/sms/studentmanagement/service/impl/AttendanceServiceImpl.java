package com.sms.studentmanagement.service.impl;

import com.sms.studentmanagement.dto.AttendanceDTO;
import com.sms.studentmanagement.entity.Attendance;
import com.sms.studentmanagement.entity.AttendanceStatus;
import com.sms.studentmanagement.entity.Course;
import com.sms.studentmanagement.entity.Student;
import com.sms.studentmanagement.exception.ResourceNotFoundException;
import com.sms.studentmanagement.repository.AttendanceRepository;
import com.sms.studentmanagement.repository.CourseRepository;
import com.sms.studentmanagement.repository.StudentRepository;
import com.sms.studentmanagement.service.AttendanceService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class AttendanceServiceImpl implements AttendanceService {

    private final AttendanceRepository attendanceRepository;
    private final StudentRepository studentRepository;
    private final CourseRepository courseRepository;

    @Override
    @Transactional
    public AttendanceDTO markAttendance(AttendanceDTO dto) {
        Student student = studentRepository.findById(dto.getStudentId())
                .orElseThrow(() -> new ResourceNotFoundException("Student", "id", dto.getStudentId()));

        Course course = courseRepository.findById(dto.getCourseId())
                .orElseThrow(() -> new ResourceNotFoundException("Course", "id", dto.getCourseId()));

        Attendance attendance = attendanceRepository
                .findByStudentIdAndCourseIdAndAttendanceDate(dto.getStudentId(), dto.getCourseId(), dto.getAttendanceDate())
                .orElse(Attendance.builder()
                        .student(student)
                        .course(course)
                        .attendanceDate(dto.getAttendanceDate())
                        .build());

        attendance.setStatus(dto.getStatus());
        attendance.setRemarks(dto.getRemarks());

        Attendance saved = attendanceRepository.save(attendance);
        return toDTO(saved);
    }

    @Override
    @Transactional
    public List<AttendanceDTO> bulkMarkAttendance(List<AttendanceDTO> dtos) {
        List<AttendanceDTO> results = new ArrayList<>();
        for (AttendanceDTO dto : dtos) {
            results.add(markAttendance(dto));
        }
        return results;
    }

    @Override
    @Transactional(readOnly = true)
    public List<AttendanceDTO> getAttendanceByStudent(Long studentId) {
        return attendanceRepository.findByStudentId(studentId).stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<AttendanceDTO> getAttendanceByCourse(Long courseId) {
        return attendanceRepository.findByCourseId(courseId).stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<AttendanceDTO> getAttendanceByCourseAndDate(Long courseId, LocalDate date) {
        return attendanceRepository.findByCourseIdAndAttendanceDate(courseId, date).stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public double getStudentAttendanceRate(Long studentId) {
        long total = attendanceRepository.countTotalByStudentId(studentId);
        if (total == 0) return 100.0; // No sessions held yet

        long present = attendanceRepository.countByStudentIdAndStatus(studentId, AttendanceStatus.PRESENT);
        long late = attendanceRepository.countByStudentIdAndStatus(studentId, AttendanceStatus.LATE);

        // Count late as 0.75 present
        double weightedPresent = present + (late * 0.75);
        return Math.round((weightedPresent / total) * 1000.0) / 10.0;
    }

    private AttendanceDTO toDTO(Attendance a) {
        return AttendanceDTO.builder()
                .id(a.getId())
                .studentId(a.getStudent().getId())
                .studentName(a.getStudent().getFirstName() + " " + a.getStudent().getLastName())
                .studentEmail(a.getStudent().getEmail())
                .courseId(a.getCourse().getId())
                .courseName(a.getCourse().getCourseName())
                .courseCode(a.getCourse().getCourseCode())
                .attendanceDate(a.getAttendanceDate())
                .status(a.getStatus())
                .remarks(a.getRemarks())
                .build();
    }
}
