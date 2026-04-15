const express = require("express");
const axios = require("axios");
const FoodEntry = require("../models/FoodEntry");

const router = express.Router();

function extractNutrient(food, names) {
    if (!food?.foodNutrients) return 0;

    const nutrient = food.foodNutrients.find((item) => {
        const name = (item.nutrientName || item.name || "").toLowerCase();
        return names.some((target) => name.includes(target.toLowerCase()));
    });

    return nutrient ? Number(nutrient.value || 0) : 0;
}

router.get("/search", async (req, res) => {
    try {
        const query = req.query.query;

        if (!query) {
            return res.status(400).json({ message: "Query is required." });
        }

        const apiKey = process.env.USDA_API_KEY;

        if (!apiKey) {
            return res.status(500).json({ message: "USDA API key is missing." });
        }

        const response = await axios.get("https://api.nal.usda.gov/fdc/v1/foods/search", {
            params: {
                api_key: apiKey,
                query,
                pageSize: 10,
            },
        });

        const foods = response.data.foods || [];

        const formattedFoods = foods.map((food) => {
            const calories = extractNutrient(food, ["energy"]);
            const protein = extractNutrient(food, ["protein"]);
            const carbs = extractNutrient(food, ["carbohydrate"]);
            const fat = extractNutrient(food, ["total lipid", "fat"]);

            return {
                fdcId: food.fdcId,
                description: food.description,
                caloriesPer100g: Number(calories.toFixed(1)),
                proteinPer100g: Number(protein.toFixed(1)),
                carbsPer100g: Number(carbs.toFixed(1)),
                fatPer100g: Number(fat.toFixed(1)),
            };
        });

        res.json(formattedFoods);
    } catch (error) {
        console.error("Error searching USDA foods:", error?.response?.data || error.message);
        res.status(500).json({ message: "Error searching food API." });
    }
});

router.post("/", async (req, res) => {
    try {
        const {
            user,
            foodName,
            grams,
            caloriesPer100g,
            proteinPer100g,
            carbsPer100g,
            fatPer100g,
            date,
        } = req.body;

        if (!user || !foodName || !grams || !caloriesPer100g || !date) {
            return res.status(400).json({ message: "All required fields are missing." });
        }

        const gramsNumber = Number(grams);
        const calories100 = Number(caloriesPer100g);
        const protein100 = Number(proteinPer100g || 0);
        const carbs100 = Number(carbsPer100g || 0);
        const fat100 = Number(fatPer100g || 0);

        const totalCalories = (gramsNumber * calories100) / 100;
        const totalProtein = (gramsNumber * protein100) / 100;
        const totalCarbs = (gramsNumber * carbs100) / 100;
        const totalFat = (gramsNumber * fat100) / 100;

        const newFoodEntry = new FoodEntry({
            user,
            foodName,
            grams: gramsNumber,
            caloriesPer100g: calories100,
            proteinPer100g: protein100,
            carbsPer100g: carbs100,
            fatPer100g: fat100,
            totalCalories: Number(totalCalories.toFixed(1)),
            totalProtein: Number(totalProtein.toFixed(1)),
            totalCarbs: Number(totalCarbs.toFixed(1)),
            totalFat: Number(totalFat.toFixed(1)),
            date,
        });

        const savedEntry = await newFoodEntry.save();
        res.status(201).json(savedEntry);
    } catch (error) {
        console.error("Error creating food entry:", error);
        res.status(500).json({ message: "Server error." });
    }
});

router.put("/:id", async (req, res) => {
    try {
        const {
            grams,
            foodName,
            caloriesPer100g,
            proteinPer100g,
            carbsPer100g,
            fatPer100g,
            date,
        } = req.body;

        const gramsNumber = Number(grams);
        const calories100 = Number(caloriesPer100g || 0);
        const protein100 = Number(proteinPer100g || 0);
        const carbs100 = Number(carbsPer100g || 0);
        const fat100 = Number(fatPer100g || 0);

        const totalCalories = (gramsNumber * calories100) / 100;
        const totalProtein = (gramsNumber * protein100) / 100;
        const totalCarbs = (gramsNumber * carbs100) / 100;
        const totalFat = (gramsNumber * fat100) / 100;

        const updatedEntry = await FoodEntry.findByIdAndUpdate(
            req.params.id,
            {
                foodName,
                grams: gramsNumber,
                caloriesPer100g: calories100,
                proteinPer100g: protein100,
                carbsPer100g: carbs100,
                fatPer100g: fat100,
                totalCalories: Number(totalCalories.toFixed(1)),
                totalProtein: Number(totalProtein.toFixed(1)),
                totalCarbs: Number(totalCarbs.toFixed(1)),
                totalFat: Number(totalFat.toFixed(1)),
                date,
            },
            { new: true }
        );

        if (!updatedEntry) {
            return res.status(404).json({ message: "Food entry not found." });
        }

        res.json(updatedEntry);
    } catch (error) {
        console.error("Error updating food entry:", error);
        res.status(500).json({ message: "Server error." });
    }
});

router.delete("/:id", async (req, res) => {
    try {
        const deletedEntry = await FoodEntry.findByIdAndDelete(req.params.id);

        if (!deletedEntry) {
            return res.status(404).json({ message: "Food entry not found." });
        }

        res.json({ message: "Food entry deleted successfully." });
    } catch (error) {
        console.error("Error deleting food entry:", error);
        res.status(500).json({ message: "Server error." });
    }
});

router.get("/:userId", async (req, res) => {
    try {
        const entries = await FoodEntry.find({ user: req.params.userId }).sort({
            createdAt: -1,
        });

        res.json(entries);
    } catch (error) {
        console.error("Error fetching food entries:", error);
        res.status(500).json({ message: "Server error." });
    }
});

module.exports = router;