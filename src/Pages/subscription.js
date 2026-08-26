import React, { useState, useEffect } from "react";
import PaymentForm from "./PaymentForm";
import "./Subscription.css";

const commonFeatures = [
  "Access premium recipes",
  "Save up to 10 favorites",
  "Unlimited favorites",
  "Personalized meal plans"
];

const plans = [
  {
    name: "Monthly",
    price: 99,
    duration: "1 month",
    features: commonFeatures,
    buttonLabel: "Subscribe Monthly",
    subscriptionType: "monthly",
  },
  {
    name: "3 Months",
    price: 249,
    duration: "3 months",
    features: commonFeatures,
    buttonLabel: "Subscribe for 3 Months",
    subscriptionType: "3months",
  },
];

export default function SubscriptionPage() {
  const [loading, setLoading] = useState(false);
  const [userSubscription, setUserSubscription] = useState(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);

  useEffect(() => {
    async function fetchUserProfile() {
      const token = localStorage.getItem("token");
      if (!token) return;
      try {
        const res = await fetch("http://localhost:5000/api/user/profile", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (res.ok && data.user && data.user.subscription) {
          setUserSubscription(data.user.subscription);
        } else {
          setUserSubscription(null);
        }
      } catch (error) {
        setUserSubscription(null);
        console.error("Failed to fetch user profile:", error);
      }
    }
    fetchUserProfile();
  }, []);

  useEffect(() => {
    if (showPaymentModal) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
  }, [showPaymentModal]);

  const handleSubscribeClick = (plan) => {
    setSelectedPlan(plan);
    setShowPaymentModal(true);
  };

  const handlePaymentSuccess = async () => {
    setShowPaymentModal(false);
    alert(`Payment successful! You are subscribed to the ${selectedPlan.name} plan.`);

    const token = localStorage.getItem("token");
    if (!token) {
      alert("User not authenticated");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("http://localhost:5000/subscribe", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({ subscription_type: selectedPlan.subscriptionType }),
      });

      const data = await res.json();
      if (res.ok) {
        setUserSubscription({
          type: selectedPlan.subscriptionType,
          isActive: true,
          expiresAt: data.expires_at,
        });
        alert("Subscription updated on server");
      } else {
        alert(`Subscription update failed: ${data.msg || data.message || "Unknown error"}`);
      }
    } catch (error) {
      alert("Error updating subscription: " + error.message);
    }
    setLoading(false);
  };


  const handlePaymentCancel = () => {
    setShowPaymentModal(false);
  };

  return (
    <div className="subscription-page">
      <h1>Our Subscription Plans</h1>
      <p>Unlock premium content and enjoy exclusive benefits with our plans.</p>
      <div className="subscription-table-container">
        <table className="subscription-table">
          <thead>
            <tr>
              <th>Features</th>
              {plans.map((plan) => (
                <th key={plan.subscriptionType}>{plan.name}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {commonFeatures.map((feature, idx) => (
              <tr key={idx}>
                <td>{feature}</td>
                {plans.map((plan) => (
                  <td key={plan.subscriptionType}>
                    <span style={{ color: "var(--primary-orange)", fontWeight: 700 }}>✓</span>
                  </td>
                ))}
              </tr>
            ))}
            <tr>
              <td style={{ fontWeight: 600 }}>Price</td>
              {plans.map((plan) => (
                <td key={plan.subscriptionType} style={{ fontWeight: 700, fontSize: "1.16rem" }}>
                  ₹{plan.price} / {plan.duration}
                </td>
              ))}
            </tr>
            <tr>
              <td></td>
              {plans.map((plan) => (
                <td key={plan.subscriptionType}>
                  <button
                    disabled={loading ||
                      (userSubscription &&
                        userSubscription.isActive &&
                        userSubscription.type === plan.subscriptionType &&
                        new Date(userSubscription.expiresAt) > new Date())
                    }
                    className="subscribe-btn"
                    style={{ margin: "10px 0", width: "100%" }}
                    onClick={() => handleSubscribeClick(plan)}
                  >
                    {userSubscription &&
                    userSubscription.type === plan.subscriptionType &&
                    userSubscription.isActive &&
                    new Date(userSubscription.expiresAt) > new Date()
                      ? "Subscribed"
                      : plan.buttonLabel}
                  </button>
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>

      {showPaymentModal && (
        <>
          <div className="modal-backdrop" />
          <div className="modal">
            <PaymentForm
              amount={selectedPlan.price}
              onSuccess={handlePaymentSuccess}
              onCancel={handlePaymentCancel}
            />
          </div>
        </>
      )}
    </div>
  );
}
