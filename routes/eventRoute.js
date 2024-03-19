import express from 'express';
import sqlite3 from 'sqlite3';
import multer from 'multer'; 

const db = new sqlite3.Database("sfi-dataBase.db");
const upload = multer(); // Initialize multer without specifying storage (files will be stored in memory)
const router = express.Router();

router.get("/Events", (req, res) => {
    res.render("Events.ejs");
});

router.get('/addevent', (req, res) => {
    res.render('addevent.ejs');
});

router.post("/addevent", upload.single('eventImage'), (req, res) => {
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

export default router;
