import React, { useState } from "react";
import "./PaymentForm.css";

const paymentOptions = [
  { id: "gpay", label: "Google Pay", icon: "https://img.icons8.com/color/48/google-pay.png" },
  { id: "phonepe", label: "PhonePe", icon: "https://img.icons8.com/color/48/phone-pe.png" },
  { id: "upi", label: "UPI", icon: "https://indiadesignsystem.bombaydc.com/logo/upi.png" },
  { id: "card", label: "Credit/Debit Card", icon: "https://img.icons8.com/color/48/bank-card-back-side.png" }
];

export default function PaymentForm({ amount, onSuccess, onCancel }) {
  const [selectedOption, setSelectedOption] = useState(null);
  const [processing, setProcessing] = useState(false);

  const handlePayment = () => {
    if (!selectedOption) {
      alert("Please select a payment method");
      return;
    }
    setProcessing(true);
    setTimeout(() => {
      setProcessing(false);
      onSuccess();
    }, 2000);
  };

  return (
    <div className="payment-form-modal">
      <h2>Choose payment method</h2>
      <p>Amount to pay: <strong>₹{amount}</strong></p>
      <div className="payment-options">
        {paymentOptions.map((option) => (
          <div
            key={option.id}
            className={`payment-option ${selectedOption === option.id ? "selected" : ""}`}
            onClick={() => setSelectedOption(option.id)}
          >
            <img src={option.icon} alt={option.label} className="payment-icon" />
            <span className="payment-label">{option.label}</span>
          </div>
        ))}
      </div>

      <button onClick={handlePayment} disabled={processing} className="pay-btn">
        {processing ? "Processing..." : "Pay Now"}
      </button>
      <button onClick={onCancel} disabled={processing} className="cancel-btn">
        Cancel
      </button>
    </div>
  );
}
