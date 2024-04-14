import express from 'express';
import sqlite3 from 'sqlite3';
import bcrypt from 'bcrypt';
// import {send_mail} from '../userdefineFuntion.js'
const db = new sqlite3.Database("sfi-dataBase.db");

const router = express.Router();

// Register route
router.get("/register", async (req, res) => {
    console.log("called the send mail")
    send_mail();
});


export default router;
