import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

function Profile() {
    const user = JSON.parse(localStorage.getItem("user")) || {};
    const userId = user._id || user.id;

    const [favoritePlans, setFavoritePlans] = useState([]);
    const [workouts, setWorkouts] = useState([]);
    const [entries, setEntries] = useState([]);

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
                console.error("Error fetching favorite plans:", error);
            }
        };

        fetchFavorites();
    }, []);

    useEffect(() => {
        const fetchWorkouts = async () => {
            try {
                const token = localStorage.getItem("token");
                if (!token) return;

                const res = await axios.get("http://localhost:5000/api/workouts", {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

                setWorkouts(res.data);
            } catch (error) {
                console.error("Error fetching workouts:", error);
            }
        };

        fetchWorkouts();
    }, []);

    useEffect(() => {
        const fetchFoodEntries = async () => {
            try {
                if (!userId) return;

                const res = await axios.get(`http://localhost:5000/api/food/${userId}`);
                setEntries(res.data);
            } catch (error) {
                console.error("Error fetching food entries:", error);
            }
        };

        fetchFoodEntries();
    }, [userId]);

    const handleRemoveFavorite = async (planId) => {
        try {
            const token = localStorage.getItem("token");
            if (!token) return;

            const res = await axios.delete(
                `http://localhost:5000/api/users/favorites/${planId}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            setFavoritePlans(res.data);
        } catch (error) {
            console.error("Error removing favorite:", error);
        }
    };

    const [formData, setFormData] = useState({
        age: user?.age || "",
        gender: user?.gender || "",
        height: user?.height || "",
        weight: user?.weight || "",
        goal: user?.goal || "",
    });

    const [updateMessage, setUpdateMessage] = useState("");

    const handleChange = (e) => {
        setFormData((prev) => ({
            ...prev,
            [e.target.name]: e.target.value,
        }));
    };

    const handleProfileUpdate = async () => {
        try {
            const token = localStorage.getItem("token");

            if (!token) {
                setUpdateMessage("No token found. Please login again.");
                return;
            }

            const res = await axios.put(
                "http://localhost:5000/api/users/update-profile",
                formData,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            localStorage.setItem("user", JSON.stringify(res.data.user));
            setUpdateMessage("Profile updated successfully!");
            window.location.reload();
        } catch (err) {
            console.error("PROFILE UPDATE ERROR:", err.response?.data || err.message);
            setUpdateMessage(
                err.response?.data?.message || "Error updating profile"
            );
        }
    };

    const totalSessions = workouts.length;

    const totalExercises = workouts.reduce(
        (sum, workout) => sum + workout.exercises.length,
        0
    );

    const totalCalories = workouts.reduce(
        (sum, workout) => sum + Number(workout.totalCalories || 0),
        0
    );

    const streak = useMemo(() => {
        if (workouts.length === 0) return 0;

        const uniqueDates = [...new Set(workouts.map((workout) => workout.date))]
            .sort((a, b) => new Date(b) - new Date(a));

        let currentStreak = 0;
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        for (let i = 0; i < uniqueDates.length; i++) {
            const expectedDate = new Date(today);
            expectedDate.setDate(today.getDate() - i);

            const workoutDate = new Date(uniqueDates[i]);
            workoutDate.setHours(0, 0, 0, 0);

            if (workoutDate.getTime() === expectedDate.getTime()) {
                currentStreak++;
            } else {
                break;
            }
        }

        return currentStreak;
    }, [workouts]);

    const latestWorkout = useMemo(() => {
        if (workouts.length === 0) return null;

        return [...workouts].sort((a, b) => {
            const dateDiff = new Date(b.date) - new Date(a.date);

            if (dateDiff !== 0) return dateDiff;

            return new Date(b.createdAt) - new Date(a.createdAt);
        })[0];
    }, [workouts]);

    const bmi = useMemo(() => {
        if (!formData.height || !formData.weight) return null;

        const heightInMeters = Number(formData.height) / 100;
        const bmiValue =
            Number(formData.weight) / (heightInMeters * heightInMeters);

        return bmiValue.toFixed(1);
    }, [formData.height, formData.weight]);

    const bmiStatus = useMemo(() => {
        if (!bmi) return "Not enough data";

        const bmiNum = Number(bmi);

        if (bmiNum < 18.5) return "Underweight";
        if (bmiNum < 25) return "Normal";
        if (bmiNum < 30) return "Overweight";
        return "Obese";
    }, [bmi]);

    const today = new Date().toISOString().split("T")[0];

    const todayEntries = entries.filter(
        (entry) => entry.date?.split("T")[0] === today
    );

    const todayTotals = todayEntries.reduce(
        (sum, entry) => {
            sum.calories += Number(entry.totalCalories || 0);
            sum.protein += Number(entry.totalProtein || 0);
            sum.carbs += Number(entry.totalCarbs || 0);
            sum.fat += Number(entry.totalFat || 0);
            return sum;
        },
        { calories: 0, protein: 0, carbs: 0, fat: 0 }
    );

    const recommendations = useMemo(() => {
        const weight = Number(formData.weight || 0);
        const height = Number(formData.height || 0);
        const age = Number(formData.age || 0);
        const gender = (formData.gender || "").toLowerCase();
        const goal = (formData.goal || "").toLowerCase();

        if (!weight || !height || !age || !gender) {
            return { calories: 0, protein: 0, carbs: 0, fat: 0 };
        }

        let bmr = 0;

        if (gender === "male") {
            bmr = 10 * weight + 6.25 * height - 5 * age + 5;
        } else {
            bmr = 10 * weight + 6.25 * height - 5 * age - 161;
        }

        const activityFactor = 1.55;
        let calories = bmr * activityFactor;

        if (goal === "lose weight") calories -= 300;
        if (goal === "build muscle") calories += 250;

        let protein = 1.6 * weight;
        if (goal === "build muscle") protein = 2.0 * weight;
        if (goal === "lose weight") protein = 1.8 * weight;

        const fat = 0.8 * weight;
        const carbs = Math.max((calories - protein * 4 - fat * 9) / 4, 0);

        return {
            calories: Number(calories.toFixed(0)),
            protein: Number(protein.toFixed(1)),
            carbs: Number(carbs.toFixed(1)),
            fat: Number(fat.toFixed(1)),
        };
    }, [formData]);

    const remaining = {
        calories: Math.max(recommendations.calories - todayTotals.calories, 0),
        protein: Math.max(recommendations.protein - todayTotals.protein, 0),
        carbs: Math.max(recommendations.carbs - todayTotals.carbs, 0),
        fat: Math.max(recommendations.fat - todayTotals.fat, 0),
    };

    const calorieProgressPercent =
        recommendations.calories > 0
            ? Math.min((todayTotals.calories / recommendations.calories) * 100, 100)
            : 0;

    const recommendedMacroPercents = {
        carbs:
            recommendations.carbs > 0
                ? ((recommendations.carbs * 4) / recommendations.calories) * 100
                : 0,
        fat:
            recommendations.fat > 0
                ? ((recommendations.fat * 9) / recommendations.calories) * 100
                : 0,
        protein:
            recommendations.protein > 0
                ? ((recommendations.protein * 4) / recommendations.calories) * 100
                : 0,
    };

    const actualTotalMacroCalories =
        todayTotals.carbs * 4 + todayTotals.fat * 9 + todayTotals.protein * 4;

    const actualMacroPercents = {
        carbs:
            actualTotalMacroCalories > 0
                ? ((todayTotals.carbs * 4) / actualTotalMacroCalories) * 100
                : 0,
        fat:
            actualTotalMacroCalories > 0
                ? ((todayTotals.fat * 9) / actualTotalMacroCalories) * 100
                : 0,
        protein:
            actualTotalMacroCalories > 0
                ? ((todayTotals.protein * 4) / actualTotalMacroCalories) * 100
                : 0,
    };

    if (!user) {
        return (
            <div className="page profile-page">
                <div className="profile-empty-card">
                    <h1>No Profile Found</h1>
                    <p>Please register or login to view your profile.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="page profile-page">
            <div className="profile-hero">
                <div className="profile-avatar">
                    {user.fullName ? user.fullName.charAt(0).toUpperCase() : "U"}
                </div>

                <div className="profile-hero-info">
                    <h1>{user.fullName}</h1>
                    <p>{user.email}</p>
                    <span className="profile-goal-badge">{user.goal || "No goal selected"}</span>
                </div>
            </div>

            <div className="profile-grid">
                <div className="profile-card">
                    <h2>Personal Information</h2>
                    <div className="profile-info-list">
                        <div className="profile-info-item">
                            <span>Age</span>
                            <input
                                type="number"
                                name="age"
                                value={formData.age}
                                onChange={handleChange}
                            />
                        </div>

                        <div className="profile-info-item">
                            <span>Gender</span>
                            <select
                                name="gender"
                                value={formData.gender}
                                onChange={handleChange}
                            >
                                <option value="">Select Gender</option>
                                <option value="male">Male</option>
                                <option value="female">Female</option>
                            </select>
                        </div>

                        <div className="profile-info-item">
                            <span>Height</span>
                            <input
                                type="number"
                                name="height"
                                value={formData.height}
                                onChange={handleChange}
                            />
                        </div>

                        <div className="profile-info-item">
                            <span>Weight</span>
                            <input
                                type="number"
                                name="weight"
                                value={formData.weight}
                                onChange={handleChange}
                            />
                        </div>

                        <div className="profile-info-item">
                            <span>Goal</span>
                            <select
                                name="goal"
                                value={formData.goal}
                                onChange={handleChange}
                            >
                                <option value="lose weight">Lose Weight</option>
                                <option value="build muscle">Build Muscle</option>
                                <option value="stay fit">Stay Fit</option>
                            </select>
                        </div>

                        <button className="goal-btn" onClick={handleProfileUpdate}>
                            Save Profile
                        </button>

                        {updateMessage && <p className="success-message">{updateMessage}</p>}
                    </div>
                </div>

                <div className="profile-card">
                    <h2>Fitness Summary</h2>
                    <div className="profile-stats-grid">
                        <div className="profile-stat-box">
                            <span>Total Sessions</span>
                            <strong>{totalSessions}</strong>
                        </div>
                        <div className="profile-stat-box">
                            <span>Total Exercises</span>
                            <strong>{totalExercises}</strong>
                        </div>
                        <div className="profile-stat-box">
                            <span>Total Calories Burned</span>
                            <strong>{totalCalories.toFixed(1)} kcal</strong>
                        </div>
                        <div className="profile-stat-box">
                            <span>BMI</span>
                            <strong>{bmi ? `${bmi} (${bmiStatus})` : "—"}</strong>
                        </div>
                        <div className="profile-stat-box">
                            <span>Workout Streak</span>
                            <strong>{streak} day{streak !== 1 ? "s" : ""}</strong>
                        </div>
                    </div>
                </div>
            </div>

            <section className="food-insights-grid profile-food-insights">
                <div className="food-dark-card food-calorie-card">
                    <div className="food-dark-card-header">
                        <h2>Daily Calories</h2>
                        <span className="food-dark-card-subtitle">{today}</span>
                    </div>

                    {recommendations.calories === 0 ? (
                        <p className="food-dark-muted">
                            Complete your profile with age, gender, height, weight, and goal.
                        </p>
                    ) : (
                        <>
                            <div className="food-calorie-main">
                                <div className="food-calorie-big">
                                    {todayTotals.calories.toFixed(0)}
                                </div>
                                <div className="food-calorie-unit">Cal</div>
                            </div>

                            <p className="food-target-text">
                                Target {recommendations.calories} kcal
                            </p>

                            <div className="food-progress-track">
                                <div
                                    className="food-progress-fill"
                                    style={{ width: `${calorieProgressPercent}%` }}
                                />
                            </div>

                            <div className="food-progress-labels">
                                <span>0</span>
                                <span>{recommendations.calories}</span>
                            </div>

                            <div className="food-target-range-row">
                                <span className="food-range-label">Target range</span>
                                <strong>
                                    {Math.round(recommendations.calories * 0.9)} -{" "}
                                    {Math.round(recommendations.calories * 1.1)} kcal
                                </strong>
                            </div>

                            <div className="food-mini-stats">
                                <div className="food-mini-stat">
                                    <span>Recommended</span>
                                    <strong>{recommendations.calories} kcal</strong>
                                </div>
                                <div className="food-mini-stat">
                                    <span>Remaining</span>
                                    <strong>{remaining.calories.toFixed(1)} kcal</strong>
                                </div>
                            </div>
                        </>
                    )}
                </div>

                <div className="food-dark-card food-nutrition-card">
                    <div className="food-dark-card-header">
                        <h2>Nutrition Info</h2>
                    </div>

                    {recommendations.calories === 0 ? (
                        <p className="food-dark-muted">
                            Add profile details first to calculate macro targets.
                        </p>
                    ) : (
                        <>
                            <div className="food-macro-top-row">
                                <div className="food-macro-top-item">
                                    <span className="macro-dot carb-dot" />
                                    <div>
                                        <p>Carb</p>
                                        <strong>{todayTotals.carbs.toFixed(1)} g</strong>
                                    </div>
                                </div>

                                <div className="food-macro-top-item">
                                    <span className="macro-dot fat-dot" />
                                    <div>
                                        <p>Fat</p>
                                        <strong>{todayTotals.fat.toFixed(1)} g</strong>
                                    </div>
                                </div>

                                <div className="food-macro-top-item">
                                    <span className="macro-dot protein-dot" />
                                    <div>
                                        <p>Protein</p>
                                        <strong>{todayTotals.protein.toFixed(1)} g</strong>
                                    </div>
                                </div>
                            </div>

                            <div className="food-macro-compare-grid">
                                <div className="food-macro-box">
                                    <h3>Recommended</h3>

                                    <div className="food-macro-bar-group">
                                        <span>Carbs</span>
                                        <div className="food-macro-line">
                                            <div
                                                className="food-macro-line-fill carb-fill"
                                                style={{ width: `${recommendedMacroPercents.carbs}%` }}
                                            />
                                        </div>
                                        <strong>{recommendedMacroPercents.carbs.toFixed(0)}%</strong>
                                    </div>

                                    <div className="food-macro-bar-group">
                                        <span>Fat</span>
                                        <div className="food-macro-line">
                                            <div
                                                className="food-macro-line-fill fat-fill"
                                                style={{ width: `${recommendedMacroPercents.fat}%` }}
                                            />
                                        </div>
                                        <strong>{recommendedMacroPercents.fat.toFixed(0)}%</strong>
                                    </div>

                                    <div className="food-macro-bar-group">
                                        <span>Protein</span>
                                        <div className="food-macro-line">
                                            <div
                                                className="food-macro-line-fill protein-fill"
                                                style={{ width: `${recommendedMacroPercents.protein}%` }}
                                            />
                                        </div>
                                        <strong>{recommendedMacroPercents.protein.toFixed(0)}%</strong>
                                    </div>
                                </div>

                                <div className="food-macro-box">
                                    <h3>Actual</h3>

                                    <div className="food-macro-bar-group">
                                        <span>Carbs</span>
                                        <div className="food-macro-line">
                                            <div
                                                className="food-macro-line-fill carb-fill"
                                                style={{ width: `${actualMacroPercents.carbs}%` }}
                                            />
                                        </div>
                                        <strong>{actualMacroPercents.carbs.toFixed(0)}%</strong>
                                    </div>

                                    <div className="food-macro-bar-group">
                                        <span>Fat</span>
                                        <div className="food-macro-line">
                                            <div
                                                className="food-macro-line-fill fat-fill"
                                                style={{ width: `${actualMacroPercents.fat}%` }}
                                            />
                                        </div>
                                        <strong>{actualMacroPercents.fat.toFixed(0)}%</strong>
                                    </div>

                                    <div className="food-macro-bar-group">
                                        <span>Protein</span>
                                        <div className="food-macro-line">
                                            <div
                                                className="food-macro-line-fill protein-fill"
                                                style={{ width: `${actualMacroPercents.protein}%` }}
                                            />
                                        </div>
                                        <strong>{actualMacroPercents.protein.toFixed(0)}%</strong>
                                    </div>
                                </div>
                            </div>

                            <div className="food-remaining-macro-grid">
                                <div className="food-remaining-card">
                                    <span>Remaining Carbs</span>
                                    <strong>{remaining.carbs.toFixed(1)} g</strong>
                                </div>
                                <div className="food-remaining-card">
                                    <span>Remaining Fat</span>
                                    <strong>{remaining.fat.toFixed(1)} g</strong>
                                </div>
                                <div className="food-remaining-card">
                                    <span>Remaining Protein</span>
                                    <strong>{remaining.protein.toFixed(1)} g</strong>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </section>

            <div className="profile-card">
                <h2>Recent Activity</h2>

                {latestWorkout ? (
                    <Link
                        to={`/workouts?session=${latestWorkout._id}`}
                        className="latest-workout-link"
                    >
                        <div className="latest-workout-box">
                            <div className="latest-workout-top">
                                <div>
                                    <h3>{latestWorkout.name}</h3>
                                    <p>Date: {latestWorkout.date}</p>
                                </div>

                                <div className="latest-workout-calories">
                                    {latestWorkout.totalCalories} kcal
                                </div>
                            </div>

                            <div className="latest-workout-exercises">
                                {latestWorkout.exercises.map((exercise) => (
                                    <div key={exercise._id} className="latest-exercise-chip">
                                        {exercise.exercise}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </Link>
                ) : (
                    <p className="profile-muted-text">
                        No workout sessions saved yet.
                    </p>
                )}
            </div>

            <div className="profile-card favorite-plans-section">
                <h2>Favorite Plans</h2>

                {favoritePlans.length > 0 ? (
                    <div className="favorite-plans-grid">
                        {favoritePlans.map((plan) => (
                            <div key={plan.id || plan._id} className="favorite-plan-card-wrapper">
                                <button
                                    className="remove-favorite-btn"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        handleRemoveFavorite(plan.id);
                                    }}
                                >
                                    ✕
                                </button>

                                <Link
                                    to={`/plans?open=${plan.id}`}
                                    className="favorite-plan-visual-card"
                                >
                                    <img
                                        src={plan.image}
                                        alt={plan.name}
                                        className="favorite-plan-image"
                                    />
                                </Link>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="profile-muted-text">No favorite plans yet.</p>
                )}
            </div>
        </div>
    );
}

export default Profile;