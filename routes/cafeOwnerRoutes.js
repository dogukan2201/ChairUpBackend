const express = require("express");
const { login, getCafeOwner, getAllOwners, updateProfile, deleteProfile, resetPassword } = require("../controllers/cafeOwnerController");
const { authenticateToken } = require("../middleware/authMiddlewareOwner");
const { registerEmployee } = require("../controllers/cafeOwnerController");

const router = express.Router();

router.post("/login", login);
router.get("/cafeOwner", authenticateToken, getCafeOwner);
router.get("/all", getAllOwners);
router.patch("/updateProfile", authenticateToken, updateProfile);
router.patch("/deleteProfile", authenticateToken, deleteProfile);
router.patch("/resetPassword", authenticateToken, resetPassword);

router.post("/registerEmployee", registerEmployee);


module.exports = router;
