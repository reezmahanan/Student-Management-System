package com.sms.studentmanagement.service.impl;

import com.sms.studentmanagement.dto.CourseDTO;
import com.sms.studentmanagement.entity.Course;
import com.sms.studentmanagement.exception.ResourceNotFoundException;
import com.sms.studentmanagement.repository.CourseRepository;
import com.sms.studentmanagement.service.CourseService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class CourseServiceImpl implements CourseService {

    private final CourseRepository courseRepository;

    @Override
    @Transactional(readOnly = true)
    public List<CourseDTO> getAllCourses() {
        log.debug("Fetching all courses");
        return courseRepository.findAll().stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public CourseDTO getCourseById(Long id) {
        log.debug("Fetching course with id: {}", id);
        Course course = findCourseById(id);
        return toDTO(course);
    }

    @Override
    public CourseDTO createCourse(CourseDTO dto) {
        log.debug("Creating course with code: {}", dto.getCourseCode());

        if (courseRepository.existsByCourseCode(dto.getCourseCode())) {
            throw new IllegalArgumentException(
                    "Course with code '" + dto.getCourseCode() + "' already exists");
        }

        Course course = toEntity(dto);
        Course saved = courseRepository.save(course);
        log.info("Created course with id: {}", saved.getId());
        return toDTO(saved);
    }

    @Override
    public CourseDTO updateCourse(Long id, CourseDTO dto) {
        log.debug("Updating course with id: {}", id);
        Course existing = findCourseById(id);

        // Check duplicate course code for other courses
        courseRepository.findByCourseCode(dto.getCourseCode())
                .filter(c -> !c.getId().equals(id))
                .ifPresent(c -> {
                    throw new IllegalArgumentException(
                            "Course code '" + dto.getCourseCode() + "' is already used by another course");
                });

        existing.setCourseName(dto.getCourseName());
        existing.setCourseCode(dto.getCourseCode());
        existing.setDescription(dto.getDescription());
        existing.setCredits(dto.getCredits());
        existing.setDuration(dto.getDuration());

        Course saved = courseRepository.save(existing);
        log.info("Updated course with id: {}", saved.getId());
        return toDTO(saved);
    }

    @Override
    public void deleteCourse(Long id) {
        log.debug("Deleting course with id: {}", id);
        Course course = findCourseById(id);
        // Remove from all student associations first
        course.getStudents().forEach(student -> student.getCourses().remove(course));
        courseRepository.delete(course);
        log.info("Deleted course with id: {}", id);
    }

    // ─── Private Helpers ────────────────────────────────────────────────────────

    private Course findCourseById(Long id) {
        return courseRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Course", "id", id));
    }

    /**
     * Convert Course entity to CourseDTO.
     */
    private CourseDTO toDTO(Course course) {
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

    /**
     * Convert CourseDTO to Course entity.
     */
    private Course toEntity(CourseDTO dto) {
        return Course.builder()
                .courseName(dto.getCourseName())
                .courseCode(dto.getCourseCode())
                .description(dto.getDescription())
                .credits(dto.getCredits())
                .duration(dto.getDuration())
                .build();
    }
}
