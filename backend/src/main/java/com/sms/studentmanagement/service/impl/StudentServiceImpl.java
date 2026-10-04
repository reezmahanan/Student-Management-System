package com.sms.studentmanagement.service.impl;

import com.sms.studentmanagement.dto.CourseDTO;
import com.sms.studentmanagement.dto.StudentDTO;
import com.sms.studentmanagement.entity.Course;
import com.sms.studentmanagement.entity.Student;
import com.sms.studentmanagement.exception.ResourceNotFoundException;
import com.sms.studentmanagement.repository.CourseRepository;
import com.sms.studentmanagement.repository.StudentRepository;
import com.sms.studentmanagement.service.StudentService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class StudentServiceImpl implements StudentService {

    private final StudentRepository studentRepository;
    private final CourseRepository courseRepository;

    @Override
    @Transactional(readOnly = true)
    public Page<StudentDTO> getAllStudents(int page, int size, String search) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "id"));
        Page<Student> studentPage;

        if (search != null && !search.trim().isEmpty()) {
            String trimmed = search.trim();
            studentPage = studentRepository
                    .findByFirstNameContainingIgnoreCaseOrLastNameContainingIgnoreCaseOrEmailContainingIgnoreCase(
                            trimmed, trimmed, trimmed, pageable);
        } else {
            studentPage = studentRepository.findAll(pageable);
        }

        return studentPage.map(this::toDTO);
    }

    @Override
    @Transactional(readOnly = true)
    public StudentDTO getStudentById(Long id) {
        Student student = findStudentById(id);
        return toDTO(student);
    }

    @Override
    @Transactional
    public StudentDTO createStudent(StudentDTO dto) {
        studentRepository.findAll().stream()
                .filter(s -> s.getEmail().equalsIgnoreCase(dto.getEmail()))
                .findFirst()
                .ifPresent(s -> {
                    throw new IllegalArgumentException("Student with email already exists: " + dto.getEmail());
                });

        Student student = toEntity(dto);

        // Auto-generate Sri Lankan admission no if omitted
        if (student.getAdmissionNo() == null || student.getAdmissionNo().trim().isEmpty()) {
            long count = studentRepository.count() + 1;
            student.setAdmissionNo(String.format("ST/%d/%03d", LocalDate.now().getYear(), count));
        }

        if (student.getEnrollmentDate() == null) {
            student.setEnrollmentDate(LocalDate.now());
        }

        if (dto.getCourseIds() != null && !dto.getCourseIds().isEmpty()) {
            for (Long courseId : dto.getCourseIds()) {
                Course course = findCourseById(courseId);
                student.getCourses().add(course);
                course.getStudents().add(student);
            }
        }

        Student saved = studentRepository.save(student);
        log.info("Student created successfully with ID: {}", saved.getId());
        return toDTO(saved);
    }

    @Override
    @Transactional
    public StudentDTO updateStudent(Long id, StudentDTO dto) {
        Student student = findStudentById(id);

        studentRepository.findAll().stream()
                .filter(s -> s.getEmail().equalsIgnoreCase(dto.getEmail()) && !s.getId().equals(id))
                .findFirst()
                .ifPresent(s -> {
                    throw new IllegalArgumentException("Student with email already exists: " + dto.getEmail());
                });

        student.setFirstName(dto.getFirstName());
        student.setLastName(dto.getLastName());
        student.setFullNameWithInitials(dto.getFullNameWithInitials());
        student.setAdmissionNo(dto.getAdmissionNo());
        student.setNicNo(dto.getNicNo());
        student.setEmail(dto.getEmail());
        student.setPhone(dto.getPhone());
        student.setDateOfBirth(dto.getDateOfBirth());
        student.setGender(dto.getGender());
        student.setAddress(dto.getAddress());
        student.setDistrict(dto.getDistrict());
        student.setProvince(dto.getProvince());
        student.setAcademicStream(dto.getAcademicStream());
        student.setGuardianName(dto.getGuardianName());
        student.setGuardianPhone(dto.getGuardianPhone());
        student.setEnrollmentDate(dto.getEnrollmentDate());

        if (dto.getCourseIds() != null) {
            student.getCourses().clear();
            for (Long courseId : dto.getCourseIds()) {
                Course course = findCourseById(courseId);
                student.getCourses().add(course);
                course.getStudents().add(student);
            }
        }

        Student updated = studentRepository.save(student);
        log.info("Student updated successfully with ID: {}", updated.getId());
        return toDTO(updated);
    }

    @Override
    @Transactional
    public void deleteStudent(Long id) {
        Student student = findStudentById(id);
        student.getCourses().forEach(c -> c.getStudents().remove(student));
        student.getCourses().clear();
        studentRepository.delete(student);
        log.info("Student deleted successfully with ID: {}", id);
    }

    @Override
    @Transactional
    public StudentDTO enrollInCourse(Long studentId, Long courseId) {
        Student student = findStudentById(studentId);
        Course course = findCourseById(courseId);

        if (student.getCourses().contains(course)) {
            throw new IllegalArgumentException(
                    "Student is already enrolled in course: " + course.getCourseName());
        }

        student.getCourses().add(course);
        course.getStudents().add(student);
        Student saved = studentRepository.save(student);
        log.info("Student {} enrolled in course {}", studentId, courseId);
        return toDTO(saved);
    }

    @Override
    @Transactional
    public StudentDTO unenrollFromCourse(Long studentId, Long courseId) {
        Student student = findStudentById(studentId);
        Course course = findCourseById(courseId);

        if (!student.getCourses().contains(course)) {
            throw new IllegalArgumentException(
                    "Student is not enrolled in course: " + course.getCourseName());
        }

        student.getCourses().remove(course);
        course.getStudents().remove(student);
        Student saved = studentRepository.save(student);
        log.info("Student {} unenrolled from course {}", studentId, courseId);
        return toDTO(saved);
    }

    // ─── Private Helpers ────────────────────────────────────────────────────────

    private Student findStudentById(Long id) {
        return studentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Student", "id", id));
    }

    private Course findCourseById(Long id) {
        return courseRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Course", "id", id));
    }

    private StudentDTO toDTO(Student student) {
        List<Long> courseIds = student.getCourses().stream()
                .map(Course::getId)
                .collect(Collectors.toList());

        List<CourseDTO> courseDTOs = student.getCourses().stream()
                .map(this::courseToDTO)
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

    private Student toEntity(StudentDTO dto) {
        return Student.builder()
                .admissionNo(dto.getAdmissionNo())
                .firstName(dto.getFirstName())
                .lastName(dto.getLastName())
                .fullNameWithInitials(dto.getFullNameWithInitials())
                .nicNo(dto.getNicNo())
                .email(dto.getEmail())
                .phone(dto.getPhone())
                .dateOfBirth(dto.getDateOfBirth())
                .gender(dto.getGender())
                .address(dto.getAddress())
                .district(dto.getDistrict())
                .province(dto.getProvince())
                .academicStream(dto.getAcademicStream())
                .guardianName(dto.getGuardianName())
                .guardianPhone(dto.getGuardianPhone())
                .enrollmentDate(dto.getEnrollmentDate())
                .build();
    }

    private CourseDTO courseToDTO(Course course) {
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
