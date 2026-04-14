import { useEffect, useMemo, useState } from "react";
import axios from "axios";

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
    const [message, setMessage] = useState("");

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

            console.log("SEARCH RESULTS:", res.data);
            setSearchResults(res.data);
        } catch (error) {
            console.error("Error searching foods:", error);
            setMessage("Error searching food API.");
        }
    };

    const handleSelectFood = (food) => {
        console.log("SELECTED FOOD:", food);

        setFoodName(food.description || "");
        setCaloriesPer100g(food.caloriesPer100g ?? "");
        setProteinPer100g(food.proteinPer100g ?? "");
        setCarbsPer100g(food.carbsPer100g ?? "");
        setFatPer100g(food.fatPer100g ?? "");
        setSearchQuery(food.description || "");
        setSearchResults([]);
        setMessage(`Selected: ${food.description}`);
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

            setFoodName("");
            setGrams("");
            setCaloriesPer100g("");
            setProteinPer100g("");
            setCarbsPer100g("");
            setFatPer100g("");
            setSearchQuery("");
            setMessage("Food entry added successfully.");

            fetchEntries();
        } catch (error) {
            console.error("Error adding food entry:", error);
            setMessage("Error adding food entry.");
        }
    };

    const todayEntries = entries.filter((entry) => entry.date === date);

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

                    <h2 className="food-form-title">Add Food Entry</h2>

                    <form onSubmit={handleSubmit} className="food-form">
                        <input
                            type="text"
                            placeholder="Food name"
                            value={foodName}
                            onChange={(e) => setFoodName(e.target.value)}
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

                        <button type="submit" className="food-add-btn">
                            Add Food
                        </button>
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

            <section className="food-recommend-grid">
                <div className="food-panel">
                    <h2>Recommended Daily Intake</h2>
                    {recommendations.calories === 0 ? (
                        <p className="food-muted-text">
                            Complete your profile with age, gender, height, weight, and goal.
                        </p>
                    ) : (
                        <div className="food-summary-grid">
                            <div className="food-summary-card">
                                <span>Recommended Calories</span>
                                <strong>{recommendations.calories} kcal</strong>
                            </div>
                            <div className="food-summary-card">
                                <span>Recommended Protein</span>
                                <strong>{recommendations.protein} g</strong>
                            </div>
                            <div className="food-summary-card">
                                <span>Recommended Carbs</span>
                                <strong>{recommendations.carbs} g</strong>
                            </div>
                            <div className="food-summary-card">
                                <span>Recommended Fat</span>
                                <strong>{recommendations.fat} g</strong>
                            </div>
                        </div>
                    )}
                </div>

                <div className="food-panel">
                    <h2>Remaining Today</h2>
                    {recommendations.calories === 0 ? (
                        <p className="food-muted-text">
                            Add profile details first to calculate remaining values.
                        </p>
                    ) : (
                        <div className="food-summary-grid">
                            <div className="food-summary-card">
                                <span>Remaining Calories</span>
                                <strong>{remaining.calories.toFixed(1)} kcal</strong>
                            </div>
                            <div className="food-summary-card">
                                <span>Remaining Protein</span>
                                <strong>{remaining.protein.toFixed(1)} g</strong>
                            </div>
                            <div className="food-summary-card">
                                <span>Remaining Carbs</span>
                                <strong>{remaining.carbs.toFixed(1)} g</strong>
                            </div>
                            <div className="food-summary-card">
                                <span>Remaining Fat</span>
                                <strong>{remaining.fat.toFixed(1)} g</strong>
                            </div>
                        </div>
                    )}
                </div>
            </section>

            <section className="food-history-section">
                <h2>Food History</h2>

                {entries.length === 0 ? (
                    <p className="food-muted-text">No food entries yet.</p>
                ) : (
                    <div className="food-history-grid">
                        {entries.map((entry) => (
                            <div key={entry._id} className="food-entry-card">
                                <h3>{entry.foodName}</h3>
                                <p>Date: {entry.date}</p>
                                <p>Grams: {entry.grams} g</p>
                                <p>Total Calories: {entry.totalCalories} kcal</p>
                                <p>Protein: {entry.totalProtein} g</p>
                                <p>Carbs: {entry.totalCarbs} g</p>
                                <p>Fat: {entry.totalFat} g</p>
                            </div>
                        ))}
                    </div>
                )}
            </section>
        </div>
    );
}

export default Food;