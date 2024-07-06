-- Create Faculty Table
CREATE TABLE Faculty (
    ID SERIAL PRIMARY KEY,
    Name VARCHAR(100) NOT NULL,
    Mail_ID VARCHAR(100),
    Office_Number VARCHAR(20),
    Phone_Number VARCHAR(20),
    Department_ID INTEGER
);

-- Create Department Table
CREATE TABLE Department (
    ID SERIAL PRIMARY KEY,
    Name VARCHAR(100) NOT NULL,
    HOD INTEGER,
    FOREIGN KEY (HOD) REFERENCES Faculty (ID) ON UPDATE CASCADE ON DELETE CASCADE
);

-- Create Student Table
CREATE TABLE Student (
    Roll_No SERIAL PRIMARY KEY,
    Name VARCHAR(100) NOT NULL,
    Gender VARCHAR(10),
    Mail_ID VARCHAR(100),
    Address VARCHAR(255),
    Phone_Number VARCHAR(20),
    DoB DATE,
    Dept_ID INTEGER,
    Date_of_Admission DATE,
    FOREIGN KEY (Dept_ID) REFERENCES Department (ID) ON UPDATE CASCADE ON DELETE CASCADE
);



-- Create Courses Table
CREATE TABLE Courses (
    Course_ID SERIAL PRIMARY KEY,
    Course_Name VARCHAR(100) NOT NULL,
    Credits INTEGER,
    Contact_Hrs INTEGER,
    Prerequisite_Course_IDs INTEGER[],
    Faculty_ID INTEGER,
    FOREIGN KEY (Faculty_ID) REFERENCES Faculty (ID) ON UPDATE CASCADE ON DELETE CASCADE
);



-- Create Payments Table
CREATE TABLE Payments (
    UTR_No VARCHAR(50) PRIMARY KEY,
    Date_of_Payment DATE,
    Amount DECIMAL(10, 2),
    Sem_No INTEGER,
    Student_ID INTEGER,
    FOREIGN KEY (Student_ID) REFERENCES Student (Roll_No) ON UPDATE CASCADE ON DELETE CASCADE
);

-- Create Registration Table
CREATE TABLE Registration (
    Student_ID INTEGER,
    Course_ID INTEGER,
    Sem_No INTEGER,
    Status VARCHAR(20),
    PRIMARY KEY (Student_ID, Course_ID, Sem_No),
    FOREIGN KEY (Student_ID) REFERENCES Student (Roll_No) ON UPDATE CASCADE ON DELETE CASCADE,
    FOREIGN KEY (Course_ID) REFERENCES Courses (Course_ID) ON UPDATE CASCADE ON DELETE CASCADE
);

-- Create Results Table
CREATE TABLE Results (
    Student_ID INTEGER,
    Course_ID INTEGER,
    Grade VARCHAR(2),
    PRIMARY KEY (Student_ID, Course_ID),
    FOREIGN KEY (Student_ID) REFERENCES Student (Roll_No) ON UPDATE CASCADE ON DELETE CASCADE,
    FOREIGN KEY (Course_ID) REFERENCES Courses (Course_ID) ON UPDATE CASCADE ON DELETE CASCADE
);

-- Create Semester Table
CREATE TABLE Semester (
    Sem_No INTEGER,
    Department_ID INTEGER,
    Course_ID INTEGER,
    Faculty_ID INTEGER,
    Total_Number_of_Classes INTEGER,
    PRIMARY KEY (Sem_No, Department_ID, Course_ID),
    FOREIGN KEY (Department_ID) REFERENCES Department (ID) ON UPDATE CASCADE ON DELETE CASCADE,
    FOREIGN KEY (Course_ID) REFERENCES Courses (Course_ID) ON UPDATE CASCADE ON DELETE CASCADE,
    FOREIGN KEY (Faculty_ID) REFERENCES Faculty (ID) ON UPDATE CASCADE ON DELETE CASCADE
);

-- Create Attendance Table
CREATE TABLE Attendance (
    Student_ID INTEGER,
    Course_ID INTEGER,
    No_of_Classes INTEGER,
    PRIMARY KEY (Student_ID, Course_ID),
    FOREIGN KEY (Student_ID) REFERENCES Student (Roll_No) ON UPDATE CASCADE ON DELETE CASCADE,
    FOREIGN KEY (Course_ID) REFERENCES Courses (Course_ID) ON UPDATE CASCADE ON DELETE CASCADE
);

