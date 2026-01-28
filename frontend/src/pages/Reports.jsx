import React, { useMemo, useState } from "react";
import { NavLink, useParams, Navigate } from "react-router-dom";
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
  "Explore how trends have changed over time and how the Tampa Bay region compares with peer metros.";

const CATEGORY_CONFIG = {
  employment: {
    title: "Employment",
    overview:
      "This section highlights key trends over the past decade and compares Tampa Bay with peer regions to understand how outcomes are changing over time.",
    indicators: [
      {
        id: "emp-1",
        title: "Labor Force Participation Rate",
        summary:
          "The labor force participation rate measures the share of the working-age population (ages 16 and over) that is either employed or actively seeking work. This indicator helps users understand how engaged residents are in the labor market beyond unemployment alone. Regions with higher participation rates generally reflect stronger labor market attachment, while lower rates may signal barriers such as caregiving responsibilities, health limitations, or limited job access. Users should expect this measure to change gradually over time rather than fluctuate sharply from year to year.",
        source: "U.S. Census Bureau, American Community Survey (ACS)",
        tableauUrl:
          "https://public.tableau.com/views/S2301_Employment_Status/LaborParticipationTrend?:language=en-US&:sid=&:redirect=auth&:display_count=n&:origin=viz_share_link",
      },
      {
        id: "emp-2",
        title: "Employment–Population Ratio",
        summary:
          "The employment–population ratio shows the share of the working-age population that is currently employed. Unlike the unemployment rate, this measure includes people who are not actively seeking work, providing a broader view of employment across a region. It is especially useful for comparing labor market strength across regions with different demographic profiles. Users should expect this indicator to move with economic conditions, but often more smoothly than monthly employment statistics.",
        source: "U.S. Census Bureau, American Community Survey (ACS)",
        tableauUrl:
          "https://public.tableau.com/views/S2301_Employment_Status/Employment-PopulationTrend?:language=en-US&:sid=&:redirect=auth&:display_count=n&:origin=viz_share_link",
      },
      {
        id: "emp-3",
        title: "Black–White Unemployment Rate Gap",
        summary:
          "This indicator measures the difference in unemployment rates between Black and White residents within a region. It highlights disparities in labor market outcomes that are not visible in overall unemployment figures. Larger gaps may reflect differences in access to employment opportunities, job stability, or economic resilience across groups. Users should expect this measure to vary by region and to change gradually over time rather than respond quickly to short-term economic shifts.",
        source: "U.S. Census Bureau, American Community Survey (ACS)",
        tableauUrl:
          "https://public.tableau.com/views/Black-WhiteUnemploymentRateGap/TrendoverTime?:language=en-US&:sid=&:redirect=auth&:display_count=n&:origin=viz_share_link",
      },
      {
        id: "emp-4",
        title: "Black–White Labor Force Participation Rate Gap",
        summary:
          "The Black–White labor force participation rate gap compares the share of Black and White residents who are working or actively seeking work. This indicator provides insight into differences in labor market engagement across groups, which may be influenced by education, caregiving, health, or access to employment. Smaller gaps suggest more similar levels of labor force participation, while larger gaps point to uneven engagement. Users should expect this indicator to reflect long-term structural patterns rather than short-term economic cycles.",
        source: "U.S. Census Bureau, American Community Survey (ACS)",
        tableauUrl:
          "https://public.tableau.com/views/Black-WhiteLaborParticipationRateGap/TrendoverTime?:language=en-US&:sid=&:redirect=auth&:display_count=n&:origin=viz_share_link",
      },
      {
        id: "emp-5",
        title: "Business Establishment Growth",
        summary:
          "Business establishment growth tracks changes in the number of operating businesses within a region over time. This indicator is commonly used as a signal of economic activity, entrepreneurship, and job creation potential. Growth in establishments may indicate a favorable business environment, while slower growth or declines can signal economic contraction or consolidation. Users should expect this measure to respond more slowly than employment figures and to vary across regions depending on industry mix and economic conditions.",
        source: "U.S. Census Bureau, County Business Patterns (CBP)",
        tableauUrl:
          "https://public.tableau.com/views/NewBusinessEstablishmentRateintheLast12Months/TrendoverTime?:language=en-US&:sid=&:redirect=auth&:display_count=n&:origin=viz_share_link",
      },
    ],
  },

  education: {
    title: "Education",
    overview:
      "This section highlights key trends over the past decade and compares Tampa Bay with peer regions to understand how outcomes are changing over time.",
    indicators: [
      {
        id: "edu-1",
        title:
          "Educational Attainment by Employment Status for the Population 25 to 64 Years",
        summary:
          "This indicator shows how employment status varies by level of educational attainment for adults ages 25 and over. It helps users understand the relationship between education and labor market outcomes, including differences in employment, unemployment, and labor force participation across education levels. Higher educational attainment is typically associated with stronger employment outcomes, though patterns vary by region and economic conditions. Users should expect this indicator to reflect long-term trends rather than short-term labor market fluctuations.",
        source: "U.S. Census Bureau, American Community Survey (ACS)",
        tableauUrl: [
          "https://public.tableau.com/views/B23006_HigherEducation_Website/Sheet1?:language=en-US&:sid=&:redirect=auth&:display_count=n&:origin=viz_share_link",
          "https://public.tableau.com/views/B23006_Low_education_Website/Sheet1?:language=en-US&:sid=&:redirect=auth&:display_count=n&:origin=viz_share_link",
        ],
      },
      {
        id: "edu-2",
        title: "Number of Students Receiving Bachelor’s Degrees",
        summary:
          "This indicator tracks the total number of bachelor’s degrees awarded by postsecondary institutions within a region. It provides insight into the volume of higher education as an output and the region’s capacity to produce a college-educated workforce. Changes over time may reflect enrollment trends, institutional capacity, or demographic shifts. Users should expect gradual changes rather than sharp year-to-year swings.",
        source:
          "National Center for Education Statistics (NCES), Integrated Postsecondary Education Data System (IPEDS)",
        tableauUrl:
          "https://public.tableau.com/views/BachelorsDegree/TrendoverTime?:language=en-US&:sid=&:redirect=auth&:display_count=n&:origin=viz_share_link",
      },
      {
        id: "edu-3",
        title: "Number of Students Receiving Master’s Degrees",
        summary:
          "This measure captures the number of master’s degrees awarded within a region each year. It is often used as a signal of advanced workforce development and alignment with professional and technical labor demand. Growth or decline in master’s degree production may reflect changes in labor market needs, student demand, or institutional offerings. Users should interpret this indicator in the context of broader education and employment trends.",
        source:
          "National Center for Education Statistics (NCES), Integrated Postsecondary Education Data System (IPEDS)",
        tableauUrl:
          "https://public.tableau.com/views/MastersDegree/Sheet1?:language=en-US&:sid=&:redirect=auth&:display_count=n&:origin=viz_share_link",
      },
      {
        id: "edu-4",
        title: "Median Earnings by Educational Attainment (B20004)",
        summary:
          "This indicator reports median earnings for individuals based on their highest level of educational attainment. It helps illustrate the economic returns associated with different education levels and highlights earnings differences across groups. Higher levels of education are generally associated with higher median earnings, though the size of the earnings gap varies by region. Users should expect earnings levels to change gradually and to be influenced by regional industry mix and cost of living.",
        source: "U.S. Census Bureau, American Community Survey (ACS)",
        tableauUrl:
          "https://public.tableau.com/views/B20004_HigherEducation_Website/Sheet1?:language=en-US&:sid=&:redirect=auth&:display_count=n&:origin=viz_share_link",
      },
      {
        id: "edu-5",
        title:
          "Poverty Status by Educational Attainment – Bachelor’s Degree or Higher (S1701)",
        summary:
          "This indicator shows the share of adults with a bachelor’s degree or higher whose income falls below the poverty threshold. It provides insight into economic security among higher-educated residents and highlights that educational attainment alone does not eliminate poverty risk. While poverty rates are typically lower for this group compared to those with less education, regional variation can be substantial. Users should expect this indicator to reflect structural economic conditions rather than short-term changes.",
        source: "U.S. Census Bureau, American Community Survey (ACS)",
        tableauUrl:
          "https://public.tableau.com/views/PercentageofAdultsWithaBachelorsDegreeorHigherBelowthePovertyLevel/CompetitivePositionTrend?:language=en-US&:sid=&:redirect=auth&:display_count=n&:origin=viz_share_link",
      },
    ],
  },

  housing: {
    title: "Housing",
    overview:
      "This section highlights key trends over the past decade and compares Tampa Bay with peer regions to understand how outcomes are changing over time.",
    indicators: [
      {
        id: "hou-1",
        title: "Zillow Home Value Index",
        summary:
          "The Zillow Home Value Index tracks the typical home value for a region, reflecting changes in residential real estate prices over time. It is commonly used to assess housing market trends, affordability pressures, and wealth accumulation through homeownership. Rising home values can signal strong housing demand but may also indicate growing barriers to homeownership for prospective buyers. Users should expect this indicator to respond to market conditions and to vary across regions depending on supply, demand, and local economic factors.",
        source: "Zillow Research",
        tableauUrl:
          "https://public.tableau.com/views/Zillow_HomeValue/Trend?:language=en-US&:sid=&:redirect=auth&:display_count=n&:origin=viz_share_link",
      },
      {
        id: "hou-2",
        title: "Zillow Observed Rent Index",
        summary:
          "The Zillow Observed Rent Index measures typical rental prices for a region based on observed rental listings. This indicator helps users understand trends in rental housing costs and affordability for renters. Increases in rent levels can place added financial pressure on households, particularly those with lower or fixed incomes. Users should expect rent trends to change more rapidly than home values and to reflect local housing market dynamics.",
        source: "Zillow Research",
        tableauUrl:
          "https://public.tableau.com/views/Zillow_RentIndex/Trend?:language=en-US&:sid=&:redirect=auth&:display_count=n&:origin=viz_share_link",
      },
      {
        id: "hou-3",
        title: "Homeownership Rate (B25003)",
        summary:
          "The homeownership rate shows the share of occupied housing units that are owner-occupied rather than rented. It provides insight into housing stability, wealth-building opportunities, and long-term residential patterns. Homeownership rates vary widely by region and are influenced by housing costs, income levels, credit access, and demographic factors. Users should expect this indicator to change gradually over time rather than fluctuate year to year.",
        source: "U.S. Census Bureau, American Community Survey (ACS)",
        tableauUrl:
          "https://public.tableau.com/views/PercentageofUnitsOccupiedbyOwner/TrendoverTime?:language=en-US&:sid=&:redirect=auth&:display_count=n&:origin=viz_share_link",
      },
      {
        id: "hou-4",
        title: "Monthly Housing Costs (B25104)",
        summary:
          "This indicator reports monthly housing costs for households, including expenses such as rent, mortgage payments, utilities, and other housing-related costs. It helps users understand the financial burden of housing and how costs vary across regions. Higher monthly housing costs can reduce household financial flexibility and increase vulnerability to economic shocks. Users should expect this measure to reflect longer-term cost trends rather than short-term market shifts.",
        source: "U.S. Census Bureau, American Community Survey (ACS)",
        tableauUrl:
          "https://public.tableau.com/views/PercentageofHouseholdswithMonthlyHousingCostLessthan1500/PercentageofHouseholdswithMonthlyHousingCostsLessthan1500?:language=en-US&:sid=&:redirect=auth&:display_count=n&:origin=viz_share_link",
      },
      {
        id: "hou-5",
        title: "Ratio of Housing Costs to Income",
        summary:
          "The ratio of housing costs to income measures the share of household income devoted to housing expenses. It is widely used to assess housing affordability, with higher ratios indicating greater cost burden. Households spending a large portion of income on housing may face tradeoffs with other essential expenses such as healthcare, childcare, or transportation. Users should expect this indicator to highlight affordability differences across regions and income groups.",
        source: "U.S. Census Bureau, American Community Survey (ACS)",
        tableauUrl:
          "https://public.tableau.com/views/RatioofHousingCoststoIncome/Sheet1?:language=en-US&:sid=&:redirect=auth&:display_count=n&:origin=viz_share_link",
      },
    ],
  },

  health: {
    title: "Health",
    overview:
      "This section highlights key trends over the past decade and compares Tampa Bay with peer regions to understand how outcomes are changing over time.",
    indicators: [
      {
        id: "hea-1",
        title: "Premature Death",
        summary:
          "Premature death measures deaths occurring before a specified age threshold and is commonly used as an indicator of overall population health and preventable mortality. This measure captures the combined effects of health behaviors, access to care, environmental conditions, and socioeconomic factors. Higher rates of premature death often signal underlying health disparities or barriers to healthcare access. Users should expect this indicator to change gradually over time rather than fluctuate sharply year to year.",
        source:
          "Centers for Disease Control and Prevention (CDC), National Center for Health Statistics",
        tableauUrl:
          "https://public.tableau.com/views/PrematureDeath_17653009774010/TrendoverTime?:language=en-US&:sid=&:redirect=auth&:display_count=n&:origin=viz_share_link",
      },
      {
        id: "hea-2",
        title: "Uninsured Rate (Under 65)",
        summary:
          "The uninsured rate for individuals under age 65 measures the share of the population without health insurance coverage, excluding those typically eligible for Medicare. This indicator is widely used to assess access to healthcare and financial protection against medical costs. Higher uninsured rates may be associated with delayed care, unmet health needs, and greater financial risk. Users should expect variation across regions based on employment patterns, income levels, and state policy environments.",
        source: "U.S. Census Bureau, American Community Survey (ACS)",
        tableauUrl:
          "https://public.tableau.com/views/PercentageofUninsuredAdultsAge65/TrendoverTime?:language=en-US&:sid=&:redirect=auth&:display_count=n&:origin=viz_share_link",
      },
      {
        id: "hea-3",
        title: "HRSA Financial Assistance",
        summary:
          "This indicator reflects the distribution of federal health-related financial assistance provided through HRSA programs. It offers insight into the level of support directed toward healthcare access, workforce development, and services for underserved populations. Higher levels of assistance may indicate greater healthcare needs or targeted investment in community health infrastructure. Users should interpret this measure as a signal of health system support rather than a direct outcome measure.",
        source: "Health Resources and Services Administration (HRSA)",
        tableauUrl:
          "https://public.tableau.com/views/HRSA_17652870184860/HRSAGrant?:language=en-US&:sid=&:redirect=auth&:display_count=n&:origin=viz_share_link",
      },
      {
        id: "hea-4",
        title: "Deaths / Injury Due to Road Accidents",
        summary:
          "This indicator tracks fatalities and injuries resulting from road accidents and is commonly used as a measure of public safety and transportation risk. It reflects factors such as roadway conditions, traffic volume, driver behavior, and emergency response capacity. Higher rates may indicate safety challenges affecting daily mobility and quality of life. Users should expect this indicator to vary across regions and to change slowly over time.",
        source: "National Highway Traffic Safety Administration (NHTSA) / CDC",
        tableauUrl:
          "https://public.tableau.com/views/accidentsWebsite/Sheet2?:language=en-US&:sid=&:redirect=auth&:display_count=n&:origin=viz_share_link",
      },
      {
        id: "hea-5",
        title: "Public Assistance Income / SNAP",
        summary:
          "This indicator measures the share of households receiving public assistance income, including Supplemental Nutrition Assistance Program (SNAP) benefits. It provides insight into economic hardship and reliance on safety net programs. Higher participation rates may reflect lower household incomes, higher living costs, or limited access to employment opportunities. Users should expect this indicator to be sensitive to broader economic conditions and policy changes.",
        source: "U.S. Census Bureau, American Community Survey (ACS)",
        tableauUrl:
          "https://public.tableau.com/views/PercentageofHouseholdsReceivingPublicAssistanceIncome/PercentageofHouseholdswithPublicAssistanceIncome?:language=en-US&:sid=&:redirect=auth&:display_count=n&:origin=viz_share_link",
      },
    ],
  },

  demographics: {
    title: "Demographics",
    overview:
      "This section highlights key trends over the past decade and compares Tampa Bay with peer regions to understand how outcomes are changing over time.",
    indicators: [
      {
        id: "dem-1",
        title: "Civic Engagement (Voting)",
        summary:
          "This indicator measures voter participation among the eligible population and is commonly used as a proxy for civic engagement. Higher voter participation may signal stronger civic connection and community involvement, while lower participation may reflect barriers to access, disengagement, or demographic differences. Voting rates vary widely across regions and demographic groups. Users should expect this indicator to change primarily during election cycles rather than year to year.",
        source:
          "U.S. Census Bureau, Current Population Survey (CPS) Voting and Registration Supplement",
        tableauUrl:
          "https://public.tableau.com/views/VotingWebsite/Sheet1?:language=en-US&:sid=&:redirect=auth&:display_count=n&:origin=viz_share_link",
      },
      {
        id: "dem-2",
        title: "Geographical Mobility by Poverty/Income (ACS B07012)",
        summary:
          "This indicator shows how residential mobility differs by poverty status and income level, capturing whether households moved within the past year. Higher mobility among lower-income households can indicate housing instability, while lower mobility among higher-income households often reflects greater residential stability. This measure helps users understand patterns of stability and displacement within a region. Users should expect gradual changes rather than sharp short-term shifts.",
        source: "U.S. Census Bureau, American Community Survey (ACS)",
        tableauUrl:
          "https://public.tableau.com/views/GeographicalMobilitybyPoverty/Sheet1?:language=en-US&:sid=&:redirect=auth&:display_count=n&:origin=viz_share_link",
      },
      {
        id: "dem-3",
        title: "Migration by Income Level (High-Income Migration to an MSA)",
        summary:
          "This indicator tracks net migration flows by income level, focusing on the movement of higher-income households into or out of a metropolitan area. It is commonly used to assess regional attractiveness, economic opportunity, and tax base dynamics. Net in-migration of higher-income households may reflect job growth, quality-of-life factors, or housing market conditions. Users should interpret this measure in the context of broader economic and housing trends.",
        source: "Internal Revenue Service (IRS), Statistics of Income (SOI) Migration Data",
        tableauUrl:
          "https://public.tableau.com/views/B07010_High_Income_migrants/High-IncomeMigrantsTrend?:language=en-US&:sid=&:redirect=auth&:display_count=n&:origin=viz_share_link",
      },
      {
        id: "dem-4",
        title: "Poverty by Age Groups (Children / Older Adults)",
        summary:
          "This indicator measures poverty rates for children and older adults, highlighting economic vulnerability at different life stages. Child poverty is often linked to household income, employment stability, and access to support services, while poverty among older adults is closely tied to fixed incomes and retirement resources. Comparing age groups helps users identify where economic risk is most concentrated. Users should expect these rates to change gradually over time.",
        source: "U.S. Census Bureau, American Community Survey (ACS)",
        tableauUrls: [
          "https://public.tableau.com/views/PovertyStatusAmongChildrenAges017/Sheet1?:language=en-US&:sid=&:redirect=auth&:display_count=n&:origin=viz_share_link",
          "https://public.tableau.com/views/PovertyRateAmongOlderAdults/Sheet4?:language=en-US&:sid=&:redirect=auth&:display_count=n&:origin=viz_share_link",
        ],
      },
      {
        id: "dem-5",
        title: "Taxpaying Population",
        summary:
          "This indicator reflects the number of tax filers within a region and serves as a proxy for the size of the taxpaying population. It provides insight into population scale, workforce participation, and the breadth of the local tax base. Changes in the number of filers may reflect migration, employment trends, or demographic shifts. Users should expect this measure to be relatively stable, with changes occurring gradually over time.",
        source: "Internal Revenue Service (IRS), Statistics of Income (SOI)",
        tableauUrl:
          "https://public.tableau.com/views/TaxpayersWebsite/Sheet1?:language=en-US&:sid=&:redirect=auth&:display_count=n&:origin=viz_share_link",
      },
    ],
  },

  // NOTE: These categories were not included in the provided “Indicator Overview” doc,
  // so their existing summaries/sources are kept as-is to avoid introducing assumptions.
  income: {
    title: "Income",
    overview:
      "Income trends shape economic opportunity across the Tampa Bay region. These indicators track inequality, earnings, and cost pressures over the past decade, and compare Tampa Bay with peer metros.",
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
      },
      {
        id: "inc-4",
        title: "Households Receiving Social Security Income (Past 12 Months)",
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
        title: "Population Below 200% of the Poverty Level (Past 12 Months)",
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

function CategoryReport({ topic }) {
  const config = CATEGORY_CONFIG[topic];
  const [showAll, setShowAll] = useState(false);

  const indicators = config?.indicators || [];
  const visibleIndicators = showAll ? indicators : indicators.slice(0, 2);

  return (
    <>
      <div className="report-top">
        <h1 className="report-title-plain">{config.title}</h1>
        <p className="report-subtitle-plain">{DEFAULT_SUBTITLE}</p>
      </div>

      <div className="overview-plain">
        <p className="overview-text">{config.overview}</p>
      </div>

      <div className="indicator-section">
        <div className="indicator-grid">
          {visibleIndicators.map((ind) => {
            // Support both tableauUrls and tableauUrl array (your current config uses both styles)
            const urls = Array.isArray(ind.tableauUrls)
              ? ind.tableauUrls
              : Array.isArray(ind.tableauUrl)
              ? ind.tableauUrl
              : ind.tableauUrl
              ? [ind.tableauUrl]
              : [];

            const firstUrl = urls[0] || "";

            return (
              <section key={ind.id} className="indicator-panel">
                <header className="indicator-header">
                  <h3 className="indicator-title">{ind.title}</h3>
                  {ind.summary && (
                    <p className="indicator-subtitle">{ind.summary}</p>
                  )}
                </header>

                <div className="indicator-chart-frame">
                  <div className="indicator-chart">
                    {urls.length > 1 ? (
                      <div style={{ display: "grid", gap: 16 }}>
                        {urls.map((u, idx) => (
                          <TableauViz
                            key={`${ind.id}-${idx}`}
                            url={u}
                            height={520}
                            toolbar={false}
                            tabs={false}
                          />
                        ))}
                      </div>
                    ) : urls.length === 1 ? (
                      <TableauViz
                        url={urls[0]}
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
                </div>

                <div className="indicator-meta">
                  <p className="indicator-label">
                    <span className="indicator-label-tag">Source</span>
                    {ind.source}
                  </p>

                  <p className="indicator-label">
                    <span className="indicator-label-tag">Date range</span>
                    {STANDARD_DATE_RANGE}
                  </p>

                  {firstUrl && (
                    <a
                      className="indicator-action"
                      href={firstUrl}
                      target="_blank"
                      rel="noreferrer"
                      title="Open visualization in Tableau"
                    >
                      Open in Tableau ↗
                    </a>
                  )}
                </div>
              </section>
            );
          })}
        </div>

        {indicators.length > 2 && (
          <div className="show-more-wrap">
            <button
              className="show-more-btn"
              type="button"
              onClick={() => setShowAll((v) => !v)}
            >
              {showAll ? "Show fewer indicators" : "Show more indicators"}
            </button>
          </div>
        )}
      </div>
    </>
  );
}

export default function Reports() {
  const { topic: topicParam } = useParams();
  const topic = useMemo(() => (topicParam || "").toLowerCase(), [topicParam]);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // ✅ Default behavior you want:
  // Visiting /reports should open Income report (no landing grid)
  if (!topicParam) return <Navigate to="/reports/income" replace />;
  if (!CATEGORY_CONFIG[topic]) return <Navigate to="/reports/income" replace />;

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
              <div className="sidebar-section-title highlight">
                Explore Topics
              </div>

              {[...TOPICS]
                .sort((a, b) => a.label.localeCompare(b.label))
                .map((t) => (
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
          <div className="reports-content-inner">
            <CategoryReport topic={topic} />
          </div>
        </main>
      </div>
    </div>
  );
}
