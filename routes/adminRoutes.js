const express = require("express");
const { signup, login, getAdmin, getAllAdmins, updateProfile, deleteProfile, resetPassword } = require("../controllers/adminController");
const { getAllCustomers, deleteCustomer, getCustomer} = require("../controllers/adminController"); 
const { registerCafeOwner, getAllCafeOwners, deleteCafeOwner, getCafeOwner } = require("../controllers/adminController");
const { registerCafe, getCafe, deleteCafe, getAllCafes } = require("../controllers/adminController");

const { authenticateToken } = require("../middleware/authMiddlewareAdmin");

const router = express.Router();

router.post("/signup", signup);
router.post("/login", login);
router.get("/admin", authenticateToken, getAdmin);
router.get("/all", getAllAdmins);
router.patch("/updateProfile", authenticateToken, updateProfile);
router.delete("/deleteProfile", authenticateToken, deleteProfile);
router.patch("/resetPassword", authenticateToken, resetPassword);

router.post("/registerCafeOwner", authenticateToken, registerCafeOwner);
router.get("/getAllCafeOwners", authenticateToken, getAllCafeOwners);
router.delete("/deleteCafeOwner/:cafeOwnerId", authenticateToken, deleteCafeOwner);
router.get("/getCafeOwner/:cafeOwnerId", authenticateToken, getCafeOwner);

router.get("/allCustomers", authenticateToken, getAllCustomers);
router.delete("/deleteCustomer/:customerId", authenticateToken, deleteCustomer);
router.get("/getCustomer/:customerId", authenticateToken, getCustomer);

router.post("/registerCafe", authenticateToken, registerCafe);
router.get("/getCafe/:cafeId", authenticateToken, getCafe);
router.delete("/deleteCafe/:cafeId", authenticateToken, deleteCafe);
router.get("/getAllCafes", authenticateToken, getAllCafes);


module.exports = router;
