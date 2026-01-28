import React, { useEffect, useMemo, useState } from "react";
import "./Home.css";
import USAMap from "./USAMap";

const Home = () => {
  const topics = useMemo(
    () =>
      [
        {
          label: "Income",
          desc: "Earnings, inequality, and affordability over time.",
          theme: "t-income",
        },
        {
          label: "Employment",
          desc: "Jobs, participation, and workforce trends.",
          theme: "t-employment",
        },
        {
          label: "Education",
          desc: "Skills, attainment, and pathways to opportunity.",
          theme: "t-education",
        },
        {
          label: "Housing",
          desc: "Costs, supply, and stability across the region.",
          theme: "t-housing",
        },
        {
          label: "Transportation",
          desc: "Commutes, access, and mobility patterns.",
          theme: "t-transportation",
        },
        {
          label: "Health",
          desc: "Outcomes, access, and community well-being.",
          theme: "t-health",
        },
        {
          label: "Demographics",
          desc: "Population change and regional composition.",
          theme: "t-demographics",
        },
        {
          label: "Poverty",
          desc: "Poverty levels and equity gaps across the region.",
          theme: "t-poverty",
        },
      ].map((t) => ({
        ...t,
        slug: t.label.toLowerCase().replace(/\s+/g, "-"),
      })),
    []
  );

  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  // auto-rotate every ~2.6s (pauses on hover)
  useEffect(() => {
    if (isPaused) return;

    const id = setInterval(() => {
      setActiveIndex((i) => (i + 1) % topics.length);
    }, 2600);

    return () => clearInterval(id);
  }, [topics.length, isPaused]);

  const active = topics[activeIndex];

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

      alert("Thanks! You’re subscribed.");
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

  const handleViewReport = () => {
    // Change this to your real report link when ready
    window.open("/reports", "_blank", "noopener,noreferrer");
  };

  return (
    <div className="home-container">
      {/* Top two-column layout */}
      <div className="top-columns">
        {/* LEFT COLUMN */}
        <div className="left-col">
          <div className="hero-section">
            <h1>Shaping Tomorrow Through Data Today</h1>

            <span className="hero-subtext">
              Helping policymakers, researchers, business leaders, and residents explore comprehensive indicators across income, employment,
              education, housing, transportation, health, and more.
            </span>

            {/* ✅ subtle divider line under subtitle */}
            <div className="hero-divider" aria-hidden="true" />

            {/* NEW wrapper */}
            <div className="hero-content">
              <p className="home-intro-text">
                The State of the Region brings together trusted data, interactive
                dashboards, and peer metro comparisons to help policymakers,
                researchers, business leaders, and residents understand how the
                Tampa Bay region is changing — and where targeted action can make
                the greatest impact.
              </p>

              <p className="home-intro-text">
                The State of the Region brings together trusted data, interactive
                dashboards, and peer metro comparisons to help policymakers,
                researchers, business leaders, and residents understand how the
                Tampa Bay region is changing — and where targeted action can make
                the greatest impact.
              </p>
            </div>
          </div>

          {/* START EXPLORING (single rotating feature card) */}
          <section className="explore-inline" aria-label="Start Exploring">
            <div className="explore-hero">
              <div className="inline-header">
                <h2 className="inline-title">Start Exploring</h2>
                <p className="inline-subtitle">
                  Select a topic to explore trends, comparisons, and insights.
                </p>
              </div>

              <div
                className="explore-carousel"
                onMouseEnter={() => setIsPaused(true)}
                onMouseLeave={() => setIsPaused(false)}
              >
                <a
                  className={`topic-feature ${active.theme}`}
                  href={`/reports/${encodeURIComponent(active.slug)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  title={`Open ${active.label} reports`}
                >
                  <div className="topic-feature-top">
                    <div className="topic-feature-title">{active.label}</div>
                    <div className="topic-feature-cta">Explore</div>
                  </div>

                  <div className="topic-feature-desc">{active.desc}</div>

                  <div className="topic-feature-meta">
                    <span className="topic-feature-pill">Trending</span>
                    <span className="topic-feature-pill">Time series</span>
                    <span className="topic-feature-pill">Peer metros</span>
                  </div>
                </a>

                {/* ✅ footer row: dots + View all topics (aligned) */}
                <div className="carousel-footer">
                  <div className="carousel-dots" aria-hidden="true">
                    {topics.map((t, i) => (
                      <button
                        key={t.label}
                        className={`dot ${i === activeIndex ? "is-active" : ""}`}
                        type="button"
                        onClick={() => setActiveIndex(i)}
                        aria-label={`Show ${t.label}`}
                        title={t.label}
                      />
                    ))}
                  </div>

                  <a
                    className="view-all-topics"
                    href="/reports/income"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    View all topics
                  </a>
                </div>
              </div>
            </div>
          </section>
        </div>

        {/* RIGHT COLUMN */}
        <div className="right-col">
          <div className="map-section" aria-label="Regional comparisons map">
            {/* ✅ Removed the visible text above the map */}
            <USAMap />
          </div>

          <div className="insight-section">
            <h2>Tampa Bay Data Insights</h2>
            <p>
              A companion piece to the Regional Competitiveness Report, the Tampa
              Bay E-Insights Report is a multi-dimensional quantitative assessment
              of the region’s current economic health produced by the Muma College
              of Business at the University of South Florida.
            </p>
            <button
              className="download-btn"
              type="button"
              onClick={handleViewReport}
            >
              View Report Here
            </button>
          </div>
        </div>
      </div>

      <div className="section-divider">
        <span className="divider-dot" />
        <span className="divider-dot" />
        <span className="divider-dot" />
      </div>

      {/* SUBSCRIBE CTA */}
      <section className="subscribe-cta" aria-label="Join our mailing list">
        <div className="subscribe-cta-inner">
          <div className="subscribe-copy">
            <p className="subscribe-eyebrow">STAY CONNECTED</p>
            <h2 className="subscribe-title">Get State of the Region updates</h2>
            <p className="subscribe-subtitle">
              Subscribe for new indicators, dashboard releases, report highlights,
              and key regional insights from USF Muma.
            </p>

            <ul className="subscribe-bullets">
              <li>New indicators & trend dashboards</li>
              <li>Report drops & executive summaries</li>
              <li>Events, briefings, and data stories</li>
            </ul>
          </div>

          <div className="subscribe-card">
            <h3 className="subscribe-card-title">Join the mailing list</h3>
            <p className="subscribe-card-note">Takes less than a minute.</p>

            <form className="subscribe-form" onSubmit={handleSubmit}>
              <div className="subscribe-grid">
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
                placeholder="Phone (optional)"
                value={formData.phone}
                onChange={handleChange}
              />

              <textarea
                name="message"
                placeholder="What topics are you most interested in? (optional)"
                rows="3"
                value={formData.message}
                onChange={handleChange}
              />

              <button className="subscribe-btn" type="submit">
                Subscribe
              </button>

              <p className="subscribe-privacy">
                By subscribing, you agree to receive emails from USF Muma’s State
                of the Region. You can unsubscribe anytime.
              </p>
            </form>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
