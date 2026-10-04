package com.sms.studentmanagement.service.impl;

import com.sms.studentmanagement.dto.AuthDTOs;
import com.sms.studentmanagement.entity.Course;
import com.sms.studentmanagement.entity.Role;
import com.sms.studentmanagement.entity.Student;
import com.sms.studentmanagement.entity.User;
import com.sms.studentmanagement.repository.CourseRepository;
import com.sms.studentmanagement.repository.StudentRepository;
import com.sms.studentmanagement.repository.UserRepository;
import com.sms.studentmanagement.security.JwtUtils;
import com.sms.studentmanagement.service.AuthService;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.Set;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuthServiceImpl implements AuthService {

    private final AuthenticationManager authenticationManager;
    private final UserRepository userRepository;
    private final StudentRepository studentRepository;
    private final CourseRepository courseRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtils jwtUtils;

    @Override
    public AuthDTOs.JwtResponse login(AuthDTOs.LoginRequest request) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getUsername(), request.getPassword()));

        SecurityContextHolder.getContext().setAuthentication(authentication);
        String jwt = jwtUtils.generateJwtToken(authentication);

        User user = userRepository.findByUsername(request.getUsername())
                .or(() -> userRepository.findByEmail(request.getUsername()))
                .orElseThrow(() -> new RuntimeException("User not found"));

        return AuthDTOs.JwtResponse.builder()
                .token(jwt)
                .type("Bearer")
                .id(user.getId())
                .username(user.getUsername())
                .email(user.getEmail())
                .fullName(user.getFullName())
                .role(user.getRole().name())
                .linkedStudentId(user.getLinkedStudentId())
                .build();
    }

    @Override
    @Transactional
    public AuthDTOs.JwtResponse register(AuthDTOs.RegisterRequest request) {
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new IllegalArgumentException("Username is already taken");
        }
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new IllegalArgumentException("Email is already in use");
        }

        Role role = request.getRole() != null ? request.getRole() : Role.ROLE_STUDENT;

        User user = User.builder()
                .username(request.getUsername())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .fullName(request.getFullName())
                .role(role)
                .linkedStudentId(request.getLinkedStudentId())
                .build();

        userRepository.save(user);

        return login(new AuthDTOs.LoginRequest(request.getUsername(), request.getPassword()));
    }

    @PostConstruct
    @Transactional
    public void seedInitialUsersAndDemoData() {
        if (userRepository.count() == 0) {
            log.info("Seeding initial Sri Lankan admin, teacher, and student users...");

            userRepository.save(User.builder()
                    .username("admin")
                    .email("admin@sms.edu.lk")
                    .fullName("Principal / Academic Registrar")
                    .password(passwordEncoder.encode("admin123"))
                    .role(Role.ROLE_ADMIN)
                    .build());

            userRepository.save(User.builder()
                    .username("teacher")
                    .email("teacher@sms.edu.lk")
                    .fullName("Prof. Sunimal Senanayake")
                    .password(passwordEncoder.encode("teacher123"))
                    .role(Role.ROLE_TEACHER)
                    .build());

            userRepository.save(User.builder()
                    .username("student")
                    .email("student@sms.edu.lk")
                    .fullName("Kasun Bandara")
                    .password(passwordEncoder.encode("student123"))
                    .role(Role.ROLE_STUDENT)
                    .build());
        }

        // Seed Sri Lankan curriculum subjects & courses
        if (courseRepository.count() == 0) {
            log.info("Seeding Sri Lankan curriculum courses & subjects...");
            Course cs101 = courseRepository.save(Course.builder()
                    .courseName("Combined Mathematics & Computing")
                    .courseCode("AL-MATH-01")
                    .credits(4)
                    .duration("Year 12 - Term 1")
                    .description("G.C.E. Advanced Level Physical Science curriculum with pure and applied mathematics.")
                    .build());

            Course web201 = courseRepository.save(Course.builder()
                    .courseName("Information & Communication Technology (ICT)")
                    .courseCode("AL-ICT-02")
                    .credits(3)
                    .duration("Year 12 - Term 1")
                    .description("G.C.E. A/L ICT stream covering software engineering, database systems, and networking.")
                    .build());

            Course phy301 = courseRepository.save(Course.builder()
                    .courseName("Physics & Electronics Laboratory")
                    .courseCode("AL-PHY-03")
                    .credits(4)
                    .duration("Year 12 - Term 1")
                    .description("Theoretical mechanics, electromagnetism, modern physics, and laboratory experiments.")
                    .build());

            if (studentRepository.count() == 0) {
                log.info("Seeding Sri Lankan student directory demo records...");
                Student s1 = Student.builder()
                        .admissionNo("ST/2026/001")
                        .firstName("Kasun")
                        .lastName("Bandara")
                        .fullNameWithInitials("K.M. Kasun Bandara")
                        .nicNo("200318501244")
                        .email("kasun.bandara@student.edu.lk")
                        .phone("+94 77 123 4567")
                        .gender("MALE")
                        .dateOfBirth(LocalDate.of(2003, 5, 14))
                        .address("No. 45, Temple Road, Maharagama")
                        .district("Colombo")
                        .province("Western Province")
                        .academicStream("A/L Physical Science (Maths)")
                        .guardianName("Sunil Bandara")
                        .guardianPhone("+94 71 888 1234")
                        .enrollmentDate(LocalDate.now().minusMonths(6))
                        .courses(Set.of(cs101, web201))
                        .build();

                Student s2 = Student.builder()
                        .admissionNo("ST/2026/002")
                        .firstName("Nadeesha")
                        .lastName("Perera")
                        .fullNameWithInitials("W.A. Nadeesha Perera")
                        .nicNo("200465209871")
                        .email("nadeesha.p@student.edu.lk")
                        .phone("+94 71 456 7890")
                        .gender("FEMALE")
                        .dateOfBirth(LocalDate.of(2004, 2, 20))
                        .address("12/B, Lake Round, Kandy")
                        .district("Kandy")
                        .province("Central Province")
                        .academicStream("A/L Technology Stream")
                        .guardianName("Anura Perera")
                        .guardianPhone("+94 77 999 5678")
                        .enrollmentDate(LocalDate.now().minusMonths(3))
                        .courses(Set.of(web201, phy301))
                        .build();

                Student s3 = Student.builder()
                        .admissionNo("ST/2026/003")
                        .firstName("Tharindu")
                        .lastName("Silva")
                        .fullNameWithInitials("H.P. Tharindu Silva")
                        .nicNo("200214803321")
                        .email("tharindu.silva@student.edu.lk")
                        .phone("+94 76 987 6543")
                        .gender("MALE")
                        .dateOfBirth(LocalDate.of(2002, 11, 9))
                        .address("88 Galle Road, Matara")
                        .district("Matara")
                        .province("Southern Province")
                        .academicStream("A/L Physical Science (Maths)")
                        .guardianName("Dharmadasa Silva")
                        .guardianPhone("+94 70 333 4455")
                        .enrollmentDate(LocalDate.now().minusMonths(8))
                        .courses(Set.of(cs101, phy301))
                        .build();

                studentRepository.save(s1);
                studentRepository.save(s2);
                studentRepository.save(s3);
            }
        }
    }
}
