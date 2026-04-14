import { useMemo, useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import axios from "axios";

function Plans() {
    const [selectedProgram, setSelectedProgram] = useState(null);
    const [selectedDayIndex, setSelectedDayIndex] = useState(0);
    const [searchParams] = useSearchParams();
    const goalFilter = searchParams.get("goal") || "";
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedGoal, setSelectedGoal] = useState(goalFilter || "");
    const [currentPage, setCurrentPage] = useState(1);
    const programsPerPage = 9;
    const [favoritePlans, setFavoritePlans] = useState([]);
    const openPlanId = searchParams.get("open");
    const navigate = useNavigate();

    const programs = [
        {
            id: 1,
            name: "Build Muscle Basics",
            goal: "Build Muscle",
            duration: "4 Days / Week",
            description: "A beginner-friendly muscle building plan.",
            image: "/images/BuildMuscle.png",
            days: [
                {
                    day: "Day 1",
                    exercises: [
                        {
                            name: "Push Ups",
                            duration: "10 mins",
                            sets: 4,
                            reps: "25",
                            image: "/images/Pushups.png"
                        },
                        {
                            name: "Dumbbell Chest Press",
                            duration: "8 mins",
                            sets: 3,
                            reps: "12-15",
                            image: "/images/DumbbellChestPress.png"
                        },
                        {
                            name: "Seated Dumbbell Sholder",
                            duration: "10 mins",
                            sets: 4,
                            reps: "12-15",
                            image: "/images/SeatedDumbbellSholder.png"
                        },
                        {
                            name: "Tricep Dips (Chair)",
                            duration: "10 mins",
                            sets: 4,
                            reps: "12-15",
                            image: "/images/TricepDipsChair.png"
                        }
                    ],
                },
                {
                    day: "Day 2",
                    exercises: [
                        {
                            name: "Bodyweight Squats",
                            duration: "10 mins",
                            sets: 4,
                            reps: "12-15",
                            image: "/images/Squads.png"
                        },
                        {
                            name: "Seated Row",
                            duration: "10 mins",
                            sets: 4,
                            reps: "12-15",
                            image: "/images/SeatedRow.png"
                        },
                        {
                            name: "Russion Twists",
                            duration: "10 mins",
                            sets: 4,
                            reps: "12-15",
                            image: "/images/RussianTwists.png"
                        },
                        {
                            name: "Plank",
                            duration: "10 mins",
                            sets: 4,
                            reps: "12-15",
                            image: "/images/Plank.png"
                        }
                    ],
                },
                {
                    day: "Day 3",
                    exercises: [
                        {
                            name: "Push Ups",
                            duration: "10 mins",
                            sets: 4,
                            reps: "25",
                            image: "/images/Pushups.png"
                        },
                        {
                            name: "Dumbbell Chest Press",
                            duration: "8 mins",
                            sets: 3,
                            reps: "12-15",
                            image: "/images/DumbbellChestPress.png"
                        },
                        {
                            name: "Seated Dumbbell Sholder",
                            duration: "10 mins",
                            sets: 4,
                            reps: "12-15",
                            image: "/images/SeatedDumbbellSholder.png"
                        },
                        {
                            name: "Tricep Dips (Chair)",
                            duration: "10 mins",
                            sets: 4,
                            reps: "12-15",
                            image: "/images/TricepDipsChair.png"
                        }
                    ],
                },
                {
                    day: "Day 4",
                    exercises: [
                        {
                            name: "Bodyweight Squats",
                            duration: "10 mins",
                            sets: 4,
                            reps: "12-15",
                            image: "/images/Squads.png"
                        },
                        {
                            name: "Seated Row",
                            duration: "10 mins",
                            sets: 4,
                            reps: "12-15",
                            image: "/images/SeatedRow.png"
                        },
                        {
                            name: "Russion Twists",
                            duration: "10 mins",
                            sets: 4,
                            reps: "12-15",
                            image: "/images/RussianTwists.png"
                        },
                        {
                            name: "Plank",
                            duration: "10 mins",
                            sets: 4,
                            reps: "12-15",
                            image: "/images/Plank.png"
                        }
                    ],
                },
            ],
        },
        {
            id: 2,
            name: "Lean Muscle Program",
            goal: "Build Muscle",
            duration: "4 Days / Week",
            description: "Focus on lean muscle gain with controlled workouts.",
            image: "/images/Leanmuscleprogram.png",
            days: [
                {
                    day: "Day 1",
                    exercises: [
                        {
                            name: "Bench Press",
                            duration: "10 mins",
                            sets: 4,
                            reps: "12-15",
                            image: "/images/BenchPressW.png"
                        },
                        {
                            name: "Pull-Ups",
                            duration: "10 mins",
                            sets: 4,
                            reps: "12-15",
                            image: "/images/PullUpps.png"
                        },
                        {
                            name: "Overhead Shoulder Press",
                            duration: "10 mins",
                            sets: 4,
                            reps: "12-15",
                            image: "/images/OverHeadSholderPress.png"
                        },
                        {
                            name: "Dumbbell Incline Press",
                            duration: "10 mins",
                            sets: 4,
                            reps: "12-15",
                            image: "/images/DumbbellInclinePress.png"
                        }
                    ],
                },
                {
                    day: "Day 2",
                    exercises: [
                        {
                            name: "Deadlift",
                            duration: "10 mins",
                            sets: 4,
                            reps: "12-15",
                            image: "/images/DeadliftW.png"
                        },
                        {
                            name: "Squats",
                            duration: "10 mins",
                            sets: 4,
                            reps: "12-15",
                            image: "/images/SquadsW.png"
                        },
                        {
                            name: "Lunges",
                            duration: "10 mins",
                            sets: 4,
                            reps: "12-15",
                            image: "/images/LungesW.png"
                        },
                        {
                            name: "Barbell Rows",
                            duration: "10 mins",
                            sets: 4,
                            reps: "12-15",
                            image: "/images/BarbellRows.png"
                        }
                    ],
                },
                {
                    day: "Day 3",
                    exercises: [
                        {
                            name: "Bench Press",
                            duration: "10 mins",
                            sets: 4,
                            reps: "12-15",
                            image: "/images/BenchPressW.png"
                        },
                        {
                            name: "Pull-Ups",
                            duration: "10 mins",
                            sets: 4,
                            reps: "12-15",
                            image: "/images/PullUpps.png"
                        },
                        {
                            name: "Overhead Shoulder Press",
                            duration: "10 mins",
                            sets: 4,
                            reps: "12-15",
                            image: "/images/OverHeadSholderPress.png"
                        },
                        {
                            name: "Dumbbell Incline Press",
                            duration: "10 mins",
                            sets: 4,
                            reps: "12-15",
                            image: "/images/DumbbellInclinePress.png"
                        }
                    ],
                },
                {
                    day: "Day 4",
                    exercises: [
                        {
                            name: "Deadlift",
                            duration: "10 mins",
                            sets: 4,
                            reps: "12-15",
                            image: "/images/DeadliftW.png"
                        },
                        {
                            name: "Squats",
                            duration: "10 mins",
                            sets: 4,
                            reps: "12-15",
                            image: "/images/SquadsW.png"
                        },
                        {
                            name: "Lunges",
                            duration: "10 mins",
                            sets: 4,
                            reps: "12-15",
                            image: "/images/LungesW.png"
                        },
                        {
                            name: "Barbell Rows",
                            duration: "10 mins",
                            sets: 4,
                            reps: "12-15",
                            image: "/images/BarbellRows.png"
                        }
                    ],
                },
            ],
        },
        {
            id: 3,
            name: "Weight Loss Starter",
            goal: "Lose Weight",
            duration: "4 Days / Week",
            description: "A simple fat-loss plan with cardio and core work.",
            image: "/images/WeightLossStarter.png",
            days: [
                {
                    day: "Day 1",
                    exercises: [
                        {
                            name: "High knees",
                            duration: "10 mins",
                            sets: 4,
                            reps: "12-15",
                            image: "/images/HighKnees.png"
                        },
                        {
                            name: "Flutter Kicks",
                            duration: "10 mins",
                            sets: 4,
                            reps: "12-15",
                            image: "/images/Flutterkicks.png"
                        },
                        {
                            name: "Ab Bicycle",
                            duration: "10 mins",
                            sets: 4,
                            reps: "12-15",
                            image: "/images/AbBusicle.png"
                        }
                    ],
                },
                {
                    day: "Day 2",
                    exercises: [
                        {
                            name: "Sholder Tap",
                            duration: "10 mins",
                            sets: 4,
                            reps: "12-15",
                            image: "/images/SholderTap.png"
                        },
                        {
                            name: "Plank",
                            duration: "10 mins",
                            sets: 4,
                            reps: "12-15",
                            image: "/images/PlankW2.png"
                        },
                        {
                            name: "Chrunches",
                            duration: "10 mins",
                            sets: 4,
                            reps: "12-15",
                            image: "/images/Crunches.png"
                        }
                    ],
                },
                {
                    day: "Day 3",
                    exercises: [
                        {
                            name: "High knees",
                            duration: "10 mins",
                            sets: 4,
                            reps: "12-15",
                            image: "/images/HighKnees.png"
                        },
                        {
                            name: "Flutter Kicks",
                            duration: "10 mins",
                            sets: 4,
                            reps: "12-15",
                            image: "/images/Flutterkicks.png"
                        },
                        {
                            name: "Ab Bicycle",
                            duration: "10 mins",
                            sets: 4,
                            reps: "12-15",
                            image: "/images/AbBusicle.png"
                        }
                    ],
                },
                {
                    day: "Day 4",
                    exercises: [
                        {
                            name: "Sholder Tap",
                            duration: "10 mins",
                            sets: 4,
                            reps: "12-15",
                            image: "/images/SholderTap.png"
                        },
                        {
                            name: "Plank",
                            duration: "10 mins",
                            sets: 4,
                            reps: "12-15",
                            image: "/images/PlankW2.png"
                        },
                        {
                            name: "Chrunches",
                            duration: "10 mins",
                            sets: 4,
                            reps: "12-15",
                            image: "/images/Crunches.png"
                        }
                    ],
                },
            ],
        },
        {
            id: 4,
            name: "Fat Burn HIIT",
            goal: "Lose Weight",
            duration: "5 Days / Week",
            description: "High-intensity sessions to burn more calories.",
            image: "/images/FatBurnHIIT.png",
            days: [
                {
                    day: "Day 1",
                    exercises: [
                        {
                            name: "Power Jacks",
                            duration: "10 mins",
                            sets: 4,
                            reps: "15-20",
                            image: "/images/PowerJacks.png"
                        },
                        {
                            name: "Butt Kicks",
                            duration: "10 mins",
                            sets: 4,
                            reps: "15-20",
                            image: "/images/ButtKicks.png"
                        },
                        {
                            name: "1-1/2 Side Step Squat",
                            duration: "10 mins",
                            sets: 4,
                            reps: "15-20",
                            image: "/images/SideStepSquat.png"
                        }
                    ],
                },
                {
                    day: "Day 2",
                    exercises: [
                        {
                            name: "Plank Spider Climbers",
                            duration: "10 mins",
                            sets: 4,
                            reps: "15-20",
                            image: "/images/PlankSpiderClimbers.png"
                        },
                        {
                            name: "Pop Squat",
                            duration: "10 mins",
                            sets: 4,
                            reps: "15-20",
                            image: "/images/PopSquat.png"
                        },
                        {
                            name: "Standing Oblique Twist",
                            duration: "10 mins",
                            sets: 4,
                            reps: "15-20",
                            image: "/images/StandingObliqueTwist.png"
                        }
                    ],
                },
                {
                    day: "Day 3",
                    exercises: [
                        {
                            name: "Power Jacks",
                            duration: "10 mins",
                            sets: 4,
                            reps: "15-20",
                            image: "/images/PowerJacks.png"
                        },
                        {
                            name: "Butt Kicks",
                            duration: "10 mins",
                            sets: 4,
                            reps: "15-20",
                            image: "/images/ButtKicks.png"
                        },
                        {
                            name: "1-1/2 Side Step Squat",
                            duration: "10 mins",
                            sets: 4,
                            reps: "15-20",
                            image: "/images/SideStepSquat.png"
                        }
                    ],
                },
                {
                    day: "Day 4",
                    exercises: [
                        {
                            name: "Plank Spider Climbers",
                            duration: "10 mins",
                            sets: 4,
                            reps: "15-20",
                            image: "/images/PlankSpiderClimbers.png"
                        },
                        {
                            name: "Pop Squat",
                            duration: "10 mins",
                            sets: 4,
                            reps: "15-20",
                            image: "/images/PopSquat.png"
                        },
                        {
                            name: "Standing Oblique Twist",
                            duration: "10 mins",
                            sets: 4,
                            reps: "15-20",
                            image: "/images/StandingObliqueTwist.png"
                        }
                    ],
                },
            ],
        },
        {
            id: 5,
            name: "Stay Fit Essentials",
            goal: "Stay Fit",
            duration: "4 Days / Week",
            description: "Balanced training plan for general health and fitness.",
            image: "/images/StayFitEssentials.png",
            days: [
                {
                    day: "Day 1",
                    exercises: [
                        {
                            name: "Chair Dips",
                            duration: "10 mins",
                            sets: 4,
                            reps: "12-15",
                            image: "/images/ChairDipsW2.png"
                        },
                        {
                            name: "Glute Bridges",
                            duration: "10 mins",
                            sets: 4,
                            reps: "12-15",
                            image: "/images/GluteBridges.png"
                        },
                        {
                            name: "Lunges",
                            duration: "10 mins",
                            sets: 4,
                            reps: "12-15",
                            image: "/images/Lunges.png"
                        }
                    ],
                },
                {
                    day: "Day 2",
                    exercises: [
                        {
                            name: "Lunges",
                            duration: "10 mins",
                            sets: 4,
                            reps: "12-15",
                            image: "/images/Lunges.png"
                        },
                        {
                            name: "Mountain Climbers",
                            duration: "10 mins",
                            sets: 4,
                            reps: "12-15",
                            image: "/images/MountainClimbers.png"
                        },
                        {
                            name: "Donkey kicks",
                            duration: "10 mins",
                            sets: 4,
                            reps: "12-15",
                            image: "/images/DonketKicks.png"
                        }
                    ],
                },
                {
                    day: "Day 3",
                    exercises: [
                        {
                            name: "Mountain Climbers",
                            duration: "10 mins",
                            sets: 4,
                            reps: "12-15",
                            image: "/images/MountainClimbers.png"
                        },
                        {
                            name: "Donkey kicks",
                            duration: "10 mins",
                            sets: 4,
                            reps: "12-15",
                            image: "/images/DonketKicks.png"
                        },
                        {
                            name: "Glute Bridges",
                            duration: "10 mins",
                            sets: 4,
                            reps: "12-15",
                            image: "/images/GluteBridges.png"
                        }
                    ],
                },
                {
                    day: "Day 4",
                    exercises: [
                        {
                            name: "Glute Bridges",
                            duration: "10 mins",
                            sets: 4,
                            reps: "12-15",
                            image: "/images/GluteBridges.png"
                        },
                        {
                            name: "Donkey kicks",
                            duration: "10 mins",
                            sets: 4,
                            reps: "12-15",
                            image: "/images/DonketKicks.png"
                        },
                        {
                            name: "Chair Dips",
                            duration: "10 mins",
                            sets: 4,
                            reps: "12-15",
                            image: "/images/ChairDipsW2.png"
                        }
                    ],
                },
            ],
        },
        {
            id: 6,
            name: "Active Lifestyle Plan",
            goal: "Stay Fit",
            duration: "3 Days / Week",
            description: "Simple weekly plan to stay active and healthy.",
            image: "/images/ActiveLifestylePlan.png",
            days: [
                {
                    day: "Day 1",
                    exercises: [
                        {
                            name: "Bird Dog",
                            duration: "10 mins",
                            sets: 4,
                            reps: "12-15",
                            image: "/images/BirdDog.png"
                        },
                        {
                            name: "Dead Bug",
                            duration: "10 mins",
                            sets: 4,
                            reps: "12-15",
                            image: "/images/DeadBug.png",
                        },
                        {
                            name: "Hanging Leg Raises",
                            duration: "10 mins",
                            sets: 4,
                            reps: "12-15",
                            image: "/images/HangingLegRaises.png",
                        }
                    ],
                },
                {
                    day: "Day 2",
                    exercises: [
                        {
                            name: "Glute Bridge",
                            duration: "10 mins",
                            sets: 4,
                            reps: "12-15",
                            image: "/images/GluteBridgesM.png"
                        },
                        {
                            name: "Plank",
                            duration: "10 mins",
                            sets: 4,
                            reps: "12-15",
                            image: "/images/PlankM.png"
                        },
                        {
                            name: "Dead Bug",
                            duration: "10 mins",
                            sets: 4,
                            reps: "12-15",
                            image: "/images/DeadBug.png",
                        }
                    ],
                },
                {
                    day: "Day 3",
                    exercises: [
                        {
                            name: "Bird Dog",
                            duration: "10 mins",
                            sets: 4,
                            reps: "12-15",
                            image: "/images/BirdDog.png"
                        },
                        {
                            name: "Hanging Leg Raises",
                            duration: "10 mins",
                            sets: 4,
                            reps: "12-15",
                            image: "/images/HangingLegRaises.png",
                        },
                        {
                            name: "Glute Bridge",
                            duration: "10 mins",
                            sets: 4,
                            reps: "12-15",
                            image: "/images/GluteBridgesM.png"
                        }
                    ],
                },
            ],
        },
        {
            id: 7,
            name: "Core Crusher",
            goal: "Lose Weight",
            duration: "4 Days / Week",
            description: "Core-focused challenge with cardio support.",
            image: "/images/CoreCrusher.png",
            days: [
                {
                    day: "Day 1",
                    exercises: [
                        {
                            name: "Glute Bridge",
                            duration: "10 mins",
                            sets: 4,
                            reps: "12-15",
                            image: "/images/GluteBridgesM.png"
                        },
                        {
                            name: "Hanging Leg Raises",
                            duration: "10 mins",
                            sets: 4,
                            reps: "12-15",
                            image: "/images/HangingLegRaises.png",
                        },
                        {
                            name: "Bird Dog",
                            duration: "10 mins",
                            sets: 4,
                            reps: "12-15",
                            image: "/images/BirdDog.png"
                        }
                    ],
                },
                {
                    day: "Day 2",
                    exercises: [
                        {
                            name: "Dead Bug",
                            duration: "10 mins",
                            sets: 4,
                            reps: "12-15",
                            image: "/images/DeadBug.png",
                        },
                        {
                            name: "Dead Bug",
                            duration: "10 mins",
                            sets: 4,
                            reps: "12-15",
                            image: "/images/DeadBug.png",
                        },
                        {
                            name: "Mountain Climbers",
                            duration: "10 mins",
                            sets: 4,
                            reps: "12-15",
                            image: "/images/MountainClimbers.png"
                        }
                    ],
                },
                {
                    day: "Day 3",
                    exercises: [
                        {
                            name: "Mountain Climbers",
                            duration: "10 mins",
                            sets: 4,
                            reps: "12-15",
                            image: "/images/MountainClimbers.png"
                        },
                        {
                            name: "Chair Dips",
                            duration: "10 mins",
                            sets: 4,
                            reps: "12-15",
                            image: "/images/ChairDipsW2.png"
                        },
                        {
                            name: "Power Jacks",
                            duration: "10 mins",
                            sets: 4,
                            reps: "15-20",
                            image: "/images/PowerJacks.png"
                        }
                    ],
                },
                {
                    day: "Day 4",
                    exercises: [
                        {
                            name: "Power Jacks",
                            duration: "10 mins",
                            sets: 4,
                            reps: "15-20",
                            image: "/images/PowerJacks.png"
                        },
                        {
                            name: "Lunges",
                            duration: "10 mins",
                            sets: 4,
                            reps: "12-15",
                            image: "/images/Lunges.png"
                        },
                        {
                            name: "Pop Squat",
                            duration: "10 mins",
                            sets: 4,
                            reps: "15-20",
                            image: "/images/PopSquat.png"
                        }
                    ],
                },
            ],
        },
        {
            id: 8,
            name: "Strength Builder",
            goal: "Build Muscle",
            duration: "4 Days / Week",
            description: "Strength-based plan for compound movements.",
            image: "/images/StrenthBuilder.png",
            days: [
                {
                    day: "Day 1",
                    exercises: [
                        {
                            name: "Bench Press",
                            duration: "10 mins",
                            sets: 4,
                            reps: "12-15",
                            image: "/images/BenchPressW.png"
                        },
                        {
                            name: "Dumbbell Incline Press",
                            duration: "10 mins",
                            sets: 4,
                            reps: "12-15",
                            image: "/images/DumbbellInclinePress.png"
                        },
                        {
                            name: "Overhead Shoulder Press",
                            duration: "10 mins",
                            sets: 4,
                            reps: "12-15",
                            image: "/images/OverHeadSholderPress.png"
                        },
                        {
                            name: "Dumbbell Chest Press",
                            duration: "8 mins",
                            sets: 3,
                            reps: "12-15",
                            image: "/images/DumbbellChestPress.png"
                        }

                    ],
                },
                {
                    day: "Day 2",
                    exercises: [
                        {
                            name: "Deadlift",
                            duration: "10 mins",
                            sets: 4,
                            reps: "12-15",
                            image: "/images/DeadliftW.png"
                        },
                        {
                            name: "Barbell Rows",
                            duration: "10 mins",
                            sets: 4,
                            reps: "12-15",
                            image: "/images/BarbellRows.png"
                        },
                        {
                            name: "Pull-Ups",
                            duration: "10 mins",
                            sets: 4,
                            reps: "12-15",
                            image: "/images/PullUpps.png"
                        },
                        {
                            name: "Overhead Shoulder Press",
                            duration: "10 mins",
                            sets: 4,
                            reps: "12-15",
                            image: "/images/OverHeadSholderPress.png"
                        },
                    ],
                },
                {
                    day: "Day 3",
                    exercises: [
                        {
                            name: "1-1/2 Side Step Squat",
                            duration: "10 mins",
                            sets: 4,
                            reps: "15-20",
                            image: "/images/SideStepSquat.png"
                        },
                        {
                            name: "Squats",
                            duration: "10 mins",
                            sets: 4,
                            reps: "12-15",
                            image: "/images/SquadsW.png"
                        },
                        {
                            name: "Bodyweight Squats",
                            duration: "10 mins",
                            sets: 4,
                            reps: "12-15",
                            image: "/images/Squads.png"
                        },
                        {
                            name: "Pop Squat",
                            duration: "10 mins",
                            sets: 4,
                            reps: "15-20",
                            image: "/images/PopSquat.png"
                        }
                    ],
                },
                {
                    day: "Day 4",
                    exercises: [
                        {
                            nname: "Seated Dumbbell Sholder",
                            duration: "10 mins",
                            sets: 4,
                            reps: "12-15",
                            image: "/images/SeatedDumbbellSholder.png"
                        },
                        {
                            name: "Sholder Tap",
                            duration: "10 mins",
                            sets: 4,
                            reps: "12-15",
                            image: "/images/SholderTap.png"
                        },
                        {
                            name: "Pull-Ups",
                            duration: "10 mins",
                            sets: 4,
                            reps: "12-15",
                            image: "/images/PullUpps.png"
                        },
                        {
                            name: "Bench Press",
                            duration: "10 mins",
                            sets: 4,
                            reps: "12-15",
                            image: "/images/BenchPressW.png"
                        }
                    ],
                },
            ],
        },
        {
            id: 9,
            name: "Full Body Reset",
            goal: "Stay Fit",
            duration: "4 Days / Week",
            description: "Full body sessions for balance and conditioning.",
            image: "/images/FullBodyReset.png",
            days: [
                {
                    day: "Day 1",
                    exercises: [
                        {
                            name: "Push Ups",
                            duration: "10 mins",
                            sets: 4,
                            reps: "25",
                            image: "/images/Pushups.png"
                        },
                        {
                            name: "Squats",
                            duration: "10 mins",
                            sets: 4,
                            reps: "12-15",
                            image: "/images/SquadsW.png"
                        },
                        {
                            name: "Pull-Ups",
                            duration: "10 mins",
                            sets: 4,
                            reps: "12-15",
                            image: "/images/PullUpps.png"
                        },
                        {
                            name: "Russion Twists",
                            duration: "10 mins",
                            sets: 4,
                            reps: "12-15",
                            image: "/images/RussianTwists.png"
                        }
                    ],
                },
                {
                    day: "Day 2",
                    exercises: [
                        {
                            name: "Lunges",
                            duration: "10 mins",
                            sets: 4,
                            reps: "12-15",
                            image: "/images/Lunges.png"
                        },
                        {
                            name: "Bench Press",
                            duration: "10 mins",
                            sets: 4,
                            reps: "12-15",
                            image: "/images/BenchPressW.png"
                        },
                        {
                            name: "Mountain Climbers",
                            duration: "10 mins",
                            sets: 4,
                            reps: "12-15",
                            image: "/images/MountainClimbers.png"
                        }
                    ],
                },
                {
                    day: "Day 3",
                    exercises: [
                        {
                            name: "Chrunches",
                            duration: "10 mins",
                            sets: 4,
                            reps: "12-15",
                            image: "/images/Crunches.png"
                        },
                        {
                            name: "Overhead Shoulder Press",
                            duration: "10 mins",
                            sets: 4,
                            reps: "12-15",
                            image: "/images/OverHeadSholderPress.png"
                        },
                        {
                            name: "Tricep Dips (Chair)",
                            duration: "10 mins",
                            sets: 4,
                            reps: "12-15",
                            image: "/images/TricepDipsChair.png"
                        }
                    ],
                },
                {
                    day: "Day 4",
                    exercises: [
                        {
                            name: "Russion Twists",
                            duration: "10 mins",
                            sets: 4,
                            reps: "12-15",
                            image: "/images/RussianTwists.png"
                        },
                        {
                            name: "Mountain Climbers",
                            duration: "10 mins",
                            sets: 4,
                            reps: "12-15",
                            image: "/images/MountainClimbers.png"
                        },
                        {
                            name: "Dumbbell Incline Press",
                            duration: "10 mins",
                            sets: 4,
                            reps: "12-15",
                            image: "/images/DumbbellInclinePress.png"
                        },
                        {
                            name: "Dumbbell Chest Press",
                            duration: "8 mins",
                            sets: 3,
                            reps: "12-15",
                            image: "/images/DumbbellChestPress.png"
                        }
                    ],
                },
            ],
        },
        {
            id: 10,
            name: "Cardio Burn Challenge",
            goal: "Lose Weight",
            duration: "5 Days / Week",
            description: "A fast-paced cardio plan for fat loss.",
            image: "/images/CardioBurnChallange.png",
            days: [
                {
                    day: "Day 1",
                    exercises: [
                        {
                            name: "Russion Twists",
                            duration: "10 mins",
                            sets: 4,
                            reps: "12-15",
                            image: "/images/RussianTwists.png"
                        },
                        {
                            name: "Mountain Climbers",
                            duration: "10 mins",
                            sets: 4,
                            reps: "12-15",
                            image: "/images/MountainClimbers.png"
                        },
                        {
                            name: "Chrunches",
                            duration: "10 mins",
                            sets: 4,
                            reps: "12-15",
                            image: "/images/Crunches.png"
                        }
                    ],
                },
                {
                    day: "Day 2",
                    exercises: [
                        {
                            name: "Ab Bicycle",
                            duration: "10 mins",
                            sets: 4,
                            reps: "12-15",
                            image: "/images/AbBusicle.png"

                        },
                        {
                            name: "Power Jacks",
                            duration: "10 mins",
                            sets: 4,
                            reps: "15-20",
                            image: "/images/PowerJacks.png"
                        },
                        {
                            name: "Dumbbell Incline Press",
                            duration: "10 mins",
                            sets: 4,
                            reps: "12-15",
                            image: "/images/DumbbellInclinePress.png"
                        }
                    ],
                },
                {
                    day: "Day 3",
                    exercises: [
                        {
                            name: "Mountain Climbers",
                            duration: "10 mins",
                            sets: 4,
                            reps: "12-15",
                            image: "/images/MountainClimbers.png"
                        },
                        {
                            name: "Power Jacks",
                            duration: "10 mins",
                            sets: 4,
                            reps: "15-20",
                            image: "/images/PowerJacks.png"
                        },
                        {
                            name: "Overhead Shoulder Press",
                            duration: "10 mins",
                            sets: 4,
                            reps: "12-15",
                            image: "/images/OverHeadSholderPress.png"
                        },
                        {
                            name: "Russion Twists",
                            duration: "10 mins",
                            sets: 4,
                            reps: "12-15",
                            image: "/images/RussianTwists.png"
                        }
                    ],
                },
                {
                    day: "Day 4",
                    exercises: [
                        {
                            name: "Russion Twists",
                            duration: "10 mins",
                            sets: 4,
                            reps: "12-15",
                            image: "/images/RussianTwists.png"
                        },
                        {
                            name: "Overhead Shoulder Press",
                            duration: "10 mins",
                            sets: 4,
                            reps: "12-15",
                            image: "/images/OverHeadSholderPress.png"
                        },
                        {
                            name: "Power Jacks",
                            duration: "10 mins",
                            sets: 4,
                            reps: "15-20",
                            image: "/images/PowerJacks.png"
                        },
                        {
                            name: "Mountain Climbers",
                            duration: "10 mins",
                            sets: 4,
                            reps: "12-15",
                            image: "/images/MountainClimbers.png"
                        }
                    ],
                },
            ],
        },
    ];

    const filteredPrograms = useMemo(() => {
        return programs.filter((program) => {
            const matchesGoal = selectedGoal
                ? program.goal.toLowerCase() === selectedGoal.toLowerCase()
                : true;

            const matchesSearch = program.name
                .toLowerCase()
                .includes(searchTerm.toLowerCase());

            return matchesGoal && matchesSearch;
        });
    }, [programs, selectedGoal, searchTerm]);


    const indexOfLast = currentPage * programsPerPage;
    const indexOfFirst = indexOfLast - programsPerPage;

    const currentPrograms = filteredPrograms.slice(indexOfFirst, indexOfLast);

    const totalPages = Math.ceil(filteredPrograms.length / programsPerPage);

    const toggleFavorite = async (program) => {
        try {
            const token = localStorage.getItem("token");
            if (!token) return;

            const isFavorite = favoritePlans.some(
                (item) => String(item.id) === String(program.id)
            );

            if (isFavorite) {
                const res = await axios.delete(
                    `http://localhost:5000/api/users/favorites/${program.id}`,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    }
                );

                setFavoritePlans(res.data);
            } else {
                const res = await axios.post(
                    "http://localhost:5000/api/users/favorites",
                    {
                        id: program.id,
                        name: program.name,
                        goal: program.goal,
                        duration: program.duration,
                        description: program.description,
                        image: program.image,
                    },
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    }
                );

                setFavoritePlans(res.data);
            }
        } catch (error) {
            console.error("Error updating favorites:", error);
        }
    };

    useEffect(() => {
        const fetchFavorites = async () => {
            try {
                const token = localStorage.getItem("token");
                if (!token) return;

                const res = await axios.get("http://localhost:5000/api/users/favorites", {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

                setFavoritePlans(res.data);
            } catch (error) {
                console.error("Error fetching favorites:", error);
            }
        };

        fetchFavorites();
    }, []);

    useEffect(() => {
        if (openPlanId && !selectedProgram) {
            const found = programs.find(
                (p) => String(p.id) === String(openPlanId)
            );

            if (found) {
                setSelectedProgram(found);
                setSelectedDayIndex(0);
            }
        }
    }, [openPlanId, selectedProgram]);


    if (!selectedProgram) {
        return (
            <div className="page plans-page">
                <div className="plans-hero">
                    <h1>Workout Programs</h1>
                    <div className="plans-filters">
                        <input
                            type="text"
                            placeholder="Search programs..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />

                        <select
                            value={selectedGoal}
                            onChange={(e) => setSelectedGoal(e.target.value)}
                        >
                            <option value="">All Goals</option>
                            <option value="lose weight">Lose Weight</option>
                            <option value="build muscle">Build Muscle</option>
                            <option value="stay fit">Stay Fit</option>
                        </select>

                        <button
                            onClick={() => {
                                setSearchTerm("");
                                setSelectedGoal("");
                            }}
                        >
                            Clear
                        </button>
                    </div>
                    {goalFilter && (
                        <p className="plans-filter-label">
                            Showing programs for: <strong>{goalFilter}</strong>
                        </p>
                    )}
                    <p>Choose a program and explore the daily workout plan.</p>
                </div>


                <div className="program-grid">
                    {filteredPrograms.length === 0 ? (
                        <p className="home-muted-text">No programs found for this goal.</p>
                    ) : (
                        currentPrograms.map((program) => (
                            <div
                                key={program.id}
                                className="program-card"
                                onClick={() => {
                                    setSelectedProgram(program);
                                    setSelectedDayIndex(0);
                                }}
                            >
                                <img
                                    src={program.image}
                                    alt={program.name}
                                    className="program-image"
                                />
                                <button
                                    className="favorite-btn"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        toggleFavorite(program);
                                    }}
                                >
                                    {favoritePlans.some((item) => item.id === program.id) ? "❤️" : "🤍"}
                                </button>
                            </div>
                        ))
                    )}
                </div>

                <div className="pagination">
                    <button
                        onClick={() => setCurrentPage((prev) => prev - 1)}
                        disabled={currentPage === 1}
                    >
                        Prev
                    </button>

                    {[...Array(totalPages)].map((_, index) => {
                        const pageNumber = index + 1;

                        return (
                            <button
                                key={pageNumber}
                                className={currentPage === pageNumber ? "active-page" : ""}
                                onClick={() => setCurrentPage(pageNumber)}
                            >
                                {pageNumber}
                            </button>
                        );
                    })}

                    <button
                        onClick={() => setCurrentPage((prev) => prev + 1)}
                        disabled={currentPage === totalPages}
                    >
                        Next
                    </button>
                </div>
            </div>
        );
    }

    const selectedDay = selectedProgram.days[selectedDayIndex];

    return (

        <div className="page plans-page">
            {/*<div className="plan-hero">*/}
            {/*    <img src={selectedProgram.image} alt={selectedProgram.name} />*/}
            {/*</div>*/}

            {/*<button*/}
            {/*    className="back-btn"*/}
            {/*    onClick={() => {*/}
            {/*        navigate("/plans", { replace: true });*/}
            {/*        setTimeout(() => {*/}
            {/*            setSelectedProgram(null);*/}
            {/*            setSelectedDayIndex(0);*/}
            {/*        }, 0);*/}
            {/*    }}*/}
            {/*>*/}
            {/*    ← Back to Programs*/}
            {/*</button>*/}
            {/*<div className="day-tabs">*/}
            {/*    {selectedProgram.days.map((day, index) => (*/}
            {/*        <button*/}
            {/*            key={index}*/}
            {/*            className={`day-tab ${index === selectedDayIndex ? "active-day" : ""}`}*/}
            {/*            onClick={() => setSelectedDayIndex(index)}*/}
            {/*        >*/}
            {/*            {day.day}*/}
            {/*        </button>*/}
            {/*    ))}*/}
            {/*</div>*/}


            <div className="plan-hero">
                <img src={selectedProgram.image} alt={selectedProgram.name} />

                <button
                    className="back-btn hero-back-btn"
                    onClick={() => {
                        navigate("/plans", { replace: true });
                        setTimeout(() => {
                            setSelectedProgram(null);
                            setSelectedDayIndex(0);
                        }, 0);
                    }}
                >
                    ← Back to Programs
                </button>

                <div className="hero-day-tabs">
                    {selectedProgram.days.map((day, index) => (
                        <button
                            key={index}
                            className={`day-tab hero-day-btn ${index === selectedDayIndex ? "active-day" : ""}`}
                            onClick={() => setSelectedDayIndex(index)}
                        >
                            {day.day}
                        </button>
                    ))}
                </div>
            </div>


            <div className="exercise-list">
                {selectedDay.exercises.map((exercise, index) => (
                    <div key={index} className="exercise-row">
                        <div className="exercise-info">
                            <h3>{exercise.name}</h3>

                            <div className="exercise-meta-row">
                                <span className="exercise-badge">{exercise.duration}</span>
                                <span className="exercise-badge">{exercise.sets} sets</span>
                                <span className="exercise-badge">{exercise.reps} reps</span>
                            </div>
                        </div>

                        <div className="exercise-image-box">
                            <img
                                src={exercise.image}
                                alt={exercise.name}
                                className="exercise-image"
                            />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default Plans;