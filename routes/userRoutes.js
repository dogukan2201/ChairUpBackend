const express = require("express");
const {
  signup,
  login,
  getUser,
  getAllUsers,
  deleteUser,
} = require("../controllers/userController");
const { authenticateToken } = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/signup", signup);
router.post("/login", login);
router.get("/user", authenticateToken, getUser);
router.get("/all", getAllUsers);
router.delete("/deleteUser/:id", deleteUser);

module.exports = router;
