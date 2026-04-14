const mongoose = require("mongoose");

const favoritePlanSchema = new mongoose.Schema(
    {
        id: Number,
        name: String,
        goal: String,
        duration: String,
        description: String,
        image: String,
    },
    { _id: false }
);

const userSchema = new mongoose.Schema(
    {
        fullName: {
            type: String,
            required: true,
        },
        email: {
            type: String,
            required: true,
            unique: true,
        },
        password: {
            type: String,
            required: true,
        },
        age: {
            type: Number,
        },
        gender: {
            type: String,
        },
        height: {
            type: Number,
        },
        weight: {
            type: Number,
        },
        goal: {
            type: String,
            enum: ["lose weight", "build muscle", "stay fit"],
        },
        favoritePlans: {
            type: [favoritePlanSchema],
            default: [],
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);