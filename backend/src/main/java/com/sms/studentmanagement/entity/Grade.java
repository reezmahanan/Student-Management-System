package com.sms.studentmanagement.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;

@Entity
@Table(name = "grades")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Grade {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "student_id", nullable = false)
    private Student student;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "course_id", nullable = false)
    private Course course;

    @Column(name = "exam_type", nullable = false, length = 50)
    private String examType; // e.g. "MIDTERM", "FINAL", "ASSIGNMENT", "QUIZ"

    @Column(name = "score", nullable = false)
    private Double score;

    @Column(name = "max_score", nullable = false)
    private Double maxScore;

    @Column(name = "letter_grade", length = 5)
    private String letterGrade; // A+, A, B, C, D, F

    @Column(name = "gpa_point")
    private Double gpaPoint; // 4.0 scale

    @Column(name = "semester", length = 30)
    private String semester; // e.g. "Fall 2026"

    @Column(name = "exam_date")
    private LocalDate examDate;

    @Column(length = 255)
    private String feedback;
}
