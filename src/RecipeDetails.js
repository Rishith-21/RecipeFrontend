import React from "react";
import { useParams, Link } from "react-router-dom";

const recipes = {
  "Palak Paneer": {
    img: "/images/palak.jpg",
    time: "40 mins",
    serves: "2–3 people",
    ingredients: [
      "250g Paneer",
      "2 cups Spinach (Palak)",
      "2 Onions",
      "2 Tomatoes",
      "2 Green Chilies",
      "1 tsp Ginger Garlic Paste",
      "1 tsp Garam Masala",
      "½ tsp Turmeric",
      "1 tsp Red Chili Powder",
      "Salt to taste",
      "2 tbsp Oil or Ghee",
      "2 tbsp Fresh Cream (for garnish)",
    ],
    steps: [
      "Wash spinach and blanch in hot water for 2–3 mins, then make a smooth puree.",
      "Heat oil, sauté onions until golden, add ginger garlic paste.",
      "Add tomatoes, green chilies, and all dry spices. Cook until masala releases oil.",
      "Mix in spinach puree and simmer for 5 minutes.",
      "Add paneer cubes, stir gently, cook for another 5 minutes.",
      "Garnish with cream and serve hot with roti or jeera rice.",
    ],
  },

  "Veg Pulao": {
    img: "/images/pulao.jpg",
    time: "30 mins",
    serves: "3–4 people",
    ingredients: [
      "2 cups Basmati Rice (soaked 30 mins)",
      "1 cup Mixed Vegetables (carrot, beans, peas, cauliflower)",
      "2 Onions (sliced)",
      "2 Green Chilies",
      "Whole spices (bay leaf, cinnamon, cardamom, cloves)",
      "1 tsp Ginger Garlic Paste",
      "3 cups Water",
      "Salt to taste",
      "2 tbsp Ghee or Oil",
      "Coriander leaves (for garnish)",
    ],
    steps: [
      "Heat ghee, add whole spices and fry until fragrant.",
      "Add onions, chilies, and ginger garlic paste. Cook until golden.",
      "Add vegetables, sauté 2–3 mins.",
      "Add soaked rice, salt, and water. Mix gently.",
      "Cover and cook on low flame until rice is fluffy.",
      "Garnish with coriander leaves. Serve with raita or curry.",
    ],
  },

  "Mixed Veg Curry": {
    img: "/images/mixedveg.jpg",
    time: "35 mins",
    serves: "3–4 people",
    ingredients: [
      "1 cup Mixed Vegetables (carrot, beans, peas, potato, capsicum)",
      "2 Onions",
      "2 Tomatoes",
      "2 Green Chilies",
      "1 tsp Ginger Garlic Paste",
      "½ tsp Turmeric",
      "1 tsp Red Chili Powder",
      "1 tsp Garam Masala",
      "½ cup Curd or Cream",
      "2 tbsp Oil",
      "Salt to taste",
    ],
    steps: [
      "Chop vegetables and parboil them (optional).",
      "Heat oil, sauté onions until golden, add ginger garlic paste.",
      "Add tomatoes, chilies, and spices. Cook until masala thickens.",
      "Add curd/cream and stir well.",
      "Add vegetables, mix and simmer until cooked.",
      "Serve with chapati or rice.",
    ],
  },

  "Paneer Butter Masala": {
    img: "/images/paneerbutter.jpg",
    time: "40 mins",
    serves: "2–3 people",
    ingredients: [
      "250g Paneer (cubed)",
      "2 Tomatoes (pureed)",
      "1 Onion (finely chopped)",
      "2 tbsp Butter",
      "2 tbsp Fresh Cream",
      "1 tsp Ginger Garlic Paste",
      "1 tsp Red Chili Powder",
      "1 tsp Garam Masala",
      "½ tsp Turmeric",
      "1 tbsp Cashew Paste",
      "Salt to taste",
    ],
    steps: [
      "Heat butter, sauté onions until soft, add ginger garlic paste.",
      "Add tomato puree, cook until oil separates.",
      "Mix in cashew paste, chili powder, turmeric, garam masala.",
      "Add paneer cubes and a little water, cook 5 mins.",
      "Stir in cream and simmer for 2 minutes.",
      "Serve with naan, roti or rice.",
    ],
  },

  "Rajma (Kidney Bean Curry)": {
    img: "/images/rajma.jpg",
    time: "50 mins",
    serves: "3–4 people",
    ingredients: [
      "1 cup Rajma (Kidney beans, soaked overnight)",
      "2 Onions",
      "2 Tomatoes",
      "1 tsp Ginger Garlic Paste",
      "2 Green Chilies",
      "½ tsp Turmeric",
      "1 tsp Red Chili Powder",
      "1 tsp Coriander Powder",
      "1 tsp Garam Masala",
      "2 tbsp Oil",
      "Salt to taste",
      "Coriander leaves (for garnish)",
    ],
    steps: [
      "Pressure cook soaked rajma until soft (4–5 whistles).",
      "Heat oil, sauté onions until golden, add ginger garlic paste.",
      "Add tomatoes, chilies, and spices. Cook until masala thickens.",
      "Add boiled rajma with some water, simmer for 15–20 mins.",
      "Mash some rajma for thickness.",
      "Garnish with coriander and serve with jeera rice or roti.",
    ],
  },
};

