const express = require("express");
const router = express.Router();

// Handelrs 
const general = require("../routehandlers/GeneralRouteHandler");

router.get('/allfaculty',general.AllFaculty);

module.exports = router;