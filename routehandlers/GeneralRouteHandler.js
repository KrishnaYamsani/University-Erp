require("dotenv").config();

const express = require("express");
const router = express.Router();
const pool = require("../utilities/db");

exports.AllFaculty = async (req,res) => {
    const result = await pool.query("SELECT * FROM FACULTY");

    res.render('facultydetails',{facultyDetails:result.rows,greetingMessage:"Hi",userName:"Hi",});
}