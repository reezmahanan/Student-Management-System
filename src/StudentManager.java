import java.util.ArrayList;

public class StudentManager {
    private ArrayList<Student> students = new ArrayList<>();

    public void addStudent(Student student) {
        students.add(student);
        System.out.println("✅ Student added successfully!\n");
    }

    public void displayAllStudents() {
        if (students.isEmpty()) {
            System.out.println("No students found.");
            return;
        }

        System.out.println("\n📋 Student List:");
        for (Student student: students) {
            student.displayInfo();
        }
        System.out.println();
    }

    public void removeStudent(String id) {
        boolean found = false;
        for (Student student: students) {
            if (student.getId().equalsIgnoreCase(id)) {
                students.remove(student);
                System.out.println("🗑️ Student removed successfully!\n");
                found = true;
                break;
            }
        }
        if (!found) {
            System.out.println("⚠️ No student found with ID: " + id + "\n");
        }
    }
}




