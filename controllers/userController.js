const User = require("../models/user.model");
const jwt = require("jsonwebtoken");

exports.signup = async (req, res) => {
  const { firstName, lastName, email, password, phoneNumber, role } = req.body;

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
  if (!phoneNumber) {
    return res
      .status(400)
      .json({ error: true, message: "Phone Number is required." });
  }
  if (!password) {
    return res
      .status(400)
      .json({ error: true, message: "Password is required." });
  }

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res
        .status(409)
        .json({ error: true, message: "User already exists." });
    }

    const newUser = new User({
      firstName,
      lastName,
      email,
      password,
      phoneNumber,
      role,
    });
    await newUser.save();

    const accessToken = jwt.sign(
      { user: newUser },
      process.env.ACCESS_TOKEN_SECRET,
      {
        expiresIn: "45m",
      }
    );

    return res.status(201).json({
      error: false,
      user: newUser,
      message: "User registered successfully.",
      accessToken,
    });
  } catch (error) {
    return res.status(500).json({ error: true, message: "Server Error" });
  }
};

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
    const user = await User.findOne({ email });

    if (!user || user.password !== password) {
      return res
        .status(401)
        .json({ error: true, message: "Invalid Credentials" });
    }

    const accessToken = jwt.sign({ user }, process.env.ACCESS_TOKEN_SECRET, {
      expiresIn: "45m",
    });

    return res.json({
      error: false,
      message: "Login Successful",
      accessToken,
      email: user.email,
    });
  } catch (error) {
    return res.status(500).json({ error: true, message: "Server Error" });
  }
};

exports.getUser = async (req, res) => {
  try {
    const { user } = req.user;
    const foundUser = await User.findById(user._id);

    if (!foundUser) {
      return res.status(404).json({ error: true, message: "User not found" });
    }

    return res.json({
      error: false,
      user: {
        firstName: foundUser.firstName,
        lastName: foundUser.lastName,
        email: foundUser.email,
        phoneNumber: foundUser.phoneNumber,
        role: foundUser.role,
        created: foundUser.created,
      },
    });
  } catch (error) {
    return res.status(500).json({ error: true, message: "Server Error" });
  }
};

exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find({});
    return res.json({ error: false, users });
  } catch (error) {
    return res.status(500).json({ error: true, message: "Server Error" });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedUser = await User.findByIdAndDelete(id);
    if (!deletedUser) {
      return res.status(404).json({ error: true, message: "User not found" });
    }
    return res.json({ error: false, message: "User Deleted" });
  } catch (error) {
    console.error("Server Error:", error);
    return res.status(500).json({ error: true, message: "Server Error" });
  }
};
