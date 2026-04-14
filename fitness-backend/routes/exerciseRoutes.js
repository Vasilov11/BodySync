const express = require("express");
const router = express.Router();
const Exercise = require("../models/Exercise");

router.get("/", async (req, res) => {
    try {
        const exercises = await Exercise.find().sort({ name: 1 });
        res.json(exercises);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;