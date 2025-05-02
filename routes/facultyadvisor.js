const express = require("express");
const router = express.Router();

//Handlers
const FacultyAdvisorHandler = require("../routehandlers/FacultyAdvisorRouteHandler");

// router.get("/facultydetails/facultyid/:facultyid",FacultyAdvisorHandler.FacultyDetails);
// router.get("/studentdetails/facultyid/:facultyid",FacultyAdvisorHandler.GetStudentDetails);
// router.get("/studentgradedetails/studentid/:studentid",FacultyAdvisorHandler.GetStudentGrades);
// router.get("/studentattendancedetails/studentid/:studentid",FacultyAdvisorHandler.GetStudentAttendance);
// router.get("/allfaculty/facultyid/:facultyid",FacultyAdvisorHandler.GetAllFacultyDeatils);
///////////
router.get("/studentdetails/facultyid/:faculty_id", FacultyAdvisorHandler.getStudentDetails);

// Registration Verification
router.get("/verifyregistration/facultyid/:faculty_id", FacultyAdvisorHandler.getVerifyRegistrationPage);
router.post("/verifyregistration/facultyid/:faculty_id", FacultyAdvisorHandler.postVerifyRegistration);

// Pre-Registration Allotment
router.get("/allotpreregistration/facultyid/:faculty_id", FacultyAdvisorHandler.getAllotPreregistrationPage);
router.post("/allotpreregistration/facultyid/:faculty_id", FacultyAdvisorHandler.runAllotmentScript);


module.exports = router;