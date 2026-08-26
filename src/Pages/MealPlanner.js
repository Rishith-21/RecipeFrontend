import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./MealPlanner.css";

const DAYS = [
  "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"
];
const MEALS = ["Breakfast", "Lunch", "Snack", "Dinner"];

const API_BASE = process.env.REACT_APP_API_BASE || "http://localhost:5000";
const api = (path) => `${API_BASE}${path.startsWith("/") ? path : `/${path}`}`;

const MealPlanner = ({ token, userId }) => {
  const [plan, setPlan] = useState({});
  const [generatedMeals, setGeneratedMeals] = useState({});
  const [loading, setLoading] = useState(true);
  const [subscriptionLoading, setSubscriptionLoading] = useState(true);
  const [hasActiveSubscription, setHasActiveSubscription] = useState(false);
  const [subscriptionDetails, setSubscriptionDetails] = useState(null);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [showShoppingList, setShowShoppingList] = useState(false);
  const [shoppingList, setShoppingList] = useState([]);
  const [favourites, setFavourites] = useState([]);
  const [expandedDays, setExpandedDays] = useState({}); // Track expanded day cards
  const [settings, setSettings] = useState({
    calories: 2000,
    diet: "balanced",
    includeSnacks: true,
  });
  const [favPicker, setFavPicker] = useState({ open: false, day: null, mealType: null });

  const navigate = useNavigate();

  useEffect(() => {
    if (!token || !userId) {
      setError("Authentication required. Please log in again.");
      setLoading(false);
      setSubscriptionLoading(false);
      return;
    }
    checkSubscriptionAccess();
    fetchFavourites();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, userId]);

  const fetchFavourites = async () => {
    // Use the dedicated current-user favourites endpoint
    try {
      const resp = await fetch(api('/api/user/favourites'), {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (resp.ok) {
        const data = await resp.json();
        const favsList = data.favourites || data.data || [];
        console.log("Fetched favourites:", favsList);
        setFavourites(favsList);
      } else {
        console.warn(`Favourites fetch failed (${resp.status})`);
        setFavourites([]);
      }
    } catch (e) {
      console.error("Failed to load favourites", e);
      setFavourites([]);
    }
  };

  const checkSubscriptionAccess = async () => {
    setSubscriptionLoading(true);
    try {
      const resp = await fetch(api("/api/mealplan/check-access"), {
        method: "GET",
        credentials: "include",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      const data = await resp.json();
      if (resp.ok) {
        setHasActiveSubscription(!!data.hasActiveSubscription);
        setSubscriptionDetails(data.subscriptionDetails || null);
        await loadMealPlan();
      } else {
        setHasActiveSubscription(false);
        setError(data.message || "Unable to verify premium features");
        await loadMealPlan();
      }
    } catch (e) {
      console.error("Subscription check error:", e);
      setHasActiveSubscription(false);
      setError("Unable to verify subscription status. Basic view available.");
      await loadMealPlan();
    } finally {
      setSubscriptionLoading(false);
      setLoading(false);
    }
  };

  const loadMealPlan = async () => {
    if (!token || !userId) return;
    try {
      const resp = await fetch(api("/api/mealplan/get-plan"), {
        method: "GET",
        credentials: "include",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (resp.ok) {
        const data = await resp.json();
        setPlan(data.plans || {});
        setSettings(data.settings || data.plans?.settings || settings);
        setGeneratedMeals(data.plans || {});
      } else {
        console.warn("get-plan non-OK:", resp.status);
      }
    } catch (e) {
      console.error("Load meal plan error:", e);
    }
  };

  const generateMealPlan = async () => {
    if (!hasActiveSubscription) {
      setError("Premium subscription required to generate meal plans");
      return;
    }
    setGenerating(true);
    setError("");
    try {
      const resp = await fetch(api("/api/mealplan/generate-plan"), {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          calories: settings.calories,
          diet: settings.diet,
          exclude: settings.exclude || [],
          includeSnacks: settings.includeSnacks,
        }),
      });
      const data = await resp.json();
      if (resp.ok && data.success) {
        setPlan(data.plan?.days || {});
        setGeneratedMeals(data.plan?.days || {});
        setSettings(data.plan?.settings || settings);
        setError("");
        alert("New meal plan generated! 🎉");
      } else {
        setError(data.error || "Failed to generate meal plan");
      }
    } catch (e) {
      console.error("Generate plan error:", e);
      setError("Failed to generate meal plan. Please try again.");
    } finally {
      setGenerating(false);
    }
  };

  const savePlan = async () => {
    if (!hasActiveSubscription) {
      setError("Premium subscription required to save meal plans");
      navigate("/subscribe");
      return;
    }
    setSaving(true);
    try {
      const resp = await fetch(api("/api/mealplan/save-plan"), {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          plans: plan,
          settings: {
            calories: settings.calories,
            diet: settings.diet,
            includeSnacks: settings.includeSnacks,
          },
        }),
      });
      const data = await resp.json();
      if (resp.ok && data.success) {
        alert("Meal plan saved successfully! 🎉");
      } else {
        setError(data.error || "Failed to save meal plan");
      }
    } catch (e) {
      console.error("Save error:", e);
      setError("Failed to save meal plan. Please check your connection.");
    } finally {
      setSaving(false);
    }
  };

  const resetMealPlan = async () => {
    if (window.confirm("Are you sure you want to reset the meal plan? This will delete all saved meals.")) {
      try {
        setSaving(true);
        // First, send request to backend to delete the saved meal plan
        const resp = await fetch(api("/api/mealplan/reset"), {
          method: "POST",
          credentials: "include",
          headers: { Authorization: `Bearer ${token}` },
        });
        
        if (resp.ok) {
          // Clear local state completely
          const emptyPlan = {};
          DAYS.forEach((day) => {
            emptyPlan[day] = {
              Breakfast: null,
              Lunch: null,
              Snack: null,
              Dinner: null,
            };
          });
          setPlan(emptyPlan);
          setGeneratedMeals({});  // Also clear generated meals so they don't regenerate
          setShowShoppingList(false);
          setShoppingListByDay({});
          setExpandedDays({});  // Clear expanded days state
          setError("Meal plan reset successfully. All saved meals have been deleted.");
          setTimeout(() => setError(""), 3000);
        } else {
          setError("Failed to reset meal plan. Please try again.");
        }
      } catch (e) {
        console.error("Reset error:", e);
        setError("Failed to reset meal plan. Please check your connection.");
      } finally {
        setSaving(false);
      }
    }
  };

  const [shoppingListByDay, setShoppingListByDay] = useState({});

const toggleShoppingList = async () => {
  if (!hasActiveSubscription) {
    setError("Premium subscription required for shopping list");
    return;
  }
  if (showShoppingList) {
    setShowShoppingList(false);
    return;
  }
  try {
    const resp = await fetch(api("/api/mealplan/shopping-list"), {
      method: "GET",
      credentials: "include",
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await resp.json();
    if (resp.ok && data.success) {
      // Set grouped by day with meal type already included from backend
      const shoppingData = data.shoppingList?.dailyIngredients || {};
      setShoppingListByDay(shoppingData);
      setShowShoppingList(true);
    } else {
      setError(data.error || "Failed to generate shopping list");
    }
  } catch (e) {
    console.error("Shopping list error:", e);
    setError("Failed to generate shopping list");
  }
};


  const updateSettings = (key, value) =>
    setSettings((prev) => ({ ...prev, [key]: value }));

  const toggleDayExpanded = (day) => {
    setExpandedDays((prev) => ({ ...prev, [day]: !prev[day] }));
  };

  const openFavouritePicker = (day, mealType) =>
    setFavPicker({ open: true, day, mealType });

  const closeFavouritePicker = () =>
    setFavPicker({ open: false, day: null, mealType: null });

  const handleFavouriteSelect = async (recipe) => {
    const { day, mealType } = favPicker;
    if (!day || !mealType) return;
    
    try {
      // For favorites from mealdb, fetch full recipe details including ingredients
      let fullRecipeData = {
        id: recipe.id || recipe.idMeal,
        title: recipe.title || recipe.strMeal || "",
        image: recipe.image || recipe.strMealThumb || "",
        extendedIngredients: recipe.extendedIngredients || [],
        spoonacularInfo: { 
          source: "mealdb_favourite",
          recipeId: recipe.id || recipe.idMeal
        }
      };
      
      // If recipe doesn't have ingredients, try to fetch them from the server
      if (!fullRecipeData.extendedIngredients || fullRecipeData.extendedIngredients.length === 0) {
        try {
          const resp = await fetch(
            `https://www.themealdb.com/api/json/v1/1/lookup.php?i=${recipe.id || recipe.idMeal}`
          );
          const data = await resp.json();
          if (data.meals && data.meals.length > 0) {
            const meal = data.meals[0];
            fullRecipeData.title = meal.strMeal;
            fullRecipeData.image = meal.strMealThumb;
            // Extract ingredients from TheMealDB format
            const ingredients = [];
            for (let i = 1; i <= 20; i++) {
              const ingredient = meal[`strIngredient${i}`];
              const measure = meal[`strMeasure${i}`];
              if (ingredient && ingredient.trim()) {
                ingredients.push({
                  name: ingredient.trim(),
                  amount: 1,
                  unit: measure ? measure.trim() : ""
                });
              }
            }
            fullRecipeData.extendedIngredients = ingredients;
          }
        } catch (e) {
          console.warn("Failed to fetch full recipe details:", e);
        }
      }
      
      setPlan((prev) => ({
        ...prev,
        [day]: { ...prev[day], [mealType]: { title: fullRecipeData.title, id: fullRecipeData.id, spoonacularData: fullRecipeData } },
      }));
      closeFavouritePicker();
    } catch (e) {
      console.error("Error selecting favourite:", e);
      setError("Failed to select recipe. Please try again.");
    }
  };

  const handleSelectGeneratedMeal = () => {
    const { day, mealType } = favPicker;
    if (!day || !mealType) return;
    setPlan((prev) => ({
      ...prev,
      [day]: { ...prev[day], [mealType]: generatedMeals[day][mealType] },
    }));
    closeFavouritePicker();
  };

  const viewMode = hasActiveSubscription ? "premium" : "basic";

  if (subscriptionLoading) {
    return (
      <div className="meal-planner-container">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Checking your account...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="meal-planner-container">
      <div className="planner-header">
        <div className="header-left">
          <h2>Weekly Meal Planner</h2>
          <p className="header-subtitle">
            {hasActiveSubscription ? "AI-Powered Premium Planning" : "View meal planner"}
          </p>
        </div>
        <div className="view-mode-indicator">
          <span className={`mode-badge ${viewMode}`}>{viewMode.toUpperCase()} VIEW</span>
          {!hasActiveSubscription && (
            <button className="upgrade-btn" onClick={() => navigate("/subscribe")}>
              Upgrade to Premium
            </button>
          )}
        </div>
      </div>

      {error && <div className="error-msg">{error}</div>}

      {hasActiveSubscription && (
        <div className="plan-settings">
          <div className="settings-group">
            <label>Daily Calories:</label>
            <input
              type="number"
              value={settings.calories}
              onChange={(e) => updateSettings("calories", e.target.value === "" ? 0 : parseInt(e.target.value, 10))}
              min="1000"
              max="5000"
              className="settings-input"
            />
          </div>
          <div className="settings-group">
            <label>Diet Preference:</label>
            <select
              value={settings.diet}
              onChange={(e) => updateSettings("diet", e.target.value)}
              className="settings-input"
            >
              <option value="balanced">Balanced</option>
              <option value="vegetarian">Veg</option>
              <option value="nonvegetarian">Non-Veg</option>
            </select>
          </div>
          <div className="settings-group">
            <label>
              <input
                type="checkbox"
                checked={settings.includeSnacks}
                onChange={(e) => updateSettings("includeSnacks", e.target.checked)}
              />
              Include Snacks
            </label>
          </div>
        </div>
      )}

      <div className="planner-content">
        {viewMode === "premium" ? (
          <div className="premium-view">
            <div className="premium-controls">
              <button
                onClick={generateMealPlan}
                disabled={generating}
                className="generate-plan-btn"
              >
                {generating ? "Generating..." : "Generate New Meal Plan"}
              </button>
              <button onClick={toggleShoppingList} className="shopping-list-btn">
                {showShoppingList ? "Hide" : "View"} Shopping List
              </button>
              <button onClick={resetMealPlan} className="reset-plan-btn">
                Reset Meal Plan
              </button>
            </div>
            <div className="meal-planner-table-container">
              <table className="meal-planner-table">
                <thead>
                  <tr>
                    <th>Day</th>
                    {MEALS.map((m) => (
                      <th key={m}>
                        {m}
                        <span className="meal-type-icon">
                          {m === "Breakfast" && "☀️"}
                          {m === "Lunch" && "🍱"}
                          {m === "Dinner" && "🍽️"}
                          {m === "Snack" && "🍎"}
                        </span>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {DAYS.map((day) => (
                    <tr key={day}>
                      <td className="day-cell">
                        <span className="day-name">{day}</span>
                        {day === "Saturday" || day === "Sunday" ? "🎉" : "📅"}
                      </td>
                      {MEALS.map((mealType) => (
                        <td
                          key={mealType}
                          className="meal-cell editable"
                          onClick={() => openFavouritePicker(day, mealType)}
                          style={{ cursor: "pointer" }}
                          title="Click to add or replace meal with your favourite or generated recipe"
                        >
                          {plan[day]?.[mealType] ? (
                            <div className="meal-item premium">
                              <span className="meal-title">{plan[day][mealType].title}</span>
                              <button
                                className="meal-remove-btn"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  const updatedPlan = { ...plan };
                                  const updatedDay = { ...updatedPlan[day] };
                                  delete updatedDay[mealType];
                                  updatedPlan[day] = updatedDay;
                                  setPlan(updatedPlan);
                                }}
                              >
                                ×
                              </button>
                            </div>
                          ) : (
                            <div className="meal-placeholder">
                              Click to add favourite or generated
                              <br />
                              <small className="placeholder-text">Tap to choose recipe</small>
                            </div>
                          )}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <button onClick={savePlan} disabled={saving} className="save-btn">
              {saving ? "Saving..." : "Save Meal Plan"}
            </button>
            {showShoppingList && (
                <div className="shopping-list-section">
                  <h3>Shopping List (Day-wise)</h3>
                  <div className="shopping-days-list">
                    {DAYS.map((day) => (
                      <div 
                        key={day} 
                        className={`shopping-day-row ${expandedDays[day] ? 'expanded' : 'collapsed'}`}
                      >
                        <div 
                          className="day-header-row"
                          onClick={() => toggleDayExpanded(day)}
                        >
                          <span className="day-name-row">{day}</span>
                          <span className="expand-icon-row">{expandedDays[day] ? '▼' : '▶'}</span>
                        </div>
                        {expandedDays[day] && (
                          <div className="ingredients-wrapper-row">
                            {shoppingListByDay[day] && shoppingListByDay[day].length > 0 ? (
                              <ul className="ingredients-list-row">
                                {shoppingListByDay[day].map((item, idx) => {
                                  // Get meal type from item, or determine from item structure
                                  const mealType = item.mealType || item.meal_type || 'Unknown';
                                  const mealEmoji = mealType === 'Breakfast' ? '☀️' : 
                                                   mealType === 'Lunch' ? '🍱' : 
                                                   mealType === 'Dinner' ? '🍽️' : 
                                                   mealType === 'Snack' ? '🍎' : '📌';
                                  
                                  return (
                                    <li key={idx} className="ingredient-item-row">
                                      <div className="ingredient-content-row">
                                        <span className="ingredient-name-row">{item.name}</span>
                                        <span className={`meal-tag-row meal-tag-${mealType.toLowerCase()}`}>
                                          {mealEmoji} {mealType}
                                        </span>
                                      </div>
                                      <span className="ingredient-quantity-row">{item.amount} {item.unit}</span>
                                    </li>
                                  );
                                })}
                              </ul>
                            ) : (
                              <div className="no-ingredients-row">No ingredients for this day</div>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </div>
        ) : (
          <div className="basic-view">
            <div className="basic-message">
              Upgrade to Premium to unlock AI-powered meal planning with real recipes!
              <button className="upgrade-btn" onClick={() => navigate("/subscribe")}>
                Upgrade Now - ₹99/month
              </button>
            </div>
            <div className="meal-planner-table-container">
              <table className="meal-planner-table">
                <thead>
                  <tr>
                    <th>Day</th>
                    {MEALS.map((m) => (
                      <th key={m}>
                        {m}
                        <span className="meal-type-icon">
                          {m === "Breakfast" && "☀️"}
                          {m === "Lunch" && "🍱"}
                          {m === "Dinner" && "🍽️"}
                          {m === "Snack" && "🍎"}
                        </span>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {DAYS.map((day) => (
                    <tr key={day}>
                      <td className="day-cell">
                        <span className="day-name">{day}</span>
                      </td>
                      {MEALS.map((mealType) => (
                        <td key={mealType} className="meal-cell basic">
                          <div className="premium-locked">
                            <span className="lock-icon">🔒</span>
                            Premium Feature
                          </div>
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
        {/* Favourite and generated picker modal */}
        {favPicker.open && (
          <div className="favourite-picker-modal">
            <div className="modal-content">
              <h3>Select a Favourite or Generated Meal</h3>
              <button className="modal-close-btn" onClick={closeFavouritePicker}>× Close</button>
              <div className="favourites-list">
                {generatedMeals &&
                  generatedMeals[favPicker.day] &&
                  generatedMeals[favPicker.day][favPicker.mealType] && (
                    <div
                      className="favourite-item generated"
                      onClick={handleSelectGeneratedMeal}
                      title="Add original generated meal"
                    >
                      {generatedMeals[favPicker.day][favPicker.mealType].title} <em>(Generated)</em>
                    </div>
                  )}
                {favourites && favourites.length > 0 ? (
                  favourites.map((fav) => (
                    <div
                      key={fav.id || fav._id}
                      className="favourite-item"
                      onClick={() => handleFavouriteSelect(fav)}
                      title={`Add ${fav.title} to your meal plan`}
                    >
                      {fav.title || fav.name || 'Untitled Recipe'}
                    </div>
                  ))
                ) : (
                  <p>No favourites found. Add recipes to your favourites to see them here.</p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MealPlanner;
