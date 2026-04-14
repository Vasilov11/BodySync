const mongoose = require("mongoose");
const dotenv = require("dotenv");
const Exercise = require("./models/Exercise");

dotenv.config();

const exercises = [
    { name: "Push Ups", muscleGroup: "Chest", equipment: "Bodyweight", caloriesFactor: 0.4 },
    { name: "Pull Ups", muscleGroup: "Back", equipment: "Pull-up Bar", caloriesFactor: 0.8 },
    { name: "Bench Press", muscleGroup: "Chest", equipment: "Barbell", caloriesFactor: 0.7 },
    { name: "Incline Bench Press", muscleGroup: "Chest", equipment: "Barbell", caloriesFactor: 0.7 },
    { name: "Squat", muscleGroup: "Legs", equipment: "Barbell", caloriesFactor: 0.8 },
    { name: "Leg Press", muscleGroup: "Legs", equipment: "Machine", caloriesFactor: 0.7 },
    { name: "Deadlift", muscleGroup: "Back", equipment: "Barbell", caloriesFactor: 0.9 },
    { name: "Shoulder Press", muscleGroup: "Shoulders", equipment: "Dumbbell", caloriesFactor: 0.6 },
    { name: "Bicep Curls", muscleGroup: "Arms", equipment: "Dumbbell", caloriesFactor: 0.4 },
    { name: "Tricep Pushdown", muscleGroup: "Arms", equipment: "Cable", caloriesFactor: 0.4 },
    { name: "Lateral Raises", muscleGroup: "Shoulders", equipment: "Dumbbell", caloriesFactor: 0.3 },
    { name: "Plank", muscleGroup: "Core", equipment: "Bodyweight", caloriesFactor: 3.0 },
    { name: "Crunches", muscleGroup: "Core", equipment: "Bodyweight", caloriesFactor: 0.2 },
    { name: "Burpees", muscleGroup: "Full Body", equipment: "Bodyweight", caloriesFactor: 1.2 },
    { name: "Jump Squats", muscleGroup: "Legs", equipment: "Bodyweight", caloriesFactor: 0.9 },
    { name: "Mountain Climbers", muscleGroup: "Core", equipment: "Bodyweight", caloriesFactor: 0.8 },
    { name: "Lat Pulldown", muscleGroup: "Back", equipment: "Machine", caloriesFactor: 0.7 },
    { name: "Barbell Row", muscleGroup: "Back", equipment: "Barbell", caloriesFactor: 0.8 },
    { name: "Seated Row", muscleGroup: "Back", equipment: "Cable", caloriesFactor: 0.7 },
    { name: "Dumbbell Press", muscleGroup: "Chest", equipment: "Dumbbell", caloriesFactor: 0.6 },
    { name: "Romanian Deadlift", muscleGroup: "Legs", equipment: "Barbell", caloriesFactor: 0.8 },
    { name: "Lunges", muscleGroup: "Legs", equipment: "Bodyweight", caloriesFactor: 0.6 },
    { name: "Calf Raises", muscleGroup: "Legs", equipment: "Bodyweight", caloriesFactor: 0.3 },
    { name: "Hammer Curls", muscleGroup: "Arms", equipment: "Dumbbell", caloriesFactor: 0.4 },
    { name: "Skull Crushers", muscleGroup: "Arms", equipment: "Barbell", caloriesFactor: 0.5 },
    { name: "Face Pulls", muscleGroup: "Shoulders", equipment: "Cable", caloriesFactor: 0.4 },
    { name: "Leg Curl", muscleGroup: "Legs", equipment: "Machine", caloriesFactor: 0.5 },
    { name: "Leg Extension", muscleGroup: "Legs", equipment: "Machine", caloriesFactor: 0.5 },
    { name: "Hip Thrust", muscleGroup: "Glutes", equipment: "Barbell", caloriesFactor: 0.7 },
    { name: "Cable Fly", muscleGroup: "Chest", equipment: "Cable", caloriesFactor: 0.5 },
    { name: "Pec Deck", muscleGroup: "Chest", equipment: "Machine", caloriesFactor: 0.5 },
    { name: "Arnold Press", muscleGroup: "Shoulders", equipment: "Dumbbell", caloriesFactor: 0.6 },
    { name: "Front Raises", muscleGroup: "Shoulders", equipment: "Dumbbell", caloriesFactor: 0.3 },
    { name: "Shrugs", muscleGroup: "Traps", equipment: "Dumbbell", caloriesFactor: 0.4 },
    { name: "T-Bar Row", muscleGroup: "Back", equipment: "Machine", caloriesFactor: 0.8 },
    { name: "Bulgarian Split Squat", muscleGroup: "Legs", equipment: "Dumbbell", caloriesFactor: 0.7 },
    { name: "Glute Bridge", muscleGroup: "Glutes", equipment: "Bodyweight", caloriesFactor: 0.4 },
    { name: "Sit Ups", muscleGroup: "Core", equipment: "Bodyweight", caloriesFactor: 0.2 },
    { name: "Russian Twists", muscleGroup: "Core", equipment: "Bodyweight", caloriesFactor: 0.3 },
    { name: "Jump Rope", muscleGroup: "Cardio", equipment: "Rope", caloriesFactor: 1.0 },
];

const seedExercises = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);

        await Exercise.deleteMany();
        await Exercise.insertMany(exercises);

        console.log("Exercises seeded successfully");
        process.exit();
    } catch (error) {
        console.error("Error seeding exercises:", error);
        process.exit(1);
    }
};

seedExercises();