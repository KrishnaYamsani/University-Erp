require('dotenv').config();
const jwt = require("jsonwebtoken");
const pool = require("./db");


function generateToken (user) {
    return jwt.sign(user,process.env.ACCESS_TOKEN_SECRET,{expiresIn : '60m'});
}

function authenticateToken(req,res,next){
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if(!token){
        return res.sendStatus(401);
    }

    jwt.verify(token,process.env.ACCESS_TOKEN_SECRET, (err,user) => {
        if (err) return res.sendStatus(403);
        req.user = user;
        next()
    })
}


async function authenticateUserWithRole (req,res,next) {
    const user = req.body.user;
    const password = req.body.password;
    const role = req.body.role;
console.log(req.body);
    

    const result = await pool.query(`SELECT PASSWORD FROM AUTHENTICATION WHERE USERNAME=$1 AND ROLE=$2`,[user,role]);
                            console.log(result.rows);

    if(result === password){
       if(role === 'faculty'){
        res.redirect('/faculty/facultydetails/facultyid/'+user);
       }else if(role === 'facultyadvisor'){
        res.redirect('/facultyadvisor/facultydetails/facultyid/'+user);
       }else if(role === 'student'){
        res.redirect('/student/profileinfo/studentId/' + user)
       }
    }else{
        res.redirect("/");
    }
}

async function authenticateUserWithRoleFaculty (req,res,next) {
    const user = req.body.user;
    const password = req.body.password;
    const role = req.body.role;

    if(role!='faculty'){
        res.redirect("/");
    }

    const result = await pool.query("SELECT PASSWORD FROM AUTHENTICATION WHERE USERNAME=$1 AND ROLE=$2",[user,role])
                             .then((result) => result.rows[0].password);

    if(result === password){
        next();
    }else{
        res.redirect("/");
    }
}
async function authenticateUserWithRoleFaculty (req,res,next) {
    const user = req.body.user;
    const password = req.body.password;
    const role = req.body.role;

    if(role!='faculty'){
        res.redirect("/");
    }

    const result = await pool.query("SELECT PASSWORD FROM AUTHENTICATION WHERE USERNAME=$1 AND ROLE=$2",[user,role])
                             .then((result) => result.rows[0].password);

    if(result === password){
        next();
    }else{
        res.redirect("/");
    }
}

async function authenticateUserWithRoleFacultyAdvisor (req,res,next) {
    const user = req.body.user;
    const password = req.body.password;
    const role = req.body.role;

    if(role!='facultyadvisor'){
        res.redirect("/");
    }

    const result = await pool.query("SELECT PASSWORD FROM AUTHENTICATION WHERE USERNAME=$1 AND ROLE=$2",[user,role])
                             .then((result) => result.rows[0].password);

    if(result === password){
        next();
    }else{
        res.redirect("/");
    }
}

async function authenticateUserWithRoleStudent (req,res,next) {
    const user = req.body.user;
    const password = req.body.password;
    const role = req.body.role;

    if(role!='student'){
        res.redirect("/");
    }

    const result = await pool.query("SELECT PASSWORD FROM AUTHENTICATION WHERE USERNAME=$1 AND ROLE=$2",[user,role])
                             .then((result) => result.rows[0].password);

    if(result === password){
        next();
    }else{
        res.redirect("/");
    }
}

module.exports = {generateToken,authenticateToken,authenticateUserWithRoleFaculty,authenticateUserWithRoleFacultyAdvisor,authenticateUserWithRoleStudent,authenticateUserWithRole};