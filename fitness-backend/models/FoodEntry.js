const mongoose = require("mongoose");

const foodEntrySchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },

        foodName: {
            type: String,
            required: true,
            trim: true,
        },

        grams: {
            type: Number,
            required: true,
            min: 1,
        },

        caloriesPer100g: {
            type: Number,
            required: true,
            min: 0,
        },

        proteinPer100g: {
            type: Number,
            default: 0,
            min: 0,
        },

        carbsPer100g: {
            type: Number,
            default: 0,
            min: 0,
        },

        fatPer100g: {
            type: Number,
            default: 0,
            min: 0,
        },

        totalCalories: {
            type: Number,
            required: true,
            min: 0,
        },

        totalProtein: {
            type: Number,
            default: 0,
            min: 0,
        },

        totalCarbs: {
            type: Number,
            default: 0,
            min: 0,
        },

        totalFat: {
            type: Number,
            default: 0,
            min: 0,
        },

        date: {
            type: String,
            required: true,
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model("FoodEntry", foodEntrySchema);