-- Create Exams Table
CREATE TABLE Exams (
    Course_ID INTEGER PRIMARY KEY,
    Date DATE,
    Slot VARCHAR(20),
    FOREIGN KEY (Course_ID) REFERENCES Courses (Course_ID) ON UPDATE CASCADE ON DELETE CASCADE
);

-- Create Exam_Location Table
CREATE TABLE Exam_Location (
    Student_ID INTEGER,
    Course_ID INTEGER,
    Location VARCHAR(100),
    Invigilator INTEGER,
    PRIMARY KEY (Student_ID, Course_ID),
    FOREIGN KEY (Student_ID) REFERENCES Student (Roll_No) ON UPDATE CASCADE ON DELETE CASCADE,
    FOREIGN KEY (Course_ID) REFERENCES Courses (Course_ID) ON UPDATE CASCADE ON DELETE CASCADE,
    FOREIGN KEY (Invigilator) REFERENCES Faculty (ID) ON UPDATE CASCADE ON DELETE CASCADE
);

-- Alter Faculty Table to add Department_ID as a foreign key
ALTER TABLE Faculty ADD CONSTRAINT fk_department_id FOREIGN KEY (Department_ID) REFERENCES Department (ID) ON UPDATE CASCADE ON DELETE CASCADE;

---- Adding data

-- Insert data into Faculty table
INSERT INTO Faculty (Name, Mail_ID, Office_Number, Phone_Number, Department_ID) 
VALUES ('John Smith', 'john.smith@example.com', 'A101', '123-456-7890', 1);
INSERT INTO Faculty (Name, Mail_ID, Office_Number, Phone_Number, Department_ID) 
VALUES ('Emily Johnson', 'emily.johnson@example.com', 'B202', '987-654-3210', 2);
INSERT INTO Faculty (Name, Mail_ID, Office_Number, Phone_Number, Department_ID) 
VALUES ('Michael Williams', 'michael.williams@example.com', 'C303', '555-123-4567', 3);
INSERT INTO Faculty (Name, Mail_ID, Office_Number, Phone_Number, Department_ID) 
VALUES ('Sarah Davis', 'sarah.davis@example.com', 'D404', '111-222-3333', 1);
INSERT INTO Faculty (Name, Mail_ID, Office_Number, Phone_Number, Department_ID) 
VALUES ('Daniel Wilson', 'daniel.wilson@example.com', 'E505', '444-555-6666', 2);
INSERT INTO Faculty (Name, Mail_ID, Office_Number, Phone_Number, Department_ID) 
VALUES ('Olivia Brown', 'olivia.brown@example.com', 'F606', '777-888-9999', 3);
INSERT INTO Faculty (Name, Mail_ID, Office_Number, Phone_Number, Department_ID) 
VALUES ('William Taylor', 'william.taylor@example.com', 'G707', '888-999-0000', 1);
INSERT INTO Faculty (Name, Mail_ID, Office_Number, Phone_Number, Department_ID) 
VALUES ('Emma Anderson', 'emma.anderson@example.com', 'H808', '999-000-1111', 2);

-- Insert data into Department table
INSERT INTO Department (Name) VALUES ('Computer Science');
INSERT INTO Department (Name) VALUES ('Electrical Engineering');
INSERT INTO Department (Name) VALUES ('Mechanical Engineering');



-- Insert data into Student table
INSERT INTO Student (Name, Gender, Mail_ID, Address, Phone_Number, DoB, Dept_ID, Date_of_Admission) 
VALUES ('Alice Brown', 'Female', 'alice.brown@example.com', '123 Main St', '111-222-3333', '2002-05-15', 1, '2023-09-01');
INSERT INTO Student (Name, Gender, Mail_ID, Address, Phone_Number, DoB, Dept_ID, Date_of_Admission) 
VALUES ('Bob Jones', 'Male', 'bob.jones@example.com', '456 Elm St', '444-555-6666', '2001-07-20', 2, '2023-09-01');
INSERT INTO Student (Name, Gender, Mail_ID, Address, Phone_Number, DoB, Dept_ID, Date_of_Admission) 
VALUES ('Carol Davis', 'Female', 'carol.davis@example.com', '789 Oak St', '777-888-9999', '2003-02-10', 3, '2023-09-01');

