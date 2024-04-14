import express from "express";
import bcrypt from "bcrypt";
import User from "../models/usersModel.js";
import { convert_to_hash_s10 } from "../userdefineFuntion.js";
import { transporter } from "../userdefineFuntion.js";
import { generateOTP } from "../userdefineFuntion.js";
import nodemailer from 'nodemailer';

const router = express.Router();

const genOtp=generateOTP(4);

router.get("/", (req, res) => {
  res.render("joinUs.ejs", { message: null, error_message: null });
});

router.post("/", async (req, res) => {
  try {
    const { username, password, confirm_password, email, phone } = req.body;

    if (password !== confirm_password) {
      res.render("joinUs.ejs", {
        message: null,
        error_message: "Password does't match",
      });
    }
    const newEmail = email.toLowerCase();
    const emailExist = await User.findOne({ email: newEmail });
    const pnExist = await User.findOne({ phoneno: phone });

    if (emailExist || pnExist) {
      res.render("joinUs.ejs", {
        message: null,
        error_message: "Email or Phone number is already exits",
      });
    }

  // Define email content
  let mailOptions = {
    from: 'gyaanhub8@gmail.com', // sender address
    to: 'subhadip240420@gmail.com', // list of receivers
    subject: 'OTP verification | SFI Aliah ', // Subject line
    text: `Hello,

    Thank you for using SFI Aliah. Please use the following OTP to verify your account:
    
    ${genOtp}
    
    If you didn't request this OTP, please ignore this email.
    
    Best regards,
    SFI Aliah Team
    `, // plain text body
};
transporter.sendMail(mailOptions, (error, info) => {
  if (error) {
      return console.log(error);
  }
res.redirect('joinUs/verify')});
    
  } catch (error) {
    console.log(error);
  }
});

router.post('/verify',async(req,res)=>{
  const {otp}=req.body;
  if(otp==genOtp){

 const new_password = await convert_to_hash_s10(password);
    const newUser = await User.create({
      name: username,
      email,
      password: new_password,
      phoneno: phone,
    });
    if (!newUser) {
      console.log("Error to add user");
    }
    const message = `Welcome to the COMRED's World ${username}`;

    res.render("joinUs.ejs", { message: message, error_message: null });
  }else{
    res.render('verify_otp.ejs',{error_message:'OTP is not matched'})

  }
  
  
})
router.get('/verify',(req,res)=>{
res.render('verify_otp.ejs',{error_message:null})
})

export default router;
