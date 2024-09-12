const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const employeeSchema = new Schema({
    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, trim: true },
    phoneNumber: { type: String, required: true, unique: true, trim: true },
    password: { type: String, required: true, trim: true },
    cafeId: {
        type: mongoose.Schema.Types.ObjectId, // Kafe sahibinin kullanıcı ID'si
        required: true
    },
    orderHistory: [
        {
            type: mongoose.Schema.Types.ObjectId, // Order ID'si
        }
    ],
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: null },
    isActive: { type: Boolean, default: true },
});

module.exports = mongoose.model("Employee", employeeSchema, "employees");