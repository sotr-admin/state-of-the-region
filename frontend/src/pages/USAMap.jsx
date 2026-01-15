import React from "react";
import { ComposableMap, Geographies, Geography } from "react-simple-maps";
import { Tooltip } from "react-tooltip"; // ✅ named import

const geoUrl = "/states-10m.json";

const USAMap = () => {
  return (
    <>
      {/* ✅ Add the Tooltip container */}
      <Tooltip
        id="state-tooltip"
        style={{
          backgroundColor: "#ecedee",
          color: "#000",
          fontSize: "14px",
          borderRadius: "4px",
        }}
      />

      <ComposableMap projection="geoAlbersUsa">
        <Geographies geography={geoUrl}>
          {({ geographies }) =>
            geographies.map((geo) => (
              <Geography
                key={geo.rsmKey}
                geography={geo}
                fill="#EDEBD1"
                stroke="#CFC493"
                strokeWidth={0.6}
                data-tooltip-id="state-tooltip" // ✅ tooltip target
                data-tooltip-content={geo.properties.name} // ✅ tooltip text
                style={{
                  default: { outline: "none" },
                  hover: {
                    fill: "#DBE442",
                    stroke: "#9CCB3B",
                    outline: "none",
                  },
                }}
              />
            ))
          }
        </Geographies>
      </ComposableMap>
    </>
  );
};

export default USAMap;
