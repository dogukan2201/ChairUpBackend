const express = require("express");
const { signup, login, getCustomer, getAllCustomers, updateProfile,deleteProfile } = require("../controllers/customerController");
const { authenticateToken } = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/signup", signup);
router.post("/login", login);
router.get("/customer", authenticateToken, getCustomer);
router.get("/all", getAllCustomers);
router.patch("/updateProfile", authenticateToken, updateProfile);
router.patch("/deleteProfile", authenticateToken, deleteProfile);

module.exports = router;
