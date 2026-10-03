# 🎓 EduNexus — Advanced Student Management System (SMS)

A full-stack enterprise-grade academic management system built with **Spring Boot 3**, **React 19**, **Material UI**, and **MySQL/H2**.

---

## 🚀 Key Features

- **🔐 Multi-Role RBAC & JWT Security**: Role-based access control with `ADMIN`, `TEACHER`, and `STUDENT` profiles.
- **👥 Student Directory**: Complete CRUD operations, searchable and paginated tables, profile views, and multi-course enrollment.
- **📚 Course Management**: Department curriculum management with credit allocations and student counts.
- **📅 Attendance Register**: Daily roll call tracking (`PRESENT`, `ABSENT`, `LATE`, `EXCUSED`), one-click "Mark All Present", and attendance percentage calculation.
- **📊 Continuous Assessment & Grades (GPA Engine)**: Exam and assignment grade recording with automated letter grades (`A+` to `F`) and real-time Cumulative GPA calculations.
- **💳 Fee & Invoicing Management**: Tuition invoice issuance, payment status tracking (`PAID`, `PENDING`, `OVERDUE`), and online payment confirmation.
- **🧠 AI Academic Risk Advisor & Early Warning System**: Automatically flags vulnerable students based on attendance (< 75%) and low scores (< 60%) with prescriptive intervention recommendations.
- **📥 1-Click Directory Exports**: Instant export of student registries to native Microsoft Excel (`.xlsx`) via Apache POI and CSV (`.csv`).

---

## 🛠️ Tech Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | React 19, Vite, Material UI (MUI v5), Recharts, Axios, React Router v7 |
| **Backend** | Spring Boot 3.2.0, Java 17, Spring Security 6, JJWT, Spring Data JPA |
| **Database** | MySQL 8 / H2 In-Memory (Zero-config fallback) |
| **Reports** | Apache POI (Excel `.xlsx`), OpenCSV |

---

## 📁 Repository Structure

```
Student-Management-System/
├── backend/                  # Spring Boot 3 REST API Server
│   ├── src/main/java/com/sms/studentmanagement/
│   │   ├── config/           # Security & CORS configuration
│   │   ├── controller/       # REST API endpoints (Auth, Students, Grades, etc.)
│   │   ├── dto/              # Data Transfer Objects & Requests
│   │   ├── entity/           # JPA entities (Student, Course, Attendance, Grade, Fee, User)
│   │   ├── repository/       # Spring Data JPA repositories
│   │   ├── security/         # JWT utilities and authentication filters
│   │   └── service/          # Business logic and AI advisor implementations
│   └── pom.xml
├── frontend/                 # React 19 + Vite Frontend Application
│   ├── src/
│   │   ├── api/              # Axios API service clients
│   │   ├── components/       # Layout, forms, and dialog components
│   │   ├── context/          # Authentication context (JWT state)
│   │   ├── pages/            # Dashboard, Students, Courses, Attendance, Grades, Fees, Advisor
│   │   └── theme.js          # Material UI custom theme
│   └── package.json
└── README.md
```

---

## 🏃 Running the Project Locally

### 1. Backend (Spring Boot)
```bash
cd backend
mvn spring-boot:run
```
- Server starts at: `http://localhost:8080`
- API Base: `http://localhost:8080/api`
- H2 Database Console: `http://localhost:8080/h2-console` (JDBC URL: `jdbc:h2:mem:student_management_db`, User: `sa`, No password)

### 2. Frontend (React + Vite)
```bash
cd frontend
npm install
npm run dev
```
- Web Application opens at: `http://localhost:5173` (or `http://localhost:5174`)

---

## 🔑 Demo Login Accounts

| Role | Username | Password |
| :--- | :--- | :--- |
| **Administrator** | `admin` | `admin123` |
| **Teacher** | `teacher` | `teacher123` |
| **Student** | `student` | `student123` |