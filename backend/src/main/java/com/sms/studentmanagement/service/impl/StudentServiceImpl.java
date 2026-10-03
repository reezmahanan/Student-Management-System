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
import org.springframework.util.StringUtils;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class StudentServiceImpl implements StudentService {

    private final StudentRepository studentRepository;
    private final CourseRepository courseRepository;

    @Override
    @Transactional(readOnly = true)
    public Page<StudentDTO> getAllStudents(int page, int size, String search) {
        log.debug("Fetching students - page: {}, size: {}, search: '{}'", page, size, search);
        Pageable pageable = PageRequest.of(page, size, Sort.by("firstName").ascending());

        Page<Student> studentPage;
        if (StringUtils.hasText(search)) {
            studentPage = studentRepository
                    .findByFirstNameContainingIgnoreCaseOrLastNameContainingIgnoreCaseOrEmailContainingIgnoreCase(
                            search, search, search, pageable);
        } else {
            studentPage = studentRepository.findAll(pageable);
        }

        return studentPage.map(this::toDTO);
    }

    @Override
    @Transactional(readOnly = true)
    public StudentDTO getStudentById(Long id) {
        log.debug("Fetching student with id: {}", id);
        Student student = findStudentById(id);
        return toDTO(student);
    }

    @Override
    public StudentDTO createStudent(StudentDTO dto) {
        log.debug("Creating new student with email: {}", dto.getEmail());

        // Check for duplicate email
        studentRepository.findAll().stream()
                .filter(s -> s.getEmail().equalsIgnoreCase(dto.getEmail()))
                .findFirst()
                .ifPresent(s -> {
                    throw new IllegalArgumentException(
                            "Student with email '" + dto.getEmail() + "' already exists");
                });

        Student student = toEntity(dto);
        Student saved = studentRepository.save(student);
        log.info("Created student with id: {}", saved.getId());
        return toDTO(saved);
    }

    @Override
    public StudentDTO updateStudent(Long id, StudentDTO dto) {
        log.debug("Updating student with id: {}", id);
        Student existing = findStudentById(id);

        // Check duplicate email for other students
        studentRepository.findAll().stream()
                .filter(s -> !s.getId().equals(id) && s.getEmail().equalsIgnoreCase(dto.getEmail()))
                .findFirst()
                .ifPresent(s -> {
                    throw new IllegalArgumentException(
                            "Email '" + dto.getEmail() + "' is already used by another student");
                });

        existing.setFirstName(dto.getFirstName());
        existing.setLastName(dto.getLastName());
        existing.setEmail(dto.getEmail());
        existing.setPhone(dto.getPhone());
        existing.setDateOfBirth(dto.getDateOfBirth());
        existing.setGender(dto.getGender());
        existing.setAddress(dto.getAddress());
        existing.setEnrollmentDate(dto.getEnrollmentDate());

        Student saved = studentRepository.save(existing);
        log.info("Updated student with id: {}", saved.getId());
        return toDTO(saved);
    }

    @Override
    public void deleteStudent(Long id) {
        log.debug("Deleting student with id: {}", id);
        Student student = findStudentById(id);
        // Remove from all course associations first
        student.getCourses().forEach(course -> course.getStudents().remove(student));
        studentRepository.delete(student);
        log.info("Deleted student with id: {}", id);
    }

    @Override
    public StudentDTO enrollInCourse(Long studentId, Long courseId) {
        log.debug("Enrolling student {} in course {}", studentId, courseId);
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
    public StudentDTO unenrollFromCourse(Long studentId, Long courseId) {
        log.debug("Unenrolling student {} from course {}", studentId, courseId);
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

    /**
     * Convert Student entity to StudentDTO.
     */
    private StudentDTO toDTO(Student student) {
        List<Long> courseIds = student.getCourses().stream()
                .map(Course::getId)
                .collect(Collectors.toList());

        List<CourseDTO> courseDTOs = student.getCourses().stream()
                .map(this::courseToDTO)
                .collect(Collectors.toList());

        return StudentDTO.builder()
                .id(student.getId())
                .firstName(student.getFirstName())
                .lastName(student.getLastName())
                .email(student.getEmail())
                .phone(student.getPhone())
                .dateOfBirth(student.getDateOfBirth())
                .gender(student.getGender())
                .address(student.getAddress())
                .enrollmentDate(student.getEnrollmentDate())
                .courseIds(courseIds)
                .courses(courseDTOs)
                .build();
    }

    /**
     * Convert StudentDTO to Student entity.
     */
    private Student toEntity(StudentDTO dto) {
        return Student.builder()
                .firstName(dto.getFirstName())
                .lastName(dto.getLastName())
                .email(dto.getEmail())
                .phone(dto.getPhone())
                .dateOfBirth(dto.getDateOfBirth())
                .gender(dto.getGender())
                .address(dto.getAddress())
                .enrollmentDate(dto.getEnrollmentDate())
                .build();
    }

    /**
     * Convert Course entity to CourseDTO (without student list to avoid recursion).
     */
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
