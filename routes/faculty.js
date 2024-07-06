const express = require('express');
const bodyparser = require('body-parser');
const router = express.Router();

// Handler
const FacultyRouterHandler = require('../routehandlers/FacultyRouteHandler');


router.get("/facultydetails/facultyid/:faculty_id",FacultyRouterHandler.FacultyDetails);// send facultyprofile page
router.get("/courses/faculty_id/:faculty_id",FacultyRouterHandler.FacultyCourseDetails);// send facultycoursedetails page
router.get("/coursestudents/course_id/:course_id",FacultyRouterHandler.CourseStudentDetails);
router.get("/coursestudents/attendance/course_id/:course_id",FacultyRouterHandler.GetStudentAttendance);// send faculty attendance view page
router.get("/coursestudents/grade/course_id/:course_id",FacultyRouterHandler.GetStudentGrade);
router.get("/coursestudents/giveattendance/course_id/:course_id",FacultyRouterHandler.GiveStudentAttendance);//send facultyattendanceupdate page
router.get("/coursestudents/givegrade/course_id/:course_id",FacultyRouterHandler.GiveStudentGrade);//send facultygradeupdatepage
router.post("/coursestudents/attendance/course_id/:course_id",FacultyRouterHandler.UpdateStudentAttendance);
router.post("/coursestudents/grade/course_id/:course_id",FacultyRouterHandler.UpdateStudentGrade);
router.get("/allfacultydetails/facultyid/:facultyid",FacultyRouterHandler.GetAllFacultyDeatils);

module.exports = router;
