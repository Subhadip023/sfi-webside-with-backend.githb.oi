// middleware/authMiddleware.js
import User from "../models/usersModel.js"; // Adjust the path as needed
import passport from "passport";

const isAuthenticated = async (req, res, next) => {
  if (req.isAuthenticated()) {
    const user = await User.findById(req.user.id);
    if (user) {
      req.user.isMember = true;
    }
    return next();
  } else {
    res.redirect("/login");
  }
};

export default isAuthenticated;
