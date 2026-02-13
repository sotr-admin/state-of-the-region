import React, { useState } from "react";
import "./About.css";
import USAMap from "./USAMap"; // reuse the same map as Home

const teamLeads = [
  {
    name: "Dr. Manish Agrawal",
    image: "/assets/Photos/manish.png",
    link: "https://www.usf.edu/business/about/bios/agrawal-manish.aspx",
  },
  {
    name: "Dr. Shivendu Shivendu",
    image: "/assets/Photos/shivendu-shivendu.jpg",
    link: "https://www.usf.edu/business/about/bios/shivendu-shivendu.aspx",
  },
];

const studentVolunteers = {
  2025: [
    {
      name: "Shlok Goud",
      role: "MS AIBA 2026",
      image: "/assets/Photos/shlok_goud.jpg",
    },
    {
      name: "Sohan Vasudeva",
      role: "MS AIBA 2026",
      image: "/assets/Photos/sohan.jpg",
    },
    {
      name: "Sonal Shreya",
      role: "MS AIBA 2026",
      image: "/assets/Photos/sonal.jpg",
    },
    {
      name: "Aditi Malik",
      role: "MS AIBA 2027",
      image: "/assets/Photos/aditi-malik.jpg",
    },
    {
      name: "Venkata Lokesh Adda",
      role: "MS AIBA 2026",
      image: "/assets/Photos/lokesh.jpg",
    },
    {
      name: "Jacqueline Lapacek",
      role: "MS AIBA 2026",
      image: "/assets/Photos/jackie.jpg",
    },
  ],
  2024: [
    {
      name: "Nikita Gill",
      role: "MS AIBA 2025",
      image: "/assets/Photos/nikita-gill.jpg",
    },
    {
      name: "Nidhi Falak",
      role: "MS AIBA 2025",
      image: "/assets/Photos/nidhi-falak.jpg",
    },
    {
      name: "Alvaro Ruiz",
      role: "MS AIBA 2026",
      image: "/assets/Photos/alvaro-montoya-ruiz.jpg",
    },
    {
      name: "Priyanka ",
      role: "MS AIBA 2026",
      image: "/assets/Photos/priyanka-jammu.jpg",
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
          <h1 className="about-title">About the Regional Insights Dashboard</h1>

          <p className="about-intro-text">
            <strong>The Regional Insights Dashboard</strong> is an interactive, data-driven
            platform designed to help communities understand their economic,
            social, and demographic standing within a broader national context.
            Originally developed as a regional benchmarking tool for the Tampa Bay
            area, the initiative has evolved into a comprehensive resource that
            supports comparisons across metropolitan statistical areas (MSAs),
            counties, and states throughout the United States.
            <br />
            <br />
            By consolidating high-quality data from trusted national sources and
            presenting it through clear, interactive visualizations, the platform
            empowers users—including policymakers, business leaders, researchers,
            students, and residents—to explore trends, identify opportunities,
            and support informed decision-making. Whether examining workforce
            dynamics, housing affordability, public health measures, or economic
            competitiveness, Regional Insights Dashboard provides essential context for
            understanding how communities are performing today and how they are
            changing over time.
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
                The <strong>E-Insights report and Regional Insights Dashboard</strong> were created with a simple but ambitious vision: to make regional data accessible, meaningful, and actionable. What began as a localized effort to understand Tampa Bay’s position among peer metropolitan areas has grown into a robust national platform that enables comparisons across cities, counties, and states using a wide range of economic and social indicators.
                </p>
                <p>
                  The project empowers communities by transforming complex datasets
                  into clear, intuitive insights. Rather than presenting isolated
                  facts or one-off reports, the Regional Insights Dashboard offers a structured,
                  comparative view of performance, helping users understand how
                  regions relate to one another and how they are changing over time.
                </p>
                <p>
                  Our vision is to support better decision making whether for
                  policymakers evaluating public investments, businesses analyzing
                  market opportunities, researchers studying long-term trends, or
                  residents seeking to better understand their communities. By
                  fostering transparency, accessibility, and continuous learning,
                  this resource, and those offered through the State of the Region website, aims to serve as a trusted resource that
                  elevates conversations about regional growth, competitiveness,
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
              <span>Dashboard Overview</span>
              <span className="accordion-icon">
                {openSection === "overview" ? "−" : "+"}
              </span>
            </button>

            {openSection === "overview" && (
              <div className="accordion-content">
                <p>
                  The <strong>Regional Insights Dashboard</strong> is designed to
                  be approachable for a wide range of users from high school
                  students and new analysts to experienced researchers and policy
                  leaders. Every element of the platform emphasizes clarity,
                  simplicity, and consistency, making it possible to uncover
                  meaningful insights quickly without requiring advanced technical
                  expertise.
                </p>
                <p>
                  The <strong>Policy Playground</strong> serves as the interactive
                  centerpiece of the site. Users can explore categories, indicators,
                  time ranges, and geographic comparisons to create customized
                  charts and visualizations. This hands-on tool encourages
                  experimentation and helps users understand not only current
                  regional conditions, but how patterns and outcomes have evolved
                  over time.
                </p>
                <p>
                  For users seeking for curated insights, the{" "}
                  <strong>Reports</strong> section provides category-specific
                  summaries supported by clean, standardized visualizations. These
                  pages present a clear narrative of key trends and include
                  comparisons between the Tampa Bay region, Florida, and national
                  benchmarks.
                </p>
                <p>
                  Overall, the dashboard is built to spark curiosity, simplify complex
                  data, and support informed decision making whether a user is
                  analyzing housing markets, examining workforce trends, or
                  exploring economic change across communities nationwide.
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
                  The<strong>Regional Insights</strong> dashboard relies exclusively
                  on reputable, well-documented, and publicly available data
                  sources. These include the U.S. Census Bureau, the Bureau of
                  Labor Statistics, the Bureau of Economic Analysis, Zillow, County
                  Health Rankings, and other authoritative agencies that regularly
                  publish standardized datasets.
                </p>
                <p>
                  The platform’s data pipeline collects, validates, and processes
                  incoming data on a recurring schedule. Automated checks are used
                  to assess completeness, consistency, and potential anomalies
                  before values are incorporated into the system. While internal
                  database infrastructure is not publicly detailed for security
                  reasons, the methodology emphasizes reliability, reproducibility,
                  and transparency in how data are sourced, prepared, and
                  presented.
                </p>
                <p>
                  All visualizations on the platform follow a consistent design
                  framework. Indicators are aligned by time period, geographic
                  definition, and formatting conventions so users can make
                  comparisons across categories with confidence. Future phases of
                  the project will introduce clearer update schedules and expanded
                  documentation as additional indicators and geographic coverage
                  are added.
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
                  The<strong>Regional Insights</strong> project is the result of
                  sustained collaboration between faculty leaders and graduate
                  students at the Muma College of Business at the University of
                  South Florida. Faculty coordinators provide strategic direction,
                  guide the overall vision, and ensure methodological rigor
                  throughout the project.
                </p>
                <p>
                Graduate student contributors play a central role in the platform’s development, supporting research, data preparation, visualization design, testing, and the implementation of new features. Their work is essential to keeping the site accurate, relevant, and user-friendly. Team members bring diverse academic and professional backgrounds—from analytics and economics to software development and public policy—strengthening the depth and quality of the project.
                </p>
                <p>
                Together, faculty and student contributors form a collaborative team committed to improving access to high-quality data and supporting informed decision-making across communities nationwide. 
                </p>

                {/* Faculty */}
                <h2 className="section-title centered-heading">
                  Faculty Coordinators
                </h2>
                <div className="team-leads">
                  {teamLeads.map((prof, idx) => (
                    <div key={idx} className="prof-card">
                      <img src={prof.image} alt={prof.name} className="prof-img" />
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
            <a href="/" className="about-nav-link">Home</a>
            <a href="/reports" className="about-nav-link">Reports</a>
            <a href="/policy-playground" className="about-nav-link">Policy Playground</a>
            <a href="/about" className="about-nav-link">About</a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;
