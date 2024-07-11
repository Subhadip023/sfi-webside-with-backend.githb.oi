import express from "express";
import isAuthenticated from "../midelwire/authMiddleware.js";
import passport from "passport";
import dotenv from "dotenv";
import qr from "qrcode";
import Donate from "../models/donateModel.js";
import User from "../models/usersModel.js";

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
  let { name, email, phone, amount } = req.body;
  amount = Number(amount).toFixed(2);
  // console.log(req.body);
  try {
    let user = await User.findOne({ email: email });
    // console.log(user);
    if (user) {
      if (!user.position === "donater") {
        return res.render("donate.ejs", {
          qrImage: false,
          user: false,
          error_message: `This Email Id is Used Please LogIn to donate`,
        });
      } 
    } else {
      user = await User.create({
        name: name,
        email: email,
        phoneno: phone,
        Donate_Amount: 0.00,
        position: "donater",
      });

      if (!user) {
        return res.render("donate.ejs", {
          qrImage: false,
          user: false,
          error_message: `Unknown Error Can't Donate Now Try again`,
        });
      }
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
      console.log("donateData not saved");
    }

    res.render("donate.ejs", {
      qrImage: qrCodeDataURL,
      user: false,
      error_message: null,
    });
  } catch (err) {
    console.error("Error generating QR code:", err);
    res.status(500).send("Failed to generate QR code");
  }
});


router.post("/user",  async(req, res) => {
  let { id, amount } = req.body;
  amount = Number(amount).toFixed(2);
  // console.log(req.body);
  try {
    const user=await User.findById(id);
    if (!user) {
      res.send(404).json({message:'Internal Server Error '})
    }
    const upiPaymentLink = `upi://pay?pa=${process.env.PAYMENT_UPI}&pn=Subhadip%20Chakraborty&am=${amount}&cu=INR&aid=uGICAgID146_9bw`;

    // Generate QR code as a data URL
    const qrCodeDataURL = await qr.toDataURL(upiPaymentLink);

    const donate = await Donate.create({
      amount: amount,
      user: user._id,
    });
    donateData={id:donate.id,userEmail:user.email}

    if (!donate) {
      console.log("donateData not saved");
    }

    res.render("donate.ejs", {
      qrImage: qrCodeDataURL,
      user: false,
      error_message: null,
    });

  } catch (error) {
    console.log(error)
  }
});
router.get("/login", (req, res) => {
  const { message } = req.query;
  res.render("donate_login.ejs", { message: message });
});

router.post(
  "/login",
  passport.authenticate("local", {
    successRedirect: "/donate/user",
    failureRedirect: "/login",
  })
);

router.get("/thanks-donate", async (req, res) => {
//  console.log(req.body);
//  console.log(donateData);
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
