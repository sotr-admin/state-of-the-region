import React, { useState } from "react";
import "./About.css";
import USAMap from "./USAMap"; // reuse the same map as Home

const teamLeads = [
  {
    name: "Dr. Manish Agrawal",
    image: "/assets/Photos/person.jpg",
    link: "https://www.usf.edu/business/about/bios/agrawal-manish.aspx",
  },
  {
    name: "Dr. Shivendu Shivendu",
    image: "/assets/Photos/person.jpg",
    link: "https://www.usf.edu/business/about/bios/shivendu-shivendu.aspx",
  },
];

const studentVolunteers = {
  2025: [
    {
      name: "Shlok Nandkishor Goud",
      role: "MS AIBA 2026",
      image: "/assets/Photos/person.jpg",
    },
    {
      name: "Sohan Ladarpret Vasudeva",
      role: "MS AIBA 2026",
      image: "/assets/Photos/person.jpg",
    },
    {
      name: "Sonal Shreya",
      role: "MS AIBA 2026",
      image: "/assets/Photos/person.jpg",
    },
    {
      name: "Aditi Malik",
      role: "MS AIBA 2027",
      image: "/assets/Photos/person.jpg",
    },
    {
      name: "Venkata Satya Lokesh Adda",
      role: "MS AIBA 2026",
      image: "/assets/Photos/person.jpg",
    },
    {
      name: "Jacqueline Lapacek",
      role: "MS AIBA 2026",
      image: "/assets/Photos/person.jpg",
    },
  ],
  2024: [
    {
      name: "Nikita Gill",
      role: "MS AIBA 2025",
      image: "/assets/Photos/person.jpg",
    },
    {
      name: "Nidhi Falak",
      role: "MS AIBA 2025",
      image: "/assets/Photos/person.jpg",
    },
    {
      name: "Alvaro Montoya Ruiz",
      role: "MS AIBA 2026",
      image: "/assets/Photos/person.jpg",
    },
    {
      name: "Priyanka Jammu",
      role: "MS AIBA 2026",
      image: "/assets/Photos/person.jpg",
    },
  ],
};

