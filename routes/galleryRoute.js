import express from 'express';

const router = express.Router(); 


router.get("/News", (req, res) => {
    res.render("News.ejs");
  });
  export default router;
