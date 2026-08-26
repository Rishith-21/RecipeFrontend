import React, { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  Outlet,
} from "react-router-dom";

import Login from "./Pages/Login";
import Register from "./Pages/Register";
import Home from "./Pages/Home";
import Veg from "./Pages/Veg";
import Profile from "./Pages/Profile";
import Rate from "./Pages/Rate";
import Privacy from "./Pages/Privacy";
import MeatRecipes from "./Pages/MeatRecipes";
import Products from "./Pages/Products";
import RecipeDetails from "./RecipeDetails";
import MeatRecipeDetails from "./Pages/MeatRecipeDetails";
import Recipes from "./Pages/Recipes";
import ForgotPassword from "./Pages/ForgotPassword";
import Community from "./Pages/Community";
import MyRecipes from "./Pages/my_recipes";
import Help_Feedback from "./Pages/Help_Feedback";
import SubscriptionPage from "./Pages/subscription";
import MealPlanner from "./Pages/MealPlanner";
import Header from "./Pages/Header"; // Make sure this path matches your file location
import NotificationModal from "./Pages/NotificationModal";
import Favourites from "./components/favourite";

const API_BASE = process.env.REACT_APP_API_BASE || "http://localhost:5000";

// PrivateRoute and PremiumRoute Helpers
function PrivateRoute({ element, isAuthenticated, redirectTo = "/login" }) {
  return isAuthenticated ? element : <Navigate to={redirectTo} replace />;
}

function PremiumRoute({ element, isAuthenticated }) {
  return isAuthenticated ? element : <Navigate to="/subscribe" replace />;
}

// Layout that includes Header for authenticated pages
function MainLayout({ isAuthenticated, token, ...headerProps }) {
  const [showNotificationModal, setShowNotificationModal] = useState(false);
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  return (
    <>
      <Header 
        {...headerProps} 
        setShowNotificationModal={setShowNotificationModal}
      />
      <main>
        <Outlet />
      </main>
      <NotificationModal
        token={token}
        show={showNotificationModal}
        onClose={() => setShowNotificationModal(false)}
      />
    </>
  );
}

function AppRoutes({
  token,
  user,
  userId,
  isAuthenticated,
  isPremiumUser,
  handleLogin,
  handleLogout,
  setUser,
  handleSubscriptionChange,
}) {
  return (
    <Routes>
      {/* Root redirect */}
      <Route
        path="/"
        element={
          isAuthenticated ? <Navigate to="/home" replace /> : <Navigate to="/login" replace />
        }
      />

      {/* Public routes WITHOUT header */}
      <Route
        path="/login"
        element={
          isAuthenticated ? (
            <Navigate to="/home" replace />
          ) : (
            <Login onLogin={handleLogin} />
          )
        }
      />
      <Route
        path="/register"
        element={<Register onRegister={() => {
        }} />}
      />
      <Route path="/forgotpassword" element={<ForgotPassword />} />
      

      {/* Authenticated routes WITH header */}
      <Route
        element={
          <MainLayout
            isAuthenticated={isAuthenticated}
            token={token}
            userPhoto={user?.profileImage}
            unreadCount={0}
            onLogout={handleLogout}
          />
        }
      >
        <Route path="/home" element={<Home onLogout={handleLogout} token={token} user={user} />} />
        <Route path="/recipes" element={<Recipes token={token} user={user} />} />
        <Route path="/community" element={<Community token={token} user={user} />} />
        <Route path="/help" element={<Help_Feedback />} />
        <Route path="/favourite" element={<Favourites token={token} user={user} />} />
        <Route path="/veg" element={<Veg onLogout={handleLogout} token={token} user={user} />} />
        <Route path="/meatrecipes" element={<MeatRecipes onLogout={handleLogout} token={token} user={user} />} />
        <Route path="/profile" element={<Profile onLogout={handleLogout} token={token} user={user} />} />
        <Route path="/my-recipes" element={<MyRecipes token={token} user={user} />} />
        <Route path="/rate" element={<Rate onLogout={handleLogout} token={token} user={user} />} />
        <Route path="/privacy" element={<Privacy onLogout={handleLogout} token={token} user={user} />} />
        <Route path="/products" element={<Products onLogout={handleLogout} token={token} user={user} />} />
        <Route path="/subscribe" element={
          <SubscriptionPage
            token={token}
            user={user}
            onSubscriptionChange={handleSubscriptionChange}
          />
        } />
        <Route
          path="/mealplanner"
              element={<MealPlanner token={token} userId={userId} user={user} />}
              isAuthenticated={isAuthenticated}
            />
      </Route>

      {/* Public recipe detail pages, no header assumed */}
      <Route path="/veg/:recipeName" element={<RecipeDetails />} />
      <Route path="/meat/:recipeName" element={<MeatRecipeDetails />} />

      {/* Fallback route */}
      <Route
        path="*"
        element={
          isAuthenticated ? <Navigate to="/home" replace /> : <Navigate to="/login" replace />
        }
      />
    </Routes>
  );
}

function App() {
  const [token, setToken] = useState(() => localStorage.getItem("token"));
  const [userId, setUserId] = useState(() => localStorage.getItem("userId"));
  const [isAuthenticated, setIsAuthenticated] = useState(() => !!token);
  const [isPremiumUser, setIsPremiumUser] = useState(
    () => localStorage.getItem("isPremium") === "true"
  );
  const [user, setUser] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const userId = localStorage.getItem("userId");
    const isPremium = localStorage.getItem("isPremium") === "true";

    if (token && userId) {
      setToken(token);
      setUserId(userId);
      setIsAuthenticated(true);
      setIsPremiumUser(isPremium);

      fetchUserDetails(token, userId);
    }
  }, []);

  const fetchUserDetails = async (token, userId) => {
  try {
    const url = `${API_BASE}/api/user/${userId}`;
    const res = await fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      // credentials: "include", // only if you actually use cookies
    });
    const ct = res.headers.get("content-type") || "";
    if (!res.ok || !ct.includes("application/json")) {
      const body = await res.text();
      throw new Error(`[${res.status}] ${url} -> ${ct}\n${body.slice(0,300)}`);
    }
    const userData = await res.json();
    setUser(userData);
    const active = !!userData.subscription?.active;
    setIsPremiumUser(active);
    localStorage.setItem("isPremium", active ? "true" : "false");
  } catch (error) {
    console.error("Failed to fetch user details:", error);
  }
};


  const handleLogin = (token, userId) => {
    localStorage.setItem("token", token);
    localStorage.setItem("userId", userId);
    setToken(token);
    setUserId(userId);
    setIsAuthenticated(true);

    fetchUserDetails(token, userId);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userId");
    localStorage.removeItem("isPremium");
    setToken(null);
    setUserId(null);
    setUser(null);
    setIsAuthenticated(false);
    setIsPremiumUser(false);
  };

  const handleSubscriptionChange = (isPremium) => {
    setIsPremiumUser(isPremium);
    localStorage.setItem("isPremium", isPremium);
  };

  return (
    <Router>
      <AppRoutes
        token={token}
        user={user}
        userId={userId}
        isAuthenticated={isAuthenticated}
        isPremiumUser={isPremiumUser}
        handleLogin={handleLogin}
        handleLogout={handleLogout}
        setUser={setUser}
        handleSubscriptionChange={handleSubscriptionChange}
      />
    </Router>
  );
}

export default App;
