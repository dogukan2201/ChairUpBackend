const express = require("express");
const { signup, login, getCustomer, getAllCustomers, updateProfile,deleteProfile, resetPassword } = require("../controllers/customerController");
const { authenticateToken } = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/signup", signup);
router.post("/login", login);
router.get("/customer", authenticateToken, getCustomer);
router.patch("/updateProfile", authenticateToken, updateProfile);
router.patch("/deleteProfile", authenticateToken, deleteProfile);
router.patch("/resetPassword", authenticateToken, resetPassword);

module.exports = router;
