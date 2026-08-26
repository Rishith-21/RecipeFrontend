import React, { useState } from "react";
import { NavLink } from "react-router-dom";
import "./Header.css";

function Header({ userPhoto, unreadCount, setShowNotificationModal, onLogout, navigate }) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  const handleLogout = () => {
    if (onLogout) {
      onLogout();
      if (navigate) navigate("/login");
    }
  };

  return (
    <header className="homepage-header modern-navbar">
      <div className="logo-row">
        <span className="logo-circle">R</span>
        <span className="logo-name">Recipix</span>
      </div>
      <nav>
        <NavLink to="/home" className="nav-link">
          Home
        </NavLink>
        <NavLink to="/recipes" className="nav-link">
          Recipes
        </NavLink>
        <NavLink to="/Community" className="nav-link">
          Community
        </NavLink>
        <NavLink to="/subscribe" className="nav-link">
          Subscription
        </NavLink>
        <NavLink to="/mealplanner" className="nav-link">
          Meal Planner
        </NavLink>
      </nav>
      <div className="profile-section">
        {userPhoto ? (
          <img src={userPhoto} alt="User" className="profile-photo" />
        ) : (
          <span role="img" aria-label="profile" className="profile-icon">
            👤
          </span>
        )}
        <button
          className={`dropdown-arrow ${isDropdownOpen ? "open" : ""}`}
          onClick={toggleDropdown}
          aria-label="Toggle profile menu"
        >
          ▼
        </button>
        {isDropdownOpen && (
          <div className="profile-dropdown">
            <NavLink to="/profile" onClick={() => setIsDropdownOpen(false)}>My Profile</NavLink>
            <NavLink to="/my-recipes" onClick={() => setIsDropdownOpen(false)}>My Recipes</NavLink>
            <NavLink to="/favourite" onClick={() => setIsDropdownOpen(false)}>My favourites</NavLink>

            <button
              onClick={() => {
                setShowNotificationModal(true);
                setIsDropdownOpen(false);
              }}
              className="notifications-button"
            >
              Notifications{unreadCount > 0 && <span className="notif-dot" />}
            </button>
            <NavLink to="/help" onClick={() => setIsDropdownOpen(false)}>
              Help / Feedback
            </NavLink>
            <button onClick={handleLogout}>Logout</button>
          </div>
        )}
      </div>
    </header>
  );
}

export default Header;
