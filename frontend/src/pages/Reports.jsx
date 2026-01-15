import React, { useMemo } from "react";
import { NavLink, useParams } from "react-router-dom";
import "./Reports.css";
import TableauViz from "../components/TableauViz";

// ✅ Only these categories (as requested)
const TOPICS = [
  { slug: "income", label: "Income" },
  { slug: "employment", label: "Employment" },
  { slug: "education", label: "Education" },
  { slug: "housing", label: "Housing" },
  { slug: "transportation", label: "Transportation" },
  { slug: "health", label: "Health" },
  { slug: "demographics", label: "Demographics" },
  { slug: "poverty", label: "Poverty" },
];

const STANDARD_DATE_RANGE = "Last 10 complete years (2014–2023)";
const STANDARD_GEOS = "Jacksonville · Tampa Bay · Orlando";

// ✅ Cleaned base URLs (you can also swap to /shared links if needed)
const TABLEAU_URLS = {
  homeValueTrend: "https://public.tableau.com/views/Zillow_HomeValue/Trend",
  homeValueRank: "https://public.tableau.com/views/Zillow_HomeValue/Rank",
  rentIndexDashboard: "https://public.tableau.com/views/Zillow_RentIndex/Dashboard",
};

const CATEGORY_CONFIG = {
  income: {
    title: "Income",
    description:
      "Income indicators measure earnings, household resources, and inequality. This report compares Jacksonville, Tampa Bay, and Orlando.",
    indicators: [
      { id: "inc-1", title: "Median Household Income", summary: "Placeholder summary.", source: "Source: Placeholder", tableauUrl: "" },
      { id: "inc-2", title: "Wage Growth", summary: "Placeholder summary.", source: "Source: Placeholder", tableauUrl: "" },
      { id: "inc-3", title: "Per Capita Income", summary: "Placeholder summary.", source: "Source: Placeholder", tableauUrl: "" },
      { id: "inc-4", title: "Income Inequality (Gini Index)", summary: "Placeholder summary.", source: "Source: Placeholder", tableauUrl: "" },
      { id: "inc-5", title: "Low-Income Household Share", summary: "Placeholder summary.", source: "Source: Placeholder", tableauUrl: "" },
    ],
  },

  employment: {
    title: "Employment",
    description:
      "Employment indicators track labor market health and job dynamics across Jacksonville, Tampa Bay, and Orlando.",
    indicators: [
      { id: "emp-1", title: "Employment Rate (Age 16+)", summary: "Placeholder summary.", source: "Source: Placeholder", tableauUrl: "" },
      { id: "emp-2", title: "Total Job Growth", summary: "Placeholder summary.", source: "Source: Placeholder", tableauUrl: "" },
      { id: "emp-3", title: "Labor Force Participation", summary: "Placeholder summary.", source: "Source: Placeholder", tableauUrl: "" },
      { id: "emp-4", title: "Industry Diversity", summary: "Placeholder summary.", source: "Source: Placeholder", tableauUrl: "" },
      { id: "emp-5", title: "Average Wage Growth", summary: "Placeholder summary.", source: "Source: Placeholder", tableauUrl: "" },
    ],
  },

  education: {
    title: "Education",
    description:
      "Education indicators summarize K–12 and postsecondary outcomes across Jacksonville, Tampa Bay, and Orlando.",
    indicators: [
      { id: "edu-1", title: "High School Graduation Rate", summary: "Placeholder summary.", source: "Source: Placeholder", tableauUrl: "" },
      { id: "edu-2", title: "Postsecondary Enrollment", summary: "Placeholder summary.", source: "Source: Placeholder", tableauUrl: "" },
      { id: "edu-3", title: "Bachelor’s Degree Attainment", summary: "Placeholder summary.", source: "Source: Placeholder", tableauUrl: "" },
      { id: "edu-4", title: "Reading Proficiency", summary: "Placeholder summary.", source: "Source: Placeholder", tableauUrl: "" },
      { id: "edu-5", title: "College Completion Rate", summary: "Placeholder summary.", source: "Source: Placeholder", tableauUrl: "" },
    ],
  },

  housing: {
    title: "Housing",
    description:
      "Housing indicators capture affordability and market conditions across Jacksonville, Tampa Bay, and Orlando.",
    indicators: [
      {
        id: "hou-1",
        title: "Home Value Trend",
        summary: "Demo Tableau embed using Zillow home value workbook.",
        source: "Source: Tableau Public",
        tableauUrl: TABLEAU_URLS.homeValueTrend, // ✅ Trend
      },
      {
        id: "hou-2",
        title: "Rent Index Dashboard",
        summary: "Demo Tableau embed using Zillow rent index dashboard.",
        source: "Source: Tableau Public",
        tableauUrl: TABLEAU_URLS.rentIndexDashboard, // ✅ Rent dashboard
      },
      {
        id: "hou-3",
        title: "Home Value Rank",
        summary: "Metro ranking by home values to compare relative housing market position.",
        source: "Source: Tableau Public",
        tableauUrl: TABLEAU_URLS.homeValueRank, // ✅ Rank
      },
      { id: "hou-4", title: "Housing Cost Burden", summary: "Placeholder summary.", source: "Source: Placeholder", tableauUrl: "" },
      { id: "hou-5", title: "Vacancy Rate", summary: "Placeholder summary.", source: "Source: Placeholder", tableauUrl: "" },
    ],
  },

  transportation: {
    title: "Transportation",
    description:
      "Transportation indicators focus on commuting patterns and access across Jacksonville, Tampa Bay, and Orlando.",
    indicators: [
      { id: "tra-1", title: "Average Commute Time", summary: "Placeholder summary.", source: "Source: Placeholder", tableauUrl: "" },
      { id: "tra-2", title: "Commute Mode Share", summary: "Placeholder summary.", source: "Source: Placeholder", tableauUrl: "" },
      { id: "tra-3", title: "Transit Ridership", summary: "Placeholder summary.", source: "Source: Placeholder", tableauUrl: "" },
      { id: "tra-4", title: "Transportation Costs as % of Income", summary: "Placeholder summary.", source: "Source: Placeholder", tableauUrl: "" },
      { id: "tra-5", title: "Congestion Index", summary: "Placeholder summary.", source: "Source: Placeholder", tableauUrl: "" },
    ],
  },

  health: {
    title: "Health",
    description:
      "Health indicators track outcomes and access across Jacksonville, Tampa Bay, and Orlando.",
    indicators: [
      { id: "hea-1", title: "Life Expectancy at Birth", summary: "Placeholder summary.", source: "Source: Placeholder", tableauUrl: "" },
      { id: "hea-2", title: "Adult Obesity Rate", summary: "Placeholder summary.", source: "Source: Placeholder", tableauUrl: "" },
      { id: "hea-3", title: "Uninsured Rate", summary: "Placeholder summary.", source: "Source: Placeholder", tableauUrl: "" },
      { id: "hea-4", title: "Preventable Hospitalizations", summary: "Placeholder summary.", source: "Source: Placeholder", tableauUrl: "" },
      { id: "hea-5", title: "Primary Care Physicians per 100k", summary: "Placeholder summary.", source: "Source: Placeholder", tableauUrl: "" },
    ],
  },

  demographics: {
    title: "Demographics",
    description:
      "Demographic indicators capture population and community structure across Jacksonville, Tampa Bay, and Orlando.",
    indicators: [
      { id: "dem-1", title: "Population Growth", summary: "Placeholder summary.", source: "Source: Placeholder", tableauUrl: "" },
      { id: "dem-2", title: "Net Migration", summary: "Placeholder summary.", source: "Source: Placeholder", tableauUrl: "" },
      { id: "dem-3", title: "Age Dependency Ratio", summary: "Placeholder summary.", source: "Source: Placeholder", tableauUrl: "" },
      { id: "dem-4", title: "Diversity Index", summary: "Placeholder summary.", source: "Source: Placeholder", tableauUrl: "" },
      { id: "dem-5", title: "Educational Attainment", summary: "Placeholder summary.", source: "Source: Placeholder", tableauUrl: "" },
    ],
  },

  poverty: {
    title: "Poverty",
    description:
      "Poverty indicators highlight hardship and vulnerability across Jacksonville, Tampa Bay, and Orlando.",
    indicators: [
      { id: "pov-1", title: "Overall Poverty Rate", summary: "Placeholder summary.", source: "Source: Placeholder", tableauUrl: "" },
      { id: "pov-2", title: "Child Poverty Rate", summary: "Placeholder summary.", source: "Source: Placeholder", tableauUrl: "" },
      { id: "pov-3", title: "Deep Poverty Rate", summary: "Placeholder summary.", source: "Source: Placeholder", tableauUrl: "" },
      { id: "pov-4", title: "Working Poor Share", summary: "Placeholder summary.", source: "Source: Placeholder", tableauUrl: "" },
      { id: "pov-5", title: "Severe Housing Cost Burden", summary: "Placeholder summary.", source: "Source: Placeholder", tableauUrl: "" },
    ],
  },
};

