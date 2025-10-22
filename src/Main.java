import java.util.Scanner;

public class Main {
    public static void main(String[] args) {
        Scanner scanner = new Scanner(System.in);
        StudentManager manager = new StudentManager();
        boolean running = true;

        while (running) {
            System.out.println("######## Welcome to Student Management System! ########");
            System.out.println("Press 1 for Adding a Student");
            System.out.println("Press 2 for Viewing all Students");
            System.out.println("Press 3 for Removing a Student");
            System.out.println("Press 4 to Exit system");
            System.out.print("Choose Your option: ");

            int choice = scanner.nextInt();
            scanner.nextLine(); // consume leftover newline

            switch (choice) {
                case 1:
                    System.out.print("Enter student ID: ");
                    String id = scanner.nextLine();

                    System.out.print("Enter student Name: ");
                    String name = scanner.nextLine();

                    System.out.print("Enter student Age: ");
                    int age = scanner.nextInt();
                    scanner.nextLine(); // consume newline

                    Student newStudent = new Student(name, id, age);
                    manager.addStudents(newStudent);
                    break;

                case 2:
                    manager.displayAllStudents();
                    break;

                case 3:
                    System.out.print("Enter student Id to remove: ");
                    String removeId = scanner.nextLine();
                    manager.removeStudent(removeId);
                    break;

                case 4:
                    System.out.println("Exit system....");
                    scanner.close();
                    return;  // exit the main method and program

                default:
                    System.out.println("Invalid choice! Please try again.\n");
            }
        }
    }
}
