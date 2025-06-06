
import React from "react";
import { useNavigate } from "react-router-dom";

const FMVStep2 = ({ formData, setFormData }) => {
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleDeliverableChange = (name, value) => {
    setFormData((prev) => ({
      ...prev,
      deliverables: { ...prev.deliverables, [name]: parseInt(value) || 0 },
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    navigate("/calculator/result");
  };

  return (
    <div className="form-container">
      <h2>Step 2: Deal Information</h2>

      <label>Payment Frequency</label>
      <select name="paymentFrequency" onChange={handleChange}>
        <option value="">Select</option>
        <option value="one-time">One-Time</option>
        <option value="monthly">Monthly</option>
        <option value="quarterly">Quarterly</option>
      </select>

      <label>Total Deal Length (e.g., 3 months)</label>
      <input name="dealLength" onChange={handleChange} />

      <h3>Deliverables (enter quantity):</h3>
      {[
        "Instagram Posts",
        "Instagram Stories",
        "TikTok Videos",
        "YouTube Videos",
        "In-Person Appearances",
        "Autograph Signings",
      ].map((item) => (
        <div key={item}>
          <label>{item}</label>
          <input
            type="number"
            min="0"
            onChange={(e) =>
              handleDeliverableChange(item, e.target.value)
            }
          />
        </div>
      ))}

      <button onClick={handleSubmit}>Submit</button>
    </div>
  );
};

export default FMVStep2;
