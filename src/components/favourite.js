import React, { useState, useEffect } from "react";
import RecipeCard from "../components/RecipeCard"; // adjust path as needed
import "./favourite.css"; // separate styling

const API_BASE = process.env.REACT_APP_API_BASE || "http://localhost:5000";

const Favourites = ({ token, onAddToMealPlan }) => {
  const [favourites, setFavourites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch user's favourites
  useEffect(() => {
    if (!token) return;

    fetchFavourites();
  }, [token]);

  const fetchFavourites = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch(`${API_BASE}/api/favourites`, {
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      });

      if (!res.ok) {
        throw new Error("Failed to fetch favourites");
      }

      const data = await res.json();
      setFavourites(data.favourites || []);
    } catch (err) {
      console.error("Error fetching favourites:", err);
      setError("Failed to load your favourites. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveFavourite = async (favouriteId) => {
    try {
      const res = await fetch(`${API_BASE}/api/favourites/${favouriteId}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });

      if (!res.ok) {
        throw new Error("Failed to remove favourite");
      }

      // Update UI optimistically
      setFavourites(prev => prev.filter(fav => fav.id !== favouriteId));
      
      // Optional: show success message
      // toast.success("Removed from favourites");
    } catch (err) {
      console.error("Error removing favourite:", err);
      // Optional: revert UI or show error
      // toast.error("Failed to remove favourite");
      fetchFavourites(); // refresh on error
    }
  };

  const handleAddToMealPlan = (recipe) => {
    if (onAddToMealPlan) {
      onAddToMealPlan(recipe);
    }
    // Optional: close modal or show success
  };

  if (loading) {
    return (
      <div className="favourites-loading">
        <div className="spinner"></div>
        <p>Loading your favourites...</p>
      </div>
    );
  }

  return (
    <div className="favourites-page">
      <div className="favourites-header">
        <h1>Your Favourite Recipes</h1>
        <p>{favourites.length} recipes saved</p>
        <button 
          className="refresh-btn" 
          onClick={fetchFavourites}
          disabled={loading}
        >
          Refresh
        </button>
      </div>

      {error && (
        <div className="favourites-error">
          <p>{error}</p>
          <button onClick={fetchFavourites}>Try Again</button>
        </div>
      )}

      {favourites.length === 0 && !error ? (
        <div className="favourites-empty">
          <div className="empty-icon">⭐</div>
          <h3>No favourites yet</h3>
          <p>Save recipes you love to access them here anytime</p>
          <button className="browse-btn">
            Browse Recipes
          </button>
        </div>
      ) : (
        <div className="favourites-grid">
          {favourites.map((recipe) => (
            <div key={recipe.id} className="favourite-item">
              <RecipeCard
                recipe={{
                  id: recipe.recipeId,
                  title: recipe.title,
                  image: recipe.image,
                  token: {token}
                }}
                showFavourite={false} // don't show nested favourite button
                onClick={(recipe) => {
                  // handle recipe click - view details or navigate
                  console.log("View recipe:", recipe);
                }}
                onToggleFavourite={() => handleRemoveFavourite(recipe.id)}
                isFavourited={true}
              />
              
              {onAddToMealPlan && (
                <button 
                  className="add-to-plan-btn"
                  onClick={() => handleAddToMealPlan({
                    id: recipe.recipeId,
                    title: recipe.title,
                    image: recipe.image
                  })}
                >
                  Add to Meal Plan
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Favourites;
