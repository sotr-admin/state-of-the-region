import React, { useMemo, useState } from "react";
import { NavLink, useParams } from "react-router-dom";
import "./Reports.css";
import TableauViz from "../components/TableauViz";

const TOPICS = [
  { slug: "income", label: "Income" },
  { slug: "employment", label: "Employment" },
  { slug: "education", label: "Education" },
  { slug: "housing", label: "Housing" },
  { slug: "health", label: "Health" },
  { slug: "demographics", label: "Demographics" },
  { slug: "transportation", label: "Transportation" },
  { slug: "poverty", label: "Poverty" },
];

const STANDARD_DATE_RANGE = "Last 10 complete years (2014–2023)";
const DEFAULT_SUBTITLE =
  "Standardized report with five indicators comparing Jacksonville · Tampa Bay · Orlando.";

const CATEGORY_CONFIG = {
  employment: {
    title: "Employment",
    overview:
      "Sample overview content for Employment. This will be customized later per category.",
    indicators: [
      {
        id: "emp-1",
        title: "Labor Force Participation Rate",
        summary:
          "Tracks the share of working-age population active in the labor force.",
        source: "Source: Tableau Public",
        tableauUrl:
          "https://public.tableau.com/views/S2301_Employment_Status/LaborParticipationTrend?:language=en-US&:sid=&:redirect=auth&:display_count=n&:origin=viz_share_link",
      },
      {
        id: "emp-2",
        title: "Employment–Population Ratio",
        summary: "Measures the proportion of the population that is employed.",
        source: "Source: Tableau Public",
        tableauUrl:
          "https://public.tableau.com/views/S2301_Employment_Status/Employment-PopulationTrend?:language=en-US&:sid=&:redirect=auth&:display_count=n&:origin=viz_share_link",
      },
      {
        id: "emp-3",
        title: "Black–White Unemployment Rate Gap",
        summary:
          "Shows disparities in unemployment rates between Black and White workers.",
        source: "Source: Tableau Public",
        tableauUrl:
          "https://public.tableau.com/views/Black-WhiteUnemploymentRateGap/TrendoverTime?:language=en-US&:sid=&:redirect=auth&:display_count=n&:origin=viz_share_link",
      },
      {
        id: "emp-4",
        title: "Black–White Labor Force Participation Rate Gap",
        summary: "Highlights participation gaps in the labor force by race.",
        source: "Source: Tableau Public",
        tableauUrl:
          "https://public.tableau.com/views/Black-WhiteLaborParticipationRateGap/TrendoverTime?:language=en-US&:sid=&:redirect=auth&:display_count=n&:origin=viz_share_link",
      },
      {
        id: "emp-5",
        title: "Business Establishment Growth",
        summary:
          "Tracks new business establishment rates over the last 12 months.",
        source: "Source: Tableau Public",
        tableauUrl:
          "https://public.tableau.com/views/NewBusinessEstablishmentRateintheLast12Months/TrendoverTime?:language=en-US&:sid=&:redirect=auth&:display_count=n&:origin=viz_share_link",
      },
    ],
  },

  education: {
    title: "Education",
    overview:
      "Sample overview content for Education. This will be customized later per category.",
    indicators: [
      {
        id: "edu-1",
        title: "Educational Attainment by Employment Status for the Population 25 to 64 Years",
        summary:
          "Distribution of educational attainment across employment status categories.",
        source: "Source: Tableau Public",
        tableauUrl: [
          "https://public.tableau.com/views/B23006_HigherEducation_Website/Sheet1?:language=en-US&:sid=&:redirect=auth&:display_count=n&:origin=viz_share_link",
          "https://public.tableau.com/views/B23006_Low_education_Website/Sheet1?:language=en-US&:sid=&:redirect=auth&:display_count=n&:origin=viz_share_link",
        ],
      },
      {
        id: "edu-2",
        title: "Number of Students Receiving Bachelor’s Degrees",
        summary:
          "Trend over time in the number of students awarded bachelor’s degrees.",
        source: "Source: Tableau Public",
        tableauUrl:
          "https://public.tableau.com/views/BachelorsDegree/TrendoverTime?:language=en-US&:sid=&:redirect=auth&:display_count=n&:origin=viz_share_link",
      },
      {
        id: "edu-3",
        title: "Number of Students Receiving Master’s Degrees",
        summary:
          "Rank-based comparison of master’s degree attainment across metros.",
        source: "Source: Tableau Public",
        tableauUrl:
          "https://public.tableau.com/views/MastersDegree/Sheet1?:language=en-US&:sid=&:redirect=auth&:display_count=n&:origin=viz_share_link",
      },
      {
        id: "edu-4",
        title: "Median Earnings by Educational Attainment (B20004)",
        summary:
          "Comparison of median earnings across educational attainment levels.",
        source: "Source: Tableau Public",
        tableauUrl:
          "https://public.tableau.com/views/B20004_HigherEducation_Website/Sheet1?:language=en-US&:sid=&:redirect=auth&:display_count=n&:origin=viz_share_link",
      },
      {
        id: "edu-5",
        title:
          "Poverty Status by Educational Attainment – Bachelor’s Degree or Higher (S1701)",
        summary:
          "Competitive position for poverty rates among adults with a bachelor’s degree or higher.",
        source: "Source: Tableau Public",
        tableauUrl:
          "https://public.tableau.com/views/PercentageofAdultsWithaBachelorsDegreeorHigherBelowthePovertyLevel/CompetitivePositionTrend?:language=en-US&:sid=&:redirect=auth&:display_count=n&:origin=viz_share_link",
      },
    ],
  },

  housing: {
    title: "Housing",
    overview:
      "Sample overview content for Housing. This will be customized later per category.",
    indicators: [
      {
        id: "hou-1",
        title: "Zillow Home Value Index",
        summary: "Trend over time for the Zillow Home Value Index (ZHVI).",
        source: "Source: Tableau Public",
        tableauUrl:
          "https://public.tableau.com/views/Zillow_HomeValue/Trend?:language=en-US&:sid=&:redirect=auth&:display_count=n&:origin=viz_share_link",
      },
      {
        id: "hou-2",
        title: "Zillow Observed Rent Index",
        summary: "Trend over time for the Zillow Observed Rent Index (ZORI).",
        source: "Source: Tableau Public",
        tableauUrl:
          "https://public.tableau.com/views/Zillow_RentIndex/Trend?:language=en-US&:sid=&:redirect=auth&:display_count=n&:origin=viz_share_link",
      },
      {
        id: "hou-3",
        title: "Homeownership Rate (B25003)",
        summary:
          "Trend over time for the percentage of housing units occupied by owners.",
        source: "Source: Tableau Public",
        tableauUrl:
          "https://public.tableau.com/views/PercentageofUnitsOccupiedbyOwner/TrendoverTime?:language=en-US&:sid=&:redirect=auth&:display_count=n&:origin=viz_share_link",
      },
      {
        id: "hou-4",
        title: "Monthly Housing Costs (B25104)",
        summary:
          "Comparison of households with monthly housing costs below $1,500.",
        source: "Source: Tableau Public",
        tableauUrl:
          "https://public.tableau.com/views/PercentageofHouseholdswithMonthlyHousingCostLessthan1500/PercentageofHouseholdswithMonthlyHousingCostsLessthan1500?:language=en-US&:sid=&:redirect=auth&:display_count=n&:origin=viz_share_link",
      },
      {
        id: "hou-5",
        title: "Ratio of Housing Costs to Income",
        summary:
          "Trend over time for housing affordability relative to income.",
        source: "Source: Tableau Public",
        tableauUrl:
          "https://public.tableau.com/views/RatioofHousingCoststoIncome/Sheet1?:language=en-US&:sid=&:redirect=auth&:display_count=n&:origin=viz_share_link",
      },
    ],
  },

  health: {
    title: "Health",
    overview:
      "Sample overview content for Health. This will be customized later per category.",
    indicators: [
      {
        id: "hea-1",
        title: "Premature Death",
        summary:
          "Trend over time in premature death rates, reflecting population health outcomes.",
        source: "Source: Tableau Public",
        tableauUrl:
          "https://public.tableau.com/views/PrematureDeath_17653009774010/TrendoverTime?:language=en-US&:sid=&:redirect=auth&:display_count=n&:origin=viz_share_link",
      },
      {
        id: "hea-2",
        title: "Uninsured Rate (Under 65)",
        summary:
          "Trend over time in the percentage of adults under age 65 without health insurance.",
        source: "Source: Tableau Public",
        tableauUrl:
          "https://public.tableau.com/views/PercentageofUninsuredAdultsAge65/TrendoverTime?:language=en-US&:sid=&:redirect=auth&:display_count=n&:origin=viz_share_link",
      },
      {
        id: "hea-3",
        title: "HRSA Financial Assistance",
        summary:
          "Comparison of Health Resources and Services Administration (HRSA) grant funding.",
        source: "Source: Tableau Public",
        tableauUrl:
          "https://public.tableau.com/views/HRSA_17652870184860/HRSAGrant?:language=en-US&:sid=&:redirect=auth&:display_count=n&:origin=viz_share_link",
      },
      {
        id: "hea-4",
        title: "Deaths / Injury Due to Road Accidents",
        summary:
          "Trend over time in deaths and injuries resulting from road accidents.",
        source: "Source: Tableau Public",
        tableauUrl:
          "https://public.tableau.com/views/accidentsWebsite/Sheet2?:language=en-US&:sid=&:redirect=auth&:display_count=n&:origin=viz_share_link",
      },
      {
        id: "hea-5",
        title: "Public Assistance Income / SNAP",
        summary:
          "Comparison of households receiving public assistance or SNAP benefits.",
        source: "Source: Tableau Public",
        tableauUrl:
          "https://public.tableau.com/views/PercentageofHouseholdsReceivingPublicAssistanceIncome/PercentageofHouseholdswithPublicAssistanceIncome?:language=en-US&:sid=&:redirect=auth&:display_count=n&:origin=viz_share_link",
      },
    ],
  },

  demographics: {
    title: "Demographics",
    overview:
      "Sample overview content for Demographics. This will be customized later per category.",
    indicators: [
      {
        id: "dem-1",
        title: "Civic Engagement (Voting)",
        summary:
          "Trend or comparative view of civic engagement measured through voting participation.",
        source: "Source: Tableau Public",
        tableauUrl:
          "https://public.tableau.com/views/VotingWebsite/Sheet1?:language=en-US&:sid=&:redirect=auth&:display_count=n&:origin=viz_share_link",
      },
      {
        id: "dem-2",
        title: "Geographical Mobility by Poverty/Income (ACS B07012)",
        summary:
          "Mobility patterns segmented by income/poverty group (bar-style comparison).",
        source: "Source: Tableau Public",
        tableauUrl:
          "https://public.tableau.com/views/GeographicalMobilitybyPoverty/Sheet1?:language=en-US&:sid=&:redirect=auth&:display_count=n&:origin=viz_share_link",
      },
      {
        id: "dem-3",
        title: "Migration by Income Level (High-Income Migration to an MSA)",
        summary:
          "Trend over time in high-income migration into the metro area.",
        source: "Source: Tableau Public",
        tableauUrl:
          "https://public.tableau.com/views/B07010_High_Income_migrants/High-IncomeMigrantsTrend?:language=en-US&:sid=&:redirect=auth&:display_count=n&:origin=viz_share_link",
      },
      {
        id: "dem-4",
        title: "Poverty by Age Groups (Children / Older Adults)",
        summary:
          "Two related views: poverty among children (0–17) and poverty among older adults.",
        source: "Source: Tableau Public",
        tableauUrls: [
          "https://public.tableau.com/views/PovertyStatusAmongChildrenAges017/Sheet1?:language=en-US&:sid=&:redirect=auth&:display_count=n&:origin=viz_share_link",
          "https://public.tableau.com/views/PovertyRateAmongOlderAdults/Sheet4?:language=en-US&:sid=&:redirect=auth&:display_count=n&:origin=viz_share_link",
        ],
      },
      {
        id: "dem-5",
        title: "Taxpaying Population",
        summary:
          "Trend or comparative view of the taxpaying population over time.",
        source: "Source: Tableau Public",
        tableauUrl:
          "https://public.tableau.com/views/TaxpayersWebsite/Sheet1?:language=en-US&:sid=&:redirect=auth&:display_count=n&:origin=viz_share_link",
      },
    ],
  },

  income: {
    title: "Income",
    overview: "Sample overview content for Income.",
    indicators: [
      {
        id: "inc-1",
        title: "Income Inequality (Gini Index)",
        summary: "Tracks income inequality over time using the Gini Index.",
        source: "Source: Tableau Public",
        tableauUrl:
          "https://public.tableau.com/views/IncomeInequalityGiniIndex/TrendoverTime?:language=en-US&:sid=&:redirect=auth&:display_count=n&:origin=viz_share_link",
      },
      {
        id: "inc-2",
        title: "Cost of Living Index (Regional Price Parities)",
        summary:
          "Compares relative cost of living across regions using Regional Price Parities.",
        source: "Source: Tableau Public",
        tableauUrl:
          "https://public.tableau.com/views/MarginalRegionalPriceParitiesCostofLivingIndex_17651726792250/CostofLivingIndex?:language=en-US&:sid=&:redirect=auth&:display_count=n&:origin=viz_share_link",
      },
      {
        id: "inc-3",
        title: "Per Capita Personal Income",
        summary: "Shows per-capita personal income trends over time.",
        source: "Source: Tableau Public",
        tableauUrl:
          "https://public.tableau.com/views/PerCapitaPersonalIncome_17651698300470/TrendOverTime?:language=en-US&:sid=&:redirect=auth&:display_count=n&:origin=viz_share_link",
      },{
        id: "inc-4",
        title:
          "Households Receiving Social Security Income (Past 12 Months)",
        summary:
          "Percentage of households receiving Social Security income in the past 12 months.",
        source: "Source: Tableau Public",
        tableauUrl:
          "https://public.tableau.com/views/PercentageofHouseholdsReceivingSocialSecurityIncome/PercentageofHouseholdswithSocialSecurityIncome?:language=en-US&:sid=&:redirect=auth&:display_count=n&:origin=viz_share_link",
      },
      {
        id: "inc-5",
        title:
          "Households Receiving Public Assistance or SNAP (Past 12 Months)",
        summary:
          "Percentage of households receiving public assistance income or food stamps (SNAP).",
        source: "Source: Tableau Public",
        tableauUrl:
          "https://public.tableau.com/views/PercentageofHouseholdsReceivingPublicAssistanceIncome/PercentageofHouseholdswithPublicAssistanceIncome?:language=en-US&:sid=&:redirect=auth&:display_count=n&:origin=viz_share_link",
      },
    ],
  },
  transportation: {
    title: "Transportation",
    overview:
      "Transportation indicators highlight racial disparities in access to mobility options, including public transit usage and car transportation.",
    indicators: [
      {
        id: "trans-1",
        title: "Black–White Public Transportation Rate Gap",
        summary:
          "Difference between Black and White public transportation usage rates over time, highlighting disparities in transit access.",
        source: "Source: Tableau Public",
        tableauUrl:
          "https://public.tableau.com/views/Black-WhitePublicTransportationRateGap_17640638062030/TrendoverTime?:language=en-US&:sid=&:redirect=auth&:display_count=n&:origin=viz_share_link",
      },
      {
        id: "trans-2",
        title: "Black–White Car Transportation Rate Gap",
        summary:
          "Difference between Black and White car transportation usage rates over time, reflecting inequities in vehicle access.",
        source: "Source: Tableau Public",
        tableauUrl:
          "https://public.tableau.com/views/Black-WhiteCarTransportationRateGap_17640691231840/TrendoverTime?:language=en-US&:sid=&:redirect=auth&:display_count=n&:origin=viz_share_link",
      },
    ],
  },
  
  poverty: {
    title: "Poverty",
    overview:
      "Poverty indicators highlight economic hardship and inequality across regions, focusing on income adequacy and racial disparities.",
    indicators: [
      {
        id: "pov-1",
        title:
          "Population Below 200% of the Poverty Level (Past 12 Months)",
        summary:
          "Percentage of the population with income below 200% of the federal poverty level, shown as a trend over time.",
        source: "Source: Tableau Public",
        tableauUrl:
          "https://public.tableau.com/views/PercentageofPopulationBelow200ofthePovertyLevel/TrendoverTime?:language=en-US&:sid=&:redirect=auth&:display_count=n&:origin=viz_share_link",
      },
      {
        id: "pov-2",
        title: "Black–White Poverty Rate Gap",
        summary:
          "Difference between Black and White poverty rates, highlighting racial disparities in economic well-being.",
        source: "Source: Tableau Public",
        tableauUrl:
          "https://public.tableau.com/views/Black-WhitePovertyRateGap/Black-WhitePovertyRateGap?:language=en-US&:sid=&:redirect=auth&:display_count=n&:origin=viz_share_link",
      },
    ],
  },  
};

