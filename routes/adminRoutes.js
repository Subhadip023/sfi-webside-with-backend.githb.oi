import express from 'express'
import passport from 'passport'
import sqlite3 from 'sqlite3';
import { about_data } from '../index.js';
import User from '../models/usersModel.js';
import isAuthenticated from '../midelwire/authMiddleware.js'

const router = express.Router();
const db = new sqlite3.Database("sfi-dataBase.db");

 
router.get("/admin", isAuthenticated,(req, res) => {

 if (req.user.position!=='Admin'){
  // res.redirect("/login", { message: "Sorry You don't have permission to see the admin route!!" }); // Pass an empty message initially
  res.redirect(`/login?message=${encodeURIComponent("Sorry You don't have permission to see the admin route!!")}`);

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
        User.find()
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
  
  
  router.get("/admin/user-data/update/:id",isAuthenticated, (req, res) => {
    const userId = req.params.id;
    User.findById(userId)
        .then(userData => {
            // Check if user data is found
            if (userData.length === 0) {
                // If user data is not found, send an appropriate response
                return res.status(404).json({ message: 'User not found' });
            }
            // If user data is found, send it back to the client
            res.render('update-user.ejs',{user:userData})
        })
        .catch(error => {
            // Handle error
            console.error(error);
            // Send an error response
            res.status(500).json({ message: 'Internal server error' });
        });
});

  
  // Route to handle updating user data
  router.post("/admin/user-data/update",isAuthenticated, async (req, res) => {
    // Extract user data from the request body
    try {
        const { id, username, email, phone, position } = req.body;
        // Update the user data
        const response = await User.findByIdAndUpdate(id, { name: username, email, phoneno: phone, position }, { new: true });
        // Check if user data is found and updated
        if (!response) {
            return res.status(500).send("Internal Server Error");
        }
        // Redirect to '/admin' after successful update
        res.redirect('/admin');
    } catch (error) {
        console.error(error);
        res.status(400).send("Internal server error");
    }
});

router.post("/admin/user-data/delete", isAuthenticated,(req, res) => {
  // Extract the user ID from the request parameters
  const userId = req.body.id;

  User.findByIdAndDelete(userId)
      .then(deletedUser => {
          // Check if user was found and deleted
          if (!deletedUser) {
              // If user was not found, send a 404 response
              return res.status(404).json({ message: 'User not found' });
          }
          // Redirect to '/admin' after successful deletion
          res.redirect('/admin');
      })
      .catch(error => {
          // Handle error
          console.error(error);
          // Send an error response
          res.status(500).json({ message: 'Internal server error' });
      });
});



  
  export default router;
