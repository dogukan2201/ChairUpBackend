require("dotenv").config();
const config = require("./config.json");
const mongoose = require("mongoose");

mongoose.connect(config.connectionString);

const User = require("./models/user.model");

const express = require("express");
const cors = require("cors");
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
const jwt = require("jsonwebtoken");
const { authenticateToken } = require("./utilities");

app.use(cors({ origin: "*" }));

app.get("/", (req, res) => {
  res.json({ data: "hello" });
});

//Create Account
app.post("/signup", async (req, res) => {
  const { firstName, lastName, email, password, role } = req.body;
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
  if (!role) {
    return res.status(400).json({ error: true, message: "Role is required." });
  }
  const isUser = await User.findOne({ email: email });
  if (isUser) {
    return res.json({ error: true, message: "User already exists." });
  }
  const user = new User({ firstName, lastName, email, password, role });

  await user.save();

  const accessToken = jwt.sign({ user }, process.env.ACCESS_TOKEN_SECRET, {
    expiresIn: "45m",
  });
  return res.json({
    error: false,
    user,
    message: "User registered successfully.",
    accessToken,
  });
});
//Login
app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email) {
      return res
        .status(400)
        .json({ error: true, message: "Email is required." });
    }

    if (!password) {
      return res
        .status(400)
        .json({ error: true, message: "Password is required." });
    }

    const userInfo = await User.findOne({ email: email });
    if (!userInfo) {
      return res.status(404).json({ error: true, message: "User not found" });
    }
    if (userInfo.password === password) {
      const user = { user: userInfo };
      const accessToken = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {
        expiresIn: "45m",
      });

      return res.json({
        error: false,
        message: "Login Successful",
        accessToken,
        email,
      });
    } else {
      return res
        .status(401)
        .json({ error: true, message: "Invalid Credentials" });
    }
  } catch (err) {
    return res.status(500).json({ error: true, message: "Server Error" });
  }
});

app.listen(8000);

module.exports = app;
