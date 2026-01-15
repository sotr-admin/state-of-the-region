import React, { useState } from "react";
import "./Home.css";
import USAMap from "./USAMap";
import { Link } from "react-router-dom";

const topics = [
  "Income",
  "Employment",
  "Education",
  "Housing",
  "Transportation",
  "Health",
  "Demographics",
  "Poverty",
].map((label) => ({
  label,
  slug: label.toLowerCase().replace(/\s+/g, "-"),
}));

const Home = () => {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    message: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      // TODO: replace with your real backend endpoint
      const res = await fetch("https://your-backend.com/api/mailing-list", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!res.ok) throw new Error("Failed to send");

      alert("Message sent successfully!");
      setFormData({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        message: "",
      });
    } catch (err) {
      console.error(err);
      alert("Error sending message. Please try again.");
    }
  };

  return (
    <div className="home-container">
      {/* Top two-column layout */}
      <div className="top-columns">
        {/* LEFT COLUMN: hero + mailing list form */}
        <div className="left-col">
          <div className="hero-section">
            <h1>
              Shaping Tomorrow Through Data Today
              <span className="hero-subtext">
                Explore comprehensive indicators across income, employment,
                education, housing, transportation, health, and more — and turn
                data into action for the Tampa Bay region.
              </span>
            </h1>
          </div>

          <div className="form-section">
            <h2>Join our Mailing List</h2>
            <p className="subtext">
              Receive updates when new indicators, dashboards, and reports are
              added to the State of the Region platform. We share only
              meaningful updates — no spam.
            </p>
            <div className="mailing-form-box">
              <form className="mailing-form" onSubmit={handleSubmit}>
                <div className="form-inner">
                  <div className="name-fields">
                    <input
                      type="text"
                      name="firstName"
                      placeholder="First Name*"
                      value={formData.firstName}
                      onChange={handleChange}
                      required
                    />
                    <input
                      type="text"
                      name="lastName"
                      placeholder="Last Name*"
                      value={formData.lastName}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <input
                    type="email"
                    name="email"
                    placeholder="Email*"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                  <input
                    type="tel"
                    name="phone"
                    placeholder="Phone Number"
                    value={formData.phone}
                    onChange={handleChange}
                  />
                  <textarea
                    name="message"
                    placeholder="Your message..."
                    rows="4"
                    value={formData.message}
                    onChange={handleChange}
                  />
                  <button type="submit">Send Message</button>
                </div>
              </form>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: map + insights card */}
        <div className="right-col">
          <div className="map-section">
            <USAMap />
          </div>

          <div className="insight-section">
            <h2>Tampa Bay Data Insights</h2>
            <p>
              A companion piece to the Regional Competitiveness Report, the
              Tampa Bay E-Insights Report is a multi-dimensional quantitative
              assessment of the region’s current economic health produced by
              the Muma College of Business at the University of South Florida.
            </p>
            <button className="download-btn">View Report Here</button>
          </div>
        </div>
      </div>

      {/* START EXPLORING SECTION */}
      <section className="explore-section">
        <div className="section-divider">
          <span className="section-line" />
        </div>

        <h2 className="start-exploring">Start Exploring</h2>
        <p className="explore-subtitle">
          Dive into the core indicators that define Tampa Bay’s economic,
          social, and community health. Select a topic to explore trends,
          comparisons, and insights.
        </p>

        <div className="tiles-row">
          {topics.map(({ label, slug }) => (
            <Link
              key={label}
              className="explore-tile"
              to={`/reports?topic=${encodeURIComponent(slug)}`}
            >
              <span className="tile-label">{label}</span>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
};

export default Home;
