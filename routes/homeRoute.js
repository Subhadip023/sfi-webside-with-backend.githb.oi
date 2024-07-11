import express from 'express';
import Home from '../models/homeDataModel.js';
import Noti from '../models/nenModel.js'; // Renamed for consistency
const router = express.Router();

router.get('/', async (req, res) => {
  try {
    // Query Home data and notifications concurrently
    const [homeData, notifications] = await Promise.all([
      Home.find().sort({ position: -1 }),
      Noti.find({ type: 'Notification' }).sort({createdAt:-1}).select('title')
    ]);
    const notificationTitels=[];
    const notificationIds=[];

    notifications.forEach(Element=>{
      notificationTitels.push(Element.title)
      notificationIds.push(Element.id)
    })

    console.log(notificationIds)
    res.render('index.ejs', {
      homeData,notifications:notificationTitels,notificationIds:notificationIds
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

export default router;

