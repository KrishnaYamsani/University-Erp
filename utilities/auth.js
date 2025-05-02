require('dotenv').config();
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const pool = require("./db");

function generateToken(user) {
    return jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '60m' });
}

function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.sendStatus(401);
    }

    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
        if (err) return res.sendStatus(403);
        req.user = user;
        next();
    });
}

async function authenticateUserWithRole(req, res, next) {
    const { user, password, role } = req.body;

    try {
        // Fetch user info from Users table
        const result = await pool.query(
            "SELECT password, role, is_faculty_advisor FROM Users WHERE user_id = $1 AND role = $2",
            [user, role]
        );

        if (result.rowCount === 0) {
            return res.redirect(`/?error=Invalid username or role combination`);
        }

        const dbUser = result.rows[0];

        // Compare hashed password using bcrypt
        const match = await bcrypt.compare(password, dbUser.password);
        if (!match) {
            return res.redirect(`/?error=Incorrect password`);
        }

        const userPayload = {
            user_id: user,
            role: dbUser.role,
            is_faculty_advisor: dbUser.is_faculty_advisor,
        };

        const token = generateToken(userPayload);
        res.cookie('token', token, { httpOnly: true });

        // Redirect based on role
        if (role === 'student') {
            return res.redirect(`/student/profileinfo/studentId/${user}`);
        } else if (role === 'faculty') {
            return res.redirect(`/faculty/facultyprofileinfo/facultyid/${user}`);
        } else {
            return res.redirect('/'); // fallback
        }
    } catch (err) {
        console.error("Login error:", err);
        return res.status(500).send("Server error");
    }
}

function logoutUser(req, res) {
    res.clearCookie('token'); // Remove the JWT token cookie
    res.redirect('/');        // Redirect to home page
}

module.exports = {
    generateToken,
    authenticateToken,
    authenticateUserWithRole,
    logoutUser,
};



// async function authenticateUserWithRoleFaculty (req,res,next) {
//     const user = req.body.user;
//     const password = req.body.password;
//     const role = req.body.role;

//     if(role!='faculty'){
//         res.redirect("/");
//     }

//     const result = await pool.query("SELECT PASSWORD FROM AUTHENTICATION WHERE USERNAME=$1 AND ROLE=$2",[user,role])
//                              .then((result) => result.rows[0].password);

//     if(result === password){
//         next();
//     }else{
//         res.redirect("/");
//     }
// }


// async function authenticateUserWithRoleFaculty (req,res,next) {
//     const user = req.body.user;
//     const password = req.body.password;
//     const role = req.body.role;

//     if(role!='faculty'){
//         res.redirect("/");
//     }

//     const result = await pool.query("SELECT PASSWORD FROM AUTHENTICATION WHERE USERNAME=$1 AND ROLE=$2",[user,role])
//                              .then((result) => result.rows[0].password);

//     if(result === password){
//         next();
//     }else{
//         res.redirect("/");
//     }
// }

// async function authenticateUserWithRoleFacultyAdvisor (req,res,next) {
//     const user = req.body.user;
//     const password = req.body.password;
//     const role = req.body.role;

//     if(role!='facultyadvisor'){
//         res.redirect("/");
//     }

//     const result = await pool.query("SELECT PASSWORD FROM AUTHENTICATION WHERE USERNAME=$1 AND ROLE=$2",[user,role])
//                              .then((result) => result.rows[0].password);

//     if(result === password){
//         next();
//     }else{
//         res.redirect("/");
//     }
// }

// async function authenticateUserWithRoleStudent (req,res,next) {
//     const user = req.body.user;
//     const password = req.body.password;
//     const role = req.body.role;

//     if(role!='student'){
//         res.redirect("/");
//     }

//     const result = await pool.query("SELECT PASSWORD FROM AUTHENTICATION WHERE USERNAME=$1 AND ROLE=$2",[user,role])
//                              .then((result) => result.rows[0].password);

//     if(result === password){
//         next();
//     }else{
//         res.redirect("/");
//     }
// }

// module.exports = {generateToken,authenticateToken,authenticateUserWithRole};