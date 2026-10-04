package com.sms.studentmanagement.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "students")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Student {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Sri Lankan Index / Admission Number, e.g. "ST/2026/001"
    @Column(name = "admission_no", unique = true, length = 30)
    private String admissionNo;

    @Column(name = "first_name", nullable = false, length = 100)
    private String firstName;

    @Column(name = "last_name", nullable = false, length = 100)
    private String lastName;

    @Column(name = "full_name_with_initials", length = 200)
    private String fullNameWithInitials;

    // National Identity Card (NIC) - e.g. "200312345678" or "991234567V"
    @Column(name = "nic_no", length = 20)
    private String nicNo;

    @Column(name = "email", nullable = false, unique = true, length = 150)
    private String email;

    @Column(name = "phone", length = 20)
    private String phone;

    @Column(name = "date_of_birth")
    private LocalDate dateOfBirth;

    @Column(name = "gender", length = 10)
    private String gender;

    @Column(name = "address", length = 500)
    private String address;

    // Sri Lankan District (e.g. Colombo, Kandy, Gampaha, Galle, Jaffna)
    @Column(name = "district", length = 50)
    private String district;

    // Sri Lankan Province (e.g. Western, Central, Southern, Northern, etc.)
    @Column(name = "province", length = 50)
    private String province;

    // Stream / Grade (e.g. "A/L Physical Science", "A/L Bio Science", "A/L Commerce", "A/L Technology", "A/L Arts", "BSc Hons Computing")
    @Column(name = "academic_stream", length = 100)
    private String academicStream;

    // Guardian Details
    @Column(name = "guardian_name", length = 150)
    private String guardianName;

    @Column(name = "guardian_phone", length = 20)
    private String guardianPhone;

    @Column(name = "enrollment_date")
    private LocalDate enrollmentDate;

    @ManyToMany(cascade = {CascadeType.MERGE}, fetch = FetchType.LAZY)
    @JoinTable(
            name = "student_courses",
            joinColumns = @JoinColumn(name = "student_id"),
            inverseJoinColumns = @JoinColumn(name = "course_id")
    )
    @Builder.Default
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private Set<Course> courses = new HashSet<>();
}
