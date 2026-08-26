import React, { useState, useEffect, useMemo, useRef } from "react";
import RecipeCard from "../components/RecipeCard";
import "./Recipes.css";
import { useNavigate } from "react-router-dom";


const API_BASE = process.env.REACT_APP_API_BASE || "http://localhost:5000";
const FEATURED_AREAS = ["Indian", "Italian", "American", "Thai"];
const FEATURED_CATEGORIES = ["Chicken", "Seafood", "Beef", "Dessert"];


const pickTitleForArea = (name) => `${name} Cuisine`;
const pickSubtitleForArea = (name) => `Discover favorite ${name} dishes.`;
const pickTitleForCategory = (name) => `${name} ${/dessert/i.test(name) ? "Ideas" : "Specials"}`;
const pickSubtitleForCategory = (name) => `Popular ${name.toLowerCase()} recipes.`;
const fallbackImg = (url) => url || "https://via.placeholder.com/300x200.png?text=Recipe";
const shuffleFew = (arr, count) => {
  const shuffled = [...arr].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
};
const LS_KEY = "recipesLandingCache_v1";

// Recipe Details Modal
const RecipeDetailModal = ({ recipe, onClose, user, navigate }) => {
  const [fullRecipe, setFullRecipe] = useState(null);
  const id = recipe?.idMeal;
  const reqCache = useRef(new Map());
  
  useEffect(() => {
    let ignore = false;
    async function fetchDetails() {
      if (!id) return;
      
      // If recipe already has full details (premium recipe), use it directly
      if (recipe?.strInstructions || recipe?.instructions) {
        setFullRecipe(recipe);
        return;
      }
      
      if (reqCache.current.has(id)) {
        setFullRecipe(reqCache.current.get(id));
        return;
      }
      try {
        const res = await fetch(`${API_BASE}/api/recipes/detail?id=${id}`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        const recipeData = data.meals ? data.meals[0] : null;
        reqCache.current.set(id, recipeData);
        if (!ignore) setFullRecipe(recipeData);
      } catch (e) {
        console.error("Modal fetch error:", e);
        if (!ignore) setFullRecipe(recipe); // Fallback to recipe prop
      }
    }
    fetchDetails();
    return () => { ignore = true; };
  }, [id, recipe]);
  
  const ingredients = useMemo(() => {
    if (!fullRecipe) return [];
    const out = [];
    
    // Handle MealDB format (strIngredient1, strIngredient2, etc.)
    for (let i = 1; i <= 20; i++) {
      const ing = fullRecipe[`strIngredient${i}`];
      const meas = fullRecipe[`strMeasure${i}`];
      if (ing && ing.trim()) out.push(`${ing}${meas ? ` - ${meas}` : ""}`);
    }
    
    // If MealDB format found ingredients, return them
    if (out.length > 0) return out;
    
    // Handle premium format - ingredients as string (split by newlines)
    if (fullRecipe.ingredients && typeof fullRecipe.ingredients === 'string') {
      return fullRecipe.ingredients
        .split('\n')
        .map(line => line.trim())
        .filter(line => line.length > 0);
    }
    
    // Handle premium format - ingredients as array
    if (Array.isArray(fullRecipe.ingredients)) {
      return fullRecipe.ingredients;
    }
    
    return [];
  }, [fullRecipe]);
  
  if (!fullRecipe) return null;
  
  // Normalize field names (support both MealDB and premium formats)
  const title = fullRecipe.strMeal || fullRecipe.title || fullRecipe.name || "Untitled Recipe";
  const image = fullRecipe.strMealThumb || fullRecipe.image || fullRecipe.image_url || fullRecipe.imageUrl;
  const category = fullRecipe.strCategory || fullRecipe.category || 'N/A';
  const area = fullRecipe.strArea || fullRecipe.area || fullRecipe.cuisine || 'N/A';
  const instructions = fullRecipe.strInstructions || fullRecipe.instructions || fullRecipe.directions || 'No instructions available.';
  const description = fullRecipe.description || fullRecipe.strDescription || '';
  const video = fullRecipe.video || fullRecipe.strYoutube || '';
  
  // Check if user has premium access (same logic as main component)
  const currentUser = user?.user || user;
  const normalizedSubscription = currentUser?.subscription
    ? {
        ...currentUser.subscription,
        isActive: String(currentUser.subscription.isActive).toLowerCase() === "true",
        expiresAt: currentUser.subscription.expiresAt
          ? new Date(
              currentUser.subscription.expiresAt.$date ||
              currentUser.subscription.expiresAt
            )
          : null,
      }
    : null;
  
  const isPremiumUser = normalizedSubscription &&
    normalizedSubscription.isActive &&
    normalizedSubscription.expiresAt &&
    normalizedSubscription.expiresAt > new Date();
  
  const handleVideoClick = (e) => {
    console.log('Video clicked. isPremiumUser:', isPremiumUser);
    console.log('User subscription:', normalizedSubscription);
    if (!isPremiumUser) {
      e.preventDefault();
      // Show alert message
      const userConfirmed = window.confirm('Subscribe to watch video tutorials!\n\nClick OK to go to subscription page.');
      if (userConfirmed) {
        if (navigate) {
          navigate('/subscribe');
        } else {
          window.location.href = '/subscribe';
        }
      }
    }
  };
  
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content enhanced-modal" onClick={e => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>×</button>
        
        <div className="modal-header-section">
          <img src={fallbackImg(image)} alt={title} className="modal-image-enhanced" />
          <div className="modal-title-section">
            <h2 className="modal-title-enhanced">{title}</h2>
            {description && (
              <p className="modal-description">{description}</p>
            )}
            <div className="modal-badges">
              <span className="badge badge-category">{category}</span>
              <span className="badge badge-area">{area}</span>
            </div>
          </div>
        </div>

        <div className="modal-body-section">
          <div className="modal-section">
            <h3 className="section-heading">
              <span className="section-icon">🥘</span>
              Ingredients
            </h3>
            <ul className="ingredients-list">
              {ingredients.length > 0 ? (
                ingredients.map((item, idx) => (<li key={idx}>{item}</li>))
              ) : (
                <li>No ingredients listed</li>
              )}
            </ul>
          </div>

          <div className="modal-section">
            <h3 className="section-heading">
              <span className="section-icon">📋</span>
              Instructions
            </h3>
            <div className="instructions-content">{instructions}</div>
          </div>

          {video && (
            <div className="modal-section">
              <h3 className="section-heading">
                <span className="section-icon">🎥</span>
                Video Tutorial
              </h3>
              {isPremiumUser ? (
                <a 
                  href={video} 
                  target="_blank"
                  rel="noopener noreferrer"
                  className="video-link-button"
                >
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M8 5v14l11-7z"/>
                  </svg>
                  Watch Video Tutorial
                </a>
              ) : (
                <button
                  className="video-link-button"
                  onClick={handleVideoClick}
                  style={{ cursor: 'pointer', border: 'none', background: 'linear-gradient(135deg, #ff6600, #ff8533)' }}
                >
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M8 5v14l11-7z"/>
                  </svg>
                  🔒 Premium - Watch Video Tutorial
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Section Row Component
const SectionRow = ({ title, subtitle, meals, onCardClick, onViewAll, token }) => (
  <section className="section-block">
    <div className="section-head">
      <div>
        <h3 className="section-title">{title}</h3>
        {subtitle && <p className="section-subtitle">{subtitle}</p>}
      </div>
      {meals && meals.length > 0 && (
        <button className="view-all" onClick={onViewAll}>View All</button>
      )}
    </div>
    <div className="row-scroller">
      {meals && meals.length > 0 ? (
        meals.map(m => (
          <div key={m.idMeal} onClick={() => onCardClick(m)} className="recipe-card-wrapper">
            <RecipeCard
              recipe={{
                id: m.idMeal,
                title: m.strMeal,
                image: fallbackImg(m.strMealThumb)
              }}
              token={token}
            />
          </div>
        ))
      ) : (
        <div className="empty-row-placeholder">
          <p>Loading {title.toLowerCase()}...</p>
        </div>
      )}
    </div>
  </section>
);

const Recipes = ({ token, user }) => {
  const [recipes, setRecipes] = useState([]);
  const [userRecipes, setUserRecipes] = useState([]);
  const [premiumRecipes, setPremiumRecipes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [msg, setMsg] = useState("");
  const [selectedRecipe, setSelectedRecipe] = useState(null);
  const [categories, setCategories] = useState([]);
  const [areas, setAreas] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedArea, setSelectedArea] = useState("");
  const [areaRows, setAreaRows] = useState([]);
  const [categoryRows, setCategoryRows] = useState([]);
  const cacheRef = useRef(new Map());
  const [loadingPremium, setLoadingPremium] = useState(false);
  const navigate = useNavigate();

  const [activeFilterType, setActiveFilterType] = useState("");
  const [currentFilterTitle, setCurrentFilterTitle] = useState("");

  const landingVisible = !selectedCategory && !selectedArea && !search.trim();
  const isFilteredView = !landingVisible && (selectedCategory || selectedArea) && !search.trim();

  // Premium status
  const currentUser = user?.user || user; // ✅ handles both wrapped/unwrapped forms

const normalizedSubscription = currentUser?.subscription
  ? {
      ...currentUser.subscription,
      isActive: String(currentUser.subscription.isActive).toLowerCase() === "true",
      expiresAt: currentUser.subscription.expiresAt
        ? new Date(
            currentUser.subscription.expiresAt.$date ||
            currentUser.subscription.expiresAt
          )
        : null,
    }
  : null;

const isPremiumActive =
  normalizedSubscription &&
  normalizedSubscription.isActive &&
  normalizedSubscription.expiresAt &&
  normalizedSubscription.expiresAt > new Date();

console.log("Subscription check:", normalizedSubscription);
console.log("User premium status:", isPremiumActive);

  console.log("User premium status:", isPremiumActive);
  useEffect(() => {
    let ignore = false;
    const url = `${API_BASE}/api/recipes/meta`;
    if (cacheRef.current.has(url)) {
      const data = cacheRef.current.get(url);
      setCategories(data.categories || []);
      setAreas(data.areas || []);
      return;
    }
    async function fetchFilters() {
      try {
        const res = await fetch(url);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        cacheRef.current.set(url, data);
        if (!ignore) {
          setCategories(data.categories || []);
          setAreas(data.areas || []);
        }
      } catch (e) {
        console.error("Meta fetch error:", e);
      }
    }
    fetchFilters();
    return () => { ignore = true; };
  }, []);

  useEffect(() => {
    let ignore = false;
    const raw = localStorage.getItem(LS_KEY);
    if (raw) {
      const { areaRows: ar, categoryRows: cr, ts } = JSON.parse(raw);
      if (Date.now() - ts < 1000 * 60 * 30) {
        setAreaRows(ar || []);
        setCategoryRows(cr || []);
        return;
      }
    }
    async function cachedFetch(url) {
      if (cacheRef.current.has(url)) return cacheRef.current.get(url);
      const res = await fetch(url);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      cacheRef.current.set(url, data);
      return data;
    }
    async function fetchLanding() {
      try {
        setLoading(true);
        const areaPromises = FEATURED_AREAS.map(a =>
          cachedFetch(`${API_BASE}/api/recipes/filter?a=${encodeURIComponent(a)}`)
        );
        const catPromises = FEATURED_CATEGORIES.map(c =>
          cachedFetch(`${API_BASE}/api/recipes/filter?c=${encodeURIComponent(c)}`)
        );
        const [areaData, catData] = await Promise.all([
          Promise.all(areaPromises),
          Promise.all(catPromises)
        ]);
        if (ignore) return;
        const aRows = FEATURED_AREAS.map((name, i) => ({
          label: pickTitleForArea(name),
          subtitle: pickSubtitleForArea(name),
          meals: shuffleFew(areaData[i]?.meals || [], 10)
        }));
        const cRows = FEATURED_CATEGORIES.map((name, i) => ({
          label: pickTitleForCategory(name),
          subtitle: pickSubtitleForCategory(name),
          meals: shuffleFew(catData[i]?.meals || [], 10)
        }));
        setAreaRows(aRows);
        setCategoryRows(cRows);
        localStorage.setItem(LS_KEY, JSON.stringify({
          areaRows: aRows,
          categoryRows: cRows,
          ts: Date.now()
        }));
      } catch (e) {
        console.error("Landing fetch error:", e);
        if (!ignore) {
          setAreaRows(FEATURED_AREAS.map(name => ({
            label: pickTitleForArea(name),
            subtitle: pickSubtitleForArea(name),
            meals: []
          })));
          setCategoryRows(FEATURED_CATEGORIES.map(name => ({
            label: pickTitleForCategory(name),
            subtitle: pickSubtitleForCategory(name),
            meals: []
          })));
        }
      } finally {
        if (!ignore) setLoading(false);
      }
    }
    fetchLanding();
    return () => { ignore = true; };
  }, []);

  useEffect(() => {
    async function fetchUserRecipes() {
      try {
        const res = await fetch(`${API_BASE}/api/user-recipes/all`);
        const data = await res.json();
        setUserRecipes(data.recipes || []);
      } catch (e) {
        console.error("Error loading user recipes:", e);
        setUserRecipes([]);
      }
    }
    fetchUserRecipes();
  }, []);

  useEffect(() => {
  async function fetchPremiumRecipes() {
    if (!isPremiumActive) {
      setPremiumRecipes([]);
      return;
    }
    try {
      const res = await fetch(`${API_BASE}/api/recipes/premium`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      // If unauthorized or forbidden
      if (!res.ok) {
        const errorData = await res.json();
        console.warn("Premium fetch failed:", errorData.message);
        setPremiumRecipes([]);
        return;
      }

      const data = await res.json();
      if (data.success && Array.isArray(data.recipes)) {
        setPremiumRecipes(data.recipes);
      } else {
        setPremiumRecipes([]);
      }
    } catch (e) {
      console.error("Error loading premium recipes:", e);
      setPremiumRecipes([]);
    }
  }

  fetchPremiumRecipes();
}, [isPremiumActive, token]);


  useEffect(() => {
    let ignore = false;
    async function cachedFetch(url) {
      if (cacheRef.current.has(url)) return cacheRef.current.get(url);
      const res = await fetch(url);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      cacheRef.current.set(url, data);
      return data;
    }
    async function fetchRecipes() {
      if (!selectedCategory && !selectedArea && !search.trim()) return;
      setLoading(true);
      setError(null);
      setMsg("");
      try {
        let url = null;
        if (selectedCategory) {
          url = `${API_BASE}/api/recipes/filter?c=${encodeURIComponent(selectedCategory)}`;
        } else if (selectedArea) {
          url = `${API_BASE}/api/recipes/filter?a=${encodeURIComponent(selectedArea)}`;
        } else if (search.trim()) {
          url = `${API_BASE}/api/recipes/search?s=${encodeURIComponent(search.trim())}`;
        }
        if (!url) return;
        const data = await cachedFetch(url);
        if (!ignore) {
          if (data.meals && data.meals.length > 0) {
            setRecipes(data.meals);
            setMsg("");
          } else {
            setRecipes([]);
            setMsg("No recipes found.");
          }
        }
      } catch (e) {
        console.error("Recipes fetch error:", e);
        if (!ignore) {
          setError("Failed to fetch recipes. Please try again.");
          setRecipes([]);
        }
      } finally {
        if (!ignore) setLoading(false);
      }
    }
    const t = setTimeout(fetchRecipes, 300);
    return () => {
      clearTimeout(t);
      ignore = true;
    };
  }, [selectedCategory, selectedArea, search]);

  const handleBack = () => {
    setSelectedCategory("");
    setSelectedArea("");
    setSearch("");
    setActiveFilterType("");
    setCurrentFilterTitle("");
    setRecipes([]);
    setMsg("");
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  const viewAllArea = (name) => {
    setSelectedArea(name);
    setSelectedCategory("");
    setSearch("");
    setActiveFilterType("area");
    setCurrentFilterTitle(pickTitleForArea(name));
    requestAnimationFrame(() => {
      const el = document.getElementById("recipes-grid");
      if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  };
  const viewAllCategory = (name) => {
    setSelectedCategory(name);
    setSelectedArea("");
    setSearch("");
    setActiveFilterType("category");
    setCurrentFilterTitle(pickTitleForCategory(name));
    requestAnimationFrame(() => {
      const el = document.getElementById("recipes-grid");
      if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  };
  const onCategoryChange = (value) => {
    setSelectedCategory(value);
    setSelectedArea("");
    setSearch("");
    if (value) {
      setActiveFilterType("category");
      setCurrentFilterTitle(pickTitleForCategory(value));
    } else {
      setActiveFilterType("");
      setCurrentFilterTitle("");
    }
    if (value) requestAnimationFrame(() => {
      const el = document.getElementById("recipes-grid");
      if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  };
  const onAreaChange = (value) => {
    setSelectedArea(value);
    setSelectedCategory("");
    setSearch("");
    if (value) {
      setActiveFilterType("area");
      setCurrentFilterTitle(pickTitleForArea(value));
    } else {
      setActiveFilterType("");
      setCurrentFilterTitle("");
    }
    if (value) requestAnimationFrame(() => {
      const el = document.getElementById("recipes-grid");
      if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  };
  const onCardClick = (meal) => setSelectedRecipe(meal);
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (search.trim()) {
      setSearch(search.trim());
      setSelectedCategory("");
      setSelectedArea("");
      setActiveFilterType("");
      setCurrentFilterTitle("");
    }
  };

  return (
    <div className="recipes-container">
      <header className="recipes-header">
        <h1>🍽 Discover Delicious Recipes</h1>
        <p>Explore a world of flavors and cooking inspiration!</p>
      </header>
      <div className="top-search-section">
        <form className="top-search-form" onSubmit={handleSearchSubmit}>
          <div className="search-box-large">
            <input
              type="text"
              placeholder="Search for recipes, ingredients, or cuisines..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setSelectedCategory("");
                setSelectedArea("");
                setActiveFilterType("");
                setCurrentFilterTitle("");
              }}
              className="search-input-large"
            />
            <button type="submit" className="search-btn-large">🔍</button>
          </div>
        </form>
        <div className="top-filters">
          <select 
            value={selectedCategory} 
            onChange={e => onCategoryChange(e.target.value)}
            className="filter-select"
          >
            <option value="">All Categories</option>
            {categories.map(cat => (
              <option key={cat.strCategory} value={cat.strCategory}>{cat.strCategory}</option>
            ))}
          </select>
          <select 
            value={selectedArea} 
            onChange={e => onAreaChange(e.target.value)}
            className="filter-select"
          >
            <option value="">All Areas</option>
            {areas.map(area => (
              <option key={area.strArea} value={area.strArea}>{area.strArea}</option>
            ))}
          </select>
        </div>
      </div>
      {/* Premium Recipes Section */}
      <section className="section-block premium-section">
        <section className="section-block premium-section">
          <h3 className="section-title">Premium Recipes</h3>

          {!isPremiumActive ? (
            <div className="premium-locked-box">
              <p className="premium-message">
                🔒 These exclusive recipes are available only to premium members.
              </p>
              <button
                className="upgrade-btn"
                onClick={() => navigate("/subscribe")}
              >
                Upgrade to Premium
              </button>
            </div>
          ) : premiumRecipes.length > 0 ? (
            <div className="row-scroller">
              {premiumRecipes.map(recipe => (
                <div 
                  key={recipe._id} 
                  onClick={() => setSelectedRecipe({
                    idMeal: recipe._id,
                    strMeal: recipe.title,
                    strMealThumb: recipe.image || recipe.image_url || recipe.imageUrl,
                    strCategory: recipe.category || 'Premium',
                    strArea: recipe.area || 'Various',
                    strInstructions: recipe.instructions || 'Premium recipe instructions.',
                    ...recipe
                  })} 
                  className="recipe-card-wrapper"
                >
                  <RecipeCard
                    recipe={{
                      id: recipe._id,
                      title: recipe.title,
                      image: fallbackImg(recipe.image || recipe.image_url || recipe.imageUrl),
                    }}
                    type="premium"
                    isUserPremium={isPremiumActive}
                    token={token}
                    onClick={() => setSelectedRecipe({
                      idMeal: recipe._id,
                      strMeal: recipe.title,
                      strMealThumb: recipe.image || recipe.image_url || recipe.imageUrl,
                      strCategory: recipe.category || 'Premium',
                      strArea: recipe.area || 'Various',
                      strInstructions: recipe.instructions || 'Premium recipe instructions.',
                      ...recipe
                    })}
                  />
                </div>
              ))}
            </div>
          ) : (
            <p className="info-msg">Loading premium recipes...</p>
          )}
        </section>
      </section>

      {/* User Recipes (Community) */}
      {userRecipes.length > 0 && (
        <section className="section-block">
          <h3 className="section-title">Recipes from our users</h3>
          <div className="row-scroller">
            {userRecipes.map(recipe => (
              <RecipeCard
                key={recipe._id}
                recipe={{
                  id: recipe._id,
                  title: recipe.title,
                  image: fallbackImg(recipe.image_url),
                }}
                type="USER"
                onClick={() => {
                  // Convert user recipe format to modal format
                  setSelectedRecipe({
                    idMeal: recipe._id,
                    strMeal: recipe.title,
                    strMealThumb: recipe.image_url,
                    strInstructions: recipe.steps ? recipe.steps.join('\n\n') : 'No instructions available.',
                    strCategory: recipe.category || 'User Recipe',
                    strArea: recipe.region || 'Community',
                    description: recipe.description || '',
                    ingredients: recipe.ingredients || [],
                    video: recipe.video_url || ''
                  });
                }}
              />
            ))}
          </div>
        </section>
      )}
      

      {/* Featured Sections */}
      {landingVisible && (
        <>
          {areaRows.map((row, idx) => (
            <SectionRow
              key={`area-${idx}`}
              title={row.label}
              subtitle={row.subtitle}
              meals={row.meals}
              onCardClick={onCardClick}
              onViewAll={() => viewAllArea(FEATURED_AREAS[idx])}
              token={token}
            />
          ))}
          {categoryRows.map((row, idx) => (
            <SectionRow
              key={`cat-${idx}`}
              title={row.label}
              subtitle={row.subtitle}
              meals={row.meals}
              onCardClick={onCardClick}
              onViewAll={() => viewAllCategory(FEATURED_CATEGORIES[idx])}
              token={token}
            />
          ))}
        </>
      )}
      {!landingVisible && (
        <div className="filtered-results-section">
          {isFilteredView && (
            <div className="filter-header">
              <button 
                className="back-button" 
                onClick={handleBack}
                aria-label="Back to main page"
              >
                ← Back
              </button>
              <h2 className="filter-heading">{currentFilterTitle}</h2>
            </div>
          )}
          <div id="recipes-grid" className="recipes-grid">
            {loading ? (
              <p className="info-msg">Loading recipes...</p>
            ) : error ? (
              <p className="error-msg">{error}</p>
            ) : msg ? (
              <p className="info-msg">{msg}</p>
            ) : recipes.length === 0 ? (
              <p className="info-msg">No recipes to display.</p>
            ) : (
              recipes.map((recipe) => (
                <div key={recipe.idMeal} onClick={() => setSelectedRecipe(recipe)} className="recipe-card-wrapper">
                  <RecipeCard
                    recipe={{
                      title: recipe.strMeal,
                      image: fallbackImg(recipe.strMealThumb),
                      id: recipe.idMeal,
                    }}
                    token={token}
                  />
                </div>
              ))
            )}
          </div>
        </div>
      )}
      {selectedRecipe && (
        <RecipeDetailModal
          recipe={selectedRecipe}
          onClose={() => setSelectedRecipe(null)}
          user={user}
          navigate={navigate}
        />
      )}
    </div>
  );
};

export default Recipes;
