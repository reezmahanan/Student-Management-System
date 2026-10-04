package com.sms.studentmanagement.controller;

import com.sms.studentmanagement.dto.ApiResponse;
import com.sms.studentmanagement.dto.CourseDTO;
import com.sms.studentmanagement.dto.DashboardStatsDTO;
import com.sms.studentmanagement.dto.StudentDTO;
import com.sms.studentmanagement.entity.Course;
import com.sms.studentmanagement.entity.PaymentStatus;
import com.sms.studentmanagement.entity.Student;
import com.sms.studentmanagement.repository.CourseRepository;
import com.sms.studentmanagement.repository.FeePaymentRepository;
import com.sms.studentmanagement.repository.GradeRepository;
import com.sms.studentmanagement.repository.StudentRepository;
import com.sms.studentmanagement.service.AcademicAdvisorService;
import com.sms.studentmanagement.service.AttendanceService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/dashboard")
@RequiredArgsConstructor
@Slf4j
public class DashboardController {

    private final StudentRepository studentRepository;
    private final CourseRepository courseRepository;
    private final FeePaymentRepository feePaymentRepository;
    private final GradeRepository gradeRepository;
    private final AttendanceService attendanceService;
    private final AcademicAdvisorService academicAdvisorService;

    @GetMapping("/stats")
    public ResponseEntity<ApiResponse<DashboardStatsDTO>> getDashboardStats() {
        log.info("GET /api/dashboard/stats");

        long totalStudents = studentRepository.count();
        long totalCourses = courseRepository.count();

        // Calculate total enrollments
        long totalEnrollments = studentRepository.findAll().stream()
                .mapToLong(s -> s.getCourses().size())
                .sum();

        // Overall GPA & Attendance
        double totalGpa = 0.0;
        double totalAtt = 0.0;
        List<Student> students = studentRepository.findAll();
        for (Student s : students) {
            Double gpa = gradeRepository.calculateAverageGpaByStudentId(s.getId());
            if (gpa != null) totalGpa += gpa;
            totalAtt += attendanceService.getStudentAttendanceRate(s.getId());
        }

        double overallAverageGpa = students.isEmpty() ? 0.0 : Math.round((totalGpa / students.size()) * 100.0) / 100.0;
        double overallAttendanceRate = students.isEmpty() ? 100.0 : Math.round((totalAtt / students.size()) * 10.0) / 10.0;

        // Fees (in Sri Lankan Rupees LKR)
        BigDecimal totalFeesCollected = feePaymentRepository.sumAmountByStatus(PaymentStatus.PAID);
        BigDecimal pendingFees = feePaymentRepository.sumAmountByStatus(PaymentStatus.PENDING);

        // Fetch last 5 students
        List<Student> recent = studentRepository.findAll(
                PageRequest.of(0, 5, Sort.by(
                        Sort.Order.desc("enrollmentDate"),
                        Sort.Order.desc("id")
                ))
        ).getContent();

        List<StudentDTO> recentStudentDTOs = recent.stream()
                .map(this::toStudentDTO)
                .collect(Collectors.toList());

        // AI At Risk Students
        List<DashboardStatsDTO.AtRiskStudentDTO> atRiskList = academicAdvisorService.assessAtRiskStudents();

        DashboardStatsDTO stats = DashboardStatsDTO.builder()
                .totalStudents(totalStudents)
                .totalCourses(totalCourses)
                .totalEnrollments(totalEnrollments)
                .overallAverageGpa(overallAverageGpa)
                .overallAttendanceRate(overallAttendanceRate)
                .totalFeesCollected(totalFeesCollected != null ? totalFeesCollected : BigDecimal.ZERO)
                .pendingFees(pendingFees != null ? pendingFees : BigDecimal.ZERO)
                .atRiskStudentsCount(atRiskList.size())
                .recentStudents(recentStudentDTOs)
                .atRiskStudents(atRiskList)
                .build();

        return ResponseEntity.ok(ApiResponse.success("Dashboard stats retrieved successfully", stats));
    }

    private StudentDTO toStudentDTO(Student student) {
        List<Long> courseIds = student.getCourses().stream()
                .map(Course::getId)
                .collect(Collectors.toList());

        List<CourseDTO> courseDTOs = student.getCourses().stream()
                .map(this::toCourseDTO)
                .collect(Collectors.toList());

        return StudentDTO.builder()
                .id(student.getId())
                .admissionNo(student.getAdmissionNo())
                .firstName(student.getFirstName())
                .lastName(student.getLastName())
                .fullNameWithInitials(student.getFullNameWithInitials())
                .nicNo(student.getNicNo())
                .email(student.getEmail())
                .phone(student.getPhone())
                .dateOfBirth(student.getDateOfBirth())
                .gender(student.getGender())
                .address(student.getAddress())
                .district(student.getDistrict())
                .province(student.getProvince())
                .academicStream(student.getAcademicStream())
                .guardianName(student.getGuardianName())
                .guardianPhone(student.getGuardianPhone())
                .enrollmentDate(student.getEnrollmentDate())
                .courseIds(courseIds)
                .courses(courseDTOs)
                .build();
    }

    private CourseDTO toCourseDTO(Course course) {
        return CourseDTO.builder()
                .id(course.getId())
                .courseName(course.getCourseName())
                .courseCode(course.getCourseCode())
                .description(course.getDescription())
                .credits(course.getCredits())
                .duration(course.getDuration())
                .enrolledStudentsCount(course.getStudents().size())
                .build();
    }
}
