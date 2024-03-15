import express from 'express';
import sqlite3 from 'sqlite3';

const db = new sqlite3.Database("sfi-dataBase.db");

const router = express.Router();


// Register route
router.post("/register", (req, res) => {
    const { username, password, email, phone } = req.body;
  
    // Validate input fields
    if (!username || !password || !email) {
      return res.status(400).send("Username, password, and email are required");
    }
  
    // Check if username already exists
    db.get("SELECT id FROM users WHERE username = ?", [username], (err, row) => {
      if (err) {
        console.error("Database error:", err.message);
        return res.status(500).send("Internal Server Error");
      }
  
      if (row) {
        return res.status(400).send("Username already exists");
      }
  
      // Insert new user into the database
      db.run(
        "INSERT INTO users (username, password, email, phone) VALUES (?, ?, ?, ?)",
        [username, password, email, phone],
        (err) => {
          if (err) {
            console.error("Database error:", err.message);
            return res.status(500).send("Internal Server Error");
          }
  
          res.redirect("/");
        }
      );
    });
  });
  
  export default router;
