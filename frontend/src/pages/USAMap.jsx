import React, { useEffect, useRef, useState, useMemo } from "react";
import {
  ComposableMap,
  Geographies,
  Geography,
  Marker,
} from "react-simple-maps";

// Us Atlas topojson
const GEO_URL = "https://cdn.jsdelivr.net/npm/us-atlas@3/states-10m.json";

// Census API (ACS 1-year, Data Profile)
// DP05_0001E = total population estimate
// DP03_0062E = median household income (dollars)
const CENSUS_URL =
  "https://api.census.gov/data/2023/acs/acs1/profile?get=NAME,DP05_0001E,DP03_0062E&for=state:*";

// Tampa (approx). This is the “green dot” marker.
const TAMPA_BAY_COORDS = [-82.4572, 27.9506];

// USF green
const DOT_FILL = "#006747";
const DOT_STROKE = "#ffffff";

function formatNumber(n) {
  if (n === null || n === undefined || n === "" || n === "null") return "—";
  const num = Number(n);
  if (Number.isNaN(num)) return "—";
  return num.toLocaleString("en-US");
}

function formatCurrency(n) {
  if (n === null || n === undefined || n === "" || n === "null") return "—";
  const num = Number(n);
  if (Number.isNaN(num)) return "—";
  return num.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  });
}

export default function USAMap() {
  const containerRef = useRef(null);
  const tooltipRef = useRef(null);

  const [stateStatsByFips, setStateStatsByFips] = useState({});
  const [loading, setLoading] = useState(true);
  const [fetchErr, setFetchErr] = useState("");

  const [tip, setTip] = useState({
    visible: false,
    name: "",
    fips: "",
    x: 0,
    y: 0,
  });

  // tooltip position that is clamped inside container (prevents clipping on right/top/bottom/left)
  const [tipPos, setTipPos] = useState({ left: 0, top: 0 });

  useEffect(() => {
    let mounted = true;

    async function load() {
      try {
        setLoading(true);
        setFetchErr("");

        const res = await fetch(CENSUS_URL);
        if (!res.ok) throw new Error(`Census fetch failed (${res.status})`);

        const rows = await res.json();
        const header = rows[0];
        const idxName = header.indexOf("NAME");
        const idxPop = header.indexOf("DP05_0001E");
        const idxIncome = header.indexOf("DP03_0062E");
        const idxState = header.indexOf("state");

        const map = {};
        for (let i = 1; i < rows.length; i++) {
          const r = rows[i];
          const fips = String(r[idxState] ?? "").padStart(2, "0");
          map[fips] = {
            name: r[idxName],
            population: r[idxPop],
            medianIncome: r[idxIncome],
          };
        }

        if (mounted) setStateStatsByFips(map);
      } catch (e) {
        if (mounted) setFetchErr(e?.message || "Failed to load Census data");
      } finally {
        if (mounted) setLoading(false);
      }
    }

    load();
    return () => {
      mounted = false;
    };
  }, []);

  const setTipPosition = (evt) => {
    const el = containerRef.current;
    if (!el) return { x: 0, y: 0 };
    const rect = el.getBoundingClientRect();
    return {
      x: evt.clientX - rect.left,
      y: evt.clientY - rect.top,
    };
  };

  // compute a safe on-screen tooltip position so it never gets cut off
  const computeClampedTooltipPos = (x, y) => {
    const el = containerRef.current;
    const tt = tooltipRef.current;

    // default "flag" placement (same structure you have now)
    const OFFSET = 14;
    const PAD = 10;

    let left = x + OFFSET;
    let top = y + OFFSET;

    if (!el || !tt) return { left, top };

    const rect = el.getBoundingClientRect();
    const w = rect.width;
    const h = rect.height;

    const tw = tt.offsetWidth || 0;
    const th = tt.offsetHeight || 0;

    // Flip horizontally if overflowing right
    if (left + tw + PAD > w) {
      left = x - tw - OFFSET;
    }

    // Flip vertically if overflowing bottom
    if (top + th + PAD > h) {
      top = y - th - OFFSET;
    }

    // Clamp inside container (handles left/top overflow too)
    left = Math.max(PAD, Math.min(left, Math.max(PAD, w - tw - PAD)));
    top = Math.max(PAD, Math.min(top, Math.max(PAD, h - th - PAD)));

    return { left, top };
  };

  const mapNote = useMemo(() => {
    if (fetchErr) return "Data unavailable right now.";
    if (loading) return "Loading state stats…";
    return "Hover over a state to see summary statistics";
  }, [loading, fetchErr]);

  const current = stateStatsByFips?.[tip.fips] || {};

  // Whenever tip moves/opens, update clamped position (after render, so tooltipRef has size)
  useEffect(() => {
    if (!tip.visible) return;

    // Wait one frame to ensure tooltip is measured
    const id = requestAnimationFrame(() => {
      const p = computeClampedTooltipPos(tip.x, tip.y);
      setTipPos(p);
    });

    return () => cancelAnimationFrame(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tip.visible, tip.x, tip.y, tip.name, tip.fips]);

  return (
    <div className="map-wrap" ref={containerRef}>
      <div className="map-note">{mapNote}</div>

      {tip.visible && (
        <div
          ref={tooltipRef}
          className="map-tooltip map-tooltip--pretty"
          style={{ left: tipPos.left, top: tipPos.top }}
          role="tooltip"
        >
          {/* ✅ KEEP EXACT "FLAG" STRUCTURE/STYLING */}
          <div className="map-tooltip-head">
            <div className="map-tooltip-dot" />
            <div className="map-tooltip-title">{tip.name}</div>
            <div className="map-tooltip-chip">ACS 2023</div>
          </div>

          <div className="map-tooltip-body">
            <div className="map-tooltip-row">
              <div className="map-tooltip-label">Population</div>
              <div className="map-tooltip-value">
                {formatNumber(current.population)}
              </div>
            </div>

            <div className="map-tooltip-row">
              <div className="map-tooltip-label">Median income</div>
              <div className="map-tooltip-value">
                {formatCurrency(current.medianIncome)}
              </div>
            </div>
          </div>

          <div className="map-tooltip-foot">
            U.S. Census Bureau — ACS 1-year profile estimates
          </div>
        </div>
      )}

      <ComposableMap projection="geoAlbersUsa" className="usa-map">
        <Geographies geography={GEO_URL}>
          {({ geographies }) =>
            geographies.map((geo) => {
              const fips = String(geo.id).padStart(2, "0");
              const name =
                stateStatsByFips?.[fips]?.name || geo.properties?.name || "—";

              return (
                <Geography
                  key={geo.rsmKey}
                  geography={geo}
                  onMouseEnter={(evt) => {
                    const pos = setTipPosition(evt);
                    setTip({ visible: true, name, fips, x: pos.x, y: pos.y });
                  }}
                  onMouseMove={(evt) => {
                    if (!tip.visible) return;
                    const pos = setTipPosition(evt);
                    setTip((prev) => ({ ...prev, x: pos.x, y: pos.y }));
                  }}
                  onMouseLeave={() => {
                    setTip((prev) => ({ ...prev, visible: false }));
                  }}
                  style={{
                    default: {
                      fill: "#f1f0d6",
                      stroke: "#d6d0a8",
                      strokeWidth: 0.7,
                      outline: "none",
                      cursor: "pointer",
                    },
                    hover: {
                      fill: "#cfc493",
                      stroke: "#006747",
                      strokeWidth: 1.2,
                      outline: "none",
                      cursor: "pointer",
                    },
                    pressed: {
                      fill: "#cfc493",
                      stroke: "#006747",
                      strokeWidth: 1.2,
                      outline: "none",
                    },
                  }}
                />
              );
            })
          }
        </Geographies>

        {/* ✅ Tampa Bay green dot marker (only) */}
        <Marker coordinates={TAMPA_BAY_COORDS}>
          <circle
            r={5.5}
            fill={DOT_FILL}
            stroke={DOT_STROKE}
            strokeWidth={2}
          />
        </Marker>
      </ComposableMap>
    </div>
  );
}
