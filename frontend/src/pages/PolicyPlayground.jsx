import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { toPng } from "html-to-image";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import "./PolicyPlayground.css";

/**
 * Backend base URL (FastAPI)
 * If you change backend port, update it here.
 */
const API_BASE_URL =
  process.env.REACT_APP_API_BASE_URL || "http://localhost:8002";

/**
 * Current year range available in your DB for this indicator.
 */
const MIN_YEAR = 2013;
const MAX_YEAR = 2024;

/**
 * Categories + indicators (start with B25070 in Income).
 * As we add more indicators, just extend indicators[category].
 */
const categories = [
  { value: "income", label: "Income" },
  { value: "employment", label: "Employment" },
  { value: "housing", label: "Housing" },
  { value: "demographics", label: "Demographics" },
  { value: "education", label: "Education" },
  { value: "poverty", label: "Poverty" },
  //{ value: "transportation", label: "Transportation" },
];

const indicators = {
  income: [
    {
      value: "B25070",
      label: "Gross Rent as a Percentage of Household Income",
    },
    { value: "B19083", label: "Gini Index of Income Inequality" },
    {
      value: "B19113",
      label: "Median Family Income (2024 inflation-adjusted dollars)",
    },
  ],
  employment: [
    { value: "B08006", label: "Public Transportation to Work" },
    { value: "B23025", label: "Unemployment Rate" },
    {
      value: "B23006",
      label: "Employed Adults with a Bachelor’s Degree or Higher",
    },
  ],
  housing: [
    { value: "B25002", label: "Occupancy Status (Occupancy Rate)" },
    { value: "B11016", label: "Household type: Family share" },
    { value: "B25077", label: "Median Home Value (Dollars)" },
  ],
  demographics: [
    { value: "B07201", label: "Residential Mobility Rate" },
    { value: "B07402", label: "Median Age of Interstate Movers" },
    { value: "B07007", label: "Residents Born Outside the U.S. (%)" },
  ],
  education: [
    { value: "B15003", label: "Educational attainment: Bachelor’s or Higher" },
    { value: "B15012", label: "STEM bachelor’s degrees" },
    { value: "B07009", label: "Share of Movers with Bachelor’s or Higher" },
  ],
  poverty: [
    { value: "B07012", label: "Mobility Rate for People Below Poverty Level" },
    {
      value: "B17002",
      label: "Income to Poverty Ratio Below 100% of Poverty",
    },
    {
      value: "B17009",
      label:
        "Poverty Status by Work Experience of Unrelated Individuals by Householder Status",
    },
  ],
  transportation: [],
};

const geoLevels = [
  { value: "msa", label: "Metropolitan Statistical Area (MSA)" },
  { value: "county", label: "County" },
  { value: "state", label: "State" },
];

// Remove trailing " (#####)" FIPS from display labels in tooltip/legend
const formatCountyLabel = (label) => {
  if (!label) return label;
  return String(label).replace(/\s*\(\d+\)\s*$/, "");
};

const formatNumber = (n, decimals = 1) => {
  const x = Number(n);
  if (!Number.isFinite(x)) return "NA";
  return x.toFixed(decimals);
};

