import express from 'express';
import isAuthenticated from "../midelwire/authMiddleware.js";
import passport from "passport";
import dotenv from 'dotenv';
 import qr from 'qrcode'
dotenv.config();

const router = express.Router(); 


router.get("/",(req, res) => {
res.render('donate.ejs',{user:false,qrImage:false})
});
router.get("/user",isAuthenticated,(req, res) => {
// console.log(req.user)
  res.render('donate.ejs',{user:req.user,qrImage:false})
});


router.post("/", async (req, res) => {
  let { amount } = req.body;
  amount=Number(amount).toFixed(2)
  // Assuming you have a UPI payment link format
  // const upiPaymentLink = `upi://pay?pa=${encodeURIComponent(process.env.PAYMENT_UPI)}&pn=ReceiverName&am=${encodeURIComponent(amount)}&cu=INR`;
  const upiPaymentLink = `upi://pay?pa=${process.env.PAYMENT_UPI}&pn=Subhadip%20Chakraborty&am=${amount}&cu=INR&aid=uGICAgID146_9bw`;


  try {
      // Generate QR code as a data URL
      const qrCodeDataURL = await qr.toDataURL(upiPaymentLink);

      // Respond with the QR code data URL
      // res.send(`<img src="${qrCodeDataURL}" alt="UPI QR Code">`);
res.render('donate.ejs',{qrImage:qrCodeDataURL,user:false})

  } catch (err) {
      console.error('Error generating QR code:', err);
      res.status(500).send('Failed to generate QR code');
  }
});



router.get("/login", (req, res) => {
  // Render login form using a template engine (assuming you're using EJS)
  const { message } = req.query; 

  res.render("donate_login .ejs", { message: message }); // Pass an empty message initially
});

router.post("/login", passport.authenticate('local', {
  successRedirect: '/donate/user',
  failureRedirect: '/login',
}));






  export default router;
