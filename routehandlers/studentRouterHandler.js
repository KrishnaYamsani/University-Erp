const pool = require("../utilities/db");

exports.studentDetails = async (req, res) => {
  const id = req.params.id;
  console.log(id);
  try {
    const result = await pool.query("SELECT roll_no,name,gender,mail_id,address,phone_number,dob FROM STUDENT WHERE ROLL_NO = $1", [
      id,
    ]);
  
    if (result) {
      // res.send([result.rows[0]]);
      res.render("studentdetails", {
        student : result.rows[0],
        studentName : result.rows[0].name
      });
    } else {
      res.send("No student with given id,check your id ones");
    }
  }catch (e){
    console.log(e);
  }
};

exports.studentGrades = async (req, res) => {
  const id = req.params.id;
  const result = await pool.query(
    `SELECT R.grade,R.course_id, C.Course_Name, C.Credits
    FROM Results R
    INNER JOIN Courses C ON R.Course_ID = C.Course_ID
    WHERE R.Student_ID = $1
    ORDER BY R.Course_ID;
    `,
    [id]
  );

  if (result.rows) {
    //res.send([result.rows[0]]);
   // console.log(result.rows[0]);
    res.render('studentgrades',{gradesDetails : result.rows});
  } else {
    res.send("No student with given id,check your id ones");
  }
};

exports.studentAttendance = async (req, res) => {
  const id = req.params.id;
  const sem = await pool
    .query(
      "SELECT MAX(SEM_NO) AS CURRENT_SEM FROM REGISTRATION WHERE STUDENT_ID = $1 ",
      [id]
    )
    .then((result) => result.rows[0].current_sem);
  //console.log(sem);
  //const result = await pool.query('SELECT * FROM ATTENDANCE WHERE STUDENT_ID = $1 ORDER BY COURSE_ID',[id]);
  const result = await pool.query(
    `SELECT A.course_id,A.No_of_classes AS number_of_classes_attended, S.TOTAL_NUMBER_OF_CLASSES, C.Course_Name
    FROM Attendance A
    INNER JOIN Registration R ON A.Student_ID = R.Student_ID AND A.Course_ID = R.Course_ID
    INNER JOIN Courses C ON R.Course_ID = C.Course_ID
    INNER JOIN SEMESTER S ON R.COURSE_ID = S.COURSE_ID
    WHERE R.Sem_No = $1 AND A.Student_ID = $2`,
    [sem, id]
  );

  if (result.rows) {
   // res.send([result.rows[0]]);
   res.render('studentattendances',{attendanceDetails : result.rows})
  } else {
    res.send("No student with given id,check your id ones");
  }
};

exports.studentExamDetails = async (req, res) => {
  const id = req.params.id;
  const result = await pool.query(
    `SELECT E.date, E.slot, EL.location, C.Course_Name ,C.course_id
    FROM Exams E
    INNER JOIN Exam_Location EL ON E.Course_ID = EL.Course_ID
    INNER JOIN Registration R ON E.Course_ID = R.Course_ID
    INNER JOIN Courses C ON E.Course_ID = C.Course_ID
    WHERE R.Student_ID = $1
    AND R.Sem_No = (
        SELECT MAX(Sem_No)
        FROM Registration
        WHERE Student_ID = $1
    )
    `,
    [id]
  );

  if (result.rows) {
    //res.send([result.rows]);
    res.render('studentexams.ejs',{exams : result.rows})
  } else {
    res.send("No student with given id,check your id ones");
  }
};

exports.studentCourseDetails = async (req, res) => {
  const id = req.params.id;
  const result = await pool.query(
    `SELECT C.course_id,C.course_name,C.credits,C.contact_hrs, F.Name AS Faculty_Name
    FROM Courses C
    INNER JOIN Registration R ON C.Course_ID = R.Course_ID
    INNER JOIN Faculty F ON C.Faculty_ID = F.ID
    WHERE R.Student_ID = $1
    AND R.Sem_No = (
        SELECT MAX(Sem_No)
        FROM Registration
        WHERE Student_ID = $1
    )
    `,
    [id]
  );

  if (result.rows) {
    //res.send([result.rows]);
    //console.log(result.rows[0]);
    res.render('studentcoursedetails',{courses : result.rows})
  } else {
    res.send("No student with given id,check your id ones");
  }
};

exports.StudentPostPaymentDetails = async (req, res) => {
  const id = req.params.id;
  const paymentDetails = req.body.paymentDetails;

  const result = await pool.query(
    `INSERT INTO Payments (UTR_No, Date_of_Payment, Amount, Sem_No, Student_ID) 
    VALUES ($1, $2, $3, $4, $5);
    `,
    [
      paymentDetails.UtrNo,
      paymentDetails.Date,
      paymentDetails.Amount,
      paymentDetails.Sem_No,
      paymentDetails.StudentId,
    ]
  );
  console.log(result);
  if (result.rowCount) {
    res.send("Successfull");
  } else {
    res.send("Failed");
  }
};

exports.StudentPostPaymentDetails = async (req, res) => {
  const id = req.params.id;
  const paymentDetails = req.body;

  try {
    const result = await pool.query(
      `INSERT INTO Payments (UTR_No, Date_of_Payment, Amount, Sem_No, Student_ID) 
      VALUES ($1, $2, $3, $4, $5);
      `,
      [
        paymentDetails.UtrNo,
        paymentDetails.Date,
        paymentDetails.Amount,
        paymentDetails.Sem_No,
        paymentDetails.StudentId,
      ]
    );

    
    console.log(result);
    if (result.rowCount) {
      res.send("Successfull");
    }
  } catch (e) {
    res.send(e.detail);
  }
};

exports.StudentGetPaymentDetails = async (req, res) => {
  const id = req.params.id;

  try {
    const result = await pool.query(
      `SELECT utr_no,date_of_payment,amount,sem_no FROM Payments WHERE Student_ID = $1 ORDER BY sem_no DESC`,
      [id]
    );
    res.send(result.rows);
  } catch (e) {
    res.send(e.detail);
  }
};

exports.StudentRegistartionPage = async (req,res) => {
  const id = req.params.id;

  const sname = await pool.query(`SELECT Name
  FROM Student
  WHERE roll_no = $1;
  `,[id]).then(result => result.rows[0].name);

  const result = await pool.query(
    `SELECT C.Course_ID, C.Course_Name, C.Contact_Hrs, C.Credits, F.Name AS Faculty_Name
    FROM Courses C
    JOIN Semester S ON C.Course_ID = S.Course_ID
    JOIN Department D ON S.Department_ID = D.ID
    JOIN Faculty F ON C.Faculty_ID = F.ID
    WHERE S.sem_no = (
        SELECT MAX(sem_no) + 1
        FROM Registration R
        WHERE R.Student_ID = $1
    )
    AND D.ID = (
        SELECT Dept_ID
        FROM Student
        WHERE roll_no = $1
    );    
    `,
    [id]
  );

  if(result.rows){
    res.render('studentregistration',{courses : result.rows , studentName : sname , studentid:id});
  }

}

