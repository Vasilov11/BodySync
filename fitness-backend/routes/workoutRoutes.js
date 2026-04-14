const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const Workout = require("../models/Workout");

const protect = (req, res, next) => {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
        return res.status(401).json({ message: "Not authorized" });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        return res.status(401).json({ message: "Invalid token" });
    }
};

router.get("/", protect, async (req, res) => {
    try {
        const workouts = await Workout.find({ user: req.user.id }).sort({ createdAt: -1 });
        res.json(workouts);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

router.get("/:id", protect, async (req, res) => {
    try {
        const workout = await Workout.findOne({
            _id: req.params.id,
            user: req.user.id,
        });

        if (!workout) {
            return res.status(404).json({ message: "Workout not found" });
        }

        res.json(workout);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

router.post("/", protect, async (req, res) => {
    try {
        const { name, date, exercises, totalCalories } = req.body;

        if (!name || !date || !Array.isArray(exercises) || exercises.length === 0) {
            return res.status(400).json({ message: "Invalid workout data" });
        }

        const workout = await Workout.create({
            user: req.user.id,
            name,
            date,
            exercises,
            totalCalories,
        });

        res.status(201).json(workout);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

router.delete("/:id", protect, async (req, res) => {
    try {
        const workout = await Workout.findOneAndDelete({
            _id: req.params.id,
            user: req.user.id,
        });

        if (!workout) {
            return res.status(404).json({ message: "Workout not found" });
        }

        res.json({ message: "Workout deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

router.put("/:id", protect, async (req, res) => {
    try {
        const { name, date, exercises, totalCalories } = req.body;

        const workout = await Workout.findOne({
            _id: req.params.id,
            user: req.user.id,
        });

        if (!workout) {
            return res.status(404).json({ message: "Workout not found" });
        }

        workout.name = name;
        workout.date = date;
        workout.exercises = exercises;
        workout.totalCalories = totalCalories;

        await workout.save();

        res.json(workout);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;