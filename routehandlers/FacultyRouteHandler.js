require("dotenv").config();

const pool = require("../utilities/db");

exports.FacultyDetails = async (req, res) => {
  const faculty_id = req.params.faculty_id;

  const results = await pool.query(
    `SELECT F.name,F.office_number,F.phone_number,F.mail_id, D.name AS department_name
    FROM Faculty F
    INNER JOIN Department D ON F.Department_ID = D.id
    WHERE F.ID = $1;
    `,
    [faculty_id]
  );

  if (results.rows.length) {
    //res.send(results.rows[0]);
    res.render("facultyprofile", { user: results.rows[0] });
  } else {
    res.send("No faculty found with given faculty id");
  }
};

exports.FacultyCourseDetails = async (req, res) => {
  const faculty_id = req.params.faculty_id;

  const faculty = await pool.query(
    `SELECT Name
    FROM Faculty
    WHERE ID = $1;
    `,
    [faculty_id]
  ).then(result => result.rows[0].name);

  const results = await pool.query(
    `SELECT Course_ID, Course_Name, Credits, Contact_Hrs, Prerequisite_course_IDs
    FROM Courses
    WHERE Faculty_ID = $1;
    `,
    [faculty_id]
  );

  if (results.rows.length) {
    //res.send(results.rows);
    res.render('facultycoursedetails',{courseDetails : results.rows,userName:faculty})
  } else {
    res.send("No courses found for given faculty");
  }
};

exports.CourseStudentDetails = async (req, res) => {
  const course_id = req.params.course_id;
  const results = await pool.query(
    `SELECT Student.roll_no,Student.name
    FROM Student
    INNER JOIN Registration ON Student.roll_no = Registration.Student_ID
    WHERE Registration.Course_ID = $1
    `,
    [course_id]
  );

  if (results.rows.length) {
    res.send(results.rows);
  } else {
    res.send("No courses found for given faculty");
  }
};

exports.GetStudentAttendance = async (req, res) => {
  const course_id = req.params.course_id;
  const results = await pool.query(
    `SELECT A.*, S.Name AS student_name,(SELECT Total_Number_of_classes 
        FROM Semester 
        WHERE Course_ID = $1) AS total_classes_taken
    FROM Attendance A
    INNER JOIN Student S ON A.Student_ID = S.roll_no
    WHERE A.Course_ID = $1;
    `,
    [course_id]
  );

  if (results.rows.length) {
    //res.send(results.rows);
    res.render('facultyattendanceview',{attendanceData : results.rows})
  } else {
    res.send("No students found for given course");
  }
};

exports.GiveStudentAttendance = async (req,res) => {
    const course_id = req.params.course_id;
  const results = await pool.query(
    `SELECT Student.roll_no,Student.name
    FROM Student
    INNER JOIN Registration ON Student.roll_no = Registration.Student_ID
    WHERE Registration.Course_ID = $1
    `,
    [course_id]
  );

  if (results.rows.length) {
    //res.send(results.rows);
    res.render('facultyattendanceupdate',{students : results.rows,course_id : course_id});
  } else {
    res.send("No courses found for given faculty");
  }
}

exports.GetStudentGrade = async (req, res) => {
  const course_id = req.params.course_id;
  const results = await pool.query(`SELECT * FROM RESULTS WHERE COURSE_ID=$1`, [
    course_id,
  ]);

  if (results.rows.length) {
    res.send(results.rows);
  } else {
    res.send("No students found for given course");
  }
};

exports.GiveStudentGrade = async (req,res) => {
    const course_id = req.params.course_id;
  const results = await pool.query(
    `SELECT Student.roll_no,Student.name
    FROM Student
    INNER JOIN Registration ON Student.roll_no = Registration.Student_ID
    WHERE Registration.Course_ID = $1
    `,
    [course_id]
  );

  const faculty_name = await pool.query(`SELECT F.Name AS faculty_name
  FROM Faculty F
  INNER JOIN Courses C ON F.ID = C.Faculty_ID
  WHERE C.Course_ID = $1;
  `,[course_id]).then(result => result.rows[0].faculty_name);

  if (results.rows.length) {
    //res.send(results.rows);
    res.render('facultygradeupdate',{students : results.rows,course_id : course_id,userName : faculty_name});
  } else {
    res.send("No courses found for given faculty");
  }

}
exports.UpdateStudentAttendance = async (req, res) => {
  const course_id = req.params.course_id;
  const students_attendance = req.body;
  let students_attendance_status = students_attendance;

  for(let student_roll_no in students_attendance ){
    if(students_attendance[student_roll_no] == 'P'){
        students_attendance[student_roll_no] = 1;
    }else{
        students_attendance[student_roll_no] = 0;
    }
  }

  for (let student_roll_no in students_attendance) {

    
    const result = await pool.query(
      `UPDATE ATTENDANCE SET NO_OF_CLASSES= NO_OF_CLASSES + $1 WHERE STUDENT_ID=$2 AND COURSE_ID=$3`,
      [students_attendance[student_roll_no], student_roll_no, course_id]
    );
    if (result.rowCount) {
      students_attendance_status[student_roll_no] = "success";
    } else {
      students_attendance_status[student_roll_no] = "failure";
    }
  }

  res.redirect("/faculty/coursestudents/attendance/course_id/" + course_id);
};

exports.UpdateStudentGrade = async (req, res) => {
    
  const course_id = req.params.course_id;
  const students_grade = req.body;
  let students_grade_status = students_grade;

  for (let student_roll_no in students_grade) {
    const result = await pool.query(
      `UPDATE RESULTS SET GRADE= $1 WHERE STUDENT_ID=$2 AND COURSE_ID=$3`,
      [students_grade[student_roll_no], student_roll_no, course_id]
    );
    if (result.rowCount) {
      students_grade_status[student_roll_no] = "success";
    } 
  }

  const faculty_id = await pool.query(`SELECT Faculty_ID
    FROM Courses
    WHERE Course_ID = $1;
    `,[course_id]).then (result => result.rows[0].faculty_id) ;

  res.redirect("/faculty/courses/faculty_id/" + faculty_id);
};

exports.GetAllFacultyDeatils = async (req,res) => {
  const faculty_id = req.params.facultyid;
  try {
    const results = await pool.query(`SELECT F.ID, F.Name, F.Mail_ID, F.Office_number, F.Phone_number, F.Department_ID
  FROM Faculty F
  `);

  const faculty_name = await pool.query(`SELECT Name
  FROM Faculty
  WHERE ID = $1;
  `,[faculty_id]).then((result) => result.rows[0].name);

  res.render('facultyfacultydetails',{facultyDetails : results.rows , userName:faculty_name});
  }catch(e) {
    console.log(e.description);
  }
}
