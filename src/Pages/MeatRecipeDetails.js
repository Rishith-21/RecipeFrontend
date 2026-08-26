import React from "react";
import { useParams, Link } from "react-router-dom";

const meatRecipes = {
  "Chicken Biryani": {
    ingredients: [
      "500g Chicken (bone-in preferred)",
      "2 cups Basmati Rice (soaked 30 mins)",
      "1 cup Yogurt (curd)",
      "2 large Onions (thinly sliced)",
      "2 Tomatoes (chopped)",
      "3 Green Chilies (slit)",
      "1 tbsp Ginger-Garlic Paste",
      "½ cup Fresh Coriander Leaves",
      "½ cup Mint Leaves",
      "4 tbsp Oil / Ghee",
      "1 Bay Leaf, 4 Cloves, 3 Cardamoms, 1 Cinnamon Stick, 1 Star Anise",
      "1 tsp Red Chili Powder",
      "1 tsp Turmeric Powder",
      "2 tsp Coriander Powder",
      "1 tsp Garam Masala / Biryani Masala",
      "Salt – as needed",
      "3 cups Water"
    ],
    steps: [
      "Wash & soak rice for 30 mins.",
      "Marinate chicken with yogurt, ginger-garlic paste, chili powder, turmeric, salt, and garam masala. Rest 30 mins.",
      "Heat oil/ghee, fry onions until golden brown (set half aside).",
      "Add whole spices, then add tomatoes, chilies, mint, coriander – cook into masala.",
      "Add marinated chicken, cook till 70% done.",
      "Boil soaked rice until 70% cooked. Drain.",
      "Layer rice over chicken, top with fried onions, mint, coriander, drizzle ghee.",
      "Cover & cook on low flame (dum) 20–25 mins.",
      "Fluff gently & serve hot with raita or salan."
    ]
  },

  "Mutton Biryani": {
    ingredients: [
      "500g Mutton",
      "2 cups Basmati Rice",
      "2 Onions",
      "2 Tomatoes",
      "1 cup Yogurt",
      "Whole Spices: Cloves, Cardamom, Bay leaf, Cinnamon",
      "2 tbsp Ginger-Garlic Paste",
      "1 tsp Red Chili Powder",
      "1 tsp Turmeric Powder",
      "2 tsp Coriander Powder",
      "1 tsp Garam Masala",
      "Oil/Ghee as needed",
      "Salt to taste"
    ],
    steps: [
      "Marinate mutton with yogurt, ginger-garlic paste, and spices. Rest for 1 hour.",
      "Cook mutton with onions, tomatoes, and oil until tender.",
      "Parboil rice with salt & whole spices until 70% cooked.",
      "Layer rice and cooked mutton together in a pot.",
      "Top with fried onions, coriander, and mint leaves.",
      "Seal the pot and cook on dum (low flame) for 30 mins.",
      "Serve hot with raita or salan."
    ]
  },

  "Fish Fry": {
    ingredients: [
      "500g Fish pieces",
      "2 tbsp Lemon juice",
      "1 tbsp Ginger Garlic Paste",
      "1 tsp Turmeric",
      "1 tsp Red Chili Powder",
      "1 tsp Coriander Powder",
      "Salt as needed",
      "Oil for frying"
    ],
    steps: [
      "Marinate fish with lemon juice, ginger-garlic paste, and spices.",
      "Keep aside for 20–30 minutes.",
      "Heat oil in a pan and shallow fry fish on medium flame.",
      "Fry until golden and crisp on both sides.",
      "Serve hot with onion rings and lemon wedges."
    ]
  },

  "Egg Curry": {
    ingredients: [
      "4 Boiled Eggs",
      "2 Onions",
      "2 Tomatoes",
      "1 tbsp Ginger Garlic Paste",
      "1 tsp Turmeric Powder",
      "1 tsp Red Chili Powder",
      "2 tsp Coriander Powder",
      "1 tsp Garam Masala",
      "Salt to taste",
      "Oil as required"
    ],
    steps: [
      "Heat oil, sauté onions till golden brown.",
      "Add ginger-garlic paste and tomatoes, cook till mushy.",
      "Add spices and cook until oil separates.",
      "Add boiled eggs (slightly slit) into the curry.",
      "Simmer for 5–7 minutes.",
      "Serve hot with rice or roti."
    ]
  }
};

function MeatRecipeDetails() {
  const { recipeName } = useParams();
  const recipe = meatRecipes[decodeURIComponent(recipeName)];

  if (!recipe) {
    return <h2>Recipe not found!</h2>;
  }

  return (
    <div style={{ padding: "20px" }}>
      <Link to="/meat">⬅ Back to Meat Recipes</Link>
      <h1>{recipeName}</h1>

      <h2>📝 Ingredients</h2>
      <ul>
        {recipe.ingredients.map((item, idx) => (
          <li key={idx}>{item}</li>
        ))}
      </ul>

      <h2>👨‍🍳 Steps</h2>
      <ol>
        {recipe.steps.map((step, idx) => (
          <li key={idx}>{step}</li>
        ))}
      </ol>
    </div>
  );
}

export default MeatRecipeDetails;
