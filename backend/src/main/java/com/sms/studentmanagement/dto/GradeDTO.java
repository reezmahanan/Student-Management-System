package com.sms.studentmanagement.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class GradeDTO {
    private Long id;

    @NotNull(message = "Student ID is required")
    private Long studentId;
    private String studentName;

    @NotNull(message = "Course ID is required")
    private Long courseId;
    private String courseName;
    private String courseCode;

    @NotBlank(message = "Exam type is required")
    private String examType; // MIDTERM, FINAL, ASSIGNMENT, QUIZ

    @NotNull(message = "Score is required")
    @Min(value = 0, message = "Score cannot be negative")
    private Double score;

    @NotNull(message = "Max score is required")
    @Min(value = 1, message = "Max score must be greater than 0")
    private Double maxScore;

    private String letterGrade;
    private Double gpaPoint;
    private String semester;
    private LocalDate examDate;
    private String feedback;
}
