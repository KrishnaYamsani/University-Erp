const pool = require("../utilities/db");

// 1. Faculty Profile
exports.getFacultyProfile = async (req, res) => {
  const { faculty_id } = req.params;

  try {
    const result = await pool.query(
      `SELECT F.id, F.name, F.office_number, F.phone_number, F.mail_id, D.name AS department_name
       FROM Faculty F
       JOIN Department D ON F.dept_id = D.id
       WHERE F.id = $1`,
      [faculty_id]
    );

    if (result.rows.length === 0) {
      return res.status(404).send("No faculty found with given faculty ID");
    }

    const user = result.rows[0];
    req.session.user = user;
    // Check if faculty is also a faculty advisor
    const advisorCheck = await pool.query(
      `SELECT 1 FROM FacultyAdvisors WHERE faculty_id = $1`,
      [faculty_id]
    );

    const isFacultyAdvisor = advisorCheck.rows.length > 0;
    // Store isFacultyAdvisor in the session
    req.session.isFacultyAdvisor = isFacultyAdvisor;

    res.render("facultyprofile", {
      user,
      userName: user.name,
      isFacultyAdvisor,
      greetingMessage: `Welcome, ${user.name}!`,
      facultyDetails: [user], // make it an array so it matches your loop in EJS
    });
  } catch (err) {
    console.error(err);
    res.status(500).send("Server Error");
  }
};

// 2. Faculty's Courses Offered
exports.FacultyCourseDetails = async (req, res) => {
  const { faculty_id } = req.params;

  try {
    const facultyResult = await pool.query(
      `SELECT id, name FROM Faculty WHERE id = $1`,
      [faculty_id]
    );

    if (facultyResult.rows.length === 0) {
      return res.status(404).send("Faculty not found");
    }

    const faculty = facultyResult.rows[0];

    // Use session to get faculty advisor status
    const isFacultyAdvisor = req.session.isFacultyAdvisor;

    // Fetch courses where the faculty is MAIN Faculty
    const courseResults = await pool.query(
      `SELECT co.id AS offering_id, c.name AS course_name, c.credits, c.contact_hours, c.prerequisites
       FROM Course_Offering co
       JOIN Course c ON co.course_id = c.id
       WHERE co.faculty_id = $1`,
      [faculty_id]
    );

    // Fetch courses where the faculty is a CO-Faculty
    const coFacultyResults = await pool.query(
      `SELECT co.id AS offering_id, c.name AS course_name, c.credits, c.contact_hours, c.prerequisites, f.name AS main_faculty_name
       FROM Co_Faculty_Course_Offering cf
       JOIN Course_Offering co ON cf.offering_id = co.id
       JOIN Course c ON co.course_id = c.id
       JOIN Faculty f ON co.faculty_id = f.id
       WHERE cf.faculty_id = $1`,
      [faculty_id]
    );

    // For each course offered by the faculty (main), fetch co-faculties assigned
    const coursesWithCoFaculties = [];
    for (let course of courseResults.rows) {
      const coFaculties = await pool.query(
        `SELECT f.id, f.name
         FROM Co_Faculty_Course_Offering cf
         JOIN Faculty f ON cf.faculty_id = f.id
         WHERE cf.offering_id = $1`,
        [course.offering_id]
      );

      coursesWithCoFaculties.push({
        ...course,
        co_faculties: coFaculties.rows,
      });
    }

    res.render("facultycoursedetails", {
      courseDetails: coursesWithCoFaculties,  
      coFacultyCourses: coFacultyResults.rows, 
      user: faculty,
      isFacultyAdvisor,
      activePage:'courses'
    });
  } catch (error) {
    console.error("Error fetching faculty course details:", error);
    res.status(500).send("Internal Server Error");
  }
};


