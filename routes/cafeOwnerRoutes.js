const express = require("express");
const { signup, login, getCafeOwner, getAllOwners, updateProfile, deleteProfile, resetPassword } = require("../controllers/cafeOwnerController");
const { authenticateToken } = require("../middleware/authMiddlewareOwner");

const router = express.Router();

router.post("/signup", signup);
router.post("/login", login);
router.get("/cafeOwner", authenticateToken, getCafeOwner);
router.get("/all", getAllOwners);
router.patch("/updateProfile", authenticateToken, updateProfile);
router.patch("/deleteProfile", authenticateToken, deleteProfile);
router.patch("/resetPassword", authenticateToken, resetPassword);

module.exports = router;
