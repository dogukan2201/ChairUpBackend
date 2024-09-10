require("dotenv").config();
const config = require("./config/config.json");
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const customerRoutes = require("./routes/customerRoutes");
const cafeOwnerRoutes = require("./routes/cafeOwnerRoutes");
const adminRoutes = require("./routes/adminRoutes");

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors({ origin: "*" }));

mongoose.connect(config.connectionString)
  .then(() => console.log('MongoDB connected successfully'))
  .catch(err => console.error('MongoDB connection error:', err));


app.use("/api/customers", customerRoutes);
app.use("/api/cafeOwners", cafeOwnerRoutes);
app.use("/api/admins", adminRoutes);

app.get("/", (req, res) => {
  res.json({ data: "hello" });
});

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

module.exports = app;
