const Customer = require("../models/customer.model");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

// Signup - Create a new customer account
exports.signup = async (req, res) => {
  const { firstName, lastName, email, phoneNumber, password } = req.body;

  if (!firstName) {
    return res
      .status(400)
      .json({ error: true, message: "First name is required." });
  }
  if (!lastName) {
    return res
      .status(400)
      .json({ error: true, message: "Last name is required." });
  }
  if (!email) {
    return res.status(400).json({ error: true, message: "Email is required." });
  }
  if (!password) {
    return res
      .status(400)
      .json({ error: true, message: "Password is required." });
  }
  if (!phoneNumber) {
    return res
      .status(400)
      .json({ error: true, message: "Phone Number is required." });
  }

  try {
    const existingCustomer = await Customer.findOne({ email });
    if (existingCustomer) {
      return res
        .status(409)
        .json({ error: true, message: "Customer already exists." });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const newCustomer = new Customer({
      firstName,
      lastName,
      email,
      phoneNumber,
      password: hashedPassword,
    });

    await newCustomer.save();

    const accessToken = jwt.sign(
      { customerId: Customer._id },
      process.env.ACCESS_TOKEN_SECRET,
      {
        expiresIn: "45m",
      }
    );

    return res.status(201).json({
      error: false,
      customer: newCustomer,
      message: "Customer registered successfully.",
      accessToken,
    });
  } catch (error) {
    console.error("Error ");
    return res.status(500).json({ error: true, message: "Server Error" });
  }
};

// Login - Authenticate customer and return access token
exports.login = async (req, res) => {
  const { email, password } = req.body;

  if (!email) {
    return res.status(400).json({ error: true, message: "Email is required." });
  }
  if (!password) {
    return res
      .status(400)
      .json({ error: true, message: "Password is required." });
  }

  try {
    const customer = await Customer.findOne({ email });

    if (!customer) {
      return res
        .status(401)
        .json({ error: true, message: "Invalid Credentials" });
    }

    const isPasswordValid = await bcrypt.compare(password, customer.password);
    if (!isPasswordValid) {
      return res
        .status(401)
        .json({ error: true, message: "Invalid Credentials" });
    }

    const accessToken = jwt.sign(
      { customerId: customer._id },
      process.env.ACCESS_TOKEN_SECRET,
      {
        expiresIn: "45m",
      }
    );

    return res.json({
      error: false,
      message: "Login Successful",
      accessToken,
      email: customer.email,
      role: "Customer",
    });
  } catch (error) {
    return res.status(500).json({ error: true, message: "Server Error" });
  }
};

// Get customer - Retrieve customer details for authenticated customer
exports.getCustomer = async (req, res) => {
  try {
    const { customerId } = req.customer;
    const foundCustomer = await Customer.findById(customerId);

    if (!foundCustomer) {
      return res
        .status(404)
        .json({ error: true, message: "Customer not found" });
    }

    return res.json({
      error: false,
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
    console.error("Error getting customer:", error);
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

exports.updateProfile = async (req, res) => {
  const { firstName, lastName, email, phoneNumber, password, isActive } =
    req.body;

  try {
    const { customerId } = req.customer; // Get customerId directly from req.customer
    const foundCustomer = await Customer.findById(customerId);

    if (!foundCustomer) {
      return res
        .status(401)
        .json({ error: true, message: "Unauthorized customer" });
    }

    // Update fields only if they exist in the request
    if (firstName) foundCustomer.firstName = firstName;
    if (lastName) foundCustomer.lastName = lastName;
    if (email) foundCustomer.email = email;
    if (phoneNumber) foundCustomer.phoneNumber = phoneNumber;
    if (isActive) foundCustomer.isActive = isActive;
    if (password) {
      // Hash password before saving
      const salt = await bcrypt.genSalt(10);
      foundCustomer.password = await bcrypt.hash(password, salt);
    }

    foundCustomer.updatedAt = Date.now();

    // Save updated customer
    await foundCustomer.save();

    // Generate a new token with updated customer info
    const accessToken = jwt.sign(
      { customerId: foundCustomer._id },
      process.env.ACCESS_TOKEN_SECRET,
      {
        expiresIn: "45m",
      }
    );

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
    const { customerId } = req.customer; // Get customerId directly from req.customer
    const foundCustomer = await Customer.findById(customerId); // Use customerId to find the customer

    if (!foundCustomer) {
      return res
        .status(404)
        .json({ error: true, message: "Customer Not Found" });
    }

    await Customer.findByIdAndDelete(customerId);

    return res.json({
      error: false,
      message: "Profile Deleted",
      customerId: foundCustomer._id,
    });
  } catch (error) {
    console.error("Error deleting profile:", error); // Log the error for debugging
    return res.status(500).json({ error: true, message: "Server Error" });
  }
};

exports.resetPassword = async (req, res) => {
  const { email, newPassword } = req.body;

  try {
    const customer = await Customer.findOne({ email });
    if (!customer) {
      return res
        .status(404)
        .json({ error: true, message: "Customer not found" });
    }

    const salt = await bcrypt.genSalt(10);
    customer.password = await bcrypt.hash(newPassword, salt);

    await customer.save();

    return res.json({ error: false, message: "Password reset successful" });
  } catch (error) {
    console.error("Error resetting password:", error);
    return res.status(500).json({ error: true, message: "Server Error" });
  }
};