// Indicator-specific metadata for insights + formatting
const INDICATOR_META = {
  B25070: {
    metricLabel: "Rent burdened households",
    unitLabel: "%",
    valueDecimals: 1,
    deltaStyle: "pp", // percentage points
    yAxisTick: (v) =>
      Number.isFinite(Number(v)) ? `${Number(v).toFixed(0)}%` : v,
    tooltipValue: (v) =>
      Number.isFinite(Number(v)) ? `${Number(v).toFixed(1)}%` : "NA",
  },

  B19083: {
    metricLabel: "Gini index (income inequality)",
    unitLabel: "index",
    valueDecimals: 3,
    deltaStyle: "raw",
    yAxisTick: (v) => (Number.isFinite(Number(v)) ? Number(v).toFixed(2) : v),
    tooltipValue: (v) =>
      Number.isFinite(Number(v)) ? Number(v).toFixed(3) : "NA",
  },

  B19113: {
    metricLabel: "Median family income",
    unitLabel: "$",
    valueDecimals: 0,
    deltaStyle: "raw",
    yAxisTick: (v) =>
      Number.isFinite(Number(v))
        ? new Intl.NumberFormat("en-US", { notation: "compact" }).format(
            Number(v)
          )
        : v,
    tooltipValue: (v) =>
      Number.isFinite(Number(v))
        ? new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: "USD",
            maximumFractionDigits: 0,
          }).format(Number(v))
        : "NA",
  },

  B25002: {
    metricLabel: "Occupancy rate",
    unitLabel: "%",
    valueDecimals: 1,
    deltaStyle: "pp", // percentage points
    yAxisTick: (v) =>
      Number.isFinite(Number(v)) ? `${Number(v).toFixed(0)}%` : v,
    tooltipValue: (v) =>
      Number.isFinite(Number(v)) ? `${Number(v).toFixed(1)}%` : "NA",
  },

  B11016: {
    metricLabel: "Family households",
    unitLabel: "%",
    valueDecimals: 1,
    deltaStyle: "pp",
    yAxisTick: (v) =>
      Number.isFinite(Number(v)) ? `${Number(v).toFixed(0)}%` : v,
    tooltipValue: (v) =>
      Number.isFinite(Number(v)) ? `${Number(v).toFixed(1)}%` : "NA",
  },

  B25077: {
    metricLabel: "Median home value",
    unitLabel: "$",
    valueDecimals: 0,
    deltaStyle: "raw",
    yAxisTick: (v) =>
      Number.isFinite(Number(v))
        ? new Intl.NumberFormat("en-US", { notation: "compact" }).format(
            Number(v)
          )
        : v,
    tooltipValue: (v) =>
      Number.isFinite(Number(v))
        ? new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: "USD",
            maximumFractionDigits: 0,
          }).format(Number(v))
        : "NA",
  },

  B15003: {
    metricLabel: "Bachelor’s degree or higher",
    unitLabel: "%",
    valueDecimals: 1,
    deltaStyle: "pp",
    yAxisTick: (v) =>
      Number.isFinite(Number(v)) ? `${Number(v).toFixed(0)}%` : v,
    tooltipValue: (v) =>
      Number.isFinite(Number(v)) ? `${Number(v).toFixed(1)}%` : "NA",
  },

  B15012: {
    metricLabel: "STEM bachelor’s degrees",
    unitLabel: "%",
    valueDecimals: 1,
    deltaStyle: "pp",
    yAxisTick: (v) =>
      Number.isFinite(Number(v)) ? `${Number(v).toFixed(0)}%` : v,
    tooltipValue: (v) =>
      Number.isFinite(Number(v)) ? `${Number(v).toFixed(1)}%` : "NA",
  },

  B08006: {
    metricLabel: "Public transportation to work",
    unitLabel: "%",
    valueDecimals: 1,
    deltaStyle: "pp",
    yAxisTick: (v) =>
      Number.isFinite(Number(v)) ? `${Number(v).toFixed(0)}%` : v,
    tooltipValue: (v) =>
      Number.isFinite(Number(v)) ? `${Number(v).toFixed(1)}%` : "NA",
  },

  B23025: {
    metricLabel: "Unemployment rate",
    unitLabel: "%",
    valueDecimals: 1,
    deltaStyle: "pp",
    yAxisTick: (v) =>
      Number.isFinite(Number(v)) ? `${Number(v).toFixed(0)}%` : v,
    tooltipValue: (v) =>
      Number.isFinite(Number(v)) ? `${Number(v).toFixed(1)}%` : "NA",
  },

  B23006: {
    metricLabel: "Employed adults with a bachelor’s degree or higher",
    unitLabel: "%",
    valueDecimals: 1,
    deltaStyle: "pp",
    yAxisTick: (v) =>
      Number.isFinite(Number(v)) ? `${Number(v).toFixed(0)}%` : v,
    tooltipValue: (v) =>
      Number.isFinite(Number(v)) ? `${Number(v).toFixed(1)}%` : "NA",
  },

  B07012: {
    metricLabel: "Mobility rate for people below poverty",
    unitLabel: "%",
    valueDecimals: 1,
    deltaStyle: "pp", // percentage points
    yAxisTick: (v) =>
      Number.isFinite(Number(v)) ? `${Number(v).toFixed(0)}%` : v,
    tooltipValue: (v) =>
      Number.isFinite(Number(v)) ? `${Number(v).toFixed(1)}%` : "NA",
  },

  B17002: {
    metricLabel: "Population below 100% of poverty level",
    unitLabel: "%",
    valueDecimals: 1,
    deltaStyle: "pp",
    yAxisTick: (v) =>
      Number.isFinite(Number(v)) ? `${Number(v).toFixed(0)}%` : v,
    tooltipValue: (v) =>
      Number.isFinite(Number(v)) ? `${Number(v).toFixed(1)}%` : "NA",
  },

  B17009: {
    metricLabel:
      "Below-poverty unrelated individuals who worked full-time, year-round",
    unitLabel: "%",
    valueDecimals: 1,
    deltaStyle: "pp",
    yAxisTick: (v) =>
      Number.isFinite(Number(v)) ? `${Number(v).toFixed(0)}%` : v,
    tooltipValue: (v) =>
      Number.isFinite(Number(v)) ? `${Number(v).toFixed(1)}%` : "NA",
  },

  B07201: {
    metricLabel: "Residential mobility rate",
    unitLabel: "%",
    valueDecimals: 1,
    deltaStyle: "pp", // percentage points
    yAxisTick: (v) =>
      Number.isFinite(Number(v)) ? `${Number(v).toFixed(0)}%` : v,
    tooltipValue: (v) =>
      Number.isFinite(Number(v)) ? `${Number(v).toFixed(1)}%` : "NA",
  },

  B07402: {
    metricLabel: "Median age of interstate movers",
    unitLabel: "years",
    valueDecimals: 1,
    deltaStyle: "raw",
    yAxisTick: (v) => (Number.isFinite(Number(v)) ? Number(v).toFixed(0) : v),
    tooltipValue: (v) =>
      Number.isFinite(Number(v)) ? Number(v).toFixed(1) : "NA",
  },

  B07007: {
    metricLabel: "Share of residents born outside the U.S.",
    unitLabel: "%",
    valueDecimals: 1,
    deltaStyle: "pp", // percentage points
    yAxisTick: (v) =>
      Number.isFinite(Number(v)) ? `${Number(v).toFixed(0)}%` : v,
    tooltipValue: (v) =>
      Number.isFinite(Number(v)) ? `${Number(v).toFixed(1)}%` : "NA",
  },

  B07009: {
    metricLabel: "Share of movers with bachelor’s or higher",
    unitLabel: "%",
    valueDecimals: 1,
    deltaStyle: "pp",
    yAxisTick: (v) =>
      Number.isFinite(Number(v)) ? `${Number(v).toFixed(0)}%` : v,
    tooltipValue: (v) =>
      Number.isFinite(Number(v)) ? `${Number(v).toFixed(1)}%` : "NA",
  },
};

