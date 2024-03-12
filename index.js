import express from 'express';
import sqlite3 from 'sqlite3';
import session from 'express-session';
import bodyParser from 'body-parser';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

const app = express();
const port = 3000;
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'public/images/uploads');
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + '.jpg'); // Append '.jpg' to the filename
  }
});


// Create SQLite database connection
const db = new sqlite3.Database("sfi-dataBase.db");
const upload = multer({ storage: storage })

app.use(bodyParser.urlencoded({ extended: true }));
// Middleware to serve static files
app.use(express.static("public"));
// Session middleware
app.use(
  session({
    secret: "secret-key", // Change this to a long, random string in production
    resave: false,
    saveUninitialized: true,
  })
);

// Create tables if they don't exist
db.serialize(() => {
  db.run(
    `CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY,
        username TEXT NOT NULL,
        password TEXT NOT NULL,
        email TEXT NOT NULL,
        phone TEXT,
        position TEXT DEFAULT 'member'
    )`,
    (err) => {
      if (err) {
        console.error("Error creating users table:", err.message);
      } else {
        console.log("Users table created successfully");
      }
    }
  );

  db.run(
    `CREATE TABLE IF NOT EXISTS images (
        id INTEGER PRIMARY KEY,
        filename TEXT NOT NULL,
        title TEXT,
        path TEXT NOT NULL
    )`,
    (err) => {
      if (err) {
        console.error("Error creating images table:", err.message);
      } else {
        console.log("Images table created successfully");
      }
    }
  );

  db.run(
    `CREATE TABLE IF NOT EXISTS notifications (
        id INTEGER PRIMARY KEY,
        title TEXT NOT NULL,
        content TEXT NOT NULL,
        date DATE DEFAULT CURRENT_DATE
    )`,
    (err) => {
      if (err) {
        console.error("Error creating notifications table:", err.message);
      } else {
        console.log("Notifications table created successfully");
      }
    }
  );
});

// Register route
app.post("/register", (req, res) => {
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

// Route to render login form
app.get("/login", (req, res) => {
  res.send(`
      <form method="post" action="/login">
          <input type="text" name="username" placeholder="Username">
          <input type="password" name="password" placeholder="Password">
          <button type="submit">Login</button>
      </form>
  `);
});

// Route to handle login
app.post("/login", (req, res) => {
  const { username, password } = req.body;

  // Check username and password (replace with your authentication logic)
  if (username === "sfdiaulc" && password === "joybangla") {
    // Authentication successful, set session flag
    req.session.isAuthenticated = true;
    res.redirect("/admin");
  } else {
    // Authentication failed, redirect back to login page
    res.redirect("/login");
  }
});


app.get("/admin", (req, res) => {
  if (!req.session.isAuthenticated) {
    return res.redirect("/login");
  }

  // Query to fetch user data from the database
  const userSql = "SELECT * FROM users";
  const notificationSql = "SELECT * FROM notifications";
  const imageSql = "SELECT * FROM images";

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
    })
  ])
  .then(([userRows, notificationRows, imageRows]) => {
    // Render the admin.ejs template and pass the fetched data
    res.render("admin.ejs", {
      users: userRows,
      notifications: notificationRows,
      images: imageRows
    });
  })
  .catch(err => {
    console.error("Database error:", err.message);
    return res.status(500).send("Internal Server Error");
  });
});


// Route to display update form
app.get("/update/:id", (req, res) => {
  //   Check if user is authenticated before accessing update form
  if (!req.session.isAuthenticated) {
    return res.redirect("/login");
  }

  const userId = req.params.id;

  // Query to fetch user data from the database for the specified user id
  const sql = "SELECT * FROM users WHERE id = ?";

  // Execute the query
  db.get(sql, [userId], (err, row) => {
    if (err) {
      console.error("Database error:", err.message);
      return res.status(500).send("Internal Server Error");
    }

    // Render the update-form.ejs template and pass the fetched user data
    res.render("update-user.ejs", { user: row });
  });
});
// Route to handle updating user data
app.post("/update", (req, res) => {
  // Extract user data from the request body
  const { id, username, email, phone, position } = req.body;

  // SQL query to update user data
  const sql =
    "UPDATE users SET username = ?, email = ?, phone = ?, position = ? WHERE id = ?";

  // Execute the query with the provided data
  db.run(sql, [username, email, phone, position, id], (err) => {
    if (err) {
      console.error("Database error:", err.message);
      return res.status(500).send("Internal Server Error");
    }

    // Redirect back to the admin page after successful update
    res.redirect("/admin");
  });
});
// Route to handle deleting user data
app.post("/delete", (req, res) => {
  // Extract the user ID from the request parameters
  const userId = req.body.id;

  // SQL query to delete the user with the specified ID
  const sql = "DELETE FROM users WHERE id = ?";

  // Execute the query with the provided user ID
  db.run(sql, [userId], (err) => {
    if (err) {
      console.error("Database error:", err.message);
      return res.status(500).send("Internal Server Error");
    }

    // Redirect back to the admin page after successful deletion
    res.redirect("/admin");
  });
});
app.get("/addnotification", (req, res) => {
  res.render("addnotification.ejs");
});
app.post("/addnotification", (req, res) => {
  const title = req.body.title;
  const content = req.body.content;
  db.run(
    "INSERT INTO notifications (title, content) VALUES ( ?, ?)",
    [title, content],
    (err) => {
      if (err) {
        console.error("Database error:", err.message);
        return res.status(500).send("Internal Server Error");
      }
      res.redirect("/admin");
    }
  );
});

