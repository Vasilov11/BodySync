import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import axios from "axios";
import { useLocation } from "react-router-dom";

function Workouts() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const sessionId = searchParams.get("session");

    const [editingWorkoutId, setEditingWorkoutId] = useState(null);

    const location = useLocation();

    const [sessionName, setSessionName] = useState("");
    const [sessionDate, setSessionDate] = useState(
        new Date().toISOString().split("T")[0]
    );

    const [form, setForm] = useState({
        exercise: "",
        sets: "",
        reps: "",
        weight: "",
    });

    const [currentExercises, setCurrentExercises] = useState([]);
    const [savedSessions, setSavedSessions] = useState([]);
    const [openedSession, setOpenedSession] = useState(null);
    const [message, setMessage] = useState("");

    const [exerciseOptions, setExerciseOptions] = useState([]);
    const [calorieMap, setCalorieMap] = useState({});

    const token = localStorage.getItem("token");

    const [editingExerciseIndex, setEditingExerciseIndex] = useState(null);

    const [selectedWorkout, setSelectedWorkout] = useState(null);

    const fetchWorkouts = async () => {
        try {
            if (!token) return;

            const res = await axios.get("http://localhost:5000/api/workouts", {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            setSavedSessions(res.data);
        } catch (error) {
            console.error("Error fetching workouts:", error);
        }
    };

    useEffect(() => {
        const fetchExercises = async () => {
            try {
                const res = await axios.get("http://localhost:5000/api/exercises");

                setExerciseOptions(res.data);

                const map = {};
                res.data.forEach((exercise) => {
                    map[exercise.name] = exercise.caloriesFactor;
                });
                setCalorieMap(map);
            } catch (error) {
                console.error("Error fetching exercises:", error);
            }
        };

        fetchExercises();
    }, []);
    useEffect(() => {
        fetchWorkouts();
    }, []);

    useEffect(() => {
        if (!sessionId || savedSessions.length === 0) return;

        const foundSession = savedSessions.find(
            (session) => String(session._id) === String(sessionId)
        );

        if (foundSession) {
            setOpenedSession(foundSession);
        }
    }, [sessionId, savedSessions]);

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const openId = params.get("open");

        if (openId && savedSessions.length > 0) {
            const workoutToOpen = savedSessions.find(
                (session) => session._id === openId
            );

            if (workoutToOpen) {
                setSelectedWorkout(workoutToOpen);
            }
        }
    }, [location.search, savedSessions]);

    const handleChange = (e) => {
        setForm({
            ...form,
            [e.target.name]: e.target.value,
        });
    };

    const calculateCalories = (exercise, sets, reps) => {
        const baseCalories = calorieMap[exercise] || 0.4;
        return Number((baseCalories * Number(sets) * Number(reps)).toFixed(1));
    };

    const addExerciseToCurrentWorkout = () => {
        if (!form.exercise || !form.sets || !form.reps || !form.weight) {
            setMessage("Please fill all exercise fields.");
            return;
        }

        const calories = calculateCalories(form.exercise, form.sets, form.reps);

        const newExercise = {
            exercise: form.exercise,
            sets: Number(form.sets),
            reps: Number(form.reps),
            weight: Number(form.weight),
            calories,
        };

        if (editingExerciseIndex !== null) {
            setCurrentExercises((prev) =>
                prev.map((item, index) =>
                    index === editingExerciseIndex ? newExercise : item
                )
            );

            setEditingExerciseIndex(null);
            setMessage("Exercise updated.");
        } else {
            setCurrentExercises((prev) => [...prev, newExercise]);
            setMessage("Exercise added.");
        }

        setForm({
            exercise: "",
            sets: "",
            reps: "",
            weight: "",
        });
    };

    const currentWorkoutCalories = useMemo(() => {
        return currentExercises.reduce(
            (sum, exercise) => sum + Number(exercise.calories),
            0
        );
    }, [currentExercises]);

    const endWorkout = async () => {
        try {
            if (!sessionName || !sessionDate || currentExercises.length === 0) {
                setMessage("Please fill workout name, date, and add at least one exercise.");
                return;
            }

            if (!token) {
                setMessage("You must be logged in.");
                return;
            }

            if (editingWorkoutId) {
                const res = await axios.put(
                    `http://localhost:5000/api/workouts/${editingWorkoutId}`,
                    {
                        name: sessionName,
                        date: sessionDate,
                        exercises: currentExercises,
                        totalCalories: currentWorkoutCalories,
                    },
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    }
                );

                setSavedSessions((prev) =>
                    prev.map((session) =>
                        session._id === editingWorkoutId ? res.data : session
                    )
                );

                setMessage("Workout updated successfully!");
                setEditingWorkoutId(null);
            } else {
                const res = await axios.post(
                    "http://localhost:5000/api/workouts",
                    {
                        name: sessionName,
                        date: sessionDate,
                        exercises: currentExercises,
                        totalCalories: currentWorkoutCalories,
                    },
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    }
                );

                setSavedSessions((prev) => [res.data, ...prev]);
                setMessage("Workout saved successfully!");
            }

            setSessionName("");
            setSessionDate(new Date().toISOString().split("T")[0]);
            setCurrentExercises([]);
        } catch (error) {
            console.error("Error saving workout:", error);
            setMessage("Error saving workout.");
        }
    };

    const deleteSavedSession = async (id) => {
        try {
            if (!token) return;

            await axios.delete(`http://localhost:5000/api/workouts/${id}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            setSavedSessions((prev) => prev.filter((session) => session._id !== id));

            if (openedSession && openedSession._id === id) {
                setOpenedSession(null);
                navigate("/workouts");
            }
        } catch (error) {
            console.error("Error deleting workout:", error);
        }
    };

    const handleEditWorkout = (session) => {
        setEditingWorkoutId(session._id);
        setSessionName(session.name);
        setSessionDate(session.date);
        setCurrentExercises(session.exercises || []);

        window.scrollTo({
            top: 0,
            behavior: "smooth",
        });
    };

    const handleRemoveCurrentExercise = (indexToRemove) => {
        setCurrentExercises((prev) =>
            prev.filter((_, index) => index !== indexToRemove)
        );
    };

    const handleEditCurrentExercise = (index) => {
        const exerciseToEdit = currentExercises[index];

        setForm({
            exercise: exerciseToEdit.exercise,
            sets: String(exerciseToEdit.sets),
            reps: String(exerciseToEdit.reps),
            weight: String(exerciseToEdit.weight),
        });

        setEditingExerciseIndex(index);
    };

    if (openedSession) {
        return (
            <div className="page workouts-page">
                <div className="workouts-detail-card">
                    <button
                        className="back-btn"
                        onClick={() => {
                            setOpenedSession(null);
                            navigate("/workouts#saved-sessions");
                        }}
                    >
                        ← Back to History
                    </button>

                    <h1>{openedSession.name}</h1>
                    <p><strong>Date:</strong> {openedSession.date}</p>
                    <p><strong>Total Calories:</strong> {openedSession.totalCalories} kcal</p>

                    <div className="workouts-detail-grid">
                        {openedSession.exercises.map((exercise, index) => (
                            <div key={index} className="workout-exercise-card">
                                <h3>{exercise.exercise}</h3>
                                <p>Sets: {exercise.sets}</p>
                                <p>Reps: {exercise.reps}</p>
                                <p>Weight: {exercise.weight} kg</p>
                                <p>Calories: {exercise.calories} kcal</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="page workouts-page">
            <div className="workouts-hero-card">
                <h1>Workouts</h1>
                <p>Create a workout session, add exercises, and save it to your account.</p>
            </div>

            <div className="workouts-top-grid">
                <div className="workouts-panel">
                    <h2>Start Workout Session</h2>

                    <div className="workout-form-grid">
                        <input
                            type="text"
                            placeholder="Workout Name"
                            value={sessionName}
                            onChange={(e) => setSessionName(e.target.value)}
                        />

                        <input
                            type="date"
                            value={sessionDate}
                            onChange={(e) => setSessionDate(e.target.value)}
                        />
                    </div>

                    <h3>Add Exercise</h3>

                    <div className="exercise-form-grid">
                        <select
                            name="exercise"
                            value={form.exercise}
                            onChange={handleChange}
                        >
                            <option value="">Select Exercise</option>
                            {exerciseOptions.map((exercise) => (
                                <option key={exercise._id} value={exercise.name}>
                                    {exercise.name}
                                </option>
                            ))}
                        </select>

                        <input
                            type="number"
                            name="sets"
                            placeholder="Sets"
                            value={form.sets}
                            onChange={handleChange}
                        />

                        <input
                            type="number"
                            name="reps"
                            placeholder="Reps"
                            value={form.reps}
                            onChange={handleChange}
                        />

                        <input
                            type="number"
                            name="weight"
                            placeholder="Weight (kg)"
                            value={form.weight}
                            onChange={handleChange}
                        />

                        <button className="add-exercise-btn" onClick={addExerciseToCurrentWorkout}>
                            {editingExerciseIndex !== null ? "Update Exercise" : "Add Exercise"}
                        </button>

                        {editingExerciseIndex !== null && (
                            <button
                                type="button"
                                className="cancel-edit-btn"
                                onClick={() => {
                                    setEditingExerciseIndex(null);
                                    setForm({
                                        exercise: "",
                                        sets: "",
                                        reps: "",
                                        weight: "",
                                    });
                                }}
                            >
                                Cancel
                            </button>
                        )}

                    </div>

                    {message && <p className="success-message">{message}</p>}
                </div>

                <div className="workouts-panel">
                    <h2>Current Workout</h2>

                    {currentExercises.map((exercise, index) => (
                        <div key={index} className="current-exercise-item">
                            <div className="current-exercise-main">
                                <strong>{exercise.exercise}</strong>
                                <span>
                        {exercise.sets} sets • {exercise.reps} reps • {exercise.weight} kg
                        </span>
                                <span>{exercise.calories} kcal</span>
                            </div>

                            <div className="current-exercise-actions">
                                <button
                                    className="edit-exercise-btn"
                                    onClick={() => handleEditCurrentExercise(index)}
                                >
                                    Edit
                                </button>

                                <button
                                    className="remove-exercise-btn"
                                    onClick={() => handleRemoveCurrentExercise(index)}
                                >
                                    Remove
                                </button>
                            </div>
                        </div>
                    ))}

                    <div className="current-workout-footer">
                        <p>
                            <strong>Total Current Workout Calories:</strong>{" "}
                            {currentWorkoutCalories.toFixed(1)} kcal
                        </p>

                        <button className="end-workout-btn" onClick={endWorkout}>
                            {editingWorkoutId ? "Update Workout" : "End Workout"}
                        </button>
                    </div>
                </div>
            </div>

            <div className="workouts-saved-section" id="saved-sessions">
                <h2>Saved Workout Sessions</h2>

                {savedSessions.length === 0 ? (
                    <p className="workouts-muted-text">No saved workouts yet.</p>
                ) : (
                    <div className="saved-workouts-grid">
                        {savedSessions.map((session) => (
                            <div key={session._id} className="saved-workout-card">
                                <div
                                    className="saved-workout-clickable"
                                    onClick={() => navigate(`/workouts?session=${session._id}`)}
                                >
                                    <h3>{session.name}</h3>
                                    <p><strong>Date:</strong> {session.date}</p>
                                    <p><strong>Total Calories:</strong> {session.totalCalories} kcal</p>
                                    <p><strong>Exercises:</strong> {session.exercises.length}</p>
                                </div>

                                <div className="saved-workout-exercises-preview">
                                    {session.exercises.slice(0, 3).map((exercise, index) => (
                                        <span key={index} className="exercise-chip">
                      {exercise.exercise}
                    </span>
                                    ))}
                                </div>

                                <div className="saved-workout-actions">
                                    <button
                                        className="edit-session-btn"
                                        onClick={() => handleEditWorkout(session)}
                                    >
                                        Edit Session
                                    </button>

                                    <button
                                        className="delete-session-btn"
                                        onClick={() => deleteSavedSession(session._id)}
                                    >
                                        Delete Session
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

export default Workouts;