import React from "react";
import "./LearnMoreModal.css";

function LearnMoreModal({ show, onClose }) {
  if (!show) return null;

  return (
    <div className="lm-overlay" onClick={onClose}>
      <div className="lm-modal" onClick={e => e.stopPropagation()}>
        <button className="lm-close-btn" onClick={onClose} aria-label="Close Learn More Modal">
          ×
        </button>
        <h2>About Recipix</h2>
        <p>
          Recipix brings you over 100+ authentic recipes worldwide, helpful cooking tips from expert chefs,
          and a vibrant community to share your culinary journey. Explore unique dishes, improve your
          skills, and connect with food lovers.
        </p>
        <ul>
          <li>Personalized recipe recommendations</li>
          <li>Step-by-step cooking guides</li>
          <li>User-friendly recipe saving & sharing</li>
          <li>Community forums and chats</li>
          <li>Nutrition facts and meal planning</li>
        </ul>
      </div>
    </div>
  );
}

export default LearnMoreModal;
