import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

function Food() {
    const user = JSON.parse(localStorage.getItem("user")) || {};
    const userId = user._id || user.id;

    const [searchQuery, setSearchQuery] = useState("");
    const [searchResults, setSearchResults] = useState([]);

    const [foodName, setFoodName] = useState("");
    const [grams, setGrams] = useState("");
    const [caloriesPer100g, setCaloriesPer100g] = useState("");
    const [proteinPer100g, setProteinPer100g] = useState("");
    const [carbsPer100g, setCarbsPer100g] = useState("");
    const [fatPer100g, setFatPer100g] = useState("");
    const [date, setDate] = useState(new Date().toISOString().split("T")[0]);

    const [entries, setEntries] = useState([]);
    const today = new Date().toISOString().split("T")[0];

    const todayEntries = entries.filter(
        (entry) => entry.date?.split("T")[0] === today
    );
    const [message, setMessage] = useState("");
    const [editingId, setEditingId] = useState(null);

    const preview = useMemo(() => {
        const gramsNumber = Number(grams || 0);
        const calories100 = Number(caloriesPer100g || 0);
        const protein100 = Number(proteinPer100g || 0);
        const carbs100 = Number(carbsPer100g || 0);
        const fat100 = Number(fatPer100g || 0);

        return {
            calories: ((gramsNumber * calories100) / 100).toFixed(1),
            protein: ((gramsNumber * protein100) / 100).toFixed(1),
            carbs: ((gramsNumber * carbs100) / 100).toFixed(1),
            fat: ((gramsNumber * fat100) / 100).toFixed(1),
        };
    }, [grams, caloriesPer100g, proteinPer100g, carbsPer100g, fatPer100g]);

    const recommendations = useMemo(() => {
        const weight = Number(user.weight || 0);
        const height = Number(user.height || 0);
        const age = Number(user.age || 0);
        const gender = (user.gender || "").toLowerCase();
        const goal = (user.goal || "").toLowerCase();

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
    }, [user]);

    const fetchEntries = async () => {
        try {
            if (!userId) return;
            const res = await axios.get(`http://localhost:5000/api/food/${userId}`);
            setEntries(res.data);
        } catch (error) {
            console.error("Error fetching food entries:", error);
        }
    };

    useEffect(() => {
        fetchEntries();
    }, []);

    const handleFoodSearch = async () => {
        try {
            if (!searchQuery.trim()) return;

            const res = await axios.get("http://localhost:5000/api/food/search", {
                params: { query: searchQuery },
            });

            setSearchResults(res.data);
        } catch (error) {
            console.error("Error searching foods:", error);
            setMessage("Error searching food API.");
        }
    };

    const handleSelectFood = (food) => {
        setFoodName(String(food.description || ""));
        setCaloriesPer100g(String(food.caloriesPer100g ?? ""));
        setProteinPer100g(String(food.proteinPer100g ?? ""));
        setCarbsPer100g(String(food.carbsPer100g ?? ""));
        setFatPer100g(String(food.fatPer100g ?? ""));
        setSearchQuery(String(food.description || ""));
        setSearchResults([]);
        setMessage(`Selected: ${food.description}`);
    };

    const resetForm = () => {
        setFoodName("");
        setGrams("");
        setCaloriesPer100g("");
        setProteinPer100g("");
        setCarbsPer100g("");
        setFatPer100g("");
        setSearchQuery("");
        setEditingId(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            if (!userId) {
                setMessage("User not found. Please login again.");
                return;
            }

            if (!foodName || !caloriesPer100g) {
                setMessage("Please search and select a food first.");
                return;
            }

            if (editingId) {
                await axios.put(`http://localhost:5000/api/food/${editingId}`, {
                    foodName,
                    grams,
                    caloriesPer100g,
                    proteinPer100g,
                    carbsPer100g,
                    fatPer100g,
                    date,
                });

                setMessage("Food entry updated successfully.");
            } else {
                await axios.post("http://localhost:5000/api/food", {
                    user: userId,
                    foodName,
                    grams,
                    caloriesPer100g,
                    proteinPer100g,
                    carbsPer100g,
                    fatPer100g,
                    date,
                });

                setMessage("Food entry added successfully.");
            }

            resetForm();
            fetchEntries();
        } catch (error) {
            console.error("Error saving food entry:", error);
            setMessage("Error saving food entry.");
        }
    };

    const handleDelete = async (id) => {
        try {
            await axios.delete(`http://localhost:5000/api/food/${id}`);
            setMessage("Food entry deleted successfully.");
            fetchEntries();
        } catch (error) {
            console.error("Error deleting food entry:", error);
            setMessage("Error deleting food entry.");
        }
    };

    const handleEdit = (entry) => {
        setEditingId(entry._id);
        setFoodName(entry.foodName || "");
        setGrams(String(entry.grams || ""));
        setCaloriesPer100g(String(entry.caloriesPer100g || ""));
        setProteinPer100g(String(entry.proteinPer100g || ""));
        setCarbsPer100g(String(entry.carbsPer100g || ""));
        setFatPer100g(String(entry.fatPer100g || ""));
        setDate(entry.date || new Date().toISOString().split("T")[0]);
        setSearchQuery(entry.foodName || "");
        setMessage(`Editing: ${entry.foodName}`);
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    const groupedEntries = useMemo(() => {
        const groups = {};

        entries.forEach((entry) => {
            if (!groups[entry.date]) {
                groups[entry.date] = [];
            }
            groups[entry.date].push(entry);
        });

        return Object.entries(groups).sort((a, b) => new Date(b[0]) - new Date(a[0]));
    }, [entries]);

    //const todayEntries = entries.filter((entry) => entry.date === date);

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

    return (
        <div className="page food-page">
            <section className="food-hero-card">
                <h1>Food Tracker</h1>
                <p>Add your meals and auto-fill calories and macros with food search.</p>
            </section>

            <section className="food-top-grid">
                <div className="food-panel">
                    <h2>Search Food</h2>

                    <div className="food-search-row">
                        <input
                            type="text"
                            placeholder="Search food (e.g. rice, banana, chicken breast)"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                        <button type="button" className="food-search-btn" onClick={handleFoodSearch}>
                            Search Food
                        </button>
                    </div>

                    {searchResults.length > 0 && (
                        <div className="food-search-results">
                            {searchResults.map((food) => (
                                <button
                                    key={food.fdcId}
                                    type="button"
                                    className="food-result-card"
                                    onClick={() => handleSelectFood(food)}
                                >
                                    <strong>{food.description}</strong>
                                    <span>{food.caloriesPer100g} kcal</span>
                                    <span>P: {food.proteinPer100g}g</span>
                                    <span>C: {food.carbsPer100g}g</span>
                                    <span>F: {food.fatPer100g}g</span>
                                </button>
                            ))}
                        </div>
                    )}

                    <h2 className="food-form-title">
                        {editingId ? "Edit Food Entry" : "Add Food Entry"}
                    </h2>

                    <form onSubmit={handleSubmit} className="food-form">
                        <input
                            type="text"
                            placeholder="Food name"
                            value={foodName}
                            readOnly
                            className="food-readonly-input"
                            required
                        />

                        <input
                            type="number"
                            placeholder="Grams"
                            value={grams}
                            onChange={(e) => setGrams(e.target.value)}
                            required
                        />

                        <input
                            type="number"
                            placeholder="Calories per 100g"
                            value={caloriesPer100g}
                            readOnly
                            className="food-readonly-input"
                            required
                        />

                        <input
                            type="number"
                            placeholder="Protein per 100g"
                            value={proteinPer100g}
                            readOnly
                            className="food-readonly-input"
                        />

                        <input
                            type="number"
                            placeholder="Carbs per 100g"
                            value={carbsPer100g}
                            readOnly
                            className="food-readonly-input"
                        />

                        <input
                            type="number"
                            placeholder="Fat per 100g"
                            value={fatPer100g}
                            readOnly
                            className="food-readonly-input"
                        />

                        <input
                            type="date"
                            value={date}
                            onChange={(e) => setDate(e.target.value)}
                            required
                        />

                        <div className="food-preview-box food-preview-macros">
                            <div>
                                <span>Estimated Calories</span>
                                <strong>{preview.calories} kcal</strong>
                            </div>
                            <div>
                                <span>Protein</span>
                                <strong>{preview.protein} g</strong>
                            </div>
                            <div>
                                <span>Carbs</span>
                                <strong>{preview.carbs} g</strong>
                            </div>
                            <div>
                                <span>Fat</span>
                                <strong>{preview.fat} g</strong>
                            </div>
                        </div>

                        <div className="food-form-actions">
                            <button type="submit" className="food-add-btn">
                                {editingId ? "Save Changes" : "Add Food"}
                            </button>

                            {editingId && (
                                <button type="button" className="food-cancel-btn" onClick={resetForm}>
                                    Cancel Edit
                                </button>
                            )}
                        </div>
                    </form>

                    {message && <p className="success-message">{message}</p>}
                </div>

                <div className="food-panel">
                    <h2>Today Summary</h2>
                    <div className="food-summary-grid">
                        <div className="food-summary-card">
                            <span>Entries Today</span>
                            <strong>{todayEntries.length}</strong>
                        </div>
                        <div className="food-summary-card">
                            <span>Eaten Calories</span>
                            <strong>{todayTotals.calories.toFixed(1)} kcal</strong>
                        </div>
                        <div className="food-summary-card">
                            <span>Eaten Protein</span>
                            <strong>{todayTotals.protein.toFixed(1)} g</strong>
                        </div>
                        <div className="food-summary-card">
                            <span>Eaten Carbs</span>
                            <strong>{todayTotals.carbs.toFixed(1)} g</strong>
                        </div>
                        <div className="food-summary-card">
                            <span>Eaten Fat</span>
                            <strong>{todayTotals.fat.toFixed(1)} g</strong>
                        </div>
                    </div>
                </div>
            </section>

            <section className="food-insights-grid">
                <div className="food-dark-card food-calorie-card">
                    <div className="food-dark-card-header">
                        <h2>Daily Calories</h2>
                        <span className="food-dark-card-subtitle">{date}</span>
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

            <section className="food-history-section">
                <div className="food-history-header">
                    <h2>Food History by Day</h2>
                </div>

                {groupedEntries.length === 0 ? (
                    <p className="food-muted-text">No food entries yet.</p>
                ) : (
                    <div className="food-day-grid">
                        {groupedEntries.map(([day, dayEntries]) => {
                            const totals = dayEntries.reduce(
                                (sum, entry) => {
                                    sum.calories += Number(entry.totalCalories || 0);
                                    sum.protein += Number(entry.totalProtein || 0);
                                    sum.carbs += Number(entry.totalCarbs || 0);
                                    sum.fat += Number(entry.totalFat || 0);
                                    return sum;
                                },
                                { calories: 0, protein: 0, carbs: 0, fat: 0 }
                            );

                            return (
                                <Link
                                    key={day}
                                    to={`/food/day/${day}`}
                                    className="food-day-card clickable-card"
                                >
                                    <h3>{day}</h3>
                                    <p>Foods: {dayEntries.length}</p>
                                    <p>Calories: {totals.calories.toFixed(1)} kcal</p>
                                    <p>Protein: {totals.protein.toFixed(1)} g</p>
                                    <p>Carbs: {totals.carbs.toFixed(1)} g</p>
                                    <p>Fat: {totals.fat.toFixed(1)} g</p>
                                </Link>
                            );
                        })}
                    </div>
                )}
            </section>

            <section className="food-history-section">
                <h2>All Food Entries</h2>

                {entries.length === 0 ? (
                    <p className="food-muted-text">No food entries yet.</p>
                ) : (
                    <div className="food-history-grid">
                        {todayEntries.map((entry) => (
                            <div key={entry._id} className="food-entry-card food-entry-card-detailed">
                                <div className="food-entry-top">
                                    <h3>{entry.foodName}</h3>
                                    <span className="food-entry-grams-badge">{entry.grams} g</span>
                                </div>

                                <div className="food-entry-stats-grid">
                                    <div className="food-entry-stat-mini">
                                        <span>Calories</span>
                                        <strong>{entry.totalCalories} kcal</strong>
                                    </div>

                                    <div className="food-entry-stat-mini">
                                        <span>Protein</span>
                                        <strong>{entry.totalProtein} g</strong>
                                    </div>

                                    <div className="food-entry-stat-mini">
                                        <span>Carbs</span>
                                        <strong>{entry.totalCarbs} g</strong>
                                    </div>

                                    <div className="food-entry-stat-mini">
                                        <span>Fat</span>
                                        <strong>{entry.totalFat} g</strong>
                                    </div>
                                </div>

                                <div className="food-entry-per100">
                                    <p>Per 100g values</p>

                                    <div className="food-entry-per100-row">
                                        <span>{entry.caloriesPer100g} kcal</span>
                                        <span>{entry.proteinPer100g}g protein</span>
                                        <span>{entry.carbsPer100g}g carbs</span>
                                        <span>{entry.fatPer100g}g fat</span>
                                    </div>
                                </div>

                                <div className="food-entry-actions food-entry-actions-modern">
                                    <button
                                        type="button"
                                        className="food-edit-btn"
                                        onClick={() => handleEdit(entry)}
                                    >
                                        Edit
                                    </button>

                                    <button
                                        type="button"
                                        className="food-delete-btn"
                                        onClick={() => handleDelete(entry._id)}
                                    >
                                        Delete
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </section>
        </div>
    );
}

export default Food;