const Admin = require("../models/admin.model");
const CafeOwner = require("../models/cafeOwner.model");
const Customer = require("../models/customer.model");
const Cafe = require("../models/cafe.model");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");


// Signup - Create a new admin account
exports.signup = async (req, res) => {
    const { firstName, lastName, email, phoneNumber, password } = req.body;

    if (!firstName) {
        return res.status(400).json({ error: true, message: "First name is required." });
    }
    if (!lastName) {
        return res.status(400).json({ error: true, message: "Last name is required." });
    }
    if (!email) {
        return res.status(400).json({ error: true, message: "Email is required." });
    }
    if (!password) {
        return res.status(400).json({ error: true, message: "Password is required." });
    }
    if (!phoneNumber) {
        return res.status(400).json({ error: true, message: "Phone Number is required." });
    }

    try {
        const existingAdmin = await Admin.findOne({ email });
        if (existingAdmin) {
            return res.status(409).json({ error: true, message: "Admin already exists." });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        const newAdmin = new Admin({ firstName, lastName, email, phoneNumber, password: hashedPassword });

        await newAdmin.save();

        const accessToken = jwt.sign({ adminId: newAdmin._id }, process.env.ACCESS_TOKEN_SECRET, {
            expiresIn: "45m",
        });


        return res.status(201).json({
            error: false,
            admin: newAdmin,
            message: "Admin registered successfully.",
            accessToken,
        });
    } catch (error) {
        console.error("Error sign up for admin", error);
        return res.status(500).json({ error: true, message: "Server Error" });
    }
};

// Login - Authenticate admin and return access token
exports.login = async (req, res) => {
    const { email, password } = req.body;

    if (!email) {
        return res.status(400).json({ error: true, message: "Email is required." });
    }
    if (!password) {
        return res.status(400).json({ error: true, message: "Password is required." });
    }

    try {
        const admin = await Admin.findOne({ email });

        if (!admin) {
            return res.status(401).json({ error: true, message: "Invalid Credentials" });
        }

        const isPasswordValid = await bcrypt.compare(password, admin.password);
        if (!isPasswordValid) {
            return res.status(401).json({ error: true, message: "Invalid Credentials" });
        }

        const accessToken = jwt.sign({ adminId: admin._id }, process.env.ACCESS_TOKEN_SECRET, {
            expiresIn: "45m",
        });

        return res.json({
            error: false,
            message: "Login Successful",
            accessToken,
            email: admin.email,
            role: "Admin"
        });
    } catch (error) {
        return res.status(500).json({ error: true, message: "Server Error" });
    }
};


// Get admin - Retrieve admin details for authenticated admin
exports.getAdmin = async (req, res) => {
    try {
        const { adminId } = req.admin;
        const foundAdmin = await Admin.findById(adminId);

        if (!foundAdmin) {
            return res.status(404).json({ error: true, message: "Admin not found" });
        }

        return res.json({
            error: false,
            admin: {
                firstName: foundAdmin.firstName,
                lastName: foundAdmin.lastName,
                email: foundAdmin.email,
                phoneNumber: foundAdmin.phoneNumber,
                createdAt: foundAdmin.createdAt,
                updatedAt: foundAdmin.updatedAt,
                isActive: foundAdmin.isActive,
            },
        });
    } catch (error) {
        console.error("Error getting admin:", error);
        return res.status(500).json({ error: true, message: "Server Error" });
    }
};


// Get All admins - Retrieve list of all admins
exports.getAllAdmins = async (req, res) => {
    try {
        const admins = await Admin.find({});
        return res.json({ error: false, admins });
    } catch (error) {
        return res.status(500).json({ error: true, message: "Server Error" });
    }
};

exports.updateProfile = async (req, res) => {
    const { firstName, lastName, email, phoneNumber, password, isActive } = req.body;

    try {
        const { adminId } = req.admin; // Get adminId directly from req.admin
        const foundAdmin = await Admin.findById(adminId);

        if (!foundAdmin) {
            return res.status(401).json({ error: true, message: "Unauthorized admin" });
        }

        // Update fields only if they exist in the request
        if (firstName) foundAdmin.firstName = firstName;
        if (lastName) foundAdmin.lastName = lastName;
        if (email) foundAdmin.email = email;
        if (phoneNumber) foundAdmin.phoneNumber = phoneNumber;
        if (isActive) foundAdmin.isActive = isActive;
        if (password) {
            // Hash password before saving
            const salt = await bcrypt.genSalt(10);
            foundAdmin.password = await bcrypt.hash(password, salt);
        }

        foundAdmin.updatedAt = Date.now();

        // Save updated admin
        await foundAdmin.save();

        // Generate a new token with updated admin info
        const accessToken = jwt.sign({ adminId: foundAdmin._id }, process.env.ACCESS_TOKEN_SECRET, {
            expiresIn: "45m",
        });

        return res.json({
            error: false,
            message: "Profile Update Successful",
            accessToken,
        });
    } catch (error) {
        console.error("Error updating profile:", error);
        return res.status(500).json({ error: true, message: "Server Error" });
    }
};

exports.deleteProfile = async (req, res) => {
    try {
        const { adminId } = req.admin; // Get adminId directly from req.admin
        const foundAdmin = await Admin.findById(adminId); // Use adminId to find the admin

        if (!foundAdmin) {
            return res.status(404).json({ error: true, message: "Admin Not Found" });
        }

        await Admin.findByIdAndDelete(adminId);

        return res.json({
            error: false,
            message: "Profile Deleted",
            adminId: foundAdmin._id,
        });
    } catch (error) {
        console.error("Error deleting profile:", error); // Log the error for debugging
        return res.status(500).json({ error: true, message: "Server Error" });
    }
};

exports.resetPassword = async (req, res) => {
    const { email, newPassword } = req.body;

    try {
        const admin = await Admin.findOne({ email });
        if (!admin) {
            return res.status(404).json({ error: true, message: "Admin not found" });
        }

        const salt = await bcrypt.genSalt(10);
        admin.password = await bcrypt.hash(newPassword, salt);

        await admin.save();

        return res.json({ error: false, message: "Password reset successful" });
    } catch (error) {
        console.error("Error resetting password:", error);
        return res.status(500).json({ error: true, message: "Server Error" });
    }
};

// Get Customer Info
exports.getCustomer = async (req, res) => {
    const { customerId } = req.params;

    try {
        // Find the customer by email
        const foundCustomer = await Customer.findById( customerId );

        // Check if the customer exists
        if (!foundCustomer) {
            return res.status(404).json({ error: true, message: "Customer not found." });
        }

        return res.json({
            error: false,
            message: "Customer found successfully",
            customer: {
                firstName: foundCustomer.firstName,
                lastName: foundCustomer.lastName,
                email: foundCustomer.email,
                phoneNumber: foundCustomer.phoneNumber,
                createdAt: foundCustomer.createdAt,
                updatedAt: foundCustomer.updatedAt,
                isActive: foundCustomer.isActive,
            },
        });
    } catch (error) {
        console.error("Error founding customer:", error);
        return res.status(500).json({ error: true, message: "Server Error" });
    }
};

// Get All customers - Retrieve list of all customers
exports.getAllCustomers = async (req, res) => {
    try {
        const customers = await Customer.find({});
        return res.json({ error: false, customers });
    } catch (error) {
        return res.status(500).json({ error: true, message: "Server Error" });
    }
};

// Delete Customer Profile
exports.deleteCustomer = async (req, res) => {
    const { customerId } = req.params;

    try {
        // Find the customer by email
        const foundCustomer = await Customer.findById(customerId);

        // Check if the customer exists
        if (!foundCustomer) {
            return res.status(404).json({ error: true, message: "Customer not found." });
        }

        // Delete the customer
        await Customer.findByIdAndDelete(customerId);

        return res.json({
            error: false,
            message: "Customer profile deleted successfully.",
            customerId: foundCustomer._id,
        });
    } catch (error) {
        console.error("Error deleting customer:", error);
        return res.status(500).json({ error: true, message: "Server Error" });
    }
};

// Get cafe owner Info
exports.getCafeOwner = async (req, res) => {
    const { cafeOwnerId } = req.params;

    try {
        // Find the cafe owner by email
        const foundCafeOwner = await CafeOwner.findById(cafeOwnerId);

        // Check if the cafe owner exists
        if (!foundCafeOwner) {
            return res.status(404).json({ error: true, message: "Cafe Owner not found." });
        }

        return res.json({
            error: false,
            message: "Cafe Owner found successfully",
            customer: {
                firstName: foundCafeOwner.firstName,
                lastName: foundCafeOwner.lastName,
                email: foundCafeOwner.email,
                phoneNumber: foundCafeOwner.phoneNumber,
                createdAt: foundCafeOwner.createdAt,
                updatedAt: foundCafeOwner.updatedAt,
                isActive: foundCafeOwner.isActive,
            },
        });
    } catch (error) {
        console.error("Error founding Cafe Owner:", error);
        return res.status(500).json({ error: true, message: "Server Error" });
    }
};

// Get All cafe owners - Retrieve list of all cafe owner
exports.getAllCafeOwners = async (req, res) => {
    try {
        const cafeOwners = await CafeOwner.find({});
        return res.json({ error: false, cafeOwners });
    } catch (error) {
        return res.status(500).json({ error: true, message: "Server Error" });
    }
};

// Delete cafe owner Profile
exports.deleteCafeOwner = async (req, res) => {
    const { cafeOwnerId } = req.params;

    try {
        // Find the cafe owner by email
        const foundCafeOwner = await CafeOwner.findById(cafeOwnerId);

        // Check if the cafe owner exists
        if (!foundCafeOwner) {
            return res.status(404).json({ error: true, message: "Cafe Owner not found." });
        }

        // Delete the cafe owner
        await CafeOwner.findByIdAndDelete(cafeOwnerId);

        return res.json({
            error: false,
            message: "Cafe Owner profile deleted successfully.",
            cafeOwnerId: cafeOwnerId,
        });
    } catch (error) {
        console.error("Error deleting Cafe Owner:", error);
        return res.status(500).json({ error: true, message: "Server Error" });
    }
};

// Register a new cafe owner
exports.registerCafeOwner = async (req, res) => {
    const { firstName, lastName, email, phoneNumber, password } = req.body;

    // Validate input
    if (!firstName || !lastName || !email || !password || !phoneNumber) {
        return res.status(400).json({ error: true, message: "All fields are required." });
    }

    try {
        const existingCafeOwner = await CafeOwner.findOne({ email });
        if (existingCafeOwner) {
            return res.status(409).json({ error: true, message: "Cafe owner already exists." });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        const newCafeOwner = new CafeOwner({ firstName, lastName, email, phoneNumber, password: hashedPassword });

        await newCafeOwner.save();

        return res.status(201).json({
            error: false,
            cafeOwner: newCafeOwner,
            message: "Cafe owner registered successfully.",
        });
    } catch (error) {
        console.error("Error registering cafe owner:", error);
        return res.status(500).json({ error: true, message: "Server Error" });
    }
};

//Register Cafe
exports.registerCafe = async (req, res) => {
    const { name, location, address, menu, phoneNumber, ownerId } = req.body;

    // Validate input
    if (!name || !location || !phoneNumber || !ownerId || !address ) {
        return res.status(400).json({ error: true, message: "All fields are required." });
    }

    const cafeOwner = await CafeOwner.findById(ownerId);
    if(!cafeOwner){
        return res.status(401).json({ error: true, message: "Cafe Owner Id does not exist."})
    }

    try {
        const newCafe = new Cafe({ name, address, phoneNumber, location, menu, ownerId });

        await newCafe.save();

        return res.status(201).json({
            error: false,
            cafe: newCafe,
            owner: cafeOwner,
            message: "Cafe registered successfully.",
        });
    } catch (error) {
        console.error("Error registering cafe:", error);
        return res.status(500).json({ error: true, message: "Server Error" });
    }
};

//Get all cafes
exports.getAllCafes = async (req, res) => {
    try {
        const cafes = await Cafe.find({});
        return res.json({ error: false, cafes });
    } catch (error) {
        console.error("Error getting all cafes", error)
        return res.status(500).json({ error: true, message: "Server Error" });
    }
};

// Delete cafe
exports.deleteCafe = async (req, res) => {
    const { cafeId } = req.params;

    try {
        // Find the cafe owner by email
        const foundCafe = await Cafe.findById(cafeId);

        // Check if the cafe owner exists
        if (!foundCafe) {
            return res.status(404).json({ error: true, message: "Cafe not found." });
        }

        // Delete the cafe owner
        await Cafe.findByIdAndDelete(cafeId);

        return res.json({
            error: false,
            message: "Cafe deleted successfully.",
            cafeId: cafeId,
        });
    } catch (error) {
        console.error("Error deleting Cafe:", error);
        return res.status(500).json({ error: true, message: "Server Error" });
    }
};

// Get cafe Info
exports.getCafe = async (req, res) => {
    const { cafeId } = req.params;

    try {
        // Find the cafe owner by email
        const foundCafe = await Cafe.findById(cafeId);

        // Check if the cafe owner exists
        if (!foundCafe) {
            return res.status(404).json({ error: true, message: "Cafe not found." });
        }

        return res.json({
            error: false,
            message: "Cafe found successfully",
            cafe: {
                name: foundCafe.name,
                address: foundCafe.address,
                phoneNumber: foundCafe.phoneNumber,
                location: foundCafe.location,
                menu: foundCafe.menu,
                ownerId: foundCafe.ownerId,
                createdAt: foundCafe.createdAt,
                updatedAt: foundCafe.updatedAt,
                isActive: foundCafe.isActive,
            },
        });
    } catch (error) {
        console.error("Error founding Cafe:", error);
        return res.status(500).json({ error: true, message: "Server Error" });
    }
};





