import express from "express";
import Razorpay from "razorpay";
import dotenv from "dotenv";

const router = express.Router();
dotenv.config();

const instance = new Razorpay({
  key_id: process.env.ROZERPAY_ID_KEY,
  key_secret: process.env.ROZERPAY_SECRET_KEY,
});

router.get("/donate", (req, res) => {
  res.render("donate.ejs");
});

router.post("/payment", async (req, res) => {
  const { amount } = req.body;

  try {
    const order = await instance.orders.create({
      amount: amount * 100, 
      currency: "INR",
      receipt: "receipt#1",
    });
    res.status(201).json({
      success: true,
      order,
      amount,
    });
  } catch (error) {
    console.error("Error creating Razorpay order:", error);
    res.status(500).json({ success: false, error: "Internal Server Error" });
  }
});

export default router;
