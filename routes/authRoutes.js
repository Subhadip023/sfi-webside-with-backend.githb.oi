// authRoutes.js
import express from "express";
import passport from "passport";
import User from "../models/usersModel.js";
import bcrypt from 'bcrypt'

const router = express.Router();

router.get("/login", (req, res) => {
  // Render login form using a template engine (assuming you're using EJS)
  const { message } = req.query; 

  res.render("login.ejs", { message: message }); // Pass an empty message initially
});

router.post("/login", passport.authenticate('local', {
  successRedirect: '/admin',
  failureRedirect: '/login',
}));



export default router;
