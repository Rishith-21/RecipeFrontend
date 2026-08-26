import React from "react";
import "./HelpModal.css"; // You can style modal with this class or your existing styles.

const HelpModal = ({ show, onClose, problemType, setProblemType, issueDesc, setIssueDesc, helpMessage, onSubmit }) => {
  if (!show) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>✕</button>
        <form className="fb-help-form" onSubmit={onSubmit}>
          <label htmlFor="problem-type" className="help-label">What issue are you facing?</label>
          <select
            id="problem-type"
            className="help-select"
            value={problemType}
            onChange={e => setProblemType(e.target.value)}
            required
          >
            <option value="">Choose a problem type</option>
            <option value="login">Login Issue</option>
            <option value="payment">Payment Problem</option>
            <option value="feature">Feature Not Working</option>
            <option value="other">Other</option>
          </select>
          <label htmlFor="issue-desc" className="help-label">Please describe your issue:</label>
          <textarea
            id="issue-desc"
            className="help-textarea"
            rows={4}
            value={issueDesc}
            onChange={e => setIssueDesc(e.target.value)}
            required
            placeholder="Add all relevant details..."
          />
          <button type="submit" className="help-submit">Submit Issue</button>
          {helpMessage && <div className="help-confirm">{helpMessage}</div>}
        </form>
      </div>
    </div>
  );
};

export default HelpModal;