// GET route - load course edit page
exports.EditCoursePage = async (req, res) => {
  const { course_offering_id } = req.params;
  try {
    const result = await pool.query(
      `SELECT co.id as offering_id, c.name as course_name, c.credits, c.contact_hours, c.prerequisites
       FROM Course_Offering co
       JOIN Course c ON co.course_id = c.id
       WHERE co.id = $1`,
      [course_offering_id]
    );

    if (result.rows.length === 0) {
      return res.status(404).send("Course offering not found");
    }

    res.render("facultyeditcourse", {
      course: result.rows[0],
      facultyId: req.session.facultyId,
      user:req.session.user || null,
      isFacultyAdvisor:req.session.isFacultyAdvisor
    });
  } catch (err) {
    console.error("Error fetching course:", err);
    res.status(500).send("Internal Server Error");
  }
};

// POST route - save edited course
exports.EditCoursePost = async (req, res) => {
  const { course_offering_id } = req.params;
  const { credits, contact_hours, prerequisites } = req.body;

  try {
    const course_id = await pool
      .query(`SELECT course_id FROM Course_Offering WHERE id = $1`, [
        course_offering_id,
      ])
      .then((result) => result.rows[0].course_id);

    await pool.query(
      `UPDATE Course
       SET credits = $1, contact_hours = $2, prerequisites = $3
       WHERE id = $4`,
      [credits, contact_hours, prerequisites, course_id]
    );

    res.redirect(`/faculty/courses/faculty_id/${req.session.user.id}`);
  } catch (err) {
    console.error("Error updating course:", err);
    res.status(500).send("Internal Server Error");
  }
};

exports.FacultyDeleteCourse = async (req, res) => {
  const { course_offering_id } = req.params;

  try {
    // Get faculty id first before deleting (to redirect later)
    const facultyResult = await pool.query(
      `SELECT faculty_id FROM Course_Offering WHERE id = $1`,
      [course_offering_id]
    );

    if (facultyResult.rows.length === 0) {
      return res.status(404).send("Offering not found");
    }

    const faculty_id = facultyResult.rows[0].faculty_id;

    // Now delete the course offering
    await pool.query(
      `DELETE FROM Course_Offering WHERE id = $1`,
      [course_offering_id]
    );

    res.redirect(`/faculty/courses/faculty_id/${faculty_id}`);
  } catch (err) {
    console.error(err);
    res.status(500).send("Error deleting course offering");
  }
};

// GET - page to add new offering
exports.FacultyAddCoursePage = async (req, res) => {
  const { faculty_id } = req.params;
  try {
    const availableCourses = await pool.query(
      `SELECT id, name, credits FROM Course`
    );

    const semesters = await pool.query(
      `SELECT id, semester_number, start_date, end_date FROM Semester`
    );

    res.render("facultyaddcourse", {
      availableCourses: availableCourses.rows,
      semesters: semesters.rows,
      facultyId: faculty_id,
      user:req.session.user,
      isFacultyAdvisor:req.session.isFacultyAdvisor
    });
  } catch (err) {
    console.error(err);
    res.status(500).send("Internal Server Error");
  }
};

