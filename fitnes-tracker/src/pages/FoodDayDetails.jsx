import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { Link, useParams } from "react-router-dom";

function FoodDayDetails() {
    const user = JSON.parse(localStorage.getItem("user")) || {};
    const userId = user._id || user.id;
    const { date } = useParams();

    const [entries, setEntries] = useState([]);

    useEffect(() => {
        const fetchEntries = async () => {
            try {
                if (!userId) return;

                const res = await axios.get(`http://localhost:5000/api/food/${userId}`);
                setEntries(res.data);
            } catch (error) {
                console.error("Error fetching food day entries:", error);
            }
        };

        fetchEntries();
    }, [userId]);

    const dayEntries = useMemo(() => {
        return entries.filter((entry) => entry.date === date);
    }, [entries, date]);

    const totals = useMemo(() => {
        return dayEntries.reduce(
            (sum, entry) => {
                sum.calories += Number(entry.totalCalories || 0);
                sum.protein += Number(entry.totalProtein || 0);
                sum.carbs += Number(entry.totalCarbs || 0);
                sum.fat += Number(entry.totalFat || 0);
                return sum;
            },
            { calories: 0, protein: 0, carbs: 0, fat: 0 }
        );
    }, [dayEntries]);

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

    const remaining = {
        calories: Math.max(recommendations.calories - totals.calories, 0),
        protein: Math.max(recommendations.protein - totals.protein, 0),
        carbs: Math.max(recommendations.carbs - totals.carbs, 0),
        fat: Math.max(recommendations.fat - totals.fat, 0),
    };

    const calorieProgressPercent =
        recommendations.calories > 0
            ? Math.min((totals.calories / recommendations.calories) * 100, 100)
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
        totals.carbs * 4 + totals.fat * 9 + totals.protein * 4;

    const actualMacroPercents = {
        carbs:
            actualTotalMacroCalories > 0
                ? ((totals.carbs * 4) / actualTotalMacroCalories) * 100
                : 0,
        fat:
            actualTotalMacroCalories > 0
                ? ((totals.fat * 9) / actualTotalMacroCalories) * 100
                : 0,
        protein:
            actualTotalMacroCalories > 0
                ? ((totals.protein * 4) / actualTotalMacroCalories) * 100
                : 0,
    };

    return (
        <div className="page food-page">
            <section className="food-hero-card">
                <h1>Food Day Details</h1>
                <p>Detailed nutrition history for {date}</p>
            </section>

            <section className="food-history-section">
                <Link to="/food" className="back-btn latest-workout-link">
                    ← Back to Food
                </Link>

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
                                        {totals.calories.toFixed(0)}
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
                                            <strong>{totals.carbs.toFixed(1)} g</strong>
                                        </div>
                                    </div>

                                    <div className="food-macro-top-item">
                                        <span className="macro-dot fat-dot" />
                                        <div>
                                            <p>Fat</p>
                                            <strong>{totals.fat.toFixed(1)} g</strong>
                                        </div>
                                    </div>

                                    <div className="food-macro-top-item">
                                        <span className="macro-dot protein-dot" />
                                        <div>
                                            <p>Protein</p>
                                            <strong>{totals.protein.toFixed(1)} g</strong>
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

                {dayEntries.length === 0 ? (
                    <p className="food-muted-text">No food entries for this day.</p>
                ) : (
                    <div className="food-history-grid">
                        {dayEntries.map((entry) => (
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
                            </div>
                        ))}
                    </div>
                )}
            </section>
        </div>
    );
}

export default FoodDayDetails;