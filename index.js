import authRoutes from "./routes/authRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import newsRoute from "./routes/newsRoute.js";
import homeRoute from "./routes/homeRoute.js";
import donateRoute from "./routes/donateRoute.js";
import galleryRoute from './routes/galleryRoute.js'
import notificationRouter from './routes/notificationRoute.js'
import eventRoute from './routes/eventRoute.js'
import registerRoute from "./routes/registerRoute.js";

import User from './models/usersModel.js'; 

import express from "express";
import sqlite3 from "sqlite3";
import session from "express-session";
import bodyParser from "body-parser";
import multer from "multer";
import path from "path";
import fs from "fs";
import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import bcrypt from "bcrypt";
import joinUsRoute from './routes/joinUsRoute.js'
import dotenv from 'dotenv';
import { mongoose,connect } from 'mongoose';





dotenv.config();


const app = express();
const port = 5000;


// Create SQLite database connection
// const upload = multer({ storage: storage });
app.use(express.json());  // For JSON data

app.use(bodyParser.urlencoded({ extended: true }));
// Middleware to serve static files
app.use(express.static("public"));

app.use(
  session({
    secret: process.env.secret,
    resave: false,
    saveUninitialized: false,
  })
);

app.use(passport.initialize());
app.use(passport.session());

// Create tables if they don't exist


// Use the middleware function in your adminRoutes

app.use(authRoutes);
app.use(adminRoutes);
app.use(eventRoute);
app.use(newsRoute);
app.use('/Gallery',galleryRoute);
app.use('/donate',donateRoute);
app.use('/joinUs',joinUsRoute)
app.use('/',homeRoute)
app.use('/notification',notificationRouter)


let about_data = {
  lcp: "Kiron Anjar",
  lcs: "Miladun Nabi",
  tmp: "Arian Sarkar",
  tms: "Sunirnay Chatterjee",
  sup: "Tuhina Parvin",
  sus: "Wahid",
};

app.get("/About", (req, res) => {
  res.render("About.ejs", { about: about_data });
});
app.post("/about", (req, res) => {
  about_data = {
    lcp: req.body.lcp,
    lcs: req.body.lcs,
    tmp: req.body.tmp,
    tms: req.body.tms,
    sup: req.body.sup,
    sus: req.body.sus,
  };
  // console.log(about_data)
  res.redirect("/admin");
});
export { about_data };






passport.use(new LocalStrategy(
  async function(email, password, done) {
    try {
      const user = await User.findOne({ email: email });
      if (!user) {
        return done(null, false, { message: 'Incorrect email.' });
      }
      const passwordMatch =  await bcrypt.compare(password, user.password);
      if (!passwordMatch) {
        return done(null, false, { message: 'Incorrect password.' });
      }
      return done(null, user);
    } catch (error) {
      return done(error);
    }
  }
));

// Serialization function
passport.serializeUser((user, done) => {
  // console.log(user); //This is for testing perpuse
  // Assuming user.id exists, you can directly serialize the user ID
  done(null, user.id);
});

// Deserialization function
passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    // If user is not found, pass null as the user object
    done(null, user || null);
  } catch (error) {
    done(error);
  }
});


// Connect to MongoDB Atlas
const uri = process.env.MONGO_URI;
mongoose.connect(uri)
    .then(() => console.log('Connected to MongoDB Atlas'))
    .catch(err => console.error('Could not connect to MongoDB Atlas', err));


app.listen(process.env.PORT, () => {
    console.log(`Server is running on port http://localhost:${process.env.PORT}`);
});
