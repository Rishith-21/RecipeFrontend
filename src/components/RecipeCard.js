import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import "./RecipeCard.css";

const API_BASE = process.env.REACT_APP_API_BASE || "http://localhost:5000";

const RecipeCard = ({
  recipe,
  onClick,
  token,
  type = "public", // "public", "community", or "premium"
  isUserPremium = false // Pass from parent to indicate if user has premium access
}) => {
  const [liked, setLiked] = useState(false);
  const [favourited, setFavourited] = useState(false);
  const [isAdding, setIsAdding] = useState(false);

  if (!recipe || typeof recipe !== "object") return null;

  // If type is premium and user is NOT premium, disable clicking/viewing
  const isAccessible = type !== "premium" || isUserPremium;

  const handleCardClick = (e) => {
    if (!isAccessible) {
      alert("This is a premium recipe. Please subscribe to view details.");
      e.stopPropagation();
      return;
    }
    if (onClick) onClick(recipe);
  };

  const handleLike = (e) => {
    e.stopPropagation();
    setLiked(!liked);
  };

  const handleFavourite = async (e) => {
    e.stopPropagation();

    if (!token) {
      alert("Please log in to save favourites");
      return;
    }

    const nextFavourited = !favourited;
    setFavourited(nextFavourited);
    setIsAdding(true);

    try {
      const recipeData = {
        id: recipe.id || recipe.idMeal,
        title: recipe.title || recipe.strMeal,
        image: recipe.image || recipe.strMealThumb,
      };

      if (nextFavourited) {
        const response = await fetch(`${API_BASE}/api/favourites`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`,
          },
          body: JSON.stringify({ recipe: recipeData }),
        });

        if (!response.ok) {
          if (response.status === 200) {
            console.log("Recipe already in favourites");
          } else {
            const errorData = await response.json();
            throw new Error(errorData.error || `HTTP ${response.status}`);
          }
        }

        console.log("Recipe added to favourites successfully");
      } else {
        // Removing from favourites - implement DELETE endpoint when available
        console.log("Removing from favourites - implement DELETE endpoint");
      }
    } catch (error) {
      console.error("Error toggling favourite:", error);
      setFavourited(!nextFavourited);
      alert(`Failed to ${nextFavourited ? "add" : "remove"} favourite: ${error.message}`);
    } finally {
      setIsAdding(false);
    }
  };

  // Cooking time placeholder
  const cookingTime = recipe.cookingTime || 30;

  return (
    <motion.div
      className={`recipe-card ${!isAccessible ? "locked" : ""}`}
      onClick={handleCardClick}
      whileHover={{ y: isAccessible ? -8 : 0 }}
      whileTap={{ scale: isAccessible ? 0.98 : 1 }}
      role="button"
      tabIndex={0}
      onKeyDown={e => (e.key === "Enter" && isAccessible ? handleCardClick(e) : null)}
      aria-label={`View recipe: ${recipe.title}${!isAccessible ? " (premium locked)" : ""}`}
    >
      <div className="image-container">
        <img
          src={recipe.image || "https://via.placeholder.com/300x200?text=No+Image"}
          alt={recipe.title || "Recipe Image"}
          className="recipe-image"
        />
        {type === "premium" && <div className="premium-badge">Premium</div>}
        {type === "community" && <div className="community-badge">Community</div>}
      </div>

      <div className="recipe-card-body">
        {/* Cooking time could be shown */}
        {/* <div className="time-badge">
          <span className="time-icon">⏱</span>
          <span className="time-text">{cookingTime} min</span>
        </div> */}

        <h3 className="card-title" title={recipe.title}>
          {recipe.title || "Untitled Recipe"}
        </h3>

        <div className="card-footer">
          <div className="view-details" onClick={isAccessible ? handleCardClick : undefined}>
            <span className="view-icon">👁</span>
            <span className="view-text">View Recipe</span>
          </div>

          <div className="actions-bottom">
            <motion.button
              className={`action-button like-button ${liked ? "liked" : ""}`}
              onClick={handleLike}
              whileTap={{ scale: 0.8 }}
              animate={{
                scale: liked ? [1, 1.4, 1] : 1,
                rotate: liked ? [0, -10, 10, 0] : 0,
              }}
              transition={{ duration: 0.4 }}
              title={liked ? "Unlike" : "Like"}
              aria-pressed={liked}
              disabled={!isAccessible}
            >
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill={liked ? "#e63946" : "none"}
                stroke={liked ? "#e63946" : "#888"}
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M12 21.35l-1.45-1.32C5.2 15.36 2 12.28 2 8.5
                      2 5.41 4.42 3 7.5 3c1.74 0 3.41 1 4.22 2.09
                      C12.91 4 14.58 3 16.5 3 19.58 3 22 5.41 22 8.5
                      c0 3.78-3.2 6.86-8.55 11.54L12 21.35z" />
              </svg>
            </motion.button>

            <motion.button
              className={`action-button favourite-button ${
                favourited ? "favourited" : ""
              } ${isAdding ? "loading" : ""}`}
              onClick={handleFavourite}
              whileTap={{ scale: 0.9 }}
              animate={{
                scale: favourited ? [1, 1.3, 1] : 1,
                rotate: favourited ? [0, 5, -5, 0] : 0,
              }}
              transition={{ duration: 0.4 }}
              disabled={isAdding || !isAccessible}
              title={
                isAdding 
                  ? "Adding..." 
                  : favourited 
                  ? "Added to Favourites" 
                  : token 
                  ? "Add to Favourites" 
                  : "Log in to add favourites"
              }
              aria-pressed={favourited}
            >
              {isAdding ? (
                <div className="spinner"></div>
              ) : (
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill={favourited ? "#ffd700" : "none"}
                  stroke={favourited ? "#ffd700" : "#999"}
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M12 17.27L18.18 21l-1.64-7.03
                        L22 9.24l-7.19-.61L12 2 9.19 8.63
                        2 9.24l5.46 4.73L5.82 21z" />
                </svg>
              )}
            </motion.button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default RecipeCard;
