import express from "express";
import User from "../models/usersModel.js";
import { convert_to_hash_s10, transporter, generateOTP } from "../userdefineFuntion.js";

const router = express.Router();

const genOtp = generateOTP(4); // Use const instead of let

router.get("/", (req, res) => {
  res.render("joinUs.ejs", { message: null, error_message: null });
});

router.post("/", async (req, res) => {
  try {
    const { username, password, confirm_password, email, phone } = req.body;
    req.session.userdata=req.body;

    if (password !== confirm_password) {
      return res.render("joinUs.ejs", {
        message: null,
        error_message: "Password doesn't match",
      });
    }

    const newEmail = email.toLowerCase();
    const emailExist = await User.findOne({ email: newEmail });
    const pnExist = await User.findOne({ phoneno: phone });

    if (emailExist || pnExist) {
      return res.render("joinUs.ejs", {
        message: null,
        error_message: "Email or Phone number already exists",
      });
    }

    // Define email content
    const mailOptions = {
      from: 'gyaanhub8@gmail.com',
      to: 'subhadip240420@gmail.com',
      subject: 'OTP verification | SFI Aliah ',
      text: `Hello,

      Thank you for using SFI Aliah. Please use the following OTP to verify your account:
      
      ${genOtp}
      
      If you didn't request this OTP, please ignore this email.
      
      Best regards,
      SFI Aliah Team
      `,
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        return console.log(error);
      }
      res.redirect('/joinUs/verify');
    });
    
  } catch (error) {
    console.log(error);
  }
});

router.post('/verify', async (req, res) => {
  console.log(req.session.userdata)
  
  if (otp == genOtp) { // Compare OTP
    const new_password = await convert_to_hash_s10(password);
    const newUser = await User.create({
      name: username,
      email,
      password: new_password,
      phoneno: phone,
    });
    if (!newUser) {
      console.log("Error adding user");
    }
    const message = `Welcome to the COMRED's World ${username}`;
    res.render("joinUs.ejs", { message: message, error_message: null });
  } else {
    res.render('verify_otp.ejs', { error_message: 'OTP does not match' });
  }
});

router.get('/verify', (req, res) => {
  res.render('verify_otp.ejs', { error_message: null });
});

export default router;
