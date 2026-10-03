package com.sms.studentmanagement.service;

import com.sms.studentmanagement.dto.CourseDTO;

import java.util.List;

public interface CourseService {

    /**
     * Retrieve all courses.
     *
     * @return list of all CourseDTO records
     */
    List<CourseDTO> getAllCourses();

    /**
     * Retrieve a single course by ID.
     *
     * @param id course primary key
     * @return CourseDTO representation
     */
    CourseDTO getCourseById(Long id);

    /**
     * Create a new course.
     *
     * @param dto course data transfer object
     * @return persisted CourseDTO with generated ID
     */
    CourseDTO createCourse(CourseDTO dto);

    /**
     * Update an existing course.
     *
     * @param id  course primary key
     * @param dto updated course data
     * @return updated CourseDTO
     */
    CourseDTO updateCourse(Long id, CourseDTO dto);

    /**
     * Delete a course by ID.
     *
     * @param id course primary key
     */
    void deleteCourse(Long id);
}