function RecipeDetails() {
  const { recipeName } = useParams();
  const recipe = recipes[decodeURIComponent(recipeName)];

  if (!recipe) {
    return <h2 style={{ textAlign: "center", marginTop: "50px" }}>❌ Recipe not found!</h2>;
  }

  return (
    <div style={{ padding: "20px", maxWidth: "900px", margin: "0 auto", fontFamily: "Arial, sans-serif" }}>
      <Link to="/veg" style={{ textDecoration: "none", fontSize: "18px", color: "green" }}>
        ⬅ Back to Veg Recipes
      </Link>

      <div style={{ textAlign: "center", marginTop: "20px" }}>
        <h1 style={{ color: "#2E7D32" }}>{recipeName}</h1>
        <p style={{ fontSize: "16px", color: "#555" }}>
          ⏱ {recipe.time} | 🍽 Serves: {recipe.serves}
        </p>
        {recipe.img && (
          <img
            src={recipe.img}
            alt={recipeName}
            style={{
              width: "100%",
              maxHeight: "400px",
              objectFit: "cover",
              borderRadius: "15px",
              margin: "20px 0",
              boxShadow: "0px 4px 10px rgba(0,0,0,0.2)",
            }}
          />
        )}
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "20px",
          marginTop: "30px",
        }}
      >
        {/* Ingredients */}
        <div
          style={{
            background: "#f9fbe7",
            padding: "20px",
            borderRadius: "15px",
            boxShadow: "0px 3px 6px rgba(0,0,0,0.1)",
          }}
        >
          <h2 style={{ color: "#33691E" }}>📝 Ingredients</h2>
          <ul style={{ lineHeight: "1.8", fontSize: "15px" }}>
            {recipe.ingredients.map((item, idx) => (
              <li key={idx}>{item}</li>
            ))}
          </ul>
        </div>

        {/* Steps */}
        <div
          style={{
            background: "#fff3e0",
            padding: "20px",
            borderRadius: "15px",
            boxShadow: "0px 3px 6px rgba(0,0,0,0.1)",
          }}
        >
          <h2 style={{ color: "#E65100" }}>👨‍🍳 Steps</h2>
          <ol style={{ lineHeight: "1.8", fontSize: "15px" }}>
            {recipe.steps.map((step, idx) => (
              <li key={idx}>{step}</li>
            ))}
          </ol>
        </div>
      </div>
    </div>
  );
}

export default RecipeDetails;

