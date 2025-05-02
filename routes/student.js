// student.js
const express = require('express');
const router = express.Router();
const studentController = require('../routehandlers/studentRouterHandler');

router.get('/profileinfo/studentId/:studentId', studentController.getStudentProfile);
router.get('/grades/studentId/:studentId', studentController.getStudentGrades);
router.get('/attendance/studentId/:studentId', studentController.getStudentAttendance);
router.get('/examdetails/studentId/:studentId', studentController.getStudentExams);
router.get('/coursedetails/studentId/:studentId', studentController.getStudentCourses);
router.get('/registration/studentId/:studentId', studentController.getStudentRegistration);
router.post('/registration/studentId/:studentId', studentController.postStudentRegistration);
router.post('/payment/studentId/:studentId', studentController.postStudentPayment);
router.get('/registration/status/studentId/:studentId', studentController.getStudentRegistrationStatus);
router.get('/payments/studentId/:studentId', studentController.getStudentPayments);
router.get('/faculties/studentId/:studentId', studentController.getAllFaculties);
// Pre-Registration
router.get('/preregistration/studentId/:studentId', studentController.getStudentPreRegistration);
router.post('/preregistration/studentId/:studentId', studentController.submitPreRegistration);
router.get('/preregistration/status/studentId/:studentId', studentController.getPreRegistrationStatus);

module.exports = router;
