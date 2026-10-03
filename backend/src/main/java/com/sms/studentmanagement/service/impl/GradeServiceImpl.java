package com.sms.studentmanagement.service.impl;

import com.sms.studentmanagement.dto.GradeDTO;
import com.sms.studentmanagement.entity.Course;
import com.sms.studentmanagement.entity.Grade;
import com.sms.studentmanagement.entity.Student;
import com.sms.studentmanagement.exception.ResourceNotFoundException;
import com.sms.studentmanagement.repository.CourseRepository;
import com.sms.studentmanagement.repository.GradeRepository;
import com.sms.studentmanagement.repository.StudentRepository;
import com.sms.studentmanagement.service.GradeService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class GradeServiceImpl implements GradeService {

    private final GradeRepository gradeRepository;
    private final StudentRepository studentRepository;
    private final CourseRepository courseRepository;

    @Override
    @Transactional
    public GradeDTO recordGrade(GradeDTO dto) {
        Student student = studentRepository.findById(dto.getStudentId())
                .orElseThrow(() -> new ResourceNotFoundException("Student", "id", dto.getStudentId()));

        Course course = courseRepository.findById(dto.getCourseId())
                .orElseThrow(() -> new ResourceNotFoundException("Course", "id", dto.getCourseId()));

        Grade grade = Grade.builder()
                .student(student)
                .course(course)
                .examType(dto.getExamType())
                .score(dto.getScore())
                .maxScore(dto.getMaxScore())
                .semester(dto.getSemester() != null ? dto.getSemester() : "Fall 2026")
                .examDate(dto.getExamDate())
                .feedback(dto.getFeedback())
                .build();

        computeLetterAndGpa(grade);

        Grade saved = gradeRepository.save(grade);
        return toDTO(saved);
    }

    @Override
    @Transactional
    public GradeDTO updateGrade(Long id, GradeDTO dto) {
        Grade grade = gradeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Grade", "id", id));

        grade.setExamType(dto.getExamType());
        grade.setScore(dto.getScore());
        grade.setMaxScore(dto.getMaxScore());
        grade.setSemester(dto.getSemester());
        grade.setExamDate(dto.getExamDate());
        grade.setFeedback(dto.getFeedback());

        computeLetterAndGpa(grade);

        return toDTO(gradeRepository.save(grade));
    }

    @Override
    @Transactional
    public void deleteGrade(Long id) {
        if (!gradeRepository.existsById(id)) {
            throw new ResourceNotFoundException("Grade", "id", id);
        }
        gradeRepository.deleteById(id);
    }

    @Override
    @Transactional(readOnly = true)
    public List<GradeDTO> getGradesByStudent(Long studentId) {
        return gradeRepository.findByStudentId(studentId).stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<GradeDTO> getGradesByCourse(Long courseId) {
        return gradeRepository.findByCourseId(courseId).stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public Double calculateStudentGPA(Long studentId) {
        Double avg = gradeRepository.calculateAverageGpaByStudentId(studentId);
        return avg != null ? Math.round(avg * 100.0) / 100.0 : 0.0;
    }

    private void computeLetterAndGpa(Grade grade) {
        double percentage = (grade.getScore() / grade.getMaxScore()) * 100.0;

        if (percentage >= 90) {
            grade.setLetterGrade("A+");
            grade.setGpaPoint(4.0);
        } else if (percentage >= 85) {
            grade.setLetterGrade("A");
            grade.setGpaPoint(3.75);
        } else if (percentage >= 80) {
            grade.setLetterGrade("B+");
            grade.setGpaPoint(3.5);
        } else if (percentage >= 75) {
            grade.setLetterGrade("B");
            grade.setGpaPoint(3.0);
        } else if (percentage >= 70) {
            grade.setLetterGrade("C+");
            grade.setGpaPoint(2.5);
        } else if (percentage >= 60) {
            grade.setLetterGrade("C");
            grade.setGpaPoint(2.0);
        } else if (percentage >= 50) {
            grade.setLetterGrade("D");
            grade.setGpaPoint(1.0);
        } else {
            grade.setLetterGrade("F");
            grade.setGpaPoint(0.0);
        }
    }

    private GradeDTO toDTO(Grade g) {
        return GradeDTO.builder()
                .id(g.getId())
                .studentId(g.getStudent().getId())
                .studentName(g.getStudent().getFirstName() + " " + g.getStudent().getLastName())
                .courseId(g.getCourse().getId())
                .courseName(g.getCourse().getCourseName())
                .courseCode(g.getCourse().getCourseCode())
                .examType(g.getExamType())
                .score(g.getScore())
                .maxScore(g.getMaxScore())
                .letterGrade(g.getLetterGrade())
                .gpaPoint(g.getGpaPoint())
                .semester(g.getSemester())
                .examDate(g.getExamDate())
                .feedback(g.getFeedback())
                .build();
    }
}
