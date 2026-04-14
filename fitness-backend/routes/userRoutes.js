const express = require("express");
const router = express.Router();
const User = require("../models/User");
const jwt = require("jsonwebtoken");

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

router.put("/update-profile", protect, async (req, res) => {
    try {
        const { id, name, goal, duration, description } = req.body;

        const user = await User.findById(req.user.id);

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        user.age = age;
        user.gender = gender;
        user.height = height;
        user.weight = weight;
        user.goal = goal;

        await user.save();

        res.json({
            message: "Profile updated successfully",
            user: {
                id: user._id,
                fullName: user.fullName,
                email: user.email,
                age: user.age,
                gender: user.gender,
                height: user.height,
                weight: user.weight,
                goal: user.goal,
                favoritePlans: user.favoritePlans,
            },
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

router.get("/favorites", protect, async (req, res) => {
    try {
        const user = await User.findById(req.user.id);

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        res.json(user.favoritePlans);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

router.post("/favorites", protect, async (req, res) => {
    try {
        const { id, name, goal, duration, description, image } = req.body;

        const user = await User.findById(req.user.id);

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        const alreadyExists = user.favoritePlans.some(
            (plan) => String(plan.id) === String(id)
        );

        if (!alreadyExists) {
            user.favoritePlans.push({
                id,
                name,
                goal,
                duration,
                description,
                image,
            });
            await user.save();
        }

        res.json(user.favoritePlans);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

router.delete("/favorites/:id", protect, async (req, res) => {
    try {
        const user = await User.findById(req.user.id);

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        user.favoritePlans = user.favoritePlans.filter(
            (plan) => String(plan.id) !== String(req.params.id)
        );

        await user.save();

        res.json(user.favoritePlans);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;