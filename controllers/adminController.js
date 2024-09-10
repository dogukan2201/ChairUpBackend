const Admin = require("../models/admin.model");
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


