// authRoutes.js
import express from 'express';
import passport from 'passport';

const router = express.Router();

router.get("/login", (req, res) => {
  // Render login form using a template engine (assuming you're using EJS)
  res.render("login.ejs", { message: "" }); // Pass an empty message initially
});

router.post("/login", passport.authenticate('local', {
  successRedirect: '/admin',
  failureRedirect: '/login',
}));

export default router;
