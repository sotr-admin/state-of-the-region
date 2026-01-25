import React, { useMemo } from "react";

// Normalize Tableau Public URLs so embeds work reliably
function normalize(url) {
  if (!url) return "";

  // If user gives a "shared" link, keep it and ensure showVizHome=no
  if (url.includes("/shared/")) {
    if (url.includes("?")) {
      return url.includes("showVizHome") ? url : `${url}&:showVizHome=no`;
    }
    return `${url}?:showVizHome=no`;
  }

  // For /views/ links, add showVizHome=no
  if (url.includes("?")) {
    return url.includes("showVizHome") ? url : `${url}&:showVizHome=no`;
  }
  return `${url}?:showVizHome=no`;
}

export default function TableauViz({
  url,
  height = 520,
  toolbar = false,
  tabs = false,
}) {
  const base = useMemo(() => normalize(url), [url]);

  const finalUrl = useMemo(() => {
    if (!base) return "";
    const join = base.includes("?") ? "&" : "?";

    // Tableau expects these as :param=value style
    const toolbarParam = toolbar ? "" : ":toolbar=no";
    const tabsParam = tabs ? "" : ":tabs=no";

    const extra = [toolbarParam, tabsParam].filter(Boolean).join("&");
    return extra ? `${base}${join}${extra}` : base;
  }, [base, toolbar, tabs]);

  if (!finalUrl) {
    return (
      <div style={{ padding: 12, color: "#6b7280", fontSize: 13 }}>
        Tableau URL not set yet.
      </div>
    );
  }

  return (
    <div style={{ width: "100%", borderRadius: 12, overflow: "hidden" }}>
      <iframe
        title="Tableau Visualization"
        src={finalUrl}
        width="100%"
        height={height}
        style={{ display: "block", border: "0" }}
        allow="fullscreen"
      />
    </div>
  );
}
