import React from "react";
import { Link } from "react-router-dom";
import muttonbriyani from "./images/mutton_briyani.jpg";
import chickenbriyani from "./images/chicken briyani.jpg";
import  fish from "./images/fish.jpg";
import eggcury from "./images/eggcury.jpg";
//import Rajma from "./images/rajma.jpg";

const meatDishes = [
  {  name: "chicken Biryani", img:chickenbriyani}, 
  { name: "Mutton Biryani", img: muttonbriyani },
  { name: "Fish Fry", img: fish },
  { name: "Egg Curry", img: eggcury },
];

function MeatRecipes() {
  return (
    <div style={{ padding: "20px" }}>
      <h1>🍗 Non-Veg Recipes</h1>
      <div style={{ display: "flex", gap: "20px", flexWrap: "wrap" }}>
        {meatDishes.map((dish) => (
          <Link
            to={`/meat/${encodeURIComponent(dish.name)}`}
            key={dish.name}
            style={{ textDecoration: "none", color: "black" }}
          >
            <div
              style={{
                width: "200px",
                border: "1px solid #ddd",
                borderRadius: "10px",
                padding: "10px",
                textAlign: "center",
                boxShadow: "0px 2px 5px rgba(0,0,0,0.2)",
              }}
            >
              <img
                src={dish.img}
                alt={dish.name}
                style={{ width: "100%", borderRadius: "10px" }}
              />
              <h3>{dish.name}</h3>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

export default MeatRecipes;
