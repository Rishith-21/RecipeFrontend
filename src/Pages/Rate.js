import React, { useState } from "react";

function Rate() {
  const [rating, setRating] = useState(0);

  return (
    <div style={{ padding: "20px" }}>
      <h1>⭐ Rate Us</h1>
      <p>Click on the stars to rate:</p>
      {[1, 2, 3, 4, 5].map((star) => (
        <span
          key={star}
          onClick={() => setRating(star)}
          style={{
            fontSize: "30px",
            cursor: "pointer",
            color: rating >= star ? "gold" : "gray",
          }}
        >
          ★
        </span>
      ))}
      <p>Your Rating: {rating} / 5</p>
    </div>
  );
}

export default Rate;
