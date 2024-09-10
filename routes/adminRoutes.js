const express = require("express");
const { signup, login, getAdmin, getAllAdmins, updateProfile, deleteProfile, resetPassword } = require("../controllers/adminController");
const { authenticateToken } = require("../middleware/authMiddlewareAdmin");

const router = express.Router();

router.post("/signup", signup);
router.post("/login", login);
router.get("/admin", authenticateToken, getAdmin);
router.get("/all", getAllAdmins);
router.patch("/updateProfile", authenticateToken, updateProfile);
router.patch("/deleteProfile", authenticateToken, deleteProfile);
router.patch("/resetPassword", authenticateToken, resetPassword);

module.exports = router;
