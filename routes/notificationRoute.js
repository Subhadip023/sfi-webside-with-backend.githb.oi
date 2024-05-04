import express from 'express';
import nenModel from '../models/nenModel.js';

const router = express.Router();


router.get("/", async(req, res) => {
try {
    const nen =await nenModel.find({type:'Notification'}).sort({ createdAt: -1 });
    if (!nen) {
        res.status(500).json({message:"cant find notification"})
    }
        res.render("notification.ejs",{notifications:nen});
    
} catch (error) {
    console.log(error)
}  });

router.get('/Details/:id',async(req,res)=>{
    const notificationId = req.params.id;
    const notificationDetails=await nenModel.findById(notificationId);
    res.render('notificationDetails.ejs',{Notification:notificationDetails})
})
  export default router;
