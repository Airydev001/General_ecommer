const express = require('express');
const {check,body} = require("express-validator")

const authController = require('../controllers/auth');
const User = require("../models/user")
const router = express.Router();

router.get('/login', authController.getLogin);

router.post('/login',[
    check('email')
    .isEmail()
    .normalizeEmail()
    .trim()
    .withMessage("Enter Your registered email")
    .custom((value,{req})=>{
        console.log(value)
       return User.findOne({ email:value})
        .then(user=> {
          if (!user) {
          return Promise.reject('Enter the correct  email')
            
          }
    })
}),
    check('password',"Please enter the required password")
    .not()
    .isEmpty()
    .custom((value,{req})=>{
        console.log(value)
       return User.findOne({ password:req.body.password})
        .then(user=> {
          if (user) {
          return Promise.reject('Enter the correct password')
            
          }
    })
})
    ,
    body("password","Enter a password that contain Alphabet and Number")
.isLength({min:7})
.isAlphanumeric(),
], authController.postLogin);

router.get("/signup",authController.getSignup)
router.post("/signup",[
check('email')
.normalizeEmail()
.trim()
.isEmail()
.withMessage("OOPS! enter valid email ").custom((value,{req})=>{
   return User.findOne({ email: value})
    .then(userDoc => {
      if (userDoc) {
       return Promise.reject('E-Mail exists already, please pick a different one.')
      }
    })
}),


body("confirmPassword")
.trim()
.custom((value,{req})=>{
    if (value !== req.body.password){
        throw new Error("Oops! Password has to match")
    }
    return true
}),
body("password","Enter a password that match")
.trim()
.isLength({min:7})
.isAlphanumeric()
],authController.postSignup)

router.post('/logout', authController.postLogout);

router.get('/reset',authController.getReset);
router.post('/reset',authController.postReset);
router.post('/reset/:token',authController.getNewPassword);

router.post('/new-passwrod',authController.postNewPassword);
module.exports = router;