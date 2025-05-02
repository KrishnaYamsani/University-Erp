require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session');
const pg = require('pg');
const jwt = require('jsonwebtoken');
const pool = require('./utilities/db');
const app = express();

//Routes
const student = require('./routes/student');
const faculty = require('./routes/faculty');
const general = require("./routes/public");
const facultyadvisor = require("./routes/facultyadvisor");
// DB connection
const connection = "postgresql://erp_university_database_user:iut4pFpAgSMHOZ1a1pJwAKkG6jByx8uQ@dpg-d054thje5dus738tts1g-a.singapore-postgres.render.com/erp_university_database" ;

//Utilities
const auth = require("./utilities/auth");
app.use(session({
    secret: 'your-secret-key', // Change this to a secure secret
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false } // Set secure: true if you're using HTTPS
  }));
app.use(express.static('public'))
// Body parser middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:true}));

//templates
app.set('views','./views');
app.set('view engine', 'ejs');

app.get('/',(req,res) => {
    const error = req.query.error || null;
    res.render('index',{error});
})

// app.post('/',(req,res) => {
//     console.log(req.body);
//     res.redirect('/');
// })

app.post('/', bodyParser.urlencoded({ extended: false }), auth.authenticateUserWithRole);
app.get('/logout',bodyParser.urlencoded({ extended: false }), auth.logoutUser);
app.use('/student',student);
app.use('/faculty',bodyParser.json(),faculty)
app.use('/public',general);
app.use('/facultyadvisor',facultyadvisor);

app.all('*',(req,res) => {
    res.redirect('/');
})

app.listen(3000,function (){
    console.log("Server started on port 3000");
})