const PolicyPlayground = () => {
  // Draft selections (left panel)
  const [category, setCategory] = useState("income");
  const [indicator, setIndicator] = useState("B25070");
  const [geoLevel, setGeoLevel] = useState("county"); // counties only
  const [countySearch, setCountySearch] = useState("");
  const [countyResults, setCountyResults] = useState([]);
  const [selectedCounties, setSelectedCounties] = useState([]); // draft selected counties
  const [regionMessage, setRegionMessage] = useState("");
  const [chartType, setChartType] = useState("line");
  const [dateRange, setDateRange] = useState({
    start: String(MIN_YEAR),
    end: String(MAX_YEAR),
  });

  // Applied (saved) config for the chart (source of truth)
  const [appliedConfig, setAppliedConfig] = useState(null);

  // Chart data from API (represents appliedConfig)
  const [chartData, setChartData] = useState([]);
  const [rawSeries, setRawSeries] = useState([]); // raw series for insights (applied)
  const [loadingChart, setLoadingChart] = useState(false);
  const [chartError, setChartError] = useState("");

  // Abort/cancel in-flight indicator fetches and control initial reset behavior
  const activeRequestRef = useRef(null);
  const isFirstRenderRef = useRef(true);

  const isRestoringRef = useRef(false);
  const chartExportRef = useRef(null);

  // Draft indicator list for dropdown
  const currentIndicators = indicators[category] || [];

  // When category changes, auto-pick first indicator in that category (draft)
  useEffect(() => {
    const list = indicators[category] || [];
    setIndicator(list.length ? list[0].value : "");
  }, [category]);

  // Lock geoLevel to county for now
  useEffect(() => {
    setGeoLevel("county");
  }, []);

  // County search -> backend call (debounced)
  useEffect(() => {
    const q = countySearch.trim();
    if (q.length === 0) {
      setCountyResults([]);
      return;
    }

    const t = setTimeout(async () => {
      try {
        const res = await fetch(
          `${API_BASE_URL}/api/available-counties?indicator=${encodeURIComponent(
            indicator
          )}&search=${encodeURIComponent(q)}`
        );
        if (!res.ok) throw new Error("Failed to fetch counties");
        const data = await res.json();
        setCountyResults(Array.isArray(data) ? data : []);
      } catch (e) {
        console.error(e);
        setCountyResults([]);
      }
    }, 400);

    return () => clearTimeout(t);
  }, [countySearch, indicator]);

  const addCounty = (county) => {
    setRegionMessage("");

    const already = selectedCounties.some(
      (c) => c.county_fips === county.county_fips
    );
    if (already) return;

    if (selectedCounties.length >= 3) {
      setRegionMessage("You can compare up to three counties at once.");
      return;
    }

    setSelectedCounties([...selectedCounties, county]);
    setCountySearch("");
    setCountyResults([]);
  };

  const removeCounty = (fips) => {
    setRegionMessage("");
    setSelectedCounties((prev) => prev.filter((c) => c.county_fips !== fips));
  };

  const clampYear = (y) => {
    const n = Number(y);
    if (!Number.isFinite(n)) return null;
    return Math.min(MAX_YEAR, Math.max(MIN_YEAR, n));
  };

  const handleDateChange = (key, value) => {
    setDateRange((prev) => {
      const nextRaw = { ...prev, [key]: value };
      const start = clampYear(nextRaw.start);
      const end = clampYear(nextRaw.end);

      // If user is still typing, allow it temporarily (avoid fighting input)
      if (nextRaw.start === "" || nextRaw.end === "") return nextRaw;

      if (start === null || end === null) return prev;

      // Keep it valid
      if (start > end) return prev;

      return { start: String(start), end: String(end) };
    });
  };

  // Build wide chart data for Recharts:
  const buildWideChartData = (series) => {
    const byYear = new Map();

    for (const row of series) {
      const year = Number(row.year);
      if (!byYear.has(year)) byYear.set(year, { year });

      const key = `${row.county_name}, ${row.state_name} (${row.county_fips})`;
      byYear.get(year)[key] = row.value;
    }

    return Array.from(byYear.values()).sort((a, b) => a.year - b.year);
  };

  // Apply draft selections to chart (auto-apply target)
  const applyDraftConfig = useCallback(async () => {
    setChartError("");

    if (geoLevel !== "county") {
      setChartError("For now, Policy Playground is enabled only for counties.");
      return;
    }

    if (!indicator) {
      setChartError("Please select an indicator.");
      return;
    }

    // If no counties selected, clear chart and wait
    if (selectedCounties.length === 0) {
      setAppliedConfig(null);
      setChartData([]);
      setRawSeries([]);
      return;
    }

    const startYear = clampYear(dateRange.start);
    const endYear = clampYear(dateRange.end);

    // If user is mid-typing, don't apply yet
    if (dateRange.start === "" || dateRange.end === "") return;
    if (startYear === null || endYear === null) return;
    if (startYear > endYear) return;

    const snapshot = {
      category,
      indicator,
      chartType,
      dateRange: { ...dateRange },
      selectedCounties: [...selectedCounties],
    };
    setAppliedConfig(snapshot);

    const fipsList = snapshot.selectedCounties
      .map((c) => c.county_fips)
      .join(",");

    // Abort previous request (prevents stale updates)
    if (activeRequestRef.current) {
      activeRequestRef.current.abort();
    }
    const controller = new AbortController();
    activeRequestRef.current = controller;

    setLoadingChart(true);

    try {
      const url = `${API_BASE_URL}/api/indicator/${
        snapshot.indicator
      }?counties=${encodeURIComponent(
        fipsList
      )}&start_year=${startYear}&end_year=${endYear}`;

      const res = await fetch(url, { signal: controller.signal });
      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || "Failed to fetch indicator data");
      }

      const payload = await res.json();
      const series = payload?.series || [];
      const wide = buildWideChartData(series);

      setRawSeries(series);
      setChartData(wide);

      if (!wide.length) {
        setChartError("No data returned for the selected counties and years.");
      }
    } catch (e) {
      if (e?.name === "AbortError") return;

      console.error(e);
      setChartError("Could not load data. Check backend is running.");
      setChartData([]);
      setRawSeries([]);
      setAppliedConfig(null);
    } finally {
      setLoadingChart(false);
    }
  }, [geoLevel, indicator, selectedCounties, dateRange, category, chartType]);

  // When indicator changes (including via category change), reset everything to defaults
  useEffect(() => {
    if (isFirstRenderRef.current) {
      isFirstRenderRef.current = false;
      return;
    }

    if (isRestoringRef.current) return;

    if (activeRequestRef.current) {
      activeRequestRef.current.abort();
      activeRequestRef.current = null;
    }

    setSelectedCounties([]);
    setCountySearch("");
    setCountyResults([]);
    setRegionMessage("");
    setChartType("line");
    setDateRange({ start: String(MIN_YEAR), end: String(MAX_YEAR) });

    setAppliedConfig(null);
    setChartData([]);
    setRawSeries([]);
    setChartError("");
    setLoadingChart(false);
  }, [indicator]);

  // Auto-apply for chart type changes and county add/remove
  useEffect(() => {
    if (isRestoringRef.current) return;
    applyDraftConfig();
  }, [chartType, selectedCounties, applyDraftConfig]);

  // Auto-apply for year changes (debounced)
  useEffect(() => {
    if (isRestoringRef.current) return;

    const t = setTimeout(() => {
      applyDraftConfig();
    }, 700);
    return () => clearTimeout(t);
  }, [dateRange, applyDraftConfig]);

  // Keep Save button as a manual fallback
  const handleSave = async () => {
    await applyDraftConfig();
  };

  const findCategoryForIndicator = (indicatorId) => {
    for (const [cat, list] of Object.entries(indicators)) {
      if ((list || []).some((x) => x.value === indicatorId)) return cat;
    }
    return "income";
  };

  const handleExport = async () => {
    if (!showChart) return;
    const node = chartExportRef.current;
    if (!node) return;

    try {
      const dataUrl = await toPng(node, {
        cacheBust: true,
        pixelRatio: 2,
      });

      const cfg = appliedConfig || {
        indicator,
        dateRange,
        chartType,
        selectedCounties,
      };

      const ind = cfg.indicator || "indicator";
      const start = cfg.dateRange?.start || MIN_YEAR;
      const end = cfg.dateRange?.end || MAX_YEAR;
      const fips = (cfg.selectedCounties || [])
        .map((c) => c.county_fips)
        .join("-");
      const filename = `policy_playground_${ind}_${fips}_${start}-${end}.png`;

      const link = document.createElement("a");
      link.href = dataUrl;
      link.download = filename;
      link.click();
    } catch (e) {
      console.error(e);
      window.alert("Could not export the chart. Please try again.");
    }
  };

  const handleShare = async () => {
    const cfg = appliedConfig || {
      category,
      indicator,
      chartType,
      dateRange,
      selectedCounties,
    };

    const cat = cfg.category || findCategoryForIndicator(cfg.indicator);
    const ind = cfg.indicator || "";
    const type = cfg.chartType || "line";
    const start = cfg.dateRange?.start || String(MIN_YEAR);
    const end = cfg.dateRange?.end || String(MAX_YEAR);
    const counties = (cfg.selectedCounties || [])
      .map((c) => c.county_fips)
      .join(",");

    if (!ind || !counties) {
      window.alert("Select counties to generate a share link.");
      return;
    }

    const url = new URL(window.location.href);
    url.searchParams.set("category", cat);
    url.searchParams.set("indicator", ind);
    url.searchParams.set("type", type);
    url.searchParams.set("start", String(start));
    url.searchParams.set("end", String(end));
    url.searchParams.set("counties", counties);

    try {
      await navigator.clipboard.writeText(url.toString());
      window.alert("Shareable link copied.");
    } catch (e) {
      console.error(e);
      window.prompt("Copy this link:", url.toString());
    }
  };

  // Restore from share URL on initial load
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);

    const cat = params.get("category");
    const ind = params.get("indicator");
    const type = params.get("type");
    const start = params.get("start");
    const end = params.get("end");
    const counties = params.get("counties");

    if (!ind || !counties) return;

    const startYear = clampYear(start);
    const endYear = clampYear(end);
    const fipsList = counties
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean)
      .slice(0, 3);

    if (!fipsList.length) return;
    if (startYear === null || endYear === null || startYear > endYear) return;

    const restore = async () => {
      isRestoringRef.current = true;
      setChartError("");

      if (cat) setCategory(cat);
      setIndicator(ind);
      if (type === "bar" || type === "line") setChartType(type);
      setDateRange({ start: String(startYear), end: String(endYear) });

      if (activeRequestRef.current) {
        activeRequestRef.current.abort();
        activeRequestRef.current = null;
      }

      const controller = new AbortController();
      activeRequestRef.current = controller;

      setLoadingChart(true);

      try {
        const url = `${API_BASE_URL}/api/indicator/${ind}?counties=${encodeURIComponent(
          fipsList.join(",")
        )}&start_year=${startYear}&end_year=${endYear}`;

        const res = await fetch(url, { signal: controller.signal });
        if (!res.ok) {
          const text = await res.text();
          throw new Error(text || "Failed to fetch indicator data");
        }

        const payload = await res.json();
        const series = payload?.series || [];
        const wide = buildWideChartData(series);

        const byFips = new Map();
        for (const row of series) {
          if (!row?.county_fips) continue;
          if (!byFips.has(row.county_fips)) {
            byFips.set(row.county_fips, {
              county_fips: row.county_fips,
              county_name: row.county_name,
              state_name: row.state_name,
            });
          }
        }

        const restoredCounties = fipsList
          .map((f) => byFips.get(f))
          .filter(Boolean);

        setSelectedCounties(restoredCounties);
        setRawSeries(series);
        setChartData(wide);

        const snapshot = {
          category: cat || findCategoryForIndicator(ind),
          indicator: ind,
          chartType: type === "bar" ? "bar" : "line",
          dateRange: { start: String(startYear), end: String(endYear) },
          selectedCounties: restoredCounties,
        };
        setAppliedConfig(snapshot);

        if (!wide.length) {
          setChartError("No data returned for the selected counties and years.");
        }
      } catch (e) {
        if (e?.name === "AbortError") return;

        console.error(e);
        setChartError("Could not load shared chart. Check backend is running.");
        setAppliedConfig(null);
        setChartData([]);
        setRawSeries([]);
        setSelectedCounties([]);
      } finally {
        setLoadingChart(false);
        isRestoringRef.current = false;
      }
    };

    restore();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // --- Applied config helpers (used by chart area) ---
  const appliedCategory = appliedConfig?.category || category;
  const appliedIndicator = appliedConfig?.indicator || "";
  const appliedChartType = appliedConfig?.chartType || "line";
  const appliedDateRange = useMemo(
    () =>
      appliedConfig?.dateRange || {
        start: String(MIN_YEAR),
        end: String(MAX_YEAR),
      },
    [appliedConfig]
  );
  const appliedCounties = useMemo(
    () => appliedConfig?.selectedCounties || [],
    [appliedConfig]
  );

  const appliedIndicatorsList = indicators[appliedCategory] || [];
  const appliedIndicatorLabel =
    appliedIndicatorsList.find((i) => i.value === appliedIndicator)?.label ||
    "Indicator";

  const appliedMeta = INDICATOR_META[appliedIndicator] || INDICATOR_META.B25070;

  // Selected series keys for chart (based on applied counties)
  const appliedSeriesKeys = useMemo(() => {
    return (appliedCounties || []).map(
      (c) => `${c.county_name}, ${c.state_name} (${c.county_fips})`
    );
  }, [appliedCounties]);

  // Filter chart display strictly to applied date range (not draft)
  const displayChartData = useMemo(() => {
    const start = clampYear(appliedDateRange.start);
    const end = clampYear(appliedDateRange.end);
    if (!chartData.length || start === null || end === null) return [];
    return chartData.filter((d) => d.year >= start && d.year <= end);
  }, [chartData, appliedDateRange]);

  const showChart = Boolean(appliedConfig) && displayChartData.length > 0;

  // Build per-county series from rawSeries, filtered to applied years
  const perCountySeries = useMemo(() => {
    const start = clampYear(appliedDateRange.start);
    const end = clampYear(appliedDateRange.end);
    if (!rawSeries.length || start === null || end === null) return new Map();

    const m = new Map(); // key -> [{year, value}]
    for (const row of rawSeries) {
      const year = Number(row.year);
      if (!Number.isFinite(year) || year < start || year > end) continue;

      const key = `${row.county_name}, ${row.state_name} (${row.county_fips})`;
      const v = row.value;
      if (v === null || v === undefined || Number.isNaN(Number(v))) continue;

      if (!m.has(key)) m.set(key, []);
      m.get(key).push({ year, value: Number(v) });
    }

    for (const [k, arr] of m.entries()) {
      arr.sort((a, b) => a.year - b.year);
      m.set(k, arr);
    }

    return m;
  }, [rawSeries, appliedDateRange]);

  const formatValueForIndicator = useCallback(
    (v) => {
      if (!Number.isFinite(Number(v))) return "NA";
      const decimals = appliedMeta?.valueDecimals ?? 1;
      const num = Number(v);

      if (appliedMeta?.unitLabel === "%")
        return `${formatNumber(num, decimals)}%`;
      if (appliedMeta?.unitLabel === "$") {
        return new Intl.NumberFormat("en-US", {
          style: "currency",
          currency: "USD",
          maximumFractionDigits: 0,
        }).format(num);
      }
      if (appliedMeta?.unitLabel === "index") return formatNumber(num, decimals);
      return formatNumber(num, decimals);
    },
    [appliedMeta]
  );

  const formatDelta = useCallback(
    (delta) => {
      if (!Number.isFinite(Number(delta))) return "NA";
      const d = Number(delta);
      const sign = d > 0 ? "+" : "";
      if (appliedMeta?.deltaStyle === "pp") {
        return `${sign}${formatNumber(d, 1)} percentage points`;
      }
      const decimals = appliedMeta?.valueDecimals ?? 1;
      return `${sign}${formatNumber(d, decimals)}`;
    },
    [appliedMeta]
  );

  const buildCombinedInsights = () => {
    if (!showChart) return [];

    const start = clampYear(appliedDateRange.start);
    const end = clampYear(appliedDateRange.end);
    if (start === null || end === null) return [];
    if (!perCountySeries.size) return [];

    const metricLabel = appliedMeta?.metricLabel || "Metric";

    const insights = [];
    const latestYear = end;

    // 1) Cross-county comparison at latest year
    const latestValues = [];
    for (const [key, arr] of perCountySeries.entries()) {
      const lastPoint =
        arr.find((p) => p.year === latestYear) || arr[arr.length - 1];
      if (!lastPoint) continue;
      latestValues.push({ key, value: lastPoint.value, year: lastPoint.year });
    }

    if (latestValues.length >= 2) {
      latestValues.sort((a, b) => b.value - a.value);
      const top = latestValues[0];
      const bottom = latestValues[latestValues.length - 1];
      insights.push(
        `In ${top.year}, ${formatCountyLabel(
          top.key
        )} had the highest ${metricLabel.toLowerCase()} (${formatValueForIndicator(
          top.value
        )}), while ${formatCountyLabel(
          bottom.key
        )} was lowest (${formatValueForIndicator(bottom.value)}).`
      );
    }

    // 2) Per-county net change summary
    const netParts = [];
    for (const [key, arr] of perCountySeries.entries()) {
      if (arr.length < 2) continue;
      const first = arr[0];
      const last = arr[arr.length - 1];
      const delta = last.value - first.value;
      netParts.push(
        `${formatCountyLabel(key)}: ${formatValueForIndicator(
          first.value
        )} → ${formatValueForIndicator(last.value)} (${formatDelta(delta)})`
      );
    }
    if (netParts.length) {
      insights.push(`Change over ${start}–${end}: ${netParts.join(" | ")}`);
    }

    // 3) Biggest YoY change across all counties
    let bestJump = null;
    for (const [key, arr] of perCountySeries.entries()) {
      for (let i = 1; i < arr.length; i++) {
        const d = arr[i].value - arr[i - 1].value;
        if (!Number.isFinite(d)) continue;
        if (!bestJump || Math.abs(d) > Math.abs(bestJump.delta)) {
          bestJump = {
            key,
            fromYear: arr[i - 1].year,
            toYear: arr[i].year,
            delta: d,
          };
        }
      }
    }
    if (bestJump) {
      const direction = bestJump.delta >= 0 ? "increase" : "decrease";
      insights.push(
        `Largest year-over-year change: ${formatCountyLabel(
          bestJump.key
        )} saw a ${direction} of ${formatDelta(bestJump.delta)} from ${
          bestJump.fromYear
        } to ${bestJump.toYear}.`
      );
    }

    // 4) Peak observed value
    let peak = null;
    for (const [key, arr] of perCountySeries.entries()) {
      for (const p of arr) {
        if (!peak || p.value > peak.value)
          peak = { key, year: p.year, value: p.value };
      }
    }
    if (peak) {
      insights.push(
        `Peak observed value: ${formatCountyLabel(
          peak.key
        )} reached ${formatValueForIndicator(peak.value)} in ${peak.year}.`
      );
    }

    return insights.slice(0, 6);
  };

  const insights = useMemo(buildCombinedInsights, [
    showChart,
    appliedDateRange,
    perCountySeries,
    appliedMeta,
    formatDelta,
    formatValueForIndicator,
  ]);

  const showInsights = showChart && insights.length > 0;

  const axisTickStyle = {
    fontSize: 11,
    fill: "#6B7280", // muted gray
  };

  return (
    <div className="policy-playground-page">
      <section className="policy-playground-hero">
        <h1 className="policy-playground-title">Policy Playground</h1>
        <p className="policy-playground-subtitle">
          Explore key indicators, compare peer counties, and create compelling
          visuals to inform decision-making.
        </p>
      </section>

      <section className="policy-playground-layout">
        <article className="policy-card">
          <header className="policy-card-header">
            <p className="policy-card-subtitle">
              Choose your topic, counties, time frame, and display type.
            </p>
          </header>

          <div className="policy-card-content">
            {/* Category dropdown */}
            <div className="policy-field">
              <label htmlFor="policy-category" className="policy-label">
                Select Category
              </label>
              <select
                id="policy-category"
                className="policy-select"
                value={category}
                onChange={(event) => setCategory(event.target.value)}
              >
                {categories.map(({ value, label }) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
              <p className="policy-hint"></p>
            </div>

            {/* Indicator dropdown */}
            <div className="policy-field">
              <label htmlFor="policy-indicator" className="policy-label">
                Select Indicator
              </label>
              <select
                id="policy-indicator"
                className="policy-select"
                value={indicator}
                onChange={(event) => setIndicator(event.target.value)}
                disabled={!currentIndicators.length}
              >
                {currentIndicators.length ? (
                  currentIndicators.map((it) => (
                    <option key={it.value} value={it.value}>
                      {it.label}
                    </option>
                  ))
                ) : (
                  <option value="">No indicators yet for this category</option>
                )}
              </select>
            </div>

            {/* Geo level locked to county */}
            <div className="policy-field">
              <label htmlFor="policy-geo-level" className="policy-label">
                Geographic Level
              </label>
              <select
                id="policy-geo-level"
                className="policy-select"
                value={geoLevel}
                onChange={(event) => setGeoLevel(event.target.value)}
                disabled
              >
                {geoLevels.map(({ value, label }) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </div>

            {/* County Search + Selected Chips */}
            <div className="policy-field">
              <label className="policy-label">Select Counties (max 3)</label>

              {/* Selected chips */}
              <div
                style={{
                  display: "flex",
                  gap: 8,
                  flexWrap: "wrap",
                  marginBottom: 8,
                }}
              >
                {selectedCounties.map((c) => (
                  <div
                    key={c.county_fips}
                    style={{
                      border: "1px solid rgba(0,0,0,0.15)",
                      borderRadius: 16,
                      padding: "6px 10px",
                      display: "flex",
                      gap: 8,
                      alignItems: "center",
                      background: "rgba(0,0,0,0.03)",
                      fontSize: 13,
                    }}
                  >
                    <span>
                      {c.county_name}, {c.state_name}
                    </span>
                    <button
                      type="button"
                      onClick={() => removeCounty(c.county_fips)}
                      style={{
                        cursor: "pointer",
                        border: "none",
                        background: "transparent",
                        fontSize: 14,
                        lineHeight: 1,
                      }}
                      aria-label={`Remove ${c.county_name}`}
                      title="Remove"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>

              {/* Search input */}
              <input
                type="text"
                className="policy-input"
                value={countySearch}
                onChange={(e) => setCountySearch(e.target.value)}
                placeholder="Search counties (type at least 2 letters)..."
                disabled={selectedCounties.length >= 3}
              />

              {/* Scrollable dropdown results */}
              {countyResults.length > 0 && (
                <div
                  style={{
                    border: "1px solid rgba(0,0,0,0.12)",
                    borderRadius: 10,
                    marginTop: 8,
                    background: "white",
                    maxHeight: 220,
                    overflowY: "auto",
                    fontSize: 13,
                  }}
                >
                  {countyResults.map((c) => (
                    <div
                      key={c.county_fips}
                      onClick={() => addCounty(c)}
                      style={{
                        padding: "8px 10px",
                        cursor: "pointer",
                        borderBottom: "1px solid rgba(0,0,0,0.06)",
                      }}
                      title={`${c.county_name}, ${c.state_name}`}
                    >
                      {c.county_name}, {c.state_name}
                    </div>
                  ))}
                </div>
              )}

              <p className="policy-region-count">
                {selectedCounties.length} of 3 counties selected
              </p>
              {regionMessage && (
                <p className="policy-region-warning">{regionMessage}</p>
              )}
            </div>

            {/* Date range */}
            <div className="policy-field">
              <label className="policy-label">Date Range</label>
              <div className="policy-date-range">
                <input
                  type="number"
                  className="policy-input"
                  value={dateRange.start}
                  min={MIN_YEAR}
                  max={MAX_YEAR}
                  onChange={(event) =>
                    handleDateChange("start", event.target.value)
                  }
                />
                <span>to</span>
                <input
                  type="number"
                  className="policy-input"
                  value={dateRange.end}
                  min={MIN_YEAR}
                  max={MAX_YEAR}
                  onChange={(event) =>
                    handleDateChange("end", event.target.value)
                  }
                />
              </div>
            </div>

            <div className="policy-field">
              <label className="policy-label">Chart Type</label>
              <div className="policy-chart-type">
                <label>
                  <input
                    type="radio"
                    name="chart-type"
                    value="line"
                    checked={chartType === "line"}
                    onChange={(event) => setChartType(event.target.value)}
                  />
                  Line chart
                </label>
                <label>
                  <input
                    type="radio"
                    name="chart-type"
                    value="bar"
                    checked={chartType === "bar"}
                    onChange={(event) => setChartType(event.target.value)}
                  />
                  Bar chart
                </label>
              </div>
            </div>

            {chartError && (
              <p className="policy-region-warning" style={{ marginTop: 8 }}>
                {chartError}
              </p>
            )}

            <div className="policy-actions">
              <button
                type="button"
                className="policy-primary-btn"
                onClick={handleSave}
                disabled={loadingChart}
              >
                {loadingChart ? "Loading..." : "Display chart"}
              </button>
              <div className="policy-secondary-actions">
                <button
                  type="button"
                  className="policy-secondary-btn"
                  onClick={handleExport}
                  disabled={!showChart}
                >
                  Export
                </button>
                <button
                  type="button"
                  className="policy-secondary-btn"
                  onClick={handleShare}
                  disabled={!showChart}
                >
                  Share
                </button>
              </div>
            </div>
          </div>
        </article>

        {/* Right side chart */}
        <div className="policy-main-column">
          <article className="policy-card">
            <header className="policy-card-header">
              <h2 className="policy-card-title">
                {appliedConfig
                  ? appliedIndicatorLabel
                  : "Select an indicator to visualize data"}
              </h2>
              <p className="policy-card-subtitle">
                Category:{" "}
                {appliedConfig
                  ? categories.find((c) => c.value === appliedCategory)?.label ||
                    "NA"
                  : "NA"}
              </p>
            </header>

            {showChart ? (
              <>
                <div ref={chartExportRef}>
                  <div style={{ height: 380 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      {appliedChartType === "line" ? (
                        <LineChart
                          data={displayChartData}
                          margin={{ top: 16, right: 24, left: 8, bottom: 8 }}
                        >
                          <CartesianGrid
                            vertical={false}
                            stroke="#E5E7EB"
                            strokeDasharray="4 4"
                          />
                          <XAxis
                            dataKey="year"
                            tick={axisTickStyle}
                            tickLine={false}
                            axisLine={{ stroke: "#9CA3AF", strokeWidth: 2 }}
                            padding={{ left: 12, right: 12 }}
                          />
                          <YAxis
                            tickFormatter={appliedMeta?.yAxisTick}
                            tick={axisTickStyle}
                            tickLine={false}
                            axisLine={{ stroke: "#9CA3AF", strokeWidth: 2 }}
                            width={44}
                            domain={["auto", "auto"]}
                          />
                          <Tooltip
                            labelFormatter={(label) => `Year: ${label}`}
                            formatter={(value, name) => [
                              appliedMeta?.tooltipValue(value),
                              formatCountyLabel(name),
                            ]}
                          />
                          <Legend
                            formatter={(value) => formatCountyLabel(value)}
                          />
                          {appliedSeriesKeys.map((key, index) => (
                            <Line
                              key={key}
                              type="monotone"
                              dataKey={key}
                              stroke={["#16697A", "#FDB913", "#82A3A1"][index]}
                              strokeWidth={2}
                              dot={false}
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              activeDot={{ r: 5 }}
                            />
                          ))}
                        </LineChart>
                      ) : (
                        <BarChart data={displayChartData}>
                          <CartesianGrid
                            vertical={false}
                            stroke="#E5E7EB"
                            strokeDasharray="4 4"
                          />
                          <XAxis
                            dataKey="year"
                            tick={axisTickStyle}
                            tickLine={false}
                            axisLine={{ stroke: "#9CA3AF", strokeWidth: 1 }}
                            padding={{ left: 12, right: 12 }}
                          />
                          <YAxis
                            tickFormatter={appliedMeta?.yAxisTick}
                            tick={axisTickStyle}
                            tickLine={false}
                            axisLine={{ stroke: "#9CA3AF", strokeWidth: 1 }}
                            width={44}
                            domain={["auto", "auto"]}
                          />
                          <Tooltip
                            labelFormatter={(label) => `Year: ${label}`}
                            formatter={(value, name) => [
                              appliedMeta?.tooltipValue(value),
                              formatCountyLabel(name),
                            ]}
                          />
                          <Legend
                            formatter={(value) => formatCountyLabel(value)}
                          />
                          {appliedSeriesKeys.map((key, index) => (
                            <Bar
                              key={key}
                              dataKey={key}
                              barSize={20}
                              fill={["#16697A", "#FDB913", "#82A3A1"][index]}
                            />
                          ))}
                        </BarChart>
                      )}
                    </ResponsiveContainer>
                  </div>

                  <div className="policy-chart-meta">
                    <div>
                      <span className="policy-chart-meta-label">Source</span>
                      <span className="policy-chart-meta-value">
                        U.S. Census Bureau (ACS)
                      </span>
                    </div>
                    <div>
                      <span className="policy-chart-meta-label">
                        Geographic Level
                      </span>
                      <span className="policy-chart-meta-value">County</span>
                    </div>
                    <div>
                      <span className="policy-chart-meta-label">Metric</span>
                      <span className="policy-chart-meta-value">
                        {appliedMeta?.metricLabel} ({appliedMeta?.unitLabel})
                      </span>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="policy-chart-empty">
                <div>
                  <p className="policy-chart-empty-title">
                    {loadingChart ? "Loading..." : "No Data Selected"}
                  </p>
                  <p className="policy-chart-empty-text">
                    Select up to 3 counties, choose a year range ({MIN_YEAR}–
                    {MAX_YEAR}), then click Display chart.
                  </p>
                </div>
              </div>
            )}
          </article>

          {showInsights && (
            <article className="policy-card">
              <header className="policy-card-header">
                <h3 className="policy-card-title">Summary Statistics</h3>
              </header>
              <ul className="policy-insights-list">
                {insights.map((text, idx) => (
                  <li className="policy-insights-item" key={idx}>
                    <span className="policy-insights-bullet">•</span>
                    <span>{text}</span>
                  </li>
                ))}
              </ul>
            </article>
          )}
        </div>
      </section>
    </div>
  );
};

export default PolicyPlayground;
