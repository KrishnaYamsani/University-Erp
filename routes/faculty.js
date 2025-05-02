const express = require('express');
const bodyparser = require('body-parser');
const router = express.Router();

// Handler
const FacultyRouterHandler = require('../routehandlers/FacultyRouteHandler');

// ---------- Profile & Course Details ----------
router.get("/facultyprofileinfo/facultyid/:faculty_id", FacultyRouterHandler.getFacultyProfile); // facultyprofile.ejs
router.get("/courses/faculty_id/:faculty_id", FacultyRouterHandler.FacultyCourseDetails); // facultycoursedetails.ejs
router.get("/editcourse/course_offering_id/:course_offering_id", FacultyRouterHandler.EditCoursePage);
router.post("/editcourse/course_offering_id/:course_offering_id", FacultyRouterHandler.EditCoursePost);
router.get("/deletecourse/course_offering_id/:course_offering_id", FacultyRouterHandler.FacultyDeleteCourse);
router.get("/addcourse/facultyid/:faculty_id", FacultyRouterHandler.FacultyAddCoursePage);
router.post("/addcourse/facultyid/:faculty_id", FacultyRouterHandler.FacultyAddCoursePost);
// ---------- Co-Faculty Handling ----------
router.get("/assigncofaculty/course_offering_id/:course_offering_id", FacultyRouterHandler.FacultyAddCoFacultyPage);
router.post("/assigncofaculty/course_offering_id/:course_offering_id", FacultyRouterHandler.FacultyAddCoFacultyPost);
router.get("/removeco_faculty/course_offering_id/:course_offering_id/faculty_id/:faculty_id", FacultyRouterHandler.RemoveCoFaculty);


// ---------- Student Info ----------
router.get("/coursestudents/course_offering_id/:course_id", FacultyRouterHandler.CourseStudentDetails); // JSON

// ---------- Attendance ----------
router.get("/coursestudents/attendance/course_offering_id/:course_id", FacultyRouterHandler.GetStudentAttendance); // facultyattendanceview.ejs
router.get("/coursestudents/giveattendance/course_offering_id/:course_id", FacultyRouterHandler.GiveStudentAttendance); // facultyattendanceupdate.ejs
router.post("/coursestudents/attendance/course_offering_id/:course_id", FacultyRouterHandler.UpdateStudentAttendance);

// ---------- Grades ----------
router.get("/coursestudents/grade/course_offering_id/:course_id", FacultyRouterHandler.ViewGrades); // JSON
router.get("/coursestudents/givegrade/course_offering_id/:course_id", FacultyRouterHandler.GiveStudentGrade); // facultygradeupdate.ejs
router.post("/coursestudents/grade/course_offering_id/:course_id", FacultyRouterHandler.UpdateStudentGrade);
router.get("/viewgrades/facultyid/:faculty_id", FacultyRouterHandler.ViewGrades);

// ---------- Faculty Directory ----------
router.get("/allfacultydetails/facultyid/:facultyid", FacultyRouterHandler.GetAllFacultyDeatils); // facultyfacultydetails.ejs

// Exam Schedule Routes
router.get("/examschedule/course_offering_id/:course_id", FacultyRouterHandler.GetExamSchedule);  // 📄 View Page
router.post("/examschedule/course_offering_id/:course_id", FacultyRouterHandler.UpdateExamSchedule); // ➕ Add/Update exam
router.post("/examschedule/delete/course_offering_id/:course_id/exam_type/:exam_type", FacultyRouterHandler.DeleteExamSchedule); // ❌ Delete exam

// ---------- NEW: Grading Policy ----------
router.get("/setgrading/course_offering_id/:course_id", FacultyRouterHandler.GetGradingPolicy); // 🆕 facultygradingpolicy.ejs
router.post("/setgrading/course_offering_id/:course_id", FacultyRouterHandler.UpdateGradingPolicy);

// Create Pre-Registration for a course offering
router.get('/createpreregistration/course_offering_id/:course_offering_id', FacultyRouterHandler.getCreatePreRegistrationPageByOffering);

router.post('/createpreregistration/course_offering_id/:course_offering_id', FacultyRouterHandler.postCreatePreRegistrationByOffering);

// View Pre-Registration status
router.get('/preregistrationstatus/course_offering_id/:course_offering_id', FacultyRouterHandler.getFacultyPreRegistrationStatusByOffering);


module.exports = router;
