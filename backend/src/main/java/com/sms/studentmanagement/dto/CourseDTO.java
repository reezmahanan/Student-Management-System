package com.sms.studentmanagement.dto;

import jakarta.validation.constraints.*;
import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CourseDTO {

    private Long id;

    @NotBlank(message = "Course name is required")
    @Size(max = 200, message = "Course name must not exceed 200 characters")
    private String courseName;

    @NotBlank(message = "Course code is required")
    @Size(max = 20, message = "Course code must not exceed 20 characters")
    private String courseCode;

    private String description;

    @Min(value = 1, message = "Credits must be at least 1")
    @Max(value = 20, message = "Credits must not exceed 20")
    private Integer credits;

    @Size(max = 100, message = "Duration must not exceed 100 characters")
    private String duration;

    private Integer enrolledStudentsCount;
}
