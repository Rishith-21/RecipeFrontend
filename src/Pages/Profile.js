import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./Profile.css";

function Profile() {
  const navigate = useNavigate();

  const [profile, setProfile] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    bio: "",
    photo: null,
    photoPreview: null,
  });

  const [subscription, setSubscription] = useState(null);

  const [passwords, setPasswords] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [saving, setSaving] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);

  // Live password check states
  const [passLenOk, setPassLenOk] = useState(false);
  const [passUpperOk, setPassUpperOk] = useState(false);
  const [passLowerOk, setPassLowerOk] = useState(false);
  const [passDigitOk, setPassDigitOk] = useState(false);
  const [passSpecialOk, setPassSpecialOk] = useState(false);

  useEffect(() => {
    async function fetchProfile() {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch("http://localhost:5000/api/user/profile", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();

        if (data.success && data.user) {
          setProfile((prev) => ({
            ...prev,
            firstName: data.user.firstName || "",
            lastName: data.user.lastName || "",
            email: data.user.email || "",
            phone: data.user.phone || "",
            address: data.user.address || "",
            bio: data.user.bio || "",
            photoPreview: data.user.photo || null,
          }));
          setSubscription(data.user.subscription || null);
        } else {
          setMessage({ type: "error", text: "Failed to load profile" });
        }
      } catch (error) {
        setMessage({ type: "error", text: "Error loading profile: " + error.message });
      }
    }
    fetchProfile();
  }, []);

  const handleChange = (e) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfile({
        ...profile,
        photo: file,
        photoPreview: URL.createObjectURL(file),
      });
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage({ type: "", text: "" });
    try {
      const token = localStorage.getItem("token");
      const formData = new FormData();
      if ("firstName" in profile) formData.append("firstName", profile.firstName || "");
      if ("lastName" in profile) formData.append("lastName", profile.lastName || "");
      if ("phone" in profile) formData.append("phone", profile.phone || "");
      if ("address" in profile) formData.append("address", profile.address || "");
      if ("bio" in profile) formData.append("bio", profile.bio || "");
      if (profile.photo) formData.append("photo", profile.photo);

      // Debug output: List all FormData entries to console
      for (let pair of formData.entries()) {
        console.log(pair[0]+ ': ' + pair[1]);
      }

      const res = await fetch("http://localhost:5000/api/user/profile", {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      const data = await res.json();

      if (data.success) {
        setMessage({ type: "success", text: "Profile updated successfully!" });
        if (data.photo_url) {
          setProfile((prev) => ({
            ...prev,
            photoPreview: data.photo_url,
            photo: null,
          }));
        }
      } else {
        setMessage({ type: "error", text: data.message || "Failed to update profile." });
      }
    } catch (error) {
      setMessage({ type: "error", text: "Error updating profile: " + error.message });
    }
    setSaving(false);
  };

  const handleLogout = () => {
    setMessage({ type: "success", text: "You have been logged out!" });
    localStorage.removeItem("token");
    navigate("/");
  };

  const handlePasswordInputChange = (e) => {
    const { name, value } = e.target;
    setPasswords((prev) => ({ ...prev, [name]: value }));

    if (name === "newPassword") {
      setPassLenOk(value.length >= 8);
      setPassUpperOk(/[A-Z]/.test(value));
      setPassLowerOk(/[a-z]/.test(value));
      setPassDigitOk(/[0-9]/.test(value));
      setPassSpecialOk(/[\W_]/.test(value));
    }
    if (name === "newPassword" && value === "") {
      setPassLenOk(false);
      setPassUpperOk(false);
      setPassLowerOk(false);
      setPassDigitOk(false);
      setPassSpecialOk(false);
    }
  };

  function validatePassword(password) {
    const minLength = 8;
    const upper = /[A-Z]/;
    const lower = /[a-z]/;
    const digit = /[0-9]/;
    const special = /[\W_]/;

    if (password.length < minLength) {
      return "Password must be at least 8 characters long.";
    }
    if (!upper.test(password)) {
      return "Password must contain at least one uppercase letter.";
    }
    if (!lower.test(password)) {
      return "Password must contain at least one lowercase letter.";
    }
    if (!digit.test(password)) {
      return "Password must contain at least one digit.";
    }
    if (!special.test(password)) {
      return "Password must contain at least one special character.";
    }
    return null;
  }

  const handlePasswordChange = async () => {
    if (passwords.newPassword !== passwords.confirmPassword) {
      setMessage({ type: "error", text: "New passwords do not match!" });
      return;
    }
    const validationError = validatePassword(passwords.newPassword);
    if (validationError) {
      setMessage({ type: "error", text: validationError });
      return;
    }

    setChangingPassword(true);
    setMessage({ type: "", text: "" });
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:5000/api/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(passwords),
      });
      const data = await res.json();

      if (data.success) {
        setMessage({ type: "success", text: data.message });
        setPasswords({ oldPassword: "", newPassword: "", confirmPassword: "" });
        setShowPasswordForm(false);
        setPassLenOk(false);
        setPassUpperOk(false);
        setPassLowerOk(false);
        setPassDigitOk(false);
        setPassSpecialOk(false);
      } else {
        setMessage({ type: "error", text: data.message || "Password change failed." });
      }
    } catch (error) {
      setMessage({ type: "error", text: "Error changing password: " + error.message });
    }
    setChangingPassword(false);
  };

  return (
    <div className="profile-container" aria-label="User Profile">
      <div className="profile-card">
        <h2 className="section-title">My Profile</h2>
        {message.text && <div className={`profile-message ${message.type}`}>{message.text}</div>}
        <div className="profile-header">
          <div className="profile-photo">
            {profile.photoPreview ? (
              <img src={profile.photoPreview} alt={`${profile.firstName} profile`} />
            ) : (
              <div className="placeholder" aria-label="Profile picture placeholder">Upload Photo</div>
            )}
            <input type="file" accept="image/*" onChange={handlePhotoChange} aria-label="Upload Profile Photo" />
          </div>
          <div className="profile-info">
            <div style={{ display: "flex", gap: "10px" }}>
              <div style={{ flex: 1 }}>
                <label htmlFor="firstName">First name:</label>
                <input
                  id="firstName"
                  type="text"
                  name="firstName"
                  value={profile.firstName}
                  onChange={handleChange}
                />
              </div>
              <div style={{ flex: 1 }}>
                <label htmlFor="lastName">Last name:</label>
                <input
                  id="lastName"
                  type="text"
                  name="lastName"
                  value={profile.lastName}
                  onChange={handleChange}
                />
              </div>
            </div>
            <label htmlFor="email">Email:</label>
            <input id="email" type="email" name="email" value={profile.email} readOnly />

            {subscription &&
            subscription.isActive &&
            new Date(subscription.expiresAt) > new Date() && (
              <div className="subscription-badge">
                Subscribed until {new Date(subscription.expiresAt).toLocaleDateString()}
              </div>
            )}


            <label htmlFor="phone">Phone:</label>
            <input id="phone" type="text" name="phone" value={profile.phone} onChange={handleChange} />

            <label htmlFor="address">Address:</label>
            <input id="address" type="text" name="address" value={profile.address} onChange={handleChange} />

            <label htmlFor="bio">Bio:</label>
            <textarea id="bio" name="bio" value={profile.bio} onChange={handleChange} rows="3" />
          </div>
        </div>
        <div className="profile-actions">
          <button onClick={handleSave} className="orange-btn" disabled={saving}>
            {saving ? "Saving..." : "Save Profile"}
          </button>
          <button className="secondary" onClick={handleLogout}>
            Logout
          </button>
          <button className="change-btn" onClick={() => setShowPasswordForm((prev) => !prev)}>
            {showPasswordForm ? "Cancel Password Change" : "Change Password"}
          </button>
        </div>
        {showPasswordForm && (
          <div className="change-password-card">
            <h3>Change Password</h3>
            <div className="form-row">
              <label htmlFor="oldPassword">Old Password:</label>
              <input
                id="oldPassword"
                type="password"
                name="oldPassword"
                value={passwords.oldPassword}
                onChange={handlePasswordInputChange}
                autoComplete="current-password"
              />
            </div>
            <div className="form-row">
              <label htmlFor="newPassword">New Password:</label>
              <input
                id="newPassword"
                type="password"
                name="newPassword"
                value={passwords.newPassword}
                onChange={handlePasswordInputChange}
                autoComplete="new-password"
              />
              <div className="password-checklist">
                <ul>
                  <li className={passLenOk ? "ok" : ""}>
                    <span className="pass-check">{passLenOk ? "✔" : "•"}</span>
                    At least 8 characters
                  </li>
                  <li className={passUpperOk ? "ok" : ""}>
                    <span className="pass-check">{passUpperOk ? "✔" : "•"}</span>
                    One uppercase letter
                  </li>
                  <li className={passLowerOk ? "ok" : ""}>
                    <span className="pass-check">{passLowerOk ? "✔" : "•"}</span>
                    One lowercase letter
                  </li>
                  <li className={passDigitOk ? "ok" : ""}>
                    <span className="pass-check">{passDigitOk ? "✔" : "•"}</span>
                    One digit
                  </li>
                  <li className={passSpecialOk ? "ok" : ""}>
                    <span className="pass-check">{passSpecialOk ? "✔" : "•"}</span>
                    One special character
                  </li>
                </ul>
              </div>
            </div>
            <div className="form-row">
              <label htmlFor="confirmPassword">Confirm New Password:</label>
              <input
                id="confirmPassword"
                type="password"
                name="confirmPassword"
                value={passwords.confirmPassword}
                onChange={handlePasswordInputChange}
                autoComplete="new-password"
              />
            </div>
            <button
              className="update-btn"
              onClick={handlePasswordChange}
              disabled={changingPassword}
            >
              {changingPassword ? "Updating..." : "Update Password"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default Profile;