// POST - create new offering
exports.FacultyAddCoursePost = async (req, res) => {
  const { faculty_id } = req.params;
  const {
    course_id,
    new_course_name,
    new_course_credits,
    new_course_contact_hours,
    semester_id,
    batch_year,
    grading_criteria,
    attendance_policy,
  } = req.body;

  try {
    let final_course_id = course_id;

    // If no course selected but new course details provided, create a new course first
    if (!course_id && new_course_name && new_course_credits && new_course_contact_hours) {
      const newCourseResult = await pool.query(
        `INSERT INTO Course (name, credits, contact_hours)
         VALUES ($1, $2, $3) RETURNING id`,
        [new_course_name, new_course_credits, new_course_contact_hours]
      );

      final_course_id = newCourseResult.rows[0].id; // Use newly inserted course id
    }

    if (!final_course_id) {
      return res.status(400).send("No course selected or created");
    }

    // Insert into Course_Offering
    await pool.query(
      `INSERT INTO Course_Offering (course_id, faculty_id, semester_id, batch_year, grading_criteria, attendance_policy)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [
        final_course_id,
        faculty_id,
        semester_id,
        batch_year,
        grading_criteria,
        attendance_policy,
      ]
    );

    res.redirect(`/faculty/courses/faculty_id/${faculty_id}`);
  } catch (err) {
    console.error(err);
    res.status(500).send("Error creating course offering");
  }
};


// GET - show page to add co-faculty
// GET - Show form to add Co-Faculty for a specific course
exports.FacultyAddCoFacultyPage = async (req, res) => {
  const { course_offering_id } = req.params;  // 👈 course_offering_id now
  try {
    // Fetch course info (to display course name etc.)
    const course = await pool.query(
      `SELECT co.id, c.name AS course_name
       FROM Course_Offering co
       JOIN Course c ON co.course_id = c.id
       WHERE co.id = $1`,
      [course_offering_id]
    );

    if (course.rows.length === 0) {
      return res.status(404).send("Course Offering not found");
    }

    // Fetch available faculties except existing main faculty
    const faculties = await pool.query(
      `SELECT id, name FROM Faculty
       WHERE id NOT IN (SELECT faculty_id FROM Course_Offering WHERE id = $1)`,
      [course_offering_id]
    );

    res.render("facultyaddcofaculty", {
      course: course.rows[0],
      faculties: faculties.rows,
      offeringId: course_offering_id,
      user:req.session.user,
      isFacultyAdvisor:req.session.isFacultyAdvisor
    });
  } catch (err) {
    console.error(err);
    res.status(500).send("Internal Server Error");
  }
};

// POST - add a co-faculty
// POST - Add Co-Faculty for a specific course
exports.FacultyAddCoFacultyPost = async (req, res) => {
  const { course_offering_id } = req.params;
  const { co_faculty_id } = req.body;

  try {
    await pool.query(
      `INSERT INTO Co_Faculty_Course_Offering (offering_id, faculty_id)
       VALUES ($1, $2)`,
      [course_offering_id, co_faculty_id]
    );

    res.redirect(`/faculty/courses/faculty_id/${req.session.user.id}`); // 👈 Redirect back to faculty's course page
  } catch (err) {
    console.error(err);
    res.status(500).send("Internal Server Error");
  }
};

// Remove Co-Faculty
exports.RemoveCoFaculty = async (req, res) => {
  const { course_offering_id, faculty_id } = req.params;
  try {
    await pool.query(
      `DELETE FROM Co_Faculty_Course_Offering
       WHERE offering_id = $1 AND faculty_id = $2`,
      [course_offering_id, faculty_id]
    );
    res.redirect(`/faculty/courses/faculty_id/${req.session.user.id}`);
  } catch (err) {
    console.error(err);
    res.status(500).send("Internal Server Error");
  }
};


// 3. Course Student List (JSON)
exports.CourseStudentDetails = async (req, res) => {
  const { course_id } = req.params;
  const results = await pool.query(
    `SELECT s.id AS roll_no, s.name
     FROM Registration r
     JOIN Student s ON r.student_id = s.id
     WHERE r.course_offering_id = $1`,
    [course_id]
  );
  res.send(results.rows);
};

// 4. Attendance View
exports.GetStudentAttendance = async (req, res) => {
  const { course_id } = req.params;
  const results = await pool.query(
    `SELECT a.student_id, s.name AS student_name, a.classes_attended, a.total_classes
     FROM Attendance a
     JOIN Student s ON a.student_id = s.roll_no
     WHERE a.course_offering_id = $1`,
    [course_id]
  );
  //debug
  console.log(results.rows);
  res.render("facultyattendanceview", {
    attendanceData: results.rows,
    user: req.session.user || null,
    isFacultyAdvisor: req.session.isFacultyAdvisor || null,
  });
};

// 6. Mark Attendance UI
exports.GiveStudentAttendance = async (req, res) => {
  const { course_id } = req.params;
  const results = await pool.query(
    `SELECT s.roll_no AS roll_no, s.name
     FROM Registration r
     JOIN Student s ON r.student_id = s.roll_no
     WHERE r.course_offering_id = $1`,
    [course_id]
  );
  res.render("facultyattendanceupdate", {
    students: results.rows,
    course_id,
    user: req.session.user || null,
    isFacultyAdvisor: req.session.isFacultyAdvisor || null,
  });
};

// 5. Grade View (JSON)
exports.GetStudentGrade = async (req, res) => {
  const { course_id } = req.params;
  const results = await pool.query(
    `SELECT r.student_id, s.name AS student_name, r.grade
     FROM Registration r
     JOIN Student s ON r.student_id = s.roll_no
     WHERE r.course_offering_id = $1`,
    [course_id]
  );
  res.send(results.rows);
};

exports.ViewGrades = async (req, res) => {
  const { course_id } = req.params;
  try {
    const results = await pool.query(
      `SELECT r.student_id, s.name AS student_name, r.grade
       FROM Registration r
       JOIN Student s ON r.student_id = s.roll_no
       WHERE r.course_offering_id = $1`,
      [course_id]
    );

    res.render("facultygradesview", {
      user: req.session.user,
      isFacultyAdvisor: req.session.isFacultyAdvisor,
      grades: results.rows,
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Server Error");
  }
};

// 7. Mark Grade UI
exports.GiveStudentGrade = async (req, res) => {
  const { course_id } = req.params;

  const results = await pool.query(
    `SELECT s.roll_no AS roll_no, s.name
     FROM Registration r
     JOIN Student s ON r.student_id = s.roll_no
     WHERE r.course_offering_id = $1`,
    [course_id]
  );


  res.render("facultygradeupdate", {
    students: results.rows,
    course_id,
    user: req.session.user,
    isFacultyAdvisor: req.session.isFacultyAdvisor,
  });
};

// 8. Update Attendance
exports.UpdateStudentAttendance = async (req, res) => {
  const { course_id } = req.params;
  const updates = req.body;

  for (let student_id in updates) {
    const present = updates[student_id] === "P" ? 1 : 0;
    await pool.query(
      `UPDATE Attendance
       SET classes_attended = classes_attended + $1
       WHERE student_id = $2 AND course_offering_id = $3`,
      [present, student_id, course_id]
    );
  }

  res.redirect(
    `/faculty/coursestudents/attendance/course_offering_id/${course_id}`
  );
};

// 9. Update Grades
exports.UpdateStudentGrade = async (req, res) => {
  const { course_id } = req.params;
  const updates = req.body;

  for (let student_id in updates) {
    await pool.query(
      `UPDATE Registration
       SET grade = $1
       WHERE student_id = $2 AND course_offering_id = $3`,
      [updates[student_id], student_id, course_id]
    );
  }

  const faculty_id = await pool
    .query(`SELECT faculty_id FROM Course_Offering WHERE id = $1`, [course_id])
    .then((result) => result.rows[0].faculty_id);

  res.redirect(`/faculty/courses/faculty_id/${faculty_id}`);
};

// 10. All Faculty List View
exports.GetAllFacultyDeatils = async (req, res) => {
  const { facultyid } = req.params;

  // Fetch all faculty details
  const results = await pool.query(
    `SELECT id, name, mail_id, office_number, phone_number, dept_id FROM Faculty`
  );

  // Fetch the name of the faculty with the given facultyid
  const faculty_name = await pool
    .query(`SELECT name FROM Faculty WHERE id = $1`, [facultyid])
    .then((result) => result.rows[0].name);

  // Retrieve isFacultyAdvisor from session
  const isFacultyAdvisor = req.session.isFacultyAdvisor || false; // Default to false if not set

  // Pass the user details and isFacultyAdvisor to the template
  res.render("facultyfacultydetails", {
    user: req.session.user || null,
    facultyDetails: results.rows,
    userName: faculty_name,
    isFacultyAdvisor: isFacultyAdvisor,
  });
};

// View Exam Schedule
exports.GetExamSchedule = async (req, res) => {
  const { course_id } = req.params;
  const result = await pool.query(
    `SELECT exam_type, date, start_time, end_time, location
     FROM Exam_Schedule
     WHERE course_offering_id = $1`,
    [course_id]
  );

  res.render("facultyexamschedule", {
    schedule: result.rows,
    course_id,
    user:req.session.user,
    isFacultyAdvisor:req.session.isFacultyAdvisor
  });
};

// Create / Update Exam Schedule
exports.UpdateExamSchedule = async (req, res) => {
  const { course_id } = req.params;
  const { exam_type, date, start_time, end_time, location } = req.body;

  await pool.query(
    `INSERT INTO Exam_Schedule (course_offering_id, exam_type, date, start_time, end_time, location)
     VALUES ($1, $2, $3, $4, $5, $6)
     ON CONFLICT (course_offering_id, exam_type)
     DO UPDATE SET date = $3, start_time = $4, end_time = $5, location = $6`,
    [course_id, exam_type, date, start_time, end_time, location]
  );

  res.redirect(`/faculty/examschedule/course_offering_id/${course_id}`);
};

// Delete Exam Schedule
exports.DeleteExamSchedule = async (req, res) => {
  const { course_id, exam_type } = req.params;

  await pool.query(
    `DELETE FROM Exam_Schedule WHERE course_offering_id = $1 AND exam_type = $2`,
    [course_id, exam_type]
  );

  res.redirect(`/faculty/examschedule/course_offering_id/${course_id}`);
};

// 13. View Grading Policy
exports.GetGradingPolicy = async (req, res) => {
  const { course_id } = req.params;
  const result = await pool.query(
    `SELECT grading_criteria, max_marks, attendance_policy
     FROM Course_Offering
     WHERE id = $1`,
    [course_id]
  );

  res.render("facultygradingpolicy", {
    policy: result.rows[0],
    course_id,
    user:req.session.user,
    isFacultyAdvisor:req.session.isFacultyAdvisor
  });
};

// 14. Update Grading Policy
exports.UpdateGradingPolicy = async (req, res) => {
  const { course_id } = req.params;
  const { grading_criteria, max_marks, attendance_policy } = req.body;

  await pool.query(
    `UPDATE Course_Offering
     SET grading_criteria = $1,
         max_marks = $2,
         attendance_policy = $3
     WHERE id = $4`,
    [grading_criteria, max_marks, attendance_policy, course_id]
  );

  res.redirect(`/faculty/courses/faculty_id/${req.session.user.id}`);
};

exports.getCreatePreRegistrationPageByOffering = async (req, res) => {
  const { course_offering_id } = req.params;

  try {
    const departments = await pool.query(`SELECT id, name FROM Department`);

    const offeringResult = await pool.query(
      `SELECT co.id, c.name AS course_name
       FROM Course_Offering co
       JOIN Course c ON co.course_id = c.id
       WHERE co.id = $1`,
      [course_offering_id]
    );

    res.render('facultycreatepreregistration', {
      offering: offeringResult.rows[0],
      departments: departments.rows,
      user:req.session.user,
      isFacultyAdvisor:req.session.isFacultyAdvisor
    });

  } catch (error) {
    console.error(error.message);
    res.status(500).send("Server Error");
  }
};

exports.postCreatePreRegistrationByOffering = async (req, res) => {
  const { course_offering_id } = req.params;
  const { batch_year, department_id } = req.body;

  try {
    await pool.query(
      `INSERT INTO PreRegistrationOfferings (course_offering_id, batch_year, department_id)
       VALUES ($1, $2, $3)`,
      [course_offering_id, batch_year, department_id]
    );

    res.redirect(`/faculty/courses/faculty_id/${req.session.user.id}`); // redirect to Courses page
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Error creating pre-registration offering");
  }
};

exports.getFacultyPreRegistrationStatusByOffering = async (req, res) => {
  const { course_offering_id } = req.params;

  try {
    const courseResult = await pool.query(
      `SELECT co.id AS offering_id, c.name AS course_name
       FROM Course_Offering co
       JOIN Course c ON co.course_id = c.id
       WHERE co.id = $1`,
      [course_offering_id]
    );

    const course = courseResult.rows[0];

    const studentsResult = await pool.query(
      `SELECT s.name AS student_name, s.roll_no, p.preference
       FROM PreRegistration p
       JOIN Student s ON p.student_id = s.roll_no
       WHERE p.course_offering_id = $1
       ORDER BY p.preference ASC`,
      [course_offering_id]
    );

    res.render('facultypreregistrationstatus', {
      course,
      students: studentsResult.rows,
      user:req.session.user,
      isFacultyAdvisor:req.session.isFacultyAdvisor
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Error fetching pre-registration data");
  }
};
