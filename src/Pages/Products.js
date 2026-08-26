import React, { useState } from "react";
import packpaneer from "./images/packpaneer.jpg";
import Chickenmasala from "./images/chickenmasala.jpg";
import Fishmasala from "./images/fishmasala.jpg";
import chillipowder from "./images/chillipowder.jpg";
import Turmeric from "./images/turmericpowder.jpg";

function Products() {
  const [search, setSearch] = useState("");
  const [cart, setCart] = useState([]);
  const [paymentMethod, setPaymentMethod] = useState("");
  const [message, setMessage] = useState("");

  const productList = [
    { name: "Paneer Pack", price: "₹120", img: packpaneer },
    { name: "Chicken masala", price: "₹50", img:Chickenmasala },
    { name: "Fish masala", price: "₹30", img: Fishmasala },
    { name: "chillipowder", price: "₹50", img: chillipowder },
    { name: "Turmeric", price: "₹80", img:Turmeric  },
  ];

  // Filter products by search term
  const filteredProducts = productList.filter((product) =>
    product.name.toLowerCase().includes(search.toLowerCase())
  );

  // Handle add to cart
  const addToCart = (product) => {
    setCart([...cart, product]);
    setMessage(`${product.name} is added to cart ✅`);
    setTimeout(() => setMessage(""), 2000); // clear message after 2s
  };

  // Handle Buy
  const handleBuy = () => {
    if (!paymentMethod) {
      alert("⚠️ Please select a payment method before buying!");
      return;
    }
    alert(
      `🎉 Order placed successfully!\n\nItems: ${cart
        .map((item) => item.name)
        .join(", ")}\nPayment Method: ${paymentMethod}`
    );
    setCart([]);
    setPaymentMethod("");
  };

  return (
    <div style={{ padding: "20px" }}>
      <h1>🛒 Our Products</h1>

      {/* Success message */}
      {message && (
        <p
          style={{
            background: "#d4edda",
            color: "#155724",
            padding: "10px",
            borderRadius: "5px",
            marginBottom: "15px",
          }}
        >
          {message}
        </p>
      )}

      {/* Search bar */}
      <input
        type="text"
        placeholder="🔍 Search products..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        style={{
          padding: "10px",
          width: "100%",
          maxWidth: "400px",
          margin: "10px 0 20px 0",
          borderRadius: "8px",
          border: "1px solid #ccc",
          fontSize: "16px",
        }}
      />

      {/* Product Grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
          gap: "20px",
          marginTop: "20px",
        }}
      >
        {filteredProducts.length > 0 ? (
          filteredProducts.map((product, index) => (
            <div
              key={index}
              style={{
                border: "1px solid #ddd",
                borderRadius: "10px",
                padding: "10px",
                textAlign: "center",
                backgroundColor: "#fff",
                boxShadow: "0 2px 5px rgba(0,0,0,0.1)",
              }}
            >
              <img
                src={product.img}
                alt={product.name}
                style={{
                  width: "100%",
                  height: "150px",
                  borderRadius: "10px",
                  objectFit: "cover",
                }}
              />
              <h3 style={{ marginTop: "10px" }}>{product.name}</h3>
              <p style={{ color: "green", fontWeight: "bold" }}>
                {product.price}
              </p>
              <button
                onClick={() => addToCart(product)}
                style={{
                  backgroundColor: "#007bff",
                  color: "#fff",
                  border: "none",
                  padding: "8px 12px",
                  borderRadius: "5px",
                  cursor: "pointer",
                  marginTop: "10px",
                }}
              >
                ➕ Add to Cart
              </button>
            </div>
          ))
        ) : (
          <p style={{ gridColumn: "1 / -1", textAlign: "center" }}>
            ❌ No products found
          </p>
        )}
      </div>

      {/* Cart Section */}
      {cart.length > 0 && (
        <div
          style={{
            marginTop: "30px",
            padding: "20px",
            border: "1px solid #ddd",
            borderRadius: "10px",
            backgroundColor: "#f9f9f9",
          }}
        >
          <h2>🛍️ Cart</h2>
          <ul>
            {cart.map((item, index) => (
              <li key={index}>
                {item.name} - <b>{item.price}</b>
              </li>
            ))}
          </ul>

          {/* Payment Method */}
          <div style={{ marginTop: "15px" }}>
            <h3>💳 Select Payment Method</h3>
            <label>
              <input
                type="radio"
                name="payment"
                value="UPI"
                checked={paymentMethod === "UPI"}
                onChange={(e) => setPaymentMethod(e.target.value)}
              />{" "}
              UPI
            </label>
            <br />
            <label>
              <input
                type="radio"
                name="payment"
                value="Credit/Debit Card"
                checked={paymentMethod === "Credit/Debit Card"}
                onChange={(e) => setPaymentMethod(e.target.value)}
              />{" "}
              Credit/Debit Card
            </label>
            <br />
            <label>
              <input
                type="radio"
                name="payment"
                value="Cash on Delivery"
                checked={paymentMethod === "Cash on Delivery"}
                onChange={(e) => setPaymentMethod(e.target.value)}
              />{" "}
              Cash on Delivery
            </label>
          </div>

          {/* Buy Button */}
          <button
            onClick={handleBuy}
            style={{
              backgroundColor: "green",
              color: "#fff",
              border: "none",
              padding: "10px 15px",
              borderRadius: "5px",
              cursor: "pointer",
              marginTop: "20px",
              fontSize: "16px",
            }}
          >
            ✅ Buy Now
          </button>
        </div>
      )}
    </div>
  );
}

export default Products;