function ReportsLanding() {
  return (
    <div className="reports-landing">
      <header className="reports-landing-header">
        <h1 className="reports-landing-title">Start Exploring</h1>
        <p className="reports-landing-subtitle">
          Dive into the core indicators. Select a topic to explore trends, comparisons, and insights.
        </p>
      </header>

      <div className="reports-landing-grid">
        {TOPICS.map((t) => (
          <NavLink key={t.slug} to={`/reports/${t.slug}`} className="reports-landing-tile">
            {t.label}
          </NavLink>
        ))}
      </div>
    </div>
  );
}

function CategoryReport({ topic }) {
  const config = CATEGORY_CONFIG[topic];

  return (
    <>
      <section className="category-summary">
        <h2 className="category-summary-title">{config.title} Overview</h2>
        <p className="category-summary-text">{config.description}</p>
        <p className="category-summary-meta">
          Comparative standard: <strong>5 indicators</strong>, <strong>one chart per indicator</strong>,{" "}
          <strong>{STANDARD_DATE_RANGE}</strong>, <strong>{STANDARD_GEOS}</strong>.
        </p>
      </section>

      <div className="indicator-grid">
        {config.indicators.slice(0, 5).map((ind) => (
          <section key={ind.id} className="indicator-panel">
            <header className="indicator-header">
              <h3 className="indicator-title">{ind.title}</h3>
            </header>

            <div className="indicator-chart">
              {ind.tableauUrl ? (
                <TableauViz url={ind.tableauUrl} height={520} toolbar={false} tabs={false} />
              ) : (
                <div className="indicator-chart-placeholder">
                  Tableau URL not set yet (placeholder for demo)
                </div>
              )}
            </div>

            <div className="indicator-meta">
              <p className="indicator-summary">{ind.summary}</p>

              <p className="indicator-label">
                <span className="indicator-label-tag">Source</span>
                {ind.source}
              </p>
              <p className="indicator-label">
                <span className="indicator-label-tag">Date range</span>
                {STANDARD_DATE_RANGE}
              </p>
              <p className="indicator-label">
                <span className="indicator-label-tag">Geographies</span>
                {STANDARD_GEOS}
              </p>
            </div>
          </section>
        ))}
      </div>
    </>
  );
}

export default function Reports() {
  const { topic: topicParam } = useParams();
  const topic = useMemo(() => (topicParam || "").toLowerCase(), [topicParam]);

  // Landing page: /reports
  if (!topicParam) return <ReportsLanding />;

  // Unknown category -> back to landing
  if (!CATEGORY_CONFIG[topic]) return <ReportsLanding />;

  return (
    <div className="reports-page">
      <div className="reports-layout">
        <aside className="reports-sidebar open">
          <nav className="sidebar-nav">
            {TOPICS.map((t) => (
              <NavLink
                key={t.slug}
                to={`/reports/${t.slug}`}
                className={({ isActive }) => `sidebar-link ${isActive ? "active" : ""}`}
              >
                {t.label}
              </NavLink>
            ))}
          </nav>
        </aside>

        <main className="reports-content">
          <header className="reports-header">
            <h1 className="report-title">{toTitle(topic)} Report</h1>
            <p className="report-subtitle">
              Standardized report with five indicators comparing {STANDARD_GEOS}.
            </p>
          </header>

          <CategoryReport topic={topic} />
        </main>
      </div>
    </div>
  );
}

function toTitle(slug) {
  return slug.replace(/-/g, " ").replace(/\b\w/g, (m) => m.toUpperCase());
}
