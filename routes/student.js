const express = require("express");
const router = express.Router();

//handlers
const studentHandler = require('../routehandlers/studentRouterHandler')

router.get('/profileinfo/studentId/:id',studentHandler.studentDetails);// send studentdetails page
router.get('/grades/studentId/:id',studentHandler.studentGrades);// send gradedetails page
router.get('/attendance/studentId/:id',studentHandler.studentAttendance);// send attendance details
router.get('/examdetails/studentId/:id',studentHandler.studentExamDetails);// send exams location page
router.get('/coursedetails/studentId/:id',studentHandler.studentCourseDetails);// send course details
router.post('/registration/studentId/:id',studentHandler.StudentPostPaymentDetails);
router.get('/registration/studentId/:id',studentHandler.StudentRegistartionPage);

module.exports = router ;