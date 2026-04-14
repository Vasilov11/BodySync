import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

function Profile() {
    const user = JSON.parse(localStorage.getItem("user")) || {};
    const [favoritePlans, setFavoritePlans] = useState([]);

    const [workouts, setWorkouts] = useState([]);

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
            setUpdateMessage("Error updating profile");
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