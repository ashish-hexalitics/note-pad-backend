const express = require("express");
const { getMe, getAllUsers } = require("../controllers/userController");
const authMiddleware = require("../middleware/authMiddleware");
const router = express.Router();

// Route for user registration
router.get("/getMe", authMiddleware, getMe); // Protected route
router.get("/all", authMiddleware, getAllUsers); // Protected route

module.exports = router;
