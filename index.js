require('dotenv').config();
const express = require('express');
const bodyparser = require('body-parser');
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
const connection = "postgres://erp_nb6d_user:gTHSNkhJsqaXHkDUSTuEhNzF3LT7OQVn@dpg-cocnl821hbls73cuifog-a.oregon-postgres.render.com/erp_nb6d" ;

//Utilities
const auth = require("./utilities/auth");

app.use(express.static('public'))
// Body parser middleware
app.use(bodyparser.json());
app.use(bodyparser.urlencoded({extended:true}));

//templates
app.set('views','./views');
app.set('view engine', 'ejs');

app.get('/',(req,res) => {
    res.render('index');
})

//app.use('/',bodyparser.json(),auth.authenticateUserWithRole);
//app.use('/',)
//app.use('/')
app.use('/student',student);
app.use('/faculty',bodyparser.json(),faculty)
app.use('/public',general);
app.use('/facultyadvisor',facultyadvisor);

app.all('*',(req,res) => {
    res.redirect('/');
})

app.listen(3000,function (){
    console.log("Server started on port 3000");
})