import { useState, useEffect } from "react";
import { MapContainer, TileLayer, GeoJSON } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import countriesGeoJson from "../data/countries.js";

const DEBUG_MODE = false;

const debugLog = (...args) => {
  if (DEBUG_MODE) {
    console.log(...args);
  }
};

// Create bidirectional mappings between country codes and names
const countryCodeToName = {};
const countryNameToCode = {};

try {
  if (
    countriesGeoJson &&
    countriesGeoJson.features &&
    Array.isArray(countriesGeoJson.features)
  ) {
    countriesGeoJson.features.forEach((feature) => {
      if (feature.properties) {
        // Handle ISO code mapping
        if (feature.properties.iso_a2) {
          const code = feature.properties.iso_a2.toUpperCase();
          const name = feature.properties.sovereignt;
          countryCodeToName[code] = name;

          // Create case-insensitive mapping from country name to code
          if (name) {
            countryNameToCode[name.toUpperCase()] = code;
          }

          // Add postal code mapping if different from ISO
          if (
            feature.properties.postal &&
            feature.properties.postal !== feature.properties.iso_a2
          ) {
            countryCodeToName[feature.properties.postal.toUpperCase()] = name;
          }
        }
      }
    });
  }
} catch (error) {
  // No logging
}

export default function CountryChart({ candidates, mode, onFilter }) {
  const [hoveredCountry, setHoveredCountry] = useState(null);
  const [mapError, setMapError] = useState(null);

  useEffect(() => {}, [candidates, mode]);

  // Function to normalize country input to a standard country code
  const normalizeCountryInput = (countryInput) => {
    if (!countryInput) return "UNKNOWN";

    const input = String(countryInput).trim().toUpperCase();

    // If input is a valid country code, use it directly
    if (countryCodeToName[input]) {
      return input;
    }

    // If input is a country name, get its code
    if (countryNameToCode[input]) {
      return countryNameToCode[input];
    }

    // Try partial matching for longer country names
    if (input.length > 3) {
      const matchingCountry = Object.keys(countryNameToCode).find(
        (name) => name.includes(input) || input.includes(name)
      );

      if (matchingCountry) {
        return countryNameToCode[matchingCountry];
      }
    }

    return "UNKNOWN";
  };

  let countryCounts = {};
  try {
    if (candidates && Array.isArray(candidates)) {
      countryCounts = candidates.reduce((acc, c) => {
        if (c && typeof c === "object") {
          const countryInput = c.country || "";
          const countryCode = normalizeCountryInput(countryInput);
          acc[countryCode] = (acc[countryCode] || 0) + 1;
        }
        return acc;
      }, {});
    } else {
      setMapError("Invalid candidates data");
    }
  } catch (error) {
    setMapError("Error processing candidates");
  }

  const getStandardizedCountryCode = (feature) => {
    try {
      if (!feature || !feature.properties) {
        return "UNKNOWN";
      }
      const possibleCodes = [
        feature.properties.iso_a2,
        feature.properties.ISO_A2,
        feature.properties.ISO_A2_EH,
        feature.properties.ISO_A2_PS,
      ];
      const code =
        possibleCodes.find((c) => c !== null && c !== undefined && c !== "") ||
        "UNKNOWN";
      return code.toUpperCase();
    } catch (error) {
      return "UNKNOWN";
    }
  };

  const getApplicants = (feature) => {
    try {
      const countryCode = getStandardizedCountryCode(feature);
      return countryCounts[countryCode] || 0;
    } catch (error) {
      return 0;
    }
  };

  const getStyle = (feature) => {
    try {
      const countryCode = getStandardizedCountryCode(feature);
      const count = countryCounts[countryCode] || 0;
      return {
        fillColor:
          count > 0 ? getColor(count) : mode === "dark" ? "#231812" : "#e5e5e5",
        weight: 1.5,
        opacity: 1,
        color: mode === "dark" ? "#fff" : "#231812",
        fillOpacity: count > 0 ? 0.8 : 0.3,
        dashArray: count > 0 ? "" : "3",
      };
    } catch (error) {
      return {
        fillColor: "#e5e5e5",
        weight: 1,
        opacity: 1,
        color: "#231812",
        fillOpacity: 0.3,
        dashArray: "3",
      };
    }
  };

  // Updated color scale with brand colors
  const getColor = (count) => {
    return count > 20
      ? "#b91c1c" // Darker shade of #f05d23 for 20+
      : count > 10
      ? "#f05d23" // Main brand color for 11-20
      : count > 5
      ? "#f28c5e" // Lighter shade of #f05d23 for 6-10
      : count > 3
      ? "#f5a77d" // Even lighter shade for 4-5
      : count > 1
      ? "#f8c3a2" // Very light shade for 1-3
      : "#231812"; // Secondary color fallback (unlikely to hit)
  };

  const onEachFeature = (feature, layer) => {
    try {
      const countryCode = getStandardizedCountryCode(feature);
      const countryName =
        feature.properties?.sovereignt || feature.properties?.name || "Unknown";

      layer.on({
        mouseover: (e) => {
          try {
            e.target.setStyle({ fillOpacity: 0.9, weight: 2 });
            const hoverInfo = {
              code: countryCode,
              count: countryCounts[countryCode] || 0,
              name: countryName,
            };
            setHoveredCountry(hoverInfo);
            e.target.bindTooltip(
              `${countryName}: ${countryCounts[countryCode] || 0}`,
              {
                permanent: false,
                direction: "auto",
                className: "country-tooltip",
              }
            );
          } catch (error) {
            // No logging
          }
        },
        mouseout: (e) => {
          try {
            e.target.setStyle(getStyle(feature));
            setHoveredCountry(null);
          } catch (error) {
            // No logging
          }
        },
        click: () => {
          try {
            if (countryCounts[countryCode] > 0 && onFilter) {
              onFilter(
                "country",
                countryCodeToName[countryCode] || countryCode
              );
            }
          } catch (error) {
            // No logging
          }
        },
      });
    } catch (error) {
      // No logging
    }
  };

  const canRenderMap =
    countriesGeoJson &&
    countriesGeoJson.features &&
    Array.isArray(countriesGeoJson.features) &&
    countriesGeoJson.features.length > 0;

  if (!canRenderMap) {
    return (
      <div
        className={`p-6 rounded-xl shadow-lg ${
          mode === "dark" ? "bg-gray-800 text-white" : "bg-white text-[#231812]"
        }`}
      >
        <h3 className="text-lg font-semibold mb-4">Applicants by Country</h3>
        <p className="text-red-500">Error loading map data.</p>
      </div>
    );
  }

  return (
    <div
      className={`border-t-4 border-[#84c1d9] mt-10 p-6 rounded-xl shadow-md hover:shadow-none animate-fade-in transition-shadow duration-500 animate-scale-up ${
        mode === "dark" ? "bg-gray-800" : "bg-white"
      }`}
    >
      <h3
        className={`text-lg font-semibold mb-4 ${
          mode === "dark" ? "text-white" : "text-[#231812]"
        }`}
      >
        Applicants by Country
      </h3>

      {mapError && (
        <div className="mb-4 p-2 bg-red-100 text-red-800 rounded">
          {mapError}
        </div>
      )}

      <div className="relative h-[400px] w-full">
        <MapContainer
          center={[20, 0]}
          zoom={2}
          style={{ height: "100%", width: "100%", borderRadius: "8px" }}
          scrollWheelZoom={false}
          className={mode === "dark" ? "dark-map" : ""}
        >
          <TileLayer
            url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
            attribution='© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> & <a href="https://carto.com/attributions">CARTO</a>'
          />
          <GeoJSON
            key={JSON.stringify(candidates)}
            data={countriesGeoJson}
            style={getStyle}
            onEachFeature={onEachFeature}
          />
        </MapContainer>
        {hoveredCountry && (
          <div
            className={`absolute top-4 left-4 p-4 rounded-lg shadow-lg z-[1000] max-h-[300px] overflow-y-auto ${
              mode === "dark"
                ? "bg-gray-900 text-white"
                : "bg-white text-[#231812]"
            }`}
          >
            <h4 className="font-semibold">
              {hoveredCountry.name || "Unknown"}
            </h4>
            <p>Applicants: {countryCounts[hoveredCountry.code] || 0}</p>
          </div>
        )}
      </div>
      <div className="mt-4 flex justify-center gap-4 flex-wrap">
        <span className="flex items-center gap-2">
          <span
            className="w-4 h-4 rounded-full"
            style={{ backgroundColor: "#f8c3a2" }}
          ></span>{" "}
          1-3
        </span>
        <span className="flex items-center gap-2">
          <span
            className="w-4 h-4 rounded-full"
            style={{ backgroundColor: "#f5a77d" }}
          ></span>{" "}
          4-5
        </span>
        <span className="flex items-center gap-2">
          <span
            className="w-4 h-4 rounded-full"
            style={{ backgroundColor: "#f28c5e" }}
          ></span>{" "}
          6-10
        </span>
        <span className="flex items-center gap-2">
          <span
            className="w-4 h-4 rounded-full"
            style={{ backgroundColor: "#f05d23" }}
          ></span>{" "}
          11-20
        </span>
        <span className="flex items-center gap-2">
          <span
            className="w-4 h-4 rounded-full"
            style={{ backgroundColor: "#b91c1c" }}
          ></span>{" "}
          20+
        </span>
      </div>
    </div>
  );
}
