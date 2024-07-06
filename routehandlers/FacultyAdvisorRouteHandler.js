require("dotenv").config();
const pool = require("../utilities/db");

exports.FacultyDetails = async (req, res) => {
  const faculty_id = req.params.facultyid;

  const results = await pool.query(
    `SELECT F.name,F.office_number,F.phone_number,F.mail_id, D.name AS department_name
    FROM Faculty F
    INNER JOIN Department D ON F.Department_ID = D.id
    WHERE F.ID = $1;
    `,
    [faculty_id]
  );

  if (results.rows.length) {
   // res.send(results.rows[0]);
   res.render('FAprofile',{ user: results.rows[0], })
  } else {
    res.send("No faculty found with given faculty id");
  }
};

exports.GetStudentDetails = async (req, res) => {
  const id = req.params.facultyid;
 
  try {
    const results = await pool.query(
      `SELECT S.roll_no,S.name,S.mail_id,S.phone_number
    FROM Student S
    WHERE S.faculty_id = $1
    `,
      [id]
    );
    console.log("Hi")
    if (results.rows) {
      //res.send(results.rows);
      res.render('FAstudentdetails',{students : results.rows,faculty_id:id})
    } else {
      res.send("No students under Him/her");
    }
  } catch (e) {
    res.send(e.discription);
  }
};

exports.GetStudentGrades = async (req, res) => {
  const faculty_id = req.params.facultyid;
  const student_id = req.params.studentid;

  try {
    const results = await pool.query(
      `SELECT * FROM RESULTS WHERE STUDENT_ID = $1 ORDER BY COURSE_ID`,
      [student_id]
    );
console.log("hi");
    res.send(results.rows);
  } catch (e) {
    res.send(e.discription);
  }
};

exports.GetStudentAttendance = async (req, res) => {
  const faculty_id = req.params.facultyid;
  const student_id = req.params.studentid;

  try {
    const sem = await pool
    .query(
      "SELECT MAX(SEM_NO) AS CURRENT_SEM FROM REGISTRATION WHERE STUDENT_ID = $1 ",
      [student_id]
    )
    .then((result) => result.rows[0].current_sem);

    const results = await pool.query(
      `SELECT A.course_id,A.No_of_classes AS number_of_classes_attended, S.TOTAL_NUMBER_OF_CLASSES, C.Course_Name
    FROM Attendance A
    INNER JOIN Registration R ON A.Student_ID = R.Student_ID AND A.Course_ID = R.Course_ID
    INNER JOIN Courses C ON R.Course_ID = C.Course_ID
    INNER JOIN SEMESTER S ON R.COURSE_ID = S.COURSE_ID
    WHERE R.Sem_No = $1 AND A.Student_ID = $2`,
      [sem,student_id]
    );

    res.send(results.rows);
  } catch (e) {
    res.send(e.discription);
  }
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

    res.render('FAfacultydetails',{facultyDetails : results.rows , userName:faculty_name});
    }catch(e) {
      console.log(e.description);
    }
}
