import express from "express";
import sqlite3 from "sqlite3";
import session from "express-session";
import bodyParser from "body-parser";

const app = express();
const port = 5000;

// Create SQLite database connection
const db = new sqlite3.Database("sfi-dataBase.db");

// Middleware to parse incoming JSON payloads
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
// Protected route - Admin
app.get("/admin", (req, res) => {
  if (!req.session.isAuthenticated) {
    return res.redirect("/login");
  }

  // Query to fetch user data from the database
  const userSql = "SELECT * FROM users";
  const notificationSql = "SELECT * FROM notifications";

  // Execute the user query
  db.all(userSql, (err, userRows) => {
    if (err) {
      console.error("Database error:", err.message);
      return res.status(500).send("Internal Server Error");
    }

    // Execute the notification query
    db.all(notificationSql, (err, notificationRows) => {
      if (err) {
        console.error("Database error:", err.message);
        return res.status(500).send("Internal Server Error");
      }

      // Render the admin.ejs template and pass the fetched data
      res.render("admin.ejs", {
        users: userRows,
        notifications: notificationRows,
      });
    });
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
  res.render("Gallery.ejs");
});
app.get("/About", (req, res) => {
  res.render("About.ejs");
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
