package com.sms.studentmanagement.service;

import com.sms.studentmanagement.dto.GradeDTO;

import java.util.List;

public interface GradeService {
    GradeDTO recordGrade(GradeDTO dto);
    GradeDTO updateGrade(Long id, GradeDTO dto);
    void deleteGrade(Long id);
    List<GradeDTO> getGradesByStudent(Long studentId);
    List<GradeDTO> getGradesByCourse(Long courseId);
    Double calculateStudentGPA(Long studentId);
}
