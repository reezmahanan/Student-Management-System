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

    @Override
    @Transactional(readOnly = true)
    public Double calculateStudentZScore(Long studentId) {
        List<Grade> studentGrades = gradeRepository.findByStudentId(studentId);
        if (studentGrades.isEmpty()) {
            return 0.0;
        }

        double totalZ = 0.0;
        int count = 0;

        for (Grade g : studentGrades) {
            double z = computeSubjectZScore(g);
            totalZ += z;
            count++;
        }

        if (count == 0) return 0.0;
        double compositeZ = totalZ / count;
        return Math.round(compositeZ * 10000.0) / 10000.0;
    }

    private double computeSubjectZScore(Grade grade) {
        double studentPct = (grade.getScore() / grade.getMaxScore()) * 100.0;
        List<Grade> courseGrades = gradeRepository.findByCourseId(grade.getCourse().getId());

        if (courseGrades.size() <= 1) {
            // Standard normalization benchmark (mean = 50.0, std = 15.0)
            return Math.round(((studentPct - 50.0) / 15.0) * 10000.0) / 10000.0;
        }

        double sum = 0.0;
        for (Grade cg : courseGrades) {
            sum += (cg.getScore() / cg.getMaxScore()) * 100.0;
        }
        double mean = sum / courseGrades.size();

        double sumSquares = 0.0;
        for (Grade cg : courseGrades) {
            double pct = (cg.getScore() / cg.getMaxScore()) * 100.0;
            sumSquares += Math.pow(pct - mean, 2);
        }
        double stdDev = Math.sqrt(sumSquares / courseGrades.size());

        if (stdDev < 0.001) {
            return Math.round(((studentPct - 50.0) / 15.0) * 10000.0) / 10000.0;
        }

        double z = (studentPct - mean) / stdDev;
        return Math.round(z * 10000.0) / 10000.0;
    }

    private void computeLetterAndGpa(Grade grade) {
        double percentage = (grade.getScore() / grade.getMaxScore()) * 100.0;

        // Official G.C.E. Advanced Level Grading Scale:
        // A (Distinction): >= 75%
        // B (Very Good Pass): >= 65%
        // C (Credit Pass): >= 55%
        // S (Simple Pass): >= 35%
        // F (Fail): < 35%
        if (percentage >= 75.0) {
            grade.setLetterGrade("A");
            grade.setGpaPoint(4.0);
        } else if (percentage >= 65.0) {
            grade.setLetterGrade("B");
            grade.setGpaPoint(3.0);
        } else if (percentage >= 55.0) {
            grade.setLetterGrade("C");
            grade.setGpaPoint(2.0);
        } else if (percentage >= 35.0) {
            grade.setLetterGrade("S");
            grade.setGpaPoint(1.0);
        } else {
            grade.setLetterGrade("F");
            grade.setGpaPoint(0.0);
        }

        grade.setZScore(computeSubjectZScore(grade));
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
                .zScore(g.getZScore() != null ? g.getZScore() : computeSubjectZScore(g))
                .semester(g.getSemester())
                .examDate(g.getExamDate())
                .feedback(g.getFeedback())
                .build();
    }
}