-- Insert data into Courses table
INSERT INTO Courses (Course_Name, Credits, Contact_Hrs, Faculty_ID) 
VALUES ('Introduction to Programming', 3, 45, 1);
INSERT INTO Courses (Course_Name, Credits, Contact_Hrs, Faculty_ID) 
VALUES ('Data Structures', 3, 45, 1);
INSERT INTO Courses (Course_Name, Credits, Contact_Hrs, Faculty_ID, Prerequisite_Course_IDs) 
VALUES ('Algorithms', 3, 45, 1, '{1,2}');
INSERT INTO Courses (Course_Name, Credits, Contact_Hrs, Faculty_ID) 
VALUES ('Circuit Theory', 4, 60, 2);
INSERT INTO Courses (Course_Name, Credits, Contact_Hrs, Faculty_ID) 
VALUES ('Electronics', 4, 60, 2);
INSERT INTO Courses (Course_Name, Credits, Contact_Hrs, Faculty_ID, Prerequisite_Course_IDs) 
VALUES ('Digital Systems', 4, 60, 2, '{4,5}');
INSERT INTO Courses (Course_Name, Credits, Contact_Hrs, Faculty_ID) 
VALUES ('Mechanics', 4, 60, 3);
INSERT INTO Courses (Course_Name, Credits, Contact_Hrs, Faculty_ID) 
VALUES ('Thermodynamics', 4, 60, 3);
INSERT INTO Courses (Course_Name, Credits, Contact_Hrs, Faculty_ID, Prerequisite_Course_IDs) 
VALUES ('Fluid Mechanics', 4, 60, 3, '{7,8}');

-- Insert data into Payments table
INSERT INTO Payments (UTR_No, Date_of_Payment, Amount, Sem_No, Student_ID) 
VALUES ('123456789', '2024-04-12', 500.00, 1, 1);
INSERT INTO Payments (UTR_No, Date_of_Payment, Amount, Sem_No, Student_ID) 
VALUES ('987654321', '2024-04-15', 550.00, 1, 2);
INSERT INTO Payments (UTR_No, Date_of_Payment, Amount, Sem_No, Student_ID) 
VALUES ('456789123', '2024-04-20', 520.00, 1, 3);

-- Insert data into Registration table
INSERT INTO Registration (Student_ID, Course_ID, Sem_No, Status) 
VALUES (1, 1, 1, 'Enrolled');
INSERT INTO Registration (Student_ID, Course_ID, Sem_No, Status) 
VALUES (2, 4, 1, 'Enrolled');
INSERT INTO Registration (Student_ID, Course_ID, Sem_No, Status) 
VALUES (3, 7, 1, 'Enrolled');

-- Insert data into Results table
INSERT INTO Results (Student_ID, Course_ID, Grade) 
VALUES (1, 1, 'A');
INSERT INTO Results (Student_ID, Course_ID, Grade) 
VALUES (2, 4, 'B');
INSERT INTO Results (Student_ID, Course_ID, Grade) 
VALUES (3, 7, 'A');

-- Insert data into Semester table
INSERT INTO Semester (Sem_No, Department_ID, Course_ID, Faculty_ID, Total_Number_of_Classes) 
VALUES (1, 1, 1, 1, 20);
INSERT INTO Semester (Sem_No, Department_ID, Course_ID, Faculty_ID, Total_Number_of_Classes) 
VALUES (1, 2, 4, 2, 25);
INSERT INTO Semester (Sem_No, Department_ID, Course_ID, Faculty_ID, Total_Number_of_Classes) 
VALUES (1, 3, 7, 3, 30);

-- Insert data into Attendance table
INSERT INTO Attendance (Student_ID, Course_ID, No_of_Classes) 
VALUES (1, 1, 18);
INSERT INTO Attendance (Student_ID, Course_ID, No_of_Classes) 
VALUES (2, 4, 23);
INSERT INTO Attendance (Student_ID, Course_ID, No_of_Classes) 
VALUES (3, 7, 28);

-- Insert data into Exam_Location table
INSERT INTO Exam_Location (Student_ID, Course_ID, Location, Invigilator) 
VALUES (1, 1, 'Room 101', 1);
INSERT INTO Exam_Location (Student_ID, Course_ID, Location, Invigilator) 
VALUES (2, 4, 'Room 202', 2);
INSERT INTO Exam_Location (Student_ID, Course_ID, Location, Invigilator) 
VALUES (3, 7, 'Room 303', 3);