import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";


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



    const navigate = useNavigate();



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



    if (!user) {
        return (
            <div className="page home-page">
                <section className="home-hero-smart">

                    <div className="home-hero-content">
                        <span className="home-badge">Fitness Web App</span>
                        <h1>Track your fitness. Follow plans. Build better habits.</h1>
                        <p>
                            Create your profile, choose your goal, explore workout plans,
                            and monitor your progress with sessions, calories, BMI, and more.
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
                    </div>

                    <div className="home-hero-side">
                        <div className="home-glass-card">
                            <h3>Why use Fitness Tracker?</h3>
                            <ul>
                                <li>Track workouts and sessions</li>
                                <li>View calories and activity history</li>
                                <li>Monitor BMI and profile stats</li>
                                <li>Choose plans based on your goal</li>
                            </ul>
                        </div>
                    </div>
                </section>

                <section className="home-goals-section">
                    <h2>Choose Your Goal</h2>
                    <div className="home-goals-grid">
                        <Link
                            to="/plans?goal=build%20muscle"
                            className="home-goal-card home-goal-link"
                        >
                            <h3>Build Muscle</h3>
                            <p>Strength-focused plans with progressive overload and structure.</p>
                        </Link>

                        <Link
                            to="/plans?goal=lose%20weight"
                            className="home-goal-card home-goal-link"
                        >
                            <h3>Lose Weight</h3>
                            <p>Burn calories with cardio, HIIT, and fat-loss routines.</p>
                        </Link>

                        <Link
                            to="/plans?goal=stay%20fit"
                            className="home-goal-card home-goal-link"
                        >
                            <h3>Stay Fit</h3>
                            <p>Maintain an active lifestyle with balanced training plans.</p>
                        </Link>
                    </div>
                </section>
            </div>
        );
    }

    return (
        <div className="page home-page">
            <section className="home-hero-smart logged-in-hero">
                <div className="home-hero-content">
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

                <div className="home-glass-card goal-card">
                    <h3>Your Current Goal</h3>

                    <div className="goal-big-text">
                        {user.goal || "No Goal"}
                    </div>
                </div>
            </section>

            <section className="home-stats-section">
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
                        <div className="home-latest-workout">
                            <h3>{latestWorkout.name}</h3>
                            <p>Date: {latestWorkout.date}</p>
                            <p>Total Calories: {latestWorkout.totalCalories} kcal</p>
                            <p>Exercises: {latestWorkout.exercises.length}</p>

                            <div className="home-chip-list">
                                {latestWorkout.exercises?.map((exercise) => (
                                    <span key={exercise.id} className="home-chip">
                                        {exercise.name || exercise.exercise}
                                </span>
                                ))}
                            </div>
                        </div>
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