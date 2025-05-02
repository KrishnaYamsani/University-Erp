// studentRouterHandler.js - UPDATED for new database schema
const pool = require('../utilities/db');

exports.getStudentProfile = async (req, res) => {
    const { studentId } = req.params;
    try {
        const student = await pool.query('SELECT * FROM Student WHERE roll_no = $1', [studentId]);
        res.render('studentdetails', { student: student.rows[0],activePage:'profile',studentId });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

exports.getStudentGrades = async (req, res) => {
    const { studentId } = req.params;
    try {
        const grades = await pool.query(
            `SELECT c.name AS course_name, r.grade
             FROM Registration r
             JOIN Course_Offering co ON r.course_offering_id = co.id
             JOIN Course c ON co.course_id = c.id
             WHERE r.student_id = $1`, [studentId]
        );
        res.render('studentgrades', {
          grades: grades.rows,
          studentId,
          activePage:'grades'
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

exports.getStudentAttendance = async (req, res) => {
    const { studentId } = req.params;
    try {
        const attendance = await pool.query(
            `SELECT c.name AS course_name, a.classes_attended, a.total_classes
             FROM Attendance a
             JOIN Course_Offering co ON a.course_offering_id = co.id
             JOIN Course c ON co.course_id = c.id
             WHERE a.student_id = $1`, [studentId]
        );
        res.render('studentattendances', {
          attendance: attendance.rows,
          studentId,
          activePage:'attendance'
        });        
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

exports.getStudentExams = async (req, res) => {
    const { studentId } = req.params;
    try {
        const exams = await pool.query(
            `SELECT c.name AS course_name, e.exam_type, e.date, e.start_time, e.end_time, e.location
             FROM Registration r
             JOIN Course_Offering co ON r.course_offering_id = co.id
             JOIN Course c ON co.course_id = c.id
             JOIN Exam_Schedule e ON co.id = e.course_offering_id
             WHERE r.student_id = $1`, [studentId]
        );
        res.render('studentexams', {
          exams: exams.rows,
          studentId,
          activePage:'examdetails'
        });        
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

exports.getStudentCourses = async (req, res) => {
    const { studentId } = req.params;
    try {
        const courses = await pool.query(
            `SELECT DISTINCT c.id AS course_id, 
                    c.name AS course_name, 
                    c.credits, 
                    c.contact_hours, 
                    co.batch_year, 
                    STRING_AGG(f.name, ', ') AS faculty_names
             FROM Registration r
             JOIN Course_Offering co ON r.course_offering_id = co.id
             JOIN Course c ON co.course_id = c.id
             JOIN (
                SELECT faculty_id, offering_id FROM Co_Faculty_Course_Offering
                UNION
                SELECT faculty_id, id as offering_id FROM Course_Offering
             ) as combined_faculty
             ON combined_faculty.offering_id = co.id
             JOIN Faculty f ON f.id = combined_faculty.faculty_id
             WHERE r.student_id = $1
             GROUP BY c.id, c.name, c.credits, c.contact_hours, co.batch_year
             ORDER BY c.id;`,
            [studentId]
        );

        res.render('studentcoursedetails', { courses: courses.rows, studentId,activePage: 'courses' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};


exports.getStudentRegistration = async (req, res) => {
  const { studentId } = req.params;

  try {
      const offerings = await pool.query(
          `SELECT co.id AS offering_id, c.name AS course_name, f.name AS faculty_name
           FROM Course_Offering co
           JOIN Course c ON co.course_id = c.id
           JOIN Faculty f ON co.faculty_id = f.id
           JOIN Student s ON s.roll_no = $1
           WHERE co.batch_year = EXTRACT(YEAR FROM s.date_of_admission)
             AND c.department_id = s.dept_id`,
          [studentId]
      );

      const payment = await pool.query(
          `SELECT 1 FROM Payment WHERE student_id = $1`,
          [studentId]
      );
    
      if (payment.rows.length > 0) {
          return res.redirect(`/student/registration/status/studentId/${studentId}`);
      }

      res.render('studentregistration', {
          offerings: offerings.rows,
          studentId,
          activePage:'registration'
      });

  } catch (err) {
      console.error(err.message);
      res.status(500).send('Server Error');
  }
};

exports.postStudentRegistration = async (req, res) => {
  const { studentId } = req.params;
  const { UTRNo, dateOfPayment, amount, semNo, courses } = req.body;

  try {
      // Insert Payment Info
      await pool.query(
          `INSERT INTO Payment (student_id, utr_number, payment_date, amount, semester_id, verified)
           VALUES ($1, $2, $3, $4, $5, false)`,
          [studentId, UTRNo, dateOfPayment, amount, semNo]
      );

      // Insert each selected course
      const courseIds = Array.isArray(courses) ? courses : [courses];
      for (let offering_id of courseIds) {
          await pool.query(
              `INSERT INTO Registration (student_id, course_offering_id, status)
               VALUES ($1, $2, 'Registered')`,
              [studentId, offering_id]
          );
      }

      // After successful registration, redirect to a confirmation page
      res.redirect(`/student/registration/status/studentId/${studentId}`);

  } catch (error) {
      console.error(error.message);
      res.status(500).send("Registration Failed");
  }
};

exports.getStudentRegistrationStatus = async (req, res) => {
  const { studentId } = req.params;

  try {
      // Fetch Payment Info
      const payment = await pool.query(
          `SELECT utr_number, payment_date, amount, semester_id, verified
           FROM Payment
           WHERE student_id = $1
           ORDER BY id DESC LIMIT 1`,
          [studentId]
      );

      // Fetch Registered Courses
      const courses = await pool.query(
          `SELECT c.name AS course_name, f.name AS faculty_name
           FROM Registration r
           JOIN Course_Offering co ON r.course_offering_id = co.id
           JOIN Course c ON co.course_id = c.id
           JOIN Faculty f ON co.faculty_id = f.id
           WHERE r.student_id = $1`,
          [studentId]
      );

      if (payment.rows.length > 0) {
          res.render('studentregistrationstatus', {
              payment: payment.rows[0],
              courses: courses.rows,
              studentId,
              activePage:'registration'
          });
      } else {
          // If no payment, go back to registration form
          res.redirect(`/student/registration/studentId/${studentId}`);
      }

  } catch (error) {
      console.error(error.message);
      res.status(500).send("Server Error");
  }
};


// Add payment info
exports.postStudentPayment = async (req, res) => {
  const { utr_number, payment_date, amount, semester_id } = req.body;
  const studentId = req.params.studentId;
  try {
      await pool.query(
          `INSERT INTO Payment (student_id, utr_number, payment_date, amount, semester_id, verified)
           VALUES ($1, $2, $3, $4, $5, $6)`,
          [studentId, utr_number, payment_date, amount, semester_id, false] // verified set to false by default
      );
      res.redirect(`/student/payments/studentId/${studentId}`);
  } catch (err) {
      console.error('Insert Error:', err.message);
      res.status(500).send('Server Error');
  }
};

// View payment history
exports.getStudentPayments = async (req, res) => {
  const studentId = req.params.studentId;
  try {
      const result = await pool.query(
          `SELECT id, utr_number, TO_CHAR(payment_date, 'YYYY-MM-DD') AS payment_date,
                  amount, verified, semester_id
           FROM Payment
           WHERE student_id = $1
           ORDER BY payment_date DESC`,
          [studentId]
      );
      res.render('studentpayments', {
          studentId,
          payments: result.rows,
          activePage:'payments'
      });
  } catch (err) {
      console.error('Fetch Error:', err.message);
      res.status(500).send('Server Error');
  }
};


exports.getAllFaculties = async (req, res) => {
  const { studentId } = req.params;
  try {
    const result = await pool.query(`
      SELECT 
        f.id, f.name, f.mail_id, f.office_number, f.phone_number, 
        d.name AS dept_name,
        d.hod_id
      FROM Faculty f
      LEFT JOIN Department d ON f.dept_id = d.id
    `);

    const faculties = result.rows;

    // Step 2: Group by department
    const grouped = {};

    faculties.forEach(faculty => {
      const dept = faculty.dept_name;
      if (!grouped[dept]) {
        grouped[dept] = { hod: null, others: [] };
      }

      if (faculty.id === faculty.hod_id) {
        grouped[dept].hod = {
          name: faculty.name,
          email: faculty.mail_id,
          phone: faculty.phone_number,
          office: faculty.office_number
        };
      } else {
        grouped[dept].others.push({
          name: faculty.name,
          email: faculty.mail_id,
          phone: faculty.phone_number,
          office: faculty.office_number
        });
      }
    });

    // Step 3: Sort 'others' alphabetically by name
    for (const dept in grouped) {
      grouped[dept].others.sort((a, b) => a.name.localeCompare(b.name));
    }

    // Step 4: Pass to template
    res.render('studentfaculties', {
      studentId,
      activePage: 'faculties',
      facultyGroups: grouped
    });

  } catch (err) {
    console.error(err);
    res.status(500).send('Internal server error');
  }
};

exports.getStudentPreRegistration = async (req, res) => {
  const { studentId } = req.params;
  try {
      const student = await pool.query(`SELECT * FROM Student WHERE roll_no = $1`, [studentId]);
      const studentData = student.rows[0];

      const offerings = await pool.query(
          `SELECT co.id AS offering_id, c.name AS course_name, f.name AS faculty_name
           FROM Course_Offering co
           JOIN Course c ON co.course_id = c.id
           JOIN Faculty f ON co.faculty_id = f.id
           WHERE co.batch_year = EXTRACT(YEAR FROM CURRENT_DATE)
           AND c.department_id = $1`,
          [studentData.dept_id]
      );

      res.render('studentpreregistration', { offerings: offerings.rows, studentId , activePage:'preregistration'});
  } catch (err) {
      console.error(err);
      res.status(500).send('Server Error');
  }
};

exports.submitPreRegistration = async (req, res) => {
  const { studentId } = req.params;
  const preferences = req.body; // offering_id: preference_number

  try {
      // Delete any old pre-registration by student
      await pool.query(`DELETE FROM PreRegistration WHERE student_id = $1`, [studentId]);

      for (const offeringId in preferences) {
          const preference = preferences[offeringId];

          await pool.query(
              `INSERT INTO PreRegistration (student_id, course_offering_id, preference)
               VALUES ($1, $2, $3)`,
              [studentId, offeringId, preference]
          );
      }

      res.redirect(`/student/preregistrationstatus/studentId/${studentId}`);
  } catch (err) {
      console.error(err.message);
      res.status(500).send("Error during pre-registration submission");
  }
};

exports.getPreRegistrationStatus = async (req, res) => {
  const { studentId } = req.params;

  try {
      const allocations = await pool.query(
          `SELECT c.name AS course_name, f.name AS faculty_name
           FROM Registration r
           JOIN Course_Offering co ON r.course_offering_id = co.id
           JOIN Course c ON co.course_id = c.id
           JOIN Faculty f ON co.faculty_id = f.id
           WHERE r.student_id = $1 AND r.status = 'preregistered'`,
          [studentId]
      );

      res.render('studentpreregistrationstatus', {
          allocatedCourses: allocations.rows,
          studentId,
          activePage:'preregistration'
      });

  } catch (err) {
      console.error(err.message);
      res.status(500).send("Error loading pre-registration status");
  }
};
