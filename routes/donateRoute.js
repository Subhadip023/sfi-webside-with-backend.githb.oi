import express from "express";
import isAuthenticated from "../midelwire/authMiddleware.js";
import passport from "passport";
import dotenv from "dotenv";
import qr from "qrcode";
import Donate from "../models/donateModel.js";
import User from "../models/usersModel.js";
import bcrypt from "bcrypt";

     

dotenv.config();

const router = express.Router();

let donateData = {id:null,userEmail:null};

router.get("/", (req, res) => {
  res.render("donate.ejs", {
    user: false,
    qrImage: false,
    error_message: null,
  });
});



router.post("/", async (req, res) => {
  let { password, email, amount } = req.body;
  amount = Number(amount).toFixed(2);
  try {
    let user = await User.findOne({ email: email });
    if (!user) {
 return res.render("donate.ejs", {
      qrImage: false,
      user: false,
      error_message: `can't find a user of email ${email}.      `,
    });    
  }
    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      return res.render("donate.ejs", {
        qrImage: false,
        user: false,
        error_message: `Password not matched. Please enter write password `,
      }); 
    }


    const upiPaymentLink = `upi://pay?pa=${process.env.PAYMENT_UPI}&pn=Subhadip%20Chakraborty&am=${amount}&cu=INR&aid=uGICAgID146_9bw`;

    // Generate QR code as a data URL
    const qrCodeDataURL = await qr.toDataURL(upiPaymentLink);

    const donate = await Donate.create({
      amount: amount,
      user: user._id,
    });
    donateData={id:donate.id,userEmail:email}

    if (!donate) {
      return res.render("donate.ejs", {
        qrImage: false,
        user: false,
        error_message: `Internal server error. Sorry !`,
      }); 
    }

    res.render("donate.ejs", {
      qrImage: qrCodeDataURL,
      user: false,
      error_message: null,
    });
  } catch (err) {
    console.error("Error generating QR code:", err);
    // res.status(500).send("Failed to generate QR code");
    res.render("donate.ejs", {
      qrImage: qrCodeDataURL,
      user: false,
      error_message: `Failed to generate QR code`,
    });
  }
});




router.post(
  "/login",
  passport.authenticate("local", {
    successRedirect: "/donate/user",
    failureRedirect: "/login",
  })
);

router.get("/thanks-donate", async (req, res) => {

 try {
  const donate=await Donate.findByIdAndUpdate((donateData.id),{isDone:"verifying"});
  if (!donate) {
    console.log(`Donate data from ${donateData.email} Not verifynig stage check admin ! `)
  }
  res.render('thanks-donate.ejs')

 } catch (error) {
  console.log(error)
 }
});

export default router;
