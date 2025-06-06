
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const FMVStep1 = ({ formData, setFormData }) => {
  const navigate = useNavigate();
  const [platforms, setPlatforms] = useState([]);
  const [achievements, setAchievements] = useState([]);
  const [otherAchievement, setOtherAchievement] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handlePlatformChange = (e) => {
    const { value, checked } = e.target;
    let updated = checked
      ? [...platforms, value]
      : platforms.filter((v) => v !== value);
    setPlatforms(updated);
    setFormData((prev) => ({ ...prev, socialPlatforms: updated }));
  };

  const handleFollowersChange = (platform, value) => {
    setFormData((prev) => ({
      ...prev,
      followers: { ...prev.followers, [platform]: value },
    }));
  };

  const handleAchievementsChange = (e) => {
    const { value, checked } = e.target;
    let updated = checked
      ? [...achievements, value]
      : achievements.filter((v) => v !== value);
    setAchievements(updated);
    setFormData((prev) => ({
      ...prev,
      achievements: updated,
      otherAchievement: otherAchievement,
    }));
  };

  const handleNext = () => {
    setFormData((prev) => ({ ...prev, otherAchievement }));
    navigate("/calculator/step2");
  };

  return (
    <div className="form-container">
      <h2>Step 1: Athlete Profile</h2>

      <label>Full Name</label>
      <input name="fullName" onChange={handleChange} required />

      <label>Email</label>
      <input type="email" name="email" onChange={handleChange} required />

      <label>School</label>
      <input name="school" onChange={handleChange} />

      <label>Sport</label>
      <input name="sport" onChange={handleChange} />

      <label>Gender</label>
      <select name="gender" onChange={handleChange}>
        <option value="">Select</option>
        <option>Men's</option>
        <option>Women's</option>
        <option>Co-ed</option>
      </select>

      <label>Graduation Year</label>
      <input name="gradYear" type="number" onChange={handleChange} />

      <label>Achievements (select all that apply):</label>
      {["All-American", "All-Conference", "Starter", "Team Captain", "National Champion", "Conference Champion", "None"].map((item) => (
        <div key={item}>
          <input
            type="checkbox"
            value={item}
            checked={achievements.includes(item)}
            onChange={handleAchievementsChange}
          />
          <label>{item}</label>
        </div>
      ))}
      <div>
        <input
          type="checkbox"
          value="Other"
          checked={achievements.includes("Other")}
          onChange={handleAchievementsChange}
        />
        <label>Other:</label>
        <input
          type="text"
          placeholder="Describe"
          value={otherAchievement}
          onChange={(e) => setOtherAchievement(e.target.value)}
        />
      </div>

      <label>Social Platforms Used:</label>
      {["Instagram", "TikTok", "Twitter", "YouTube"].map((platform) => (
        <div key={platform}>
          <input
            type="checkbox"
            value={platform}
            onChange={handlePlatformChange}
          />
          <label>{platform}</label>
          {platforms.includes(platform) && (
            <input
              type="number"
              placeholder="Follower count"
              onChange={(e) => handleFollowersChange(platform, e.target.value)}
            />
          )}
        </div>
      ))}

      <button onClick={handleNext}>Next</button>
    </div>
  );
};

export default FMVStep1;
