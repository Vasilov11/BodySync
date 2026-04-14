import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import heroImage from "../assets/home-page.png";

function Home() {
    const user = JSON.parse(localStorage.getItem("user")) || {};

    const [workouts, setWorkouts] = useState([]);

    const totalSessions = workouts.length;

    const totalCalories = workouts.reduce(
        (sum, session) => sum + Number(session.totalCalories || 0),
        0
    );

    const latestWorkout = useMemo(() => {
        if (workouts.length === 0) return null;

        return [...workouts].sort((a, b) => {
            const dateDiff = new Date(b.date) - new Date(a.date);

            if (dateDiff !== 0) return dateDiff;

            return new Date(b.createdAt) - new Date(a.createdAt);
        })[0];
    }, [workouts]);

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

    const bmi = useMemo(() => {
        if (!user?.height || !user?.weight) return null;
        const heightInMeters = Number(user.height) / 100;
        const bmiValue = Number(user.weight) / (heightInMeters * heightInMeters);
        return bmiValue.toFixed(1);
    }, [user]);

    const recommendedPlans = useMemo(() => {
        if (!user?.goal) return [];

        if (user.goal === "build muscle") {
            return [
                {
                    title: "Strength Builder",
                    description: "Compound lifts, hypertrophy work, and progressive overload.",
                },
                {
                    title: "Lean Muscle Program",
                    description: "Clean muscle gain with balanced weekly splits.",
                },
            ];
        }

        if (user.goal === "lose weight") {
            return [
                {
                    title: "Fat Burn HIIT",
                    description: "High-intensity sessions for calorie burn and conditioning.",
                },
                {
                    title: "Cardio Burn Challenge",
                    description: "Fast-paced cardio workouts focused on fat loss.",
                },
            ];
        }

        return [
            {
                title: "Stay Fit Essentials",
                description: "Balanced workouts for health, energy, and consistency.",
            },
            {
                title: "Active Lifestyle Plan",
                description: "Simple sessions to keep you active and feeling good.",
            },
        ];
    }, [user]);

    if (!user || !user.fullName) {
        return (
            <div className="page home-page">
                <section className="home-hero-smart guest-hero">
                    <div className="home-hero-left-wrap">
                        <div className="home-hero-content hero-floating-card guest-floating-card">
                            <span className="home-badge">Fitness Web App</span>

                            <h1>
                                Build better habits. Track every workout. Stay consistent.
                            </h1>

                            <p>
                                BodySync helps you organize your workouts, follow goal-based plans,
                                monitor calories and BMI, and keep your progress in one clean place.
                            </p>

                            <div className="home-hero-buttons">
                                <Link to="/register" className="home-primary-btn">
                                    Get Started
                                </Link>

                                <Link to="/login" className="home-secondary-btn">
                                    Login
                                </Link>

                                <Link to="/plans" className="home-secondary-btn">
                                    Explore Plans
                                </Link>
                            </div>

                            {/* WHY SECTION */}
                            <div className="guest-info-inline">
                                <h3>Why choose BodySync?</h3>

                                <div className="guest-info-list">
                                    <div className="guest-info-item">
                                        <span className="guest-info-icon">✓</span>
                                        <p>Track workouts and sessions easily</p>
                                    </div>

                                    <div className="guest-info-item">
                                        <span className="guest-info-icon">✓</span>
                                        <p>Follow plans based on your goal</p>
                                    </div>

                                    <div className="guest-info-item">
                                        <span className="guest-info-icon">✓</span>
                                        <p>Monitor calories, BMI, and progress</p>
                                    </div>

                                    <div className="guest-info-item">
                                        <span className="guest-info-icon">✓</span>
                                        <p>Stay consistent and motivated</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                <section className="guest-goals-section">
                    <div className="guest-section-header">
                        <span className="guest-section-badge">Choose Your Goal</span>

                        <h2>Start with the plan that fits you best</h2>

                        <p>
                            Pick your main goal and explore workout plans designed for your progress.
                        </p>
                    </div>

                    <div className="home-goals-grid guest-goals-grid">
                        <Link
                            to="/plans?goal=build%20muscle"
                            className="home-goal-card home-goal-link guest-goal-card"
                        >
                            <h3>Build Muscle</h3>
                            <p>
                                Strength-focused plans with progressive overload and structured workouts.
                            </p>
                        </Link>

                        <Link
                            to="/plans?goal=lose%20weight"
                            className="home-goal-card home-goal-link guest-goal-card"
                        >
                            <h3>Lose Weight</h3>
                            <p>
                                Burn calories with cardio, HIIT, and efficient fat-loss routines.
                            </p>
                        </Link>

                        <Link
                            to="/plans?goal=stay%20fit"
                            className="home-goal-card home-goal-link guest-goal-card"
                        >
                            <h3>Stay Fit</h3>
                            <p>
                                Maintain an active lifestyle with balanced training and healthy habits.
                            </p>
                        </Link>
                    </div>
                </section>
            </div>
        );
    }

    return (
        <div className="page home-page">
            <section className="home-hero-smart logged-in-hero">
                <div className="home-hero-left-wrap">
                    <div className="home-hero-content hero-floating-card">
                        <span className="home-badge">Welcome Back</span>
                        <h1>{user.fullName ? `Hello, ${user.fullName}` : "Welcome back"}</h1>
                        <p>
                            Keep going with your fitness journey. Check your stats, continue
                            your workout plan, and stay consistent.
                        </p>

                        <div className="home-hero-buttons">
                            <Link to="/workouts" className="home-primary-btn">
                                Start Workout
                            </Link>
                            <Link to="/progress" className="home-secondary-btn">
                                View Progress
                            </Link>
                            <Link to="/profile" className="home-secondary-btn">
                                Open Profile
                            </Link>
                            <Link to="/plans" className="home-secondary-btn">
                                Browse Plans
                            </Link>
                        </div>
                    </div>
                </div>

                <div className="hero-image-side">
                    <img src={heroImage} alt="Fitness hero" className="hero-side-image" />
                </div>
            </section>

            <section className="home-stats-section floating-stats">
                <div className="home-stats-grid">
                    <div className="home-stat-card">
                        <span>Total Sessions</span>
                        <strong>{totalSessions}</strong>
                    </div>

                    <div className="home-stat-card">
                        <span>Total Calories Burned</span>
                        <strong>{totalCalories.toFixed(1)} kcal</strong>
                    </div>

                    <div className="home-stat-card">
                        <span>BMI</span>
                        <strong>{bmi || "—"}</strong>
                    </div>

                    <div className="home-stat-card">
                        <span>Goal</span>
                        <strong>{user.goal || "—"}</strong>
                    </div>
                </div>
            </section>

            <section className="home-dashboard-grid">
                <div className="home-panel">
                    <h2>Latest Workout</h2>

                    {latestWorkout ? (
                        <Link
                            to={`/workouts?session=${latestWorkout._id}`}
                            className="latest-workout-link"
                        >
                            <div className="home-latest-workout clickable-card">
                                <h3>{latestWorkout.name}</h3>
                                <p>Date: {latestWorkout.date}</p>
                                <p>Total Calories: {latestWorkout.totalCalories} kcal</p>
                                <p>Exercises: {latestWorkout.exercises.length}</p>

                                <div className="home-chip-list">
                                    {latestWorkout.exercises?.map((exercise, index) => (
                                        <span key={exercise.id || index} className="home-chip">
                            {exercise.name || exercise.exercise}
                        </span>
                                    ))}
                                </div>
                            </div>
                        </Link>
                    ) : (
                        <p className="home-muted-text">No workout sessions yet.</p>
                    )}
                </div>

                <div className="home-panel">
                    <h2>Recommended For You</h2>
                    {recommendedPlans.length > 0 ? (
                        <div className="home-recommendations">
                            {recommendedPlans.map((plan, index) => (
                                <Link
                                    key={index}
                                    to={`/plans?goal=${encodeURIComponent(user.goal)}`}
                                    className="home-recommendation-card clickable-card"
                                >
                                    <h3>{plan.title}</h3>
                                    <p>{plan.description}</p>
                                </Link>
                            ))}
                        </div>
                    ) : (
                        <p className="home-muted-text">
                            Set your goal in Profile to get recommendations.
                        </p>
                    )}
                </div>
            </section>
        </div>
    );
}

export default Home;