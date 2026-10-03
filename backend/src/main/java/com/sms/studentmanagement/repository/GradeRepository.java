package com.sms.studentmanagement.repository;

import com.sms.studentmanagement.entity.Grade;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface GradeRepository extends JpaRepository<Grade, Long> {
    List<Grade> findByStudentId(Long studentId);
    List<Grade> findByCourseId(Long courseId);
    List<Grade> findByStudentIdAndCourseId(Long studentId, Long courseId);

    @Query("SELECT AVG(g.gpaPoint) FROM Grade g WHERE g.student.id = :studentId AND g.gpaPoint IS NOT NULL")
    Double calculateAverageGpaByStudentId(@Param("studentId") Long studentId);

    @Query("SELECT AVG((g.score / g.maxScore) * 100.0) FROM Grade g WHERE g.student.id = :studentId")
    Double calculateAverageScorePercentageByStudentId(@Param("studentId") Long studentId);
}
