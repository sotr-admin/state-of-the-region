import React, { useEffect, useMemo, useState } from "react";
import "./Home.css";
import USAMap from "./USAMap";

const HUBSPOT_SCRIPT_ID = "hubspot-forms-embed";
const HUBSPOT_SCRIPT_SRC = "https://js.hsforms.net/forms/embed/46516044.js";

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

  // ✅ Load HubSpot form embed script once
  useEffect(() => {
    // If script already exists, don't add again
    if (document.getElementById(HUBSPOT_SCRIPT_ID)) return;

    const s = document.createElement("script");
    s.id = HUBSPOT_SCRIPT_ID;
    s.src = HUBSPOT_SCRIPT_SRC;
    s.defer = true;
    s.async = true;
    document.body.appendChild(s);
  }, []);

  const handleViewReport = () => {
    window.open(
      "https://www.usf.edu/business/state-of-the-region/index.aspx",
      "_blank",
      "noopener,noreferrer"
    );
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
              Supporting evidence based policy, regional planning, and informed
              decision-making.
            </span>

            {/* ✅ subtle divider line under subtitle */}
            <div className="hero-divider" aria-hidden="true" />

            {/* NEW wrapper */}
            <div className="hero-content">
              <p className="home-intro-text">
                This interactive regional dashboard offers nationwide county
                comparisons to help policymakers, researchers, business leaders,
                and residents explore economic, demographic, and quality-of-life
                indicators. With metrics about income, employment, education,
                housing, transportation, and health we can better understand how
                communities are changing over time.
              </p>
              <p className="home-intro-text">
                The Regional Insights dashboard brings together trusted national
                and local data, interactive visualizations, and peer comparisons
                so users can compare key measures of economic performance,
                population change, and community wellbeing across U.S. counties.
                Whether you’re a community leader evaluating where targeted
                action could boost opportunity, a researcher analyzing trends, a
                business leader scouting new markets, or a resident considering
                where to live and work, this tool makes it easier to see how
                communities are growing, changing, and stacking up against
                similar regions.
              </p>
            </div>
          </div>

          {/* START EXPLORING (single rotating feature card) */}
          <section className="explore-inline" aria-label="Start Exploring">
            <div className="explore-hero">
              <div className="inline-header">
                <h2 className="inline-title">Start Exploring Tampa MSA</h2>
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
  A companion piece of{" "}
  <a
    href="https://stateoftheregion.com/overview/"
    target="_blank"
    rel="noopener noreferrer"
    className="inline-link"
  >
    Regional Competitiveness Report
  </a>
  , (produced by the Tampa Bay Partnership and collaborating partners,
  Community Foundation Tampa Bay and United Way Suncoast) the Tampa Bay
  E-Insights Report is a multi-dimensional quantitative assessment of the
  region’s economic health, produced by the Muma College of Business at the
  University of South Florida with support from Florida Blue. <br></br>These reports
  are released annually at {" "}
  <a
    href="https://stateoftheregion.com/"
    target="_blank"
    rel="noopener noreferrer"
    className="inline-link"
  >
    The State of the Region
  </a> event.
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
            <h2 className="subscribe-title">Get Regional Insights updates</h2>
            <p className="subscribe-subtitle">
              Subscribe for new indicators, dashboard releases, report
              highlights, and key regional insights from University of South
              Florida Muma College of Business.
            </p>

            <ul className="subscribe-bullets">
              <li>New indicators and trend dashboards</li>
              <li>Report drops and executive summaries</li>
              <li>Events, briefings, and research stories</li>
            </ul>
          </div>

          <div className="subscribe-card">
  {/* REMOVE these two lines if HubSpot already shows them */}
  {/* <h3 className="subscribe-card-title">Join the mailing list</h3> */}
  {/* <p className="subscribe-card-note">Takes less than a minute.</p> */}

  <div
    className="hs-form-frame"
    data-region="na1"
    data-form-id="39452b27-e60b-4a61-8eb5-eba1726e59ff"
    data-portal-id="46516044"
  />

  <p className="subscribe-privacy">
    By subscribing, you agree to receive emails from University of South Florida
    Muma College of Business’s State of the Region. You can unsubscribe anytime.
  </p>
</div>

        </div>
      </section>
    </div>
  );
};

export default Home;
