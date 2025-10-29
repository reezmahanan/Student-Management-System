import java.util.Scanner;

public class Main {
    public static void main(String[] args) {
        Scanner scanner = new Scanner(System.in);
        StudentManager manager = new StudentManager();

        while (true) {
            System.out.println("===== Student Management System =====");
            System.out.println("1. Add Student");
            System.out.println("2. View All Students");
            System.out.println("3. Remove Student");
            System.out.println("4. Exit");
            System.out.print("Choose an option: ");

            int choice = scanner.nextInt();
            scanner.nextLine(); // consume leftover newline

            switch (choice) {
                case 1:
                    System.out.print("Enter Student ID: ");
                    String id = scanner.nextLine();

                    System.out.print("Enter Student Name: ");
                    String name = scanner.nextLine();

                    System.out.print("Enter Student Age: ");
                    int age = scanner.nextInt();

                    Student newStudent = new Student(name, age, id);
                    manager.addStudent(newStudent);
                    break;

                case 2:
                    manager.displayAllStudents();
                    break;

                case 3:
                    System.out.print("Enter Student ID to remove: ");
                    String removeId = scanner.nextLine();
                    manager.removeStudent(removeId);
                    break;

                case 4:
                    System.out.println("👋 Exiting program...");
                    scanner.close();
                    return;

                default:
                    System.out.println("⚠️ Invalid choice! Please try again.\n");
            }
        }
    }
}
