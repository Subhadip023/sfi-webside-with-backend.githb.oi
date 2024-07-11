import express from 'express';
import galleryModel from '../models/galleryModel.js';

const router = express.Router(); 


router.get("/", async(req, res) => {
try {
      const gallery =await galleryModel.find();
// console.log(gallery.banner)
      res.render("Gallery.ejs",{images:gallery});
  
} catch (error) {
  
}  });
  export default router;