function ReportsLanding() {
  return (
    <div className="reports-landing">
      <header className="reports-landing-header">
        <h1 className="reports-landing-title">Start Exploring</h1>
        <p className="reports-landing-subtitle">
          Select a topic to explore trends, comparisons, and insights.
        </p>
      </header>

      <div className="reports-landing-grid">
        {TOPICS.map((t) => (
          <NavLink
            key={t.slug}
            to={`/reports/${t.slug}`}
            className="reports-landing-tile"
          >
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
      <div className="report-top">
        <h1 className="report-title-plain">{config.title} Report</h1>
        <p className="report-subtitle-plain">{DEFAULT_SUBTITLE}</p>
      </div>

      <div className="overview-plain">
        <p className="overview-text">{config.overview}</p>
      </div>

      <div className="indicator-grid">
        {(config.indicators || []).slice(0, 5).map((ind) => {
          const hasMultiple = Array.isArray(ind.tableauUrls);

          return (
            <section key={ind.id} className="indicator-panel">
              <header className="indicator-header">
                <h3 className="indicator-title">{ind.title}</h3>
              </header>

              <div className="indicator-chart">
                {hasMultiple ? (
                  <div style={{ display: "grid", gap: 16 }}>
                    {ind.tableauUrls.map((u, idx) => (
                      <TableauViz
                        key={`${ind.id}-${idx}`}
                        url={u}
                        height={520}
                        toolbar={false}
                        tabs={false}
                      />
                    ))}
                  </div>
                ) : ind.tableauUrl ? (
                  <TableauViz
                    url={ind.tableauUrl}
                    height={520}
                    toolbar={false}
                    tabs={false}
                  />
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
              </div>
            </section>
          );
        })}
      </div>
    </>
  );
}

export default function Reports() {
  const { topic: topicParam } = useParams();
  const topic = useMemo(() => (topicParam || "").toLowerCase(), [topicParam]);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  if (!topicParam) return <ReportsLanding />;
  if (!CATEGORY_CONFIG[topic]) return <ReportsLanding />;

  return (
    <div className="reports-page">
      <div className="reports-layout">
        <aside className={`reports-sidebar ${sidebarOpen ? "open" : "closed"}`}>
          <button
            className="sidebar-toggle"
            onClick={() => setSidebarOpen((v) => !v)}
            aria-label="Toggle sidebar"
            type="button"
          >
            {sidebarOpen ? "⟨⟨" : "⟩⟩"}
          </button>

          {sidebarOpen && (
            <nav className="sidebar-nav">
              {TOPICS.map((t) => (
                <NavLink
                  key={t.slug}
                  to={`/reports/${t.slug}`}
                  className={({ isActive }) =>
                    `sidebar-link ${isActive ? "active" : ""}`
                  }
                >
                  {t.label}
                </NavLink>
              ))}
            </nav>
          )}
        </aside>

        <main className="reports-content">
          <CategoryReport topic={topic} />
        </main>
      </div>
    </div>
  );
}
