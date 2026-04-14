const mongoose = require("mongoose");

const exerciseSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            unique: true,
            trim: true,
        },
        muscleGroup: {
            type: String,
            required: true,
            trim: true,
        },
        equipment: {
            type: String,
            default: "Bodyweight",
            trim: true,
        },
        caloriesFactor: {
            type: Number,
            required: true,
            default: 0.4,
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model("Exercise", exerciseSchema);