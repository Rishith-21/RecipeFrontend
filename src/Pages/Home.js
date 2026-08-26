import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Slider from "react-slick";
import LearnMoreModal from "./LearnMoreModal";
import NotificationModal from "./NotificationModal";

import "./Home.css";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

function Home({ token, onLogout }) {
  const [userPhoto, setUserPhoto] = useState("");
  const [showVideo, setShowVideo] = useState(false);
  const [showLearnMore, setShowLearnMore] = useState(false);
  const [mealdbRecipes, setMealdbRecipes] = useState([]);
  const [showNotificationModal, setShowNotificationModal] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  const navigate = useNavigate();

  // Fetch unread count for notifications
  useEffect(() => {
    const fetchUnreadCount = async () => {
      if (token) {
        try {
          const res = await fetch("http://localhost:5000/api/notifications", {
            headers: { Authorization: `Bearer ${token}` },
          });
          const data = await res.json();
          setUnreadCount(data.notifications.filter((n) => !n.read).length);
        } catch {
          setUnreadCount(0);
        }
      }
    };
    fetchUnreadCount();
  }, [showNotificationModal, token]);

  useEffect(() => {
    async function fetchRecipes() {
      try {
        const response = await fetch(
          "https://www.themealdb.com/api/json/v1/1/search.php?s="
        );
        const data = await response.json();
        setMealdbRecipes(data.meals || []);
      } catch (err) {
        setMealdbRecipes([]);
      }
    }
    fetchRecipes();
  }, []);

  const handleWatchDemo = () => setShowVideo(true);
  const closeVideo = () => setShowVideo(false);

  // Replace with your Cloudinary video URL
  const videoUrl =
    "https://res.cloudinary.com/dhdevkjmg/video/upload/v1760943453/Cooking_demo_qilkdt.mp4";

  // React Slick carousel settings
  const sliderSettings = {
    dots: false,
    infinite: true,
    speed: 700,
    slidesToShow: 4,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 2000,
    arrows: false,
    responsive: [
      { breakpoint: 991, settings: { slidesToShow: 2 } },
      { breakpoint: 600, settings: { slidesToShow: 1 } },
    ],
  };

  // Log modal visibility for debug
  useEffect(() => {
    console.log("Modal show state:", showNotificationModal);
  }, [showNotificationModal]);

  return (
    <div className="homepage-container">
      <main className="main-container">
        {/* HEADER SECTION
        <Header
          userPhoto={userPhoto}
          unreadCount={unreadCount}
          setShowNotificationModal={setShowNotificationModal}
          onLogout={onLogout}
          navigate={navigate}
        /> */}

        <LearnMoreModal show={showLearnMore} onClose={() => setShowLearnMore(false)} />

        {/* HERO SECTION */}
        <section className="hero-section combined-hero">
          <div className="hero-content centered">
            <h1>
              Find Your Best <br />
              Cooking Recipes <span className="highlighted-orange">Here!</span>
            </h1>
            <div className="hero-buttons">
              <button className="orange-btn" onClick={() => setShowLearnMore(true)}>
                Learn More
              </button>
              <button className="play-btn" onClick={handleWatchDemo}>
                <span role="img" aria-label="Play">
                  ▶
                </span>{" "}
                Watch Demo
              </button>
            </div>

            {showVideo && (
              <div className="video-overlay">
                <div className="video-modal">
                  <button className="close-video" onClick={closeVideo}>
                    ×
                  </button>
                  <video src={videoUrl} controls autoPlay className="video-player" />
                </div>
              </div>
            )}

            <div className="features-row">
              <div className="feature-badge">
                <span className="feature-icon" role="img" aria-label="recipes">
                  📖
                </span>
                <div className="feature-details">
                  <h4>Over 100+</h4>
                  <p>recipes from around the world</p>
                </div>
              </div>
              <div className="feature-badge">
                <span className="feature-icon" role="img" aria-label="tips">
                  🍴
                </span>
                <div className="feature-details">
                  <h4>Cooking Tips</h4>
                  <p>Improve your cooking skills</p>
                </div>
              </div>
              <div className="feature-badge">
                <span className="feature-icon" role="img" aria-label="community">
                  👥
                </span>
                <div className="feature-details">
                  <h4>Communities</h4>
                  <p>Share and connect with people</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <div className="designed-divider"></div>

        {/* ORANGE FEATURE SECTION */}
        <section className="feature-highlight-section">
          <div className="feature-highlight-content">
            <div className="chef-info">
              <img src="/images/chef_pic.jpg" alt="Chef" className="chef-photo" />
              <div className="chef-details">
                <h3>Learn cooking hacks to cook easily and faster</h3>
                <p>
                  Cooking tips from top and experienced chefs will help you to efficiently
                  save your time and use cooking utensils.
                </p>
                <button className="orange-btn">Learn More</button>
              </div>
            </div>
            <div className="feature-image">
              <img src="/images/highlighting_dish.jpg" alt="Highlighted dish" />
            </div>
          </div>
        </section>

        {/* MEALDB CAROUSEL SECTION */}
        <section className="recipes-showcase-section mealdb-carousel-section">
          <h2>Best recipes from around the world</h2>
          <p>
            The recipes are written from the place the food comes from to maintain the
            authenticity of the food.
          </p>
          <div className="mealdb-carousel-wrapper">
            <Slider {...sliderSettings}>
              {mealdbRecipes.map((recipe) => (
                <div className="showcase-card" key={recipe.idMeal}>
                  <img
                    src={recipe.strMealThumb}
                    alt={recipe.strMeal}
                    className="card-image"
                  />
                  <span className="recipe-name">{recipe.strMeal}</span>
                </div>
              ))}
            </Slider>
          </div>
          <button className="orange-btn">Learn More</button>
        </section>

        {/* FOOTER SECTION */}
        <footer className="footer-section">
          <div className="footer-content">
            <div className="footer-logo">
              <span className="footer-logo-icon">R</span>
              <span className="footer-logo-name">Recipix</span>
            </div>
            <nav className="footer-links">
              <a href="#recipes">Recipes</a>
              <a href="#community">Community</a>
              <a href="#tips">Cooking Tips</a>
              <a href="#about">About</a>
            </nav>
            <div className="footer-socials">
              <a href="#">
                <span role="img" aria-label="instagram"></span>
              </a>
              <a href="#">
                <span role="img" aria-label="twitter"></span>
              </a>
              <a href="#">
                <span role="img" aria-label="facebook"></span>
              </a>
              <a href="#">
                <span role="img" aria-label="mail"></span>
              </a>
            </div>
          </div>
          <div className="footer-bottom">
            &copy; {new Date().getFullYear()} Recipix. Crafted with{" "}
            <span style={{ color: "#fc7200" }}>♥</span> for food lovers.
          </div>
        </footer>

        {/* NOTIFICATIONS MODAL */}
        <NotificationModal
          token={token}
          
          show={showNotificationModal}
          onClose={() => setShowNotificationModal(false)}
        />
      </main>
    </div>
  );
}

export default Home;
