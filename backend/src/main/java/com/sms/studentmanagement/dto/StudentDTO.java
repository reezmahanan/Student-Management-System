package com.sms.studentmanagement.dto;

import jakarta.validation.constraints.*;
import lombok.*;

import java.time.LocalDate;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StudentDTO {

    private Long id;

    // Sri Lankan Admission / Student ID (e.g. "ST/2026/001")
    private String admissionNo;

    @NotBlank(message = "First name is required")
    @Size(max = 100, message = "First name must not exceed 100 characters")
    private String firstName;

    @NotBlank(message = "Last name is required")
    @Size(max = 100, message = "Last name must not exceed 100 characters")
    private String lastName;

    private String fullNameWithInitials;

    // Sri Lankan NIC number (e.g. "200312345678" or "991234567V")
    private String nicNo;

    @NotBlank(message = "Email is required")
    @Email(message = "Email must be a valid email address")
    @Size(max = 150, message = "Email must not exceed 150 characters")
    private String email;

    @Size(max = 20, message = "Phone must not exceed 20 characters")
    private String phone;

    private LocalDate dateOfBirth;

    @Size(max = 10, message = "Gender must not exceed 10 characters")
    private String gender;

    @Size(max = 500, message = "Address must not exceed 500 characters")
    private String address;

    // Sri Lankan District & Province
    private String district;
    private String province;

    // Academic Stream (e.g. Physical Science, Bio Science, Technology, Commerce, Arts)
    private String academicStream;

    // Guardian details
    private String guardianName;
    private String guardianPhone;

    private LocalDate enrollmentDate;

    private List<Long> courseIds;

    private List<CourseDTO> courses;
}
