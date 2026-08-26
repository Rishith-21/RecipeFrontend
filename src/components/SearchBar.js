import React from "react";
import { FaMicrophone } from "react-icons/fa"; // Use react-icons package

function SearchBar({ searchTerm, setSearchTerm, onMicClick }) {
  return (
    <div style={{ position: "relative", width: "50%" }}>
      <input
        type="text"
        placeholder="Search recipes..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        style={{
          padding: "10px 40px 10px 10px", // add right padding for icon
          fontSize: 16,
          width: "100%",
          marginBottom: 20,
          borderRadius: 8,
          border: "1px solid #ccc",
        }}
      />
      <FaMicrophone
        onClick={onMicClick}
        style={{
          position: "absolute",
          right: 10,
          top: "50%",
          transform: "translateY(-50%)",
          cursor: "pointer",
          color: "#ff8c00",
          fontSize: 20,
        }}
        title="Use voice search"
      />
    </div>
  );
}

export default SearchBar;
