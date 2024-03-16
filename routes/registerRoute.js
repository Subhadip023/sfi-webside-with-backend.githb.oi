import express from 'express';
import sqlite3 from 'sqlite3';
import bcrypt from 'bcrypt';
const db = new sqlite3.Database("sfi-dataBase.db");

const router = express.Router();

// Register route
router.post("/register", async (req, res) => {
    const { username, password, email, phone } = req.body;
  
    // Validate input fields
    if (!username || !password || !email) {
      return res.status(400).send("Username, password, and email are required");
    }
  
    try {
      // Check if username already exists
      const existingUser = await getUserByUsername(username);
      if (existingUser) {
        return res.status(400).send("Username already exists");
      }
  
      // Hash the password
      const hashedPassword = await bcrypt.hash(password, 10); // 10 is the saltRounds parameter
  
      // Insert new user into the database with hashed password
      await insertUser(username, hashedPassword, email, phone);
  

    // Redirect with success message
    const message = `Welcome to the COMRED's World ${username}`;
    res.redirect("/joinUs?message=" + encodeURIComponent(message));
    } catch (error) {
      console.error("Error:", error.message);
      return res.status(500).send("Internal Server Error");
    }
});

// Function to get user by username from the database
function getUserByUsername(username) {
  return new Promise((resolve, reject) => {
    db.get("SELECT id FROM users WHERE username = ?", [username], (err, row) => {
      if (err) {
        return reject(err);
      }
      resolve(row);
    });
  });
}

// Function to insert user into the database
function insertUser(username, password, email, phone) {
  return new Promise((resolve, reject) => {
    db.run(
      "INSERT INTO users (username, password, email, phone) VALUES (?, ?, ?, ?)",
      [username, password, email, phone],
      (err) => {
        if (err) {
          return reject(err);
        }
        resolve();
      }
    );
  });
}

export default router;
