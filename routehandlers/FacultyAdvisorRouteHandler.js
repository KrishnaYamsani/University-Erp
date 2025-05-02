require("dotenv").config();
const pool = require("../utilities/db");

// exports.FacultyDetails = async (req, res) => {
//   const faculty_id = req.params.facultyid;

//   const results = await pool.query(
//     `SELECT F.name,F.office_number,F.phone_number,F.mail_id, D.name AS department_name
//     FROM Faculty F
//     INNER JOIN Department D ON F.Department_ID = D.id
//     WHERE F.ID = $1;
//     `,
//     [faculty_id]
//   );

//   if (results.rows.length) {
//    // res.send(results.rows[0]);
//    res.render('FAprofile',{ user: results.rows[0], })
//   } else {
//     res.send("No faculty found with given faculty id");
//   }
// };

// exports.GetStudentDetails = async (req, res) => {
//   const id = req.params.facultyid;
 
//   try {
//     const results = await pool.query(
//       `SELECT S.roll_no,S.name,S.mail_id,S.phone_number
//     FROM Student S
//     WHERE S.faculty_id = $1
//     `,
//       [id]
//     );
//     console.log("Hi")
//     if (results.rows) {
//       //res.send(results.rows);
//       res.render('FAstudentdetails',{students : results.rows,faculty_id:id})
//     } else {
//       res.send("No students under Him/her");
//     }
//   } catch (e) {
//     res.send(e.discription);
//   }
// };

// exports.GetStudentGrades = async (req, res) => {
//   const faculty_id = req.params.facultyid;
//   const student_id = req.params.studentid;

//   try {
//     const results = await pool.query(
//       `SELECT * FROM RESULTS WHERE STUDENT_ID = $1 ORDER BY COURSE_ID`,
//       [student_id]
//     );
// console.log("hi");
//     res.send(results.rows);
//   } catch (e) {
//     res.send(e.discription);
//   }
// };

// exports.GetStudentAttendance = async (req, res) => {
//   const faculty_id = req.params.facultyid;
//   const student_id = req.params.studentid;

//   try {
//     const sem = await pool
//     .query(
//       "SELECT MAX(SEM_NO) AS CURRENT_SEM FROM REGISTRATION WHERE STUDENT_ID = $1 ",
//       [student_id]
//     )
//     .then((result) => result.rows[0].current_sem);

//     const results = await pool.query(
//       `SELECT A.course_id,A.No_of_classes AS number_of_classes_attended, S.TOTAL_NUMBER_OF_CLASSES, C.Course_Name
//     FROM Attendance A
//     INNER JOIN Registration R ON A.Student_ID = R.Student_ID AND A.Course_ID = R.Course_ID
//     INNER JOIN Courses C ON R.Course_ID = C.Course_ID
//     INNER JOIN SEMESTER S ON R.COURSE_ID = S.COURSE_ID
//     WHERE R.Sem_No = $1 AND A.Student_ID = $2`,
//       [sem,student_id]
//     );

//     res.send(results.rows);
//   } catch (e) {
//     res.send(e.discription);
//   }
// };

// exports.GetAllFacultyDeatils = async (req,res) => {
//     const faculty_id = req.params.facultyid;
//     try {
//       const results = await pool.query(`SELECT F.ID, F.Name, F.Mail_ID, F.Office_number, F.Phone_number, F.Department_ID
//     FROM Faculty F
//     `);

//     const faculty_name = await pool.query(`SELECT Name
//     FROM Faculty
//     WHERE ID = $1;
//     `,[faculty_id]).then((result) => result.rows[0].name);

//     res.render('FAfacultydetails',{facultyDetails : results.rows , userName:faculty_name});
//     }catch(e) {
//       console.log(e.description);
//     }
// }

/////////////////////////////////////////////////////////////////////

exports.getStudentDetails = async (req, res) => {
  const { faculty_id } = req.params;

  try {
    const students = await pool.query(`
      SELECT roll_no, name, dept_id, phone_number, mail_id, dob
      FROM Student
      WHERE faculty_advisor_id = $1
    `, [faculty_id]);

    res.render("FAstudentdetails", {
      facultyId: faculty_id,
      students: students.rows,
      user: req.session.user || null,
      isFacultyAdvisor: req.session.isFacultyAdvisor || null,
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Error fetching student details");
  }
};



// 1. Get Registration Verification Page
exports.getVerifyRegistrationPage = async (req, res) => {
  const { faculty_id } = req.params;

  try {
    const students = await pool.query(`
      SELECT 
        s.roll_no, 
        s.name, 
        p.id AS payment_id, 
        p.utr_number, 
        p.payment_date, 
        p.amount,
        sem.semester_number,
        sem.start_date,
        sem.end_date
      FROM Student s
      JOIN Payment p ON s.roll_no = p.student_id
      JOIN Semester sem ON p.semester_id = sem.id
      WHERE 
        s.faculty_advisor_id = $1
        AND p.verified = FALSE
      ORDER BY sem.start_date DESC, p.payment_date DESC
    `, [faculty_id]);

    res.render("FAregistration", { 
      students: students.rows, 
      facultyId: faculty_id,
      user: req.session.user || null,
      isFacultyAdvisor: req.session.isFacultyAdvisor || null,
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Error loading registration page");
  }
};



// 2. Post Registration Verification
exports.postVerifyRegistration = async (req, res) => {
  const { faculty_id } = req.params;
  const { verifiedPayments } = req.body; // Array of payment IDs

  try {
    if (verifiedPayments && Array.isArray(verifiedPayments)) {
      for (let paymentId of verifiedPayments) {
        await pool.query(
          `UPDATE Payment SET verified = TRUE WHERE id = $1`,
          [paymentId]
        );
      }
    }

    res.redirect(`/facultyadvisor/verifyregistration/facultyid/${faculty_id}`);
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Error verifying payments");
  }
};


// 3. Get Pre-Registration Allotment Page
exports.getAllotPreregistrationPage = async (req, res) => {
  const { faculty_id } = req.params;
  res.render("FAallotpreregistration", { facultyId: faculty_id,
    user: req.session.user || null,
    isFacultyAdvisor: req.session.isFacultyAdvisor || null
  });
};

// 4. Run Allotment Script
exports.runAllotmentScript = async (req, res) => {
  try {
    // Fetch all pre-registrations ordered by preference and GPA
    const preregistrations = await pool.query(`
      SELECT p.student_id, p.course_offering_id, p.preference, s.roll_no, s.name
      FROM Pre_Registration p
      JOIN Student s ON p.student_id = s.roll_no
      ORDER BY p.course_offering_id, p.preference ASC
    `);

    for (const prereg of preregistrations.rows) {
      // Allocate by inserting into Registration
      await pool.query(`
        INSERT INTO Registration (student_id, course_offering_id, status)
        VALUES ($1, $2, 'registered')
        ON CONFLICT (student_id, course_offering_id)
        DO NOTHING
      `, [prereg.student_id, prereg.course_offering_id]);

      // Update pre-registration status to "allocated"
      await pool.query(`
        UPDATE Pre_Registration
        SET status = 'allocated'
        WHERE student_id = $1 AND course_offering_id = $2
      `, [prereg.student_id, prereg.course_offering_id]);
    }

    res.redirect(`/facultyadvisor/allotpreregistration/facultyid/${req.params.faculty_id}`);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Error allotting pre-registrations");
  }
};