app.post("/delete-notification", (req, res) => {
  const userId = req.body.id;

  // SQL query to delete the user with the specified ID
  const sql = "DELETE FROM notifications WHERE id = ?";

  // Execute the query with the provided user ID
  db.run(sql, [userId], (err) => {
    if (err) {
      console.error("Database error:", err.message);
      return res.status(500).send("Internal Server Error");
    }

    // Redirect back to the admin page after successful deletion
    res.redirect("/admin");
  });
});

app.post("/delete-images", (req, res) => {
  const imageId = req.body.id;

  // Fetch the file path from the database
  db.get("SELECT path FROM images WHERE id = ?", [imageId], (err, row) => {
    if (err) {
      console.error("Database error:", err.message);
      return res.status(500).send("Internal Server Error");
    }

    // If the row exists, delete the file from the folder
    if (row) {
      const imagePath = row.path;

      // Delete the file using fs.unlink
      fs.unlink(imagePath, (err) => {
        if (err) {
          console.error("Error deleting image file:", err.message);
          return res.status(500).send("Internal Server Error");
        }

        // Now, delete the entry from the database
        const sql = "DELETE FROM images WHERE id = ?";
        db.run(sql, [imageId], (err) => {
          if (err) {
            console.error("Database error:", err.message);
            return res.status(500).send("Internal Server Error");
          }

          // Redirect back to the admin page after successful deletion
          res.redirect("/admin");
        });
      });
    } else {
      // If the row doesn't exist, return an error
      console.error("Image not found in the database");
      return res.status(404).send("Image not found in the database");
    }
  });
});

// Routes to render different pages
app.get("/", (req, res) => {
  const notificationSql = "SELECT title FROM notifications"; // Select only the title column
  db.all(notificationSql, (err, notificationRows) => {
    if (err) {
      console.error("Database error:", err.message);
      return res.status(500).send("Internal Server Error");
    }

    // Extract titles from notificationRows and push them into an array
    const notificationTitles = notificationRows.map((row) => row.title);

    // Render the notification.ejs template and pass the array of titles
    res.render("index.ejs", { Notification: notificationTitles });
  });
});

app.get("/notification", (req, res) => {
  // Query to fetch notifications from the database
  const notificationSql = "SELECT * FROM notifications";

  // Execute the query
  db.all(notificationSql, (err, notificationRows) => {
    if (err) {
      console.error("Database error:", err.message);
      return res.status(500).send("Internal Server Error");
    }

    // Render the notification.ejs template and pass the fetched notifications
    res.render("notification.ejs", { notifications: notificationRows });
  });
});




app.get("/notification-Details/:id", (req, res) => {
  const notification_id = req.params.id;
  const sql ="SELECT * FROM notifications WHERE id = ?";
db.get(sql,[notification_id],(err,row)=>{
    if (err) {
        console.error("Database error:", err.message);
        return res.status(500).send("Internal Server Error");
      }
      res.render("notificationDetails.ejs", { Notification:row });
});
});




app.get("/News", (req, res) => {
  res.render("News.ejs");
});
app.get("/Events", (req, res) => {
  res.render("Events.ejs");
});
app.get("/joinUs", (req, res) => {
  res.render("joinUs.ejs");
});
app.get("/Gallery", (req, res) => {
  // Query to fetch image data from the database
// Query to fetch image data from the database, ordered by ID in descending order
const sql = "SELECT * FROM images ORDER BY id DESC";

  // Execute the query
  db.all(sql, (err, imageRows) => {
    if (err) {
      console.error("Database error:", err.message);
      return res.status(500).send("Internal Server Error");
    }

    // Render the Gallery.ejs template and pass the fetched image data
    res.render("Gallery.ejs", { images: imageRows });
  });
});

app.get("/About", (req, res) => {
  res.render("About.ejs");
});

// Modify your file upload route to insert file information into the database
app.post('/profile', upload.single('avatar'), function (req, res, next) {
  // Check if file exists
  if (!req.file) {
    return res.status(400).send('No file uploaded.');
  }

  // Extract title from request body
  const title = req.body.title;

  // Get file information
  const filename = req.file.filename;
  const path = req.file.path;

  // Insert file information into the images table
  db.run(
    'INSERT INTO images (filename, title, path) VALUES (?, ?, ?)',
    [filename, title, path],
    (err) => {
      if (err) {
        console.error("Error inserting image into database:", err.message);
        return res.status(500).send("Internal Server Error");
      }
      res.redirect('/admin')
    }
  );
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
