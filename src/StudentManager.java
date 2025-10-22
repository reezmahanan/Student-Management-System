import java.util.ArrayList;


public class StudentManager {
    // Student ArrayList
    private ArrayList<Student> studentArray = new ArrayList<>();

    // Add students
    public void addStudents(Student student) {
        studentArray.add(student);
        System.out.println("Student added successfully!\n");
    }

    // Display all the students
    public void displayAllStudents() {
        for (Student student : studentArray) {
            student.displayInfo();
        }
        System.out.println();
    }

    // Remove students
    public void removeStudent(String id) {
        boolean found = false;
        for (Student student : studentArray) {
            if (student.getId().equalsIgnoreCase(id)) {
                studentArray.remove(student);
                System.out.println("Student removed successfully!");
                found = true;
                break; // exit loop immediately after removing
            }
        }
        if (!found) {
            System.out.println("No Student found with id: " + id + "\n");
        }
    }

}


