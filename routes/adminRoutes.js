import express from 'express'
import passport from 'passport'
import sqlite3 from 'sqlite3';
import { about_data } from '../index.js';

const router = express.Router();
const db = new sqlite3.Database("sfi-dataBase.db");

 
router.get("/admin", (req, res) => {
  console.log(about_data.lcp)
  // console.log(req.user)
  if (!req.isAuthenticated() || req.user.position !== 'Admin') {
    return res.redirect('/login');
  }
    
    // Query to fetch user data from the database
    const userSql = "SELECT * FROM users";
    const notificationSql = "SELECT * FROM notifications";
    const imageSql = "SELECT * FROM images";
    const homeSql = "SELECT * FROM home";
  
    // Execute all queries in parallel using Promise.all
    Promise.all([
      new Promise((resolve, reject) => {
        db.all(userSql, (err, userRows) => {
          if (err) {
            reject(err);
          } else {
            resolve(userRows);
          }
        });
      }),
      new Promise((resolve, reject) => {
        db.all(notificationSql, (err, notificationRows) => {
          if (err) {
            reject(err);
          } else {
            resolve(notificationRows);
          }
        });
      }),
      new Promise((resolve, reject) => {
        db.all(imageSql, (err, imageRows) => {
          if (err) {
            reject(err);
          } else {
            resolve(imageRows);
          }
        });
      }),
      new Promise((resolve, reject) => {
        db.all(homeSql, (err, homeRows) => {
          if (err) {
            reject(err);
          } else {
            resolve(homeRows);
          }
        });
      })
    ])
    .then(([userRows, notificationRows, imageRows,homeRows]) => {
      // Render the admin.ejs template and pass the fetched data
      res.render("admin.ejs", {
        users: userRows,
        notifications: notificationRows,
        images: imageRows,
        home:homeRows,
        about_data:about_data,
      });
    })
    .catch(err => {
      console.error("Database error:", err.message);
      return res.status(500).send("Internal Server Error");
    });
  });
  
  
  
  export default router;
