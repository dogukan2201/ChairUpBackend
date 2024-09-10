const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const adminSchema = new Schema({
    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, trim: true },
    phoneNumber: { type: String, required: true, unique: true, trim: true },
    password: { type: String, required: true, trim: true },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: null },
    isActive: { type: Boolean, default: true },
});

module.exports = mongoose.model("admin", adminSchema);