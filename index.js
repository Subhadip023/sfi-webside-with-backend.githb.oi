import authRoutes from "./routes/authRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import newsRoute from "./routes/newsRoute.js";
import User from './models/usersModel.js'; 
import registerRoute from "./routes/registerRoute.js";
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
import { connect } from 'mongoose';





dotenv.config();


const app = express();
const port = 5000;
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    let destinationDirectory = "";

    if (req.originalUrl === "/gallery") {
      destinationDirectory = "public/images/gallery";
    } else if (req.originalUrl === "/") {
      destinationDirectory = "public/images/home";
    } else if (req.originalUrl === "/addnotification") {
      destinationDirectory = "public/images/notification";
    } else if (req.originalUrl === "/addevent") {
      destinationDirectory = "public/images/event";
    } else {
      // Default directory or error handling
      destinationDirectory = "public/images";
    }
    cb(null, destinationDirectory);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + "-" + uniqueSuffix + ".jpg"); // Append '.jpg' to the filename
  },
});

// Create SQLite database connection
const db = new sqlite3.Database("sfi-dataBase.db");
const upload = multer({ storage: storage });

app.use(bodyParser.urlencoded({ extended: true }));
// Middleware to serve static files
app.use(express.static("public"));
app.use(
  session({
    secret: "sfi-aliah",
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
app.use(newsRoute);
app.use('/joinUs',joinUsRoute)
// app.use(eventRoute);

// Route to display update form


app.post("/delete-notification", (req, res) => {
  const notificationId = req.body.id;
  db.get(
    "SELECT imgfilename FROM notifications WHERE id = ?",
    [notificationId],
    (err, row) => {
      const filename = "public/images/notification/" + row.imgfilename;
      fs.unlink(filename, (err) => {
        if (err) {
          console.error("Error deleting image file:", err.message);
          return res.status(500).send("Internal Server Error");
        }
        // SQL query to delete the user with the specified ID
        const sql = "DELETE FROM notifications WHERE id = ?";

        // Execute the query with the provided user ID
        db.run(sql, [notificationId], (err) => {
          if (err) {
            console.error("Database error:", err.message);
            return res.status(500).send("Internal Server Error");
          }

          // Redirect back to the admin page after successful deletion
          res.redirect("/admin");
        });
      });
    }
  );
});


// app.get("/Events", (req, res) => {
//   res.render("Events.ejs");
// });
app.get("/Events", (req, res) => {
  // Query to fetch notifications from the database
  const notificationSql = "SELECT * FROM event";

  // Execute the query
  db.all(notificationSql, (err, notificationRows) => {
    if (err) {
      console.error("Database error:", err.message);
      return res.status(500).send("Internal Server Error");
    }
    // console.log(notificationRows)
    // Render the notification.ejs template and pass the fetched notifications
    res.render("Events.ejs", { notifications: notificationRows });
  });
});

app.get('/addevent', (req, res) => {
  res.render('addevent.ejs');
});

app.post("/addevent", upload.single('eventImage'), (req, res) => {
  const title = req.body.title;
  const content = req.body.EventContent;
  
  // Check if file was uploaded
  if (!req.file) {
      return res.status(400).send("No file uploaded.");
  }
  
  const filename = req.file.filename;

  // Insert data into the event table
  db.run(
      "INSERT INTO event (title, filename, content) VALUES (?, ?, ?)",
      [title, filename, content],
      (err) => {
          if (err) {
              console.error("Database error:", err.message);
              return res.status(500).send("Internal Server Error");
          }
          res.redirect("/admin");
      }
  );
});
app.post("/delete-event", (req, res) => {
  const notificationId = req.body.id;
  db.get(
    "SELECT filename FROM event WHERE id = ?",
    [notificationId],
    (err, row) => {
      const filename = "public/images/event/" + row.filename;
      fs.unlink(filename, (err) => {
        if (err) {
          console.error("Error deleting image file:", err.message);
          return res.status(500).send("Internal Server Error");
        }
        // SQL query to delete the user with the specified ID
        const sql = "DELETE FROM event WHERE id = ?";

        // Execute the query with the provided user ID
        db.run(sql, [notificationId], (err) => {
          if (err) {
            console.error("Database error:", err.message);
            return res.status(500).send("Internal Server Error");
          }

          // Redirect back to the admin page after successful deletion
          res.redirect("/admin");
        });
      });
    }
  );
});


app.get("/delete-home/:id", (req, res) => {
  const deleteId = req.params.id;
  db.get("SELECT filename FROM home WHERE id=?", [deleteId], (err, row) => {
    const filename = "public/images/home/" + row.filename;
    if (row) {
      fs.unlink(filename, (err) => {
        if (err) {
          console.error("Error deleting image file:", err.message);
          return res.status(500).send("Internal Server Error");
        }
      });
      const sql = "DELETE FROM home WHERE id = ?";
      db.run(sql, [deleteId], (err) => {
        if (err) {
          console.error("Database error:", err.message);
          return res.status(500).send("Internal Server Error");
        }
        res.redirect("/admin");
      });
    }
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

app.get("/", (req, res) => {
  const homeSql = "SELECT * FROM home"; // Select all columns from 'home' table
  const notificationSql = "SELECT title FROM notifications"; // Select only the title column from 'notifications' table

  // Execute the queries in parallel
  db.all(homeSql, (homeErr, homeRows) => {
    if (homeErr) {
      console.error("Home table database error:", homeErr.message);
      return res.status(500).send("Internal Server Error");
    }

    // Extract titles from notificationRows and push them into an array
    const homeData = homeRows; // You can modify this as per your data structure needs

    db.all(notificationSql, (notificationErr, notificationRows) => {
      if (notificationErr) {
        console.error(
          "Notifications table database error:",
          notificationErr.message
        );
        return res.status(500).send("Internal Server Error");
      }

      // Extract titles from notificationRows and push them into an array
      const notificationTitles = notificationRows.map((row) => row.title);

      // Render the index.ejs template and pass both sets of data
      res.render("index.ejs", {
        HomeData: homeData,
        Notification: notificationTitles,
      });
    });
  });
});

app.post("/", upload.single("image"), (req, res) => {
  const title = req.body.title;
  const content = req.body.content;
  const filename = req.file.filename;
  // Insert the data into the SQLite database
  const sql = "INSERT INTO home (title, content, filename) VALUES (?, ?, ?)";
  db.run(sql, [title, content, filename], (err) => {
    if (err) {
      console.error("Error inserting data into database:", err.message);
      return res.status(500).send("Internal Server Error");
    }
    // Redirect the user to the admin page after successful insertion
    res.redirect("/admin");
  });
});
app.get("/addnotification", (req, res) => {
  res.render("addnotification.ejs");
});

app.post("/addnotification", upload.single("notificationImage"), (req, res) => {
  const title = req.body.title;
  const content = req.body.content;
  const filename = req.file.filename;

  db.run(
    "INSERT INTO notifications (title, content,imgfilename) VALUES ( ?, ?,?)",
    [title, content, filename],
    (err) => {
      if (err) {
        console.error("Database error:", err.message);
        return res.status(500).send("Internal Server Error");
      }
      res.redirect("/admin");
    }
  );
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
    // console.log(notificationRows)
    // Render the notification.ejs template and pass the fetched notifications
    res.render("notification.ejs", { notifications: notificationRows });
  });
});

app.get("/notification-Details/:id", (req, res) => {
  const notification_id = req.params.id;
  const sql = "SELECT * FROM notifications WHERE id = ?";
  db.get(sql, [notification_id], (err, row) => {
    if (err) {
      console.error("Database error:", err.message);
      return res.status(500).send("Internal Server Error");
    }
    res.render("notificationDetails.ejs", { Notification: row });
  });
});
app.get("/event-Details/:id", (req, res) => {
  const notification_id = req.params.id;
  const sql = "SELECT * FROM event WHERE id = ?";
  db.get(sql, [notification_id], (err, row) => {
    if (err) {
      console.error("Database error:", err.message);
      return res.status(500).send("Internal Server Error");
    }
    res.render("eventDetails.ejs", { Notification: row });
  });
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

// Modify your file upload route to insert file information into the database
app.post("/gallery", upload.single("avatar"), function (req, res, next) {
  // Check if file exists
  if (!req.file) {
    return res.status(400).send("No file uploaded.");
  }



  // Extract title from request body
  const title = req.body.title;

  // Get file information
  const filename = req.file.filename;
  const path = req.file.path;

  // Insert file information into the images table
  db.run(
    "INSERT INTO images (filename, title, path) VALUES (?, ?, ?)",
    [filename, title, path],
    (err) => {
      if (err) {
        console.error("Error inserting image into database:", err.message);
        return res.status(500).send("Internal Server Error");
      }
      res.redirect("/admin");
    }
  );
});

app.get('/donate',(req,res)=>{
  res.render('donate.ejs');

});


passport.use(new LocalStrategy(
  async function(username, password, done) {
    try {
      const user = await User.findOne({ name: username });
      if (!user) {
        return done(null, false, { message: 'Incorrect username.' });
      }
      const passwordMatch = await bcrypt.compare(password, user.password);
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


connect(process.env.MONGO_URI)
  .then(() => {
    app.listen(process.env.PORT || 5000, () => {
      console.log(`Server running on  http://localhost:${process.env.PORT || 5000}`);
  console.log('Connected to MongoDB');
    });
  })
  .catch(error => {
    console.error("Failed to connect to MongoDB:", error);
  });