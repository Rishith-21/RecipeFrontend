import React from "react";
import { Link } from "react-router-dom";
import palakpaneer from "./images/palakpaneer.jpg";
import VegPulao from "./images/vegpullov.jpg";
import  MixedVegCurry from "./images/mixvehcurry.jpg";
import PaneerButterMasala from "./images/paneerbutter.jpg";
import Rajma from "./images/rajma.jpg";

const vegDishes = [
  { name: "Palak Paneer", img: palakpaneer },
  { name: "Veg Pulao", img: VegPulao },
 { name: "Mixed Veg Curry", img: MixedVegCurry },
  { name: "Paneer Butter Masala", img: PaneerButterMasala},
 { name: "Rajma (Kidney Bean Curry)", img: Rajma },
];

function Veg() {
  return (
    <div style={{ padding: "20px" }}>
      <h1>🥗 Veg Recipes</h1>
      <div style={{ display: "flex", gap: "20px", flexWrap: "wrap" }}>
        {vegDishes.map((dish) => (
          <Link
            to={`/veg/${encodeURIComponent(dish.name)}`}
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

export default Veg;
