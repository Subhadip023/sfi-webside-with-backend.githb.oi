import express from 'express';
import Home from '../models/homeDataModel.js';
const router = express.Router();


router.get("/", (req, res) => {
Home.find().sort({ position: 1 }).then(homedata=>{
  res.render("index.ejs",{HomeData:homedata});

}) .catch((error) => {
  // Handle error
  console.error(error);
  // Send an error response
  res.status(500).json({ message: "Internal server error" });
});

  });
  export default router;
