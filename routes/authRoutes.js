// authRoutes.js
import express from "express";
import passport from "passport";
import User from "../models/usersModel.js";
import bcrypt from 'bcrypt'

const router = express.Router();

router.get("/login", (req, res) => {
  // Render login form using a template engine (assuming you're using EJS)
  res.render("login.ejs", { message: "" }); // Pass an empty message initially
});

// router.post("/login", passport.authenticate('local', {
//   successRedirect: '/admin',
//   failureRedirect: '/login',
// }));
router.post("/login", async (req, res) => {
  console.log(req.body);
  const { username, password } = req.body;
  try {
    const user = await User.findOne({ name:username });
    if (!user) {
      // User not found in the database
      console.log("no userfound");
    }
    // Compare the hashed password with the provided password
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      // Password doesn't match
      console.log("password not matched");
    }
    // Authentication successful, pass user object to the done callback
    console.log("matched");
  } catch (error) {
    console.log(error);
  }
});

export default router;