const About = () => {
  const [openSection, setOpenSection] = useState("");

  return (
    <div className="about-page">
      {/* FULL-PAGE USA MAP BACKGROUND */}
      <div className="about-map-bg">
        <USAMap />
      </div>

      {/* ALL CONTENT ABOVE THE MAP */}
      <div className="about-content-wrapper">
        {/* ---- HEADER / HERO ---- */}
        <div className="about-header">
          <h1 className="about-title">About State of the Region</h1>

          <p className="about-intro-text">
            <strong>State of the Region</strong> is an interactive, data-driven
            platform built to help communities better understand their economic,
            social, and demographic standing within a broader national landscape.
            The initiative began as a regional benchmarking tool for the Tampa Bay
            area but has since evolved into a comprehensive resource that enables
            comparisons across metropolitan statistical areas (MSAs), counties, and
            states throughout the United States.
            <br />
            <br />
            By consolidating high-quality data from trusted national sources and
            presenting it through clear visualizations, the platform empowers
            users— including policymakers, business leaders, researchers, students,
            and residents— to explore trends, identify opportunities, and make
            informed decisions. Whether examining workforce dynamics, housing
            affordability, public health measures, or economic competitiveness,{" "}
            <strong>State of the Region</strong> provides the context needed to
            understand how communities are performing today and how they are
            evolving over time.
          </p>
        </div>

        {/* ---- ACCORDION ---- */}
        <div className="accordion">
          {/* --- Vision Statement --- */}
          <div className="accordion-item">
            <button
              className="accordion-header"
              onClick={() =>
                setOpenSection(openSection === "vision" ? "" : "vision")
              }
            >
              <span>Vision Statement</span>
              <span className="accordion-icon">
                {openSection === "vision" ? "−" : "+"}
              </span>
            </button>

            {openSection === "vision" && (
              <div className="accordion-content">
                <p>
                  <strong>State of the Region</strong> was created with a simple
                  but ambitious vision: to make regional data accessible,
                  meaningful, and actionable for everyone. What began as a localized
                  effort to understand Tampa Bay’s position among peer metropolitan
                  areas has grown into a robust national platform capable of
                  comparing cities, counties, and states across a wide range of
                  economic and social indicators.
                </p>
                <p>
                  The project empowers communities by transforming complex datasets
                  into clear, intuitive insights. Instead of isolated facts or
                  one-off reports, State of the Region provides a structured view of
                  performance, showing how each region fits into the broader
                  national landscape.
                </p>
                <p>
                  Our vision is to support better decision-making—whether for
                  policymakers evaluating public investments, businesses analyzing
                  market opportunities, researchers studying long-term trends, or
                  residents seeking to better understand their communities. By
                  fostering transparency, accessibility, and continuous learning,
                  State of the Region aims to become a trusted resource that
                  elevates the conversation about regional growth, competitiveness,
                  and quality of life.
                </p>
              </div>
            )}
          </div>

          {/* --- Website Overview --- */}
          <div className="accordion-item">
            <button
              className="accordion-header"
              onClick={() =>
                setOpenSection(openSection === "overview" ? "" : "overview")
              }
            >
              <span>Website Overview</span>
              <span className="accordion-icon">
                {openSection === "overview" ? "−" : "+"}
              </span>
            </button>

            {openSection === "overview" && (
              <div className="accordion-content">
                <p>
                  The <strong>State of the Region</strong> website is designed to
                  be approachable for all users— from high school students and new
                  analysts to experienced researchers and policy leaders. Every
                  element of the platform emphasizes clarity, simplicity, and
                  consistency so that meaningful insights can be discovered quickly
                  without needing technical expertise.
                </p>
                <p>
                  The <strong>Policy Playground</strong> is the interactive
                  centerpiece of the website. Users can experiment with categories,
                  indicators, time ranges, and geographic comparisons to create
                  customized charts and dashboards. This tool encourages exploration
                  and helps users understand not only the current state of regions
                  but how patterns have changed over time.
                </p>
                <p>
                  For users looking for curated insights, the{" "}
                  <strong>Reports</strong> section provides category-specific
                  summaries with clean, standardized visualizations. These pages
                  offer a clear narrative of the most important trends and include
                  comparisons between the Tampa Bay region, Florida, and national
                  benchmarks.
                </p>
                <p>
                  Overall, the site is built to encourage curiosity, simplify
                  complex data, and support informed decision-making—whether someone
                  is analyzing housing markets, examining workforce trends, or
                  exploring economic shifts across the nation.
                </p>
              </div>
            )}
          </div>

          {/* --- Data Sources --- */}
          <div className="accordion-item">
            <button
              className="accordion-header"
              onClick={() =>
                setOpenSection(openSection === "data" ? "" : "data")
              }
            >
              <span>Data Sources and Methodology</span>
              <span className="accordion-icon">
                {openSection === "data" ? "−" : "+"}
              </span>
            </button>

            {openSection === "data" && (
              <div className="accordion-content">
                <p>
                  <strong>State of the Region</strong> relies exclusively on
                  reputable, well-documented, and publicly available data sources.
                  These include the U.S. Census Bureau, the Bureau of Labor
                  Statistics, the Bureau of Economic Analysis, Zillow, County Health
                  Rankings, and other authoritative agencies that regularly publish
                  standardized datasets.
                </p>
                <p>
                  Our data pipeline collects, validates, and processes incoming data
                  on a recurring schedule. Automated scripts check for completeness,
                  consistency, and anomalies before any values are added to the
                  platform. While the internal database infrastructure is not
                  publicly detailed for security reasons, the methodology
                  prioritizes reliability, reproducibility, and transparency.
                </p>
                <p>
                  All visualizations on the platform follow a consistent design
                  structure. Indicators share aligned time periods, geographic
                  definitions, and formatting guidelines so users can compare
                  information across categories without confusion. Future phases of
                  the project will introduce clearer update schedules and expanded
                  documentation as additional indicators and geographic regions are
                  added.
                </p>
              </div>
            )}
          </div>

          {/* --- Meet the Team --- */}
          <div className="accordion-item">
            <button
              className="accordion-header"
              onClick={() =>
                setOpenSection(openSection === "team" ? "" : "team")
              }
            >
              <span>Meet the Team</span>
              <span className="accordion-icon">
                {openSection === "team" ? "−" : "+"}
              </span>
            </button>

            {openSection === "team" && (
              <div className="accordion-content">
                <p>
                  <strong>State of the Region</strong> is the result of a sustained
                  collaboration between faculty leaders and talented graduate
                  students at the USF Muma College of Business. Faculty coordinators
                  guide the vision, ensure methodological rigor, and support
                  strategic direction for the project.
                </p>
                <p>
                  The student team contributes directly to the research, data
                  preparation, visualization design, testing, and development of new
                  platform features. Their work is central to keeping the website
                  accurate, relevant, and user-friendly. Each student brings a
                  unique background—from analytics and economics to software
                  development and public policy—which strengthens the overall
                  quality of the project.
                </p>
                <p>
                  Together, the faculty and student contributors form a dynamic team
                  committed to improving data accessibility and supporting informed
                  decision-making across communities nationwide.
                </p>

                {/* Faculty */}
                <h2 className="section-title centered-heading">
                  Faculty Coordinators
                </h2>
                <div className="team-leads">
                  {teamLeads.map((prof, idx) => (
                    <div key={idx} className="prof-card">
                      <img
                        src={prof.image}
                        alt={prof.name}
                        className="prof-img"
                      />
                      <h3 className="prof-name">{prof.name}</h3>
                    </div>
                  ))}
                </div>

                {/* Students */}
                <h2 className="section-title centered-heading">Student Team</h2>
                {["2025", "2024"].map((year) => (
                  <div key={year} className="student-section">
                    <h3 className="student-year centered-heading year-heading">
                      {year}
                    </h3>
                    <div className="student-grid">
                      {studentVolunteers[year].map((stu, i) => (
                        <div key={i} className="student-card">
                          <img
                            src={stu.image}
                            alt={stu.name}
                            className="avatar-small"
                          />
                          <h4>{stu.name}</h4>
                          <p>{stu.role}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ---- FOOTER NAVIGATION ---- */}
        <div className="about-nav-footer-wrapper">
          <div className="about-nav-footer">
            <a href="/" className="about-nav-link">
              Home
            </a>
            <a href="/reports" className="about-nav-link">
              Reports
            </a>
            <a href="/policy-playground" className="about-nav-link">
              Policy Playground
            </a>
            <a href="/about" className="about-nav-link">
              About
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;
