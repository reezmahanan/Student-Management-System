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
            log.info("Seeding initial admin, teacher, and student users...");

            userRepository.save(User.builder()
                    .username("admin")
                    .email("admin@sms.edu")
                    .fullName("System Administrator")
                    .password(passwordEncoder.encode("admin123"))
                    .role(Role.ROLE_ADMIN)
                    .build());

            userRepository.save(User.builder()
                    .username("teacher")
                    .email("teacher@sms.edu")
                    .fullName("Prof. Alan Turing")
                    .password(passwordEncoder.encode("teacher123"))
                    .role(Role.ROLE_TEACHER)
                    .build());

            userRepository.save(User.builder()
                    .username("student")
                    .email("student@sms.edu")
                    .fullName("Alex Johnson")
                    .password(passwordEncoder.encode("student123"))
                    .role(Role.ROLE_STUDENT)
                    .build());
        }

        // Also seed initial courses and students if database is fresh
        if (courseRepository.count() == 0) {
            log.info("Seeding sample courses...");
            Course cs101 = courseRepository.save(Course.builder()
                    .courseName("Introduction to Computer Science")
                    .courseCode("CS101")
                    .credits(4)
                    .duration("1 Semester")
                    .description("Core computing concepts, algorithms, and Java programming fundamentals.")
                    .build());

            Course web201 = courseRepository.save(Course.builder()
                    .courseName("Full-Stack Web Development")
                    .courseCode("WEB201")
                    .credits(3)
                    .duration("1 Semester")
                    .description("Modern frontend and backend web architecture with React and Spring Boot.")
                    .build());

            Course db301 = courseRepository.save(Course.builder()
                    .courseName("Database Management Systems")
                    .courseCode("DB301")
                    .credits(3)
                    .duration("1 Semester")
                    .description("Relational database design, SQL querying, indexing, and NoSQL fundamentals.")
                    .build());

            if (studentRepository.count() == 0) {
                log.info("Seeding sample students...");
                Student s1 = Student.builder()
                        .firstName("Alex")
                        .lastName("Johnson")
                        .email("alex.johnson@student.edu")
                        .phone("+1 555-0101")
                        .gender("MALE")
                        .dateOfBirth(LocalDate.of(2003, 5, 14))
                        .address("104 Campus Drive, Hall B")
                        .enrollmentDate(LocalDate.now().minusMonths(6))
                        .courses(Set.of(cs101, web201))
                        .build();

                Student s2 = Student.builder()
                        .firstName("Sophia")
                        .lastName("Miller")
                        .email("sophia.m@student.edu")
                        .phone("+1 555-0102")
                        .gender("FEMALE")
                        .dateOfBirth(LocalDate.of(2004, 2, 20))
                        .address("88 Pinecrest Ave, Apt 4")
                        .enrollmentDate(LocalDate.now().minusMonths(3))
                        .courses(Set.of(web201, db301))
                        .build();

                Student s3 = Student.builder()
                        .firstName("David")
                        .lastName("Kim")
                        .email("david.kim@student.edu")
                        .phone("+1 555-0103")
                        .gender("MALE")
                        .dateOfBirth(LocalDate.of(2002, 11, 9))
                        .address("12 University Terrace")
                        .enrollmentDate(LocalDate.now().minusMonths(8))
                        .courses(Set.of(cs101, db301))
                        .build();

                studentRepository.save(s1);
                studentRepository.save(s2);
                studentRepository.save(s3);
            }
        }
    }
}
