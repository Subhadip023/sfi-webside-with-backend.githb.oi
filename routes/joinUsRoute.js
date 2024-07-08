import express from "express";
import User from "../models/usersModel.js";
import {
  convert_to_hash_s10,
  transporter,
  generateOTP,
} from "../userdefineFuntion.js";

const router = express.Router();

const genOtp = generateOTP(4);
let userdata = {
  name: null,
  password: null,
  email: null,
  phoneno: null,
};
let count = 0;

router.get("/", (req, res) => {
  const { message } = req.query; // Extract the message from the query parameters

  res.render("joinUs.ejs", { message: message, error_message: null });
});
router.post("/", async (req, res) => {
  try {
    const { username, password, confirm_password, email, phone } = req.body;
    req.session.userdata = req.body;

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
    const new_password = await convert_to_hash_s10(password);
    userdata = { name:username, password: new_password, email, phoneno: phone };
    // Define email content
    const mailOptions = { 
      from: "gyaanhub8@gmail.com",
      to: email,
      subject: "OTP verification | SFI Aliah ",
      text: `Hello, ${username} 

      Thank you for using SFI Aliah. Please use the following OTP to verify your account:  ${genOtp}
           
      If you didn't request this OTP, please ignore this email.
      
      Best regards,
      SFI Aliah Team 
      `,
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        return console.log(error);
      }
      res.redirect("/joinUs/verify");
    });
  } catch (error) {
    console.log(error);
  }
});
router.post("/verify", async (req, res) => {
  // console.log(req.session.userdata)
  try {
    count++;
    const { otp } = req.body;
 
    if (otp == genOtp) {
      // Compare OTP
      //   const new_password = await convert_to_hash_s10(password);
        const newUser = await User.create(userdata);
        if (!newUser) {
          console.log("Error adding user");
        }
        const message = `Welcome to the COMRED's World ${userdata.name}`;
        res.redirect(`/joinUs?message=${encodeURIComponent(message)}`);
      } else {
      if (count === 5) {
        res.redirect('/joinUs')
      } else {
        res.render("verify_otp.ejs", {
          error_message: "OTP does not match " + (5 - count) + " try left",
        });
      }
    }
  } catch (error) {
    console.log(error);
  }
});
router.get("/verify", (req, res) => {
  count = 0;
  res.render("verify_otp.ejs", { error_message: null });
});
export default router;
