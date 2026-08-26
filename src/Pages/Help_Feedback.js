import React, { useState } from 'react';
import './Help_Feedback.css';

function Rate({ rating, setRating }) {
  const [hover, setHover] = useState(0);

  return (
    <div style={{ padding: "12px 0" }}>
      <p style={{ fontWeight: '600', color: '#323232', marginBottom: 8 }}>
        Click on the stars to rate:
      </p>
      <div style={{ display: 'flex', gap: 10 }}>
        {[1, 2, 3, 4, 5].map(star => (
          <span
            key={star}
            role="button"
            tabIndex={0}
            aria-label={`Rate ${star} star${star > 1 ? "s" : ""}`}
            onClick={() => setRating(star)}
            onKeyDown={e => (e.key === 'Enter' || e.key === ' ') && setRating(star)}
            onMouseEnter={() => setHover(star)}
            onMouseLeave={() => setHover(0)}
            style={{
              fontSize: 36,
              cursor: 'pointer',
              color: (hover || rating) >= star ? '#ff8000' : '#ccc',
              transition: 'color 0.2s ease, transform 0.2s ease',
              transform: (hover || rating) === star ? 'scale(1.3)' : 'scale(1)',
              userSelect: 'none',
              textShadow: (hover || rating) >= star ? '0 0 5px #ffb347' : 'none',
            }}
          >
            ★
          </span>
        ))}
      </div>
      <p style={{ marginTop: 8, fontWeight: '600', color: '#555' }}>
        Your Rating: {rating} / 5
      </p>
    </div>
  );
}

const FeedbackForm = () => {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [statusMsg, setStatusMsg] = useState('');

  const handleFeedbackSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${process.env.REACT_APP_API_BASE || "http://localhost:5000"}/api/admin/feedback`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: JSON.stringify({
          rating,
          comment,
        }),
      });
      if (!res.ok) {
        throw new Error(`Server error: ${res.status}`);
      }
      
      setStatusMsg("Thank you for your feedback!");
      setRating(0);
      setComment('');
      // hide message after 3 seconds
      setTimeout(() => setStatusMsg(''), 3000);
    } catch (err) {
      setStatusMsg(`Failed to submit: ${err.message}`);
      setTimeout(() => setStatusMsg(''), 5000);
    }
  };

  return (
    <div className="fb-bg">
      <div className="fb-card">
        <h1 className="fb-heading">We value your opinion.</h1>
        <form onSubmit={handleFeedbackSubmit}>
          <div className="fb-question">How would you rate your overall experience?</div>
          <Rate rating={rating} setRating={setRating} />
          <div className="fb-subtext">
            Kindly take a moment to tell us what you think.
          </div>
          <textarea
            className="fb-textarea"
            value={comment}
            onChange={e => setComment(e.target.value)}
            placeholder="Type your feedback here..."
            rows={4}
          />
          <button type="submit" className="fb-submit">Share my feedback</button>
        </form>
        {statusMsg && <p className="fb-status-msg">{statusMsg}</p>}
        <div className="fb-help-email" style={{ marginTop: 20 }}>
          Need help? Contact us at:{" "}
          <a href="mailto:Recipix_admin@gmail.com" style={{ color: "#ff8000", fontWeight: 600 }}>
            Recipix_admin@gmail.com
          </a>
        </div>
      </div>
    </div>
  );
};

export default FeedbackForm;
