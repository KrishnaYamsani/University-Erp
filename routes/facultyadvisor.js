const express = require("express");
const router = express.Router();

//Handlers
const FacultyAdvisorHandler = require("../routehandlers/FacultyAdvisorRouteHandler");

router.get("/facultydetails/facultyid/:facultyid",FacultyAdvisorHandler.FacultyDetails);
router.get("/studentdetails/facultyid/:facultyid",FacultyAdvisorHandler.GetStudentDetails);
router.get("/studentgradedetails/studentid/:studentid",FacultyAdvisorHandler.GetStudentGrades);
router.get("/studentattendancedetails/studentid/:studentid",FacultyAdvisorHandler.GetStudentAttendance);
router.get("/allfaculty/facultyid/:facultyid",FacultyAdvisorHandler.GetAllFacultyDeatils);

module.exports = router;