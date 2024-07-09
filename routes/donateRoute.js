import express from 'express';
import isAuthenticated from "../midelwire/authMiddleware.js";
import passport from "passport";
import dotenv from 'dotenv';
 import qr from 'qrcode';
 import Donate from '../models/donateModel.js'
import User from '../models/usersModel.js';
dotenv.config();

const router = express.Router(); 

let donateData={}

router.get("/",(req, res) => {
res.render('donate.ejs',{user:false,qrImage:false})
});
router.get("/user",isAuthenticated,(req, res) => {
// console.log(req.user)
  res.render('donate.ejs',{user:req.user,qrImage:false})
});


router.post("/", async (req, res) => {
  let { name,email,phone,amount } = req.body;
  console.log(email)
  const findUser=await User.findOne({email:email})
  if (findUser) {
    console.log(`User found: ${findUser}`);
  } else {
    console.log('User not found');
  }

  donateData={
    name,email,phone,amount
  }
  amount=Number(amount).toFixed(2)
  
  const upiPaymentLink = `upi://pay?pa=${process.env.PAYMENT_UPI}&pn=Subhadip%20Chakraborty&am=${amount}&cu=INR&aid=uGICAgID146_9bw`;


  try {
      // Generate QR code as a data URL
      const qrCodeDataURL = await qr.toDataURL(upiPaymentLink);

      // Respond with the QR code data URL
      // res.send(`<img src="${qrCodeDataURL}" alt="UPI QR Code">`);
      const donate=Donate.create(donateData)
      if(!donate){
        console.log('donateData not save')
      }
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

router.get('/thanks-donate', async (req, res) => {
  try {
    
    const email = donateData.email;

    // Find the donation data using the email
    const donate = await Donate.findOne({ email: email });

    if (donate) {
      // Update the isDone field to true
      donate.isDone = true;

      // Update the document in the database
      const updatedDonate = await Donate.findByIdAndUpdate(donate._id, donate, { new: true });

      // Render the template
      res.render('thanks-donate.ejs');
    } else {
      res.status(404).send('Donation not found');
    }
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
});





  export default router;
