import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip,
    CartesianGrid,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
    Legend,
    LineChart,
    Line,
} from "recharts";
import { useNavigate } from "react-router-dom";

function Progress() {
    const [filter, setFilter] = useState("all");
    const [workouts, setWorkouts] = useState([]);
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

    const filteredSessions = useMemo(() => {
        const today = new Date();
        today.setHours(23, 59, 59, 999);

        return workouts.filter((session) => {
            const sessionDate = new Date(session.date);
            sessionDate.setHours(12, 0, 0, 0);

            if (filter === "today") {
                const now = new Date();
                return sessionDate.toDateString() === now.toDateString();
            }

            if (filter === "7days") {
                const sevenDaysAgo = new Date();
                sevenDaysAgo.setDate(today.getDate() - 7);
                sevenDaysAgo.setHours(0, 0, 0, 0);
                return sessionDate >= sevenDaysAgo && sessionDate <= today;
            }

            if (filter === "30days") {
                const thirtyDaysAgo = new Date();
                thirtyDaysAgo.setDate(today.getDate() - 30);
                thirtyDaysAgo.setHours(0, 0, 0, 0);
                return sessionDate >= thirtyDaysAgo && sessionDate <= today;
            }

            return true;
        });
    }, [workouts, filter]);

    const totalSessions = filteredSessions.length;

    const totalExercises = filteredSessions.reduce(
        (sum, session) => sum + session.exercises.length,
        0
    );

    const totalCalories = filteredSessions.reduce(
        (sum, session) => sum + Number(session.totalCalories),
        0
    );

    const chartData = filteredSessions.map((session) => ({
        name: session.name,
        calories: Number(session.totalCalories),
    }));

    const pieDataMap = {};

    filteredSessions.forEach((session) => {
        session.exercises.forEach((exercise) => {
            const name = exercise.exercise;
            pieDataMap[name] = (pieDataMap[name] || 0) + 1;
        });
    });

    const pieData = Object.keys(pieDataMap).map((key) => ({
        name: key,
        value: pieDataMap[key],
    }));

    const lineDataMap = {};

    filteredSessions.forEach((session) => {
        const date = session.date;
        lineDataMap[date] =
            (lineDataMap[date] || 0) + Number(session.totalCalories);
    });

    const lineData = Object.keys(lineDataMap)
        .sort((a, b) => new Date(a) - new Date(b))
        .map((date) => ({
            date,
            calories: Number(lineDataMap[date].toFixed(1)),
        }));

    const COLORS = [
        "#2563eb",
        "#16a34a",
        "#dc2626",
        "#f59e0b",
        "#7c3aed",
        "#0891b2",
        "#ea580c",
        "#4f46e5",
        "#65a30d",
        "#db2777",
    ];

    const streak = useMemo(() => {
        if (workouts.length === 0) return 0;

        const uniqueDates = [...new Set(workouts.map((session) => session.date))]
            .sort((a, b) => new Date(b) - new Date(a));

        let currentStreak = 0;
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        for (let i = 0; i < uniqueDates.length; i++) {
            const expectedDate = new Date(today);
            expectedDate.setDate(today.getDate() - i);

            const sessionDate = new Date(uniqueDates[i]);
            sessionDate.setHours(0, 0, 0, 0);

            if (sessionDate.getTime() === expectedDate.getTime()) {
                currentStreak++;
            } else {
                break;
            }
        }

        return currentStreak;
    }, [workouts]);

    return (
        <div className="page progress-page">
            <div className="progress-hero-card">
                <h1>Progress Dashboard</h1>
                <p>
                    Track your workout sessions, calories burned, exercise distribution,
                    and recent history.
                </p>
            </div>

            <div className="progress-toolbar">
                <label htmlFor="dateFilter">Filter by:</label>
                <select
                    id="dateFilter"
                    value={filter}
                    onChange={(e) => setFilter(e.target.value)}
                >
                    <option value="all">All Time</option>
                    <option value="today">Today</option>
                    <option value="7days">Last 7 Days</option>
                    <option value="30days">Last 30 Days</option>
                </select>
            </div>

            <div className="progress-cards">
                <div className="progress-card">
                    <h3>Total Workout Sessions</h3>
                    <p>{totalSessions}</p>
                </div>

                <div className="progress-card">
                    <h3>Total Exercises Done</h3>
                    <p>{totalExercises}</p>
                </div>

                <div className="progress-card">
                    <h3>Total Calories Burned</h3>
                    <p>{totalCalories.toFixed(1)} kcal</p>
                </div>

                <div className="progress-card">
                    <h3>Workout Streak</h3>
                    <p>{streak} day{streak !== 1 ? "s" : ""}</p>
                </div>
            </div>

            <div className="progress-charts-grid">
                <div className="chart-section">
                    <h2>Calories per Workout</h2>
                    {chartData.length === 0 ? (
                        <p className="progress-muted-text">No data for chart.</p>
                    ) : (
                        <div className="chart-box">
                            <ResponsiveContainer width="100%" height={320}>
                                <BarChart data={chartData}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="name" />
                                    <YAxis />
                                    <Tooltip />
                                    <Bar dataKey="calories" fill="#2563eb" radius={[8, 8, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    )}
                </div>

                <div className="chart-section">
                    <h2>Calories by Date</h2>
                    {lineData.length === 0 ? (
                        <p className="progress-muted-text">No date data for chart.</p>
                    ) : (
                        <div className="chart-box">
                            <ResponsiveContainer width="100%" height={320}>
                                <LineChart data={lineData}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="date" />
                                    <YAxis />
                                    <Tooltip />
                                    <Line
                                        type="monotone"
                                        dataKey="calories"
                                        stroke="#16a34a"
                                        strokeWidth={3}
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    )}
                </div>
            </div>

            <div className="chart-section full-width-chart">
                <h2>Exercise Distribution</h2>
                {pieData.length === 0 ? (
                    <p className="progress-muted-text">No exercise data for chart.</p>
                ) : (
                    <div className="chart-box">
                        <ResponsiveContainer width="100%" height={360}>
                            <PieChart>
                                <Pie
                                    data={pieData}
                                    dataKey="value"
                                    nameKey="name"
                                    cx="50%"
                                    cy="50%"
                                    outerRadius={110}
                                    label
                                >
                                    {pieData.map((entry, index) => (
                                        <Cell
                                            key={`cell-${index}`}
                                            fill={COLORS[index % COLORS.length]}
                                        />
                                    ))}
                                </Pie>
                                <Tooltip />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                )}
            </div>

            <div className="progress-history">
                <h2>Workout History</h2>

                {filteredSessions.length === 0 ? (
                    <p className="progress-muted-text">No workout history found.</p>
                ) : (
                    <div className="history-grid">
                        {filteredSessions.map((session) => (
                            <div
                                key={session._id}
                                className="history-card clickable-history-card"
                                onClick={() => navigate(`/workouts?session=${session._id}`)}
                            >
                                <h3>{session.name}</h3>
                                <p><strong>Date:</strong> {session.date}</p>
                                <p><strong>Total Calories:</strong> {session.totalCalories} kcal</p>
                                <p><strong>Exercises:</strong> {session.exercises.length}</p>

                                <div className="history-chips">
                                    {session.exercises.slice(0, 3).map((exercise, index) => (
                                        <span key={index} className="history-chip">
                      {exercise.exercise}
                    </span>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

export default Progress;