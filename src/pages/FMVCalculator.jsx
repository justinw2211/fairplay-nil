import React, { useState } from "react";

const FMVCalculator = () => {
  const [form, setForm] = useState({ gender: "", sport: "", followers: "", deliverables: "" });
  const [result, setResult] = useState(null);

  const sports = {
    Men: ["Football", "Basketball", "Baseball"],
    Women: ["Volleyball", "Softball", "Basketball"],
    Coed: ["Tennis", "Track & Field", "Golf"]
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const base = 100;
    const fmv = base + parseInt(form.followers) * 0.1 + parseInt(form.deliverables) * 50;
    setResult(fmv.toFixed(2));
  };

  return (
    <div style={{ padding: "2rem", color: "white" }}>
      <h2>Estimate Fair Market Value</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Gender:</label><br/>
          <select name="gender" onChange={handleChange} required>
            <option value="">Select</option>
            <option>Men</option>
            <option>Women</option>
            <option>Coed</option>
          </select>
        </div>
        <div>
          <label>Sport:</label><br/>
          <select name="sport" onChange={handleChange} required>
            <option value="">Select Sport</option>
            {(sports[form.gender] || []).map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
        </div>
        <div>
          <label>Followers:</label><br/>
          <input type="number" name="followers" onChange={handleChange} required />
        </div>
        <div>
          <label>Deliverables:</label><br/>
          <input type="number" name="deliverables" onChange={handleChange} required />
        </div>
        <button type="submit" style={{ marginTop: "1rem", padding: "0.5rem 1rem", backgroundColor: "#88E788", border: "none" }}>
          Calculate FMV
        </button>
      </form>
      {result && (
        <div style={{ marginTop: "2rem" }}>
          <h3>Estimated FMV: ${result}</h3>
        </div>
      )}
    </div>
  );
};

export default FMVCalculator;
