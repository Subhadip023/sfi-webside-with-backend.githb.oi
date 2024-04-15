import express from 'express'
import passport from 'passport'
import sqlite3 from 'sqlite3';
import { about_data } from '../index.js';
import usersModel from '../models/usersModel.js';

const router = express.Router();
const db = new sqlite3.Database("sfi-dataBase.db");

 
router.get("/admin", (req, res) => {
  if (!req.isAuthenticated()) {
      return res.redirect("/login");
    }
    
    // Query to fetch user data from the database
    const userSql = "SELECT * FROM users";
    const notificationSql = "SELECT * FROM notifications";
    const eventSql = "SELECT * FROM event";
    const imageSql = "SELECT * FROM images";
    const homeSql = "SELECT * FROM home";
  
    // Execute all queries in parallel using Promise.all
    Promise.all([
      new Promise((resolve, reject) => {
        usersModel.find()
          .then(userRows => {
            resolve(userRows);
          })
          .catch(error => {
            reject(error); // Reject the promise if an error occurs
          });
      })
      ,
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
        db.all(eventSql, (err, eventRows) => {
          if (err) {
            reject(err);
          } else {
            resolve(eventRows);
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
    .then(([userRows, notificationRows,eventRows, imageRows,homeRows]) => {
      // Render the admin.ejs template and pass the fetched data
      res.render("admin.ejs", {
        users: userRows,
        notifications: notificationRows,
        events:eventRows,
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
