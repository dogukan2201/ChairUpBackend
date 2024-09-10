const CafeOwner = require("../models/cafeOwner.model");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");


// Signup - Create a new Cafe Owner account
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
        const existingCafeOwner = await CafeOwner.findOne({ email });
        if (existingCafeOwner) {
            return res.status(409).json({ error: true, message: "Cafe owner already exists." });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        const newCafeOwner = new CafeOwner({ firstName, lastName, email, phoneNumber, password: hashedPassword });

        await newCafeOwner.save();

        const accessToken = jwt.sign({ cafeOwnerId: newCafeOwner._id }, process.env.ACCESS_TOKEN_SECRET, {
            expiresIn: "45m",
        });


        return res.status(201).json({
            error: false,
            cafeOwner: newCafeOwner,
            message: "Cafe owner registered successfully.",
            accessToken,
        });
    } catch (error) {
        return res.status(500).json({ error: true, message: "Server Error" });
    }
};

// Login - Authenticate Cafe Owner and return access token
exports.login = async (req, res) => {
    const { email, password } = req.body;

    if (!email) {
        return res.status(400).json({ error: true, message: "Email is required." });
    }
    if (!password) {
        return res.status(400).json({ error: true, message: "Password is required." });
    }

    try {
        const cafeOwner = await CafeOwner.findOne({ email });

        if (!cafeOwner) {
            return res.status(401).json({ error: true, message: "Invalid Credentials" });
        }

        const isPasswordValid = await bcrypt.compare(password, cafeOwner.password);
        if (!isPasswordValid) {
            return res.status(401).json({ error: true, message: "Invalid Credentials" });
        }

        const accessToken = jwt.sign({ cafeOwnerId: cafeOwner._id }, process.env.ACCESS_TOKEN_SECRET, {
            expiresIn: "45m",
        });

        return res.json({
            error: false,
            message: "Login Successful",
            accessToken,
            email: cafeOwner.email,
            role: "Cafe Owner",
        });
    } catch (error) {
        return res.status(500).json({ error: true, message: "Server Error" });
    }
};


// Get Cafe Owner - Retrieve Cafe Owner details for authenticated Cafe Owner
exports.getCafeOwner = async (req, res) => {
    try {
        const { cafeOwnerId } = req.cafeOwner;
        const foundCafeOwner = await CafeOwner.findById(cafeOwnerId);

        if (!foundCafeOwner) {
            return res.status(404).json({ error: true, message: "Cafe Owner not found" });
        }

        return res.json({
            error: false,
            cafeOwner: {
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
        console.error("Error getting cafe owner:", error);
        return res.status(500).json({ error: true, message: "Server Error" });
    }
};



exports.getAllOwners = async (req, res) => {
    try {
        const cafeOwners = await CafeOwner.find({});
        return res.json({ error: false, cafeOwners });
    } catch (error) {
        return res.status(500).json({ error: true, message: "Server Error" });
    }
};

exports.updateProfile = async (req, res) => {
    const { firstName, lastName, email, phoneNumber, password, isActive } = req.body;

    try {
        const { cafeOwnerId } = req.cafeOwner; // Get cafeOwnerId directly from req.cafeOwner
        const foundCafeOwner = await CafeOwner.findById(cafeOwnerId);

        if (!foundCafeOwner) {
            return res.status(401).json({ error: true, message: "Unauthorized Cafe Owner" });
        }

        // Update fields only if they exist in the request
        if (firstName) foundCafeOwner.firstName = firstName;
        if (lastName) foundCafeOwner.lastName = lastName;
        if (email) foundCafeOwner.email = email;
        if (phoneNumber) foundCafeOwner.phoneNumber = phoneNumber;
        if (isActive) foundCafeOwner.isActive = isActive;
        if (password) {
            // Hash password before saving
            const salt = await bcrypt.genSalt(10);
            foundCafeOwner.password = await bcrypt.hash(password, salt);
        }

        foundCafeOwner.updatedAt = Date.now();

        // Save updated Cafe Owner
        await foundCafeOwner.save();

        // Generate a new token with updated Cafe Owner info
        const accessToken = jwt.sign({ cafeOwnerId: foundCafeOwner._id }, process.env.ACCESS_TOKEN_SECRET, {
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
        const { cafeOwnerId } = req.cafeOwner; // Get cafeOwnerId directly from req.cafeOwner
        const foundCafeOwner = await CafeOwner.findById(cafeOwnerId); // Use cafeOwnerId to find the Cafe Owner

        if (!foundCafeOwner) {
            return res.status(404).json({ error: true, message: "Cafe Owner Not Found" });
        }

        await CafeOwner.findByIdAndDelete(cafeOwnerId);

        return res.json({
            error: false,
            message: "Profile Deleted",
            cafeOwnerId: foundCafeOwner._id,
        });
    } catch (error) {
        console.error("Error deleting profile:", error); // Log the error for debugging
        return res.status(500).json({ error: true, message: "Server Error" });
    }
};

exports.resetPassword = async (req, res) => {
    const { email, newPassword } = req.body;

    try {
        const cafeOwner = await CafeOwner.findOne({ email });
        if (!cafeOwner) {
            return res.status(404).json({ error: true, message: "Cafe Owner not found" });
        }

        const salt = await bcrypt.genSalt(10);
        cafeOwner.password = await bcrypt.hash(newPassword, salt);

        await cafeOwner.save();

        return res.json({ error: false, message: "Password reset successful" });
    } catch (error) {
        console.error("Error resetting password:", error);
        return res.status(500).json({ error: true, message: "Server Error" });
    }
};


