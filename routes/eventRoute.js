import express from 'express';
import nenModel from '../models/nenModel.js';

const router = express.Router();


router.get("/Events", async(req, res) => {
try {
    const nen =await nenModel.find({type:'Event'}).sort({ createdAt: -1 });
    if (!nen) {
        res.status(500).json({message:"cant find notification"})
    }
        res.render("Events.ejs",{events:nen});
    
} catch (error) {
    console.log(error)
}  });
  export default router;
