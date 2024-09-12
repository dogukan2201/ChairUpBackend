const mongoose = require("mongoose");

const Schema = mongoose.Schema;

// Kafe şeması
const cafeSchema = new Schema({
    name: { type: String, required: true, trim: true }, // Kafenin adı
    address: { type: String, required: true, trim: true }, // Kafenin adı
    phoneNumber: { type: String, required: true, trim: true }, // Kafenin telefon numarası
    location: {
        type: { type: String, enum: ['Point'], required: true }, // Coğrafi tür "Point"
        coordinates: { type: [Number], required: true }, // Koordinatlar [longitude, latitude]
    },
    menu: [
        {
            itemName: { type: String, required: true, trim: true }, // Menüdeki ürün adı
            price: { type: Number, required: true }, // Ürün fiyatı
            description: { type: String, trim: true }, // Ürün açıklaması (opsiyonel)
        }
    ],
    ownerId: {
        type: mongoose.Schema.Types.ObjectId, // Kafe sahibinin kullanıcı ID'si
        ref: "cafeOwners", // Cafes koleksiyonuyla ilişkilendirilir
        required: true
    },
    createdAt: { type: Date, default: Date.now }, // Kafenin oluşturulma tarihi
    updatedAt: { type: Date, default: null }, // Kafe bilgilerinin güncellenme tarihi
    isActive: { type: Boolean, default: true } // Kafenin aktif olup olmadığını gösterir
});


module.exports = mongoose.model("Cafe", cafeSchema, "cafes"); // Koleksiyon adı "cafes"
