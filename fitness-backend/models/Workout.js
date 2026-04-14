const mongoose = require("mongoose");

const exerciseSchema = new mongoose.Schema(
    {
        exercise: { type: String, required: true },
        sets: { type: Number, required: true },
        reps: { type: Number, required: true },
        weight: { type: Number, default: 0 },
        calories: { type: Number, required: true },
    },
    { _id: false }
);

const workoutSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        name: {
            type: String,
            required: true,
        },
        date: {
            type: String,
            required: true,
        },
        exercises: {
            type: [exerciseSchema],
            default: [],
        },
        totalCalories: {
            type: Number,
            default: 0,
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model("Workout", workoutSchema);