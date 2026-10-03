package com.sms.studentmanagement.service;

import com.sms.studentmanagement.dto.StudentDTO;
import org.springframework.data.domain.Page;

public interface StudentService {

    /**
     * Retrieve a paginated list of students, optionally filtered by a search term.
     *
     * @param page   zero-based page index
     * @param size   number of records per page
     * @param search optional search string matched against firstName, lastName, or email
     * @return paginated StudentDTO results
     */
    Page<StudentDTO> getAllStudents(int page, int size, String search);

    /**
     * Retrieve a single student by ID.
     *
     * @param id student primary key
     * @return StudentDTO representation
     */
    StudentDTO getStudentById(Long id);

    /**
     * Create a new student record.
     *
     * @param dto student data transfer object
     * @return persisted StudentDTO with generated ID
     */
    StudentDTO createStudent(StudentDTO dto);

    /**
     * Update an existing student record.
     *
     * @param id  student primary key
     * @param dto updated student data
     * @return updated StudentDTO
     */
    StudentDTO updateStudent(Long id, StudentDTO dto);

    /**
     * Delete a student by ID.
     *
     * @param id student primary key
     */
    void deleteStudent(Long id);

    /**
     * Enroll a student into a course.
     *
     * @param studentId student primary key
     * @param courseId  course primary key
     * @return updated StudentDTO with enrolled course
     */
    StudentDTO enrollInCourse(Long studentId, Long courseId);

    /**
     * Remove a student from a course.
     *
     * @param studentId student primary key
     * @param courseId  course primary key
     * @return updated StudentDTO without the removed course
     */
    StudentDTO unenrollFromCourse(Long studentId, Long courseId);
}
