import { useState, useEffect } from "react";
import { MapContainer, TileLayer, GeoJSON } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import countriesGeoJson from "../data/countries.js";
import { memo } from "react";
import ModernDeviceChart from "./DeviceChart.js";
import { Icon } from "@iconify/react";

const MemoizedDeviceChart = memo(ModernDeviceChart);

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
  const [showLegend, setShowLegend] = useState(true);

  const isDarkMode = mode === "dark";

  useEffect(() => {}, [candidates, mode]);

  // Function to normalize country input to a standard country code
  const normalizeCountryInput = (countryInput) => {
    if (!countryInput) return "Unknown";

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

    // Log unknown inputs for debugging
    console.warn(`Unknown country input: ${countryInput}`);
    return "Unknown";
  };

  let countryCounts = {};
  let totalApplicants = 0;

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

      // Calculate total
      totalApplicants = Object.values(countryCounts).reduce(
        (sum, count) => sum + count,
        0
      );
    } else {
      setMapError("Invalid candidates data");
    }
  } catch (error) {
    setMapError("Error processing candidates");
  }

  const getStandardizedCountryCode = (feature) => {
    try {
      if (!feature || !feature.properties) {
        return "Unknown";
      }
      const possibleCodes = [
        feature.properties.iso_a2,
        feature.properties.ISO_A2,
        feature.properties.ISO_A2_EH,
        feature.properties.ISO_A2_PS,
      ];
      const code =
        possibleCodes.find((c) => c !== null && c !== undefined && c !== "") ||
        "Unknown";
      return code.toUpperCase();
    } catch (error) {
      return "Unknown";
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

  // Updated color scale with modern gradient
  const getColor = (count) => {
    return count > 20
      ? "#1d4ed8" // Deep blue
      : count > 10
      ? "#3b82f6" // Medium blue
      : count > 5
      ? "#60a5fa" // Lighter blue
      : count > 3
      ? "#93c5fd" // Very light blue
      : count > 0
      ? "#bfdbfe" // Pale blue
      : isDarkMode
      ? "#1f2937"
      : "#f1f5f9"; // Background in dark/light mode
  };

  const getStyle = (feature) => {
    try {
      const countryCode = getStandardizedCountryCode(feature);
      const count = countryCounts[countryCode] || 0;
      return {
        fillColor: getColor(count),
        weight: 1,
        opacity: 0.8,
        color: isDarkMode ? "#374151" : "#e2e8f0",
        fillOpacity: count > 0 ? 0.85 : 0.4,
        dashArray: count > 0 ? "" : "2",
      };
    } catch (error) {
      return {
        fillColor: isDarkMode ? "#1f2937" : "#f1f5f9",
        weight: 1,
        opacity: 0.7,
        color: isDarkMode ? "#374151" : "#e2e8f0",
        fillOpacity: 0.3,
        dashArray: "2",
      };
    }
  };

  const onEachFeature = (feature, layer) => {
    try {
      const countryCode = getStandardizedCountryCode(feature);
      const countryName =
        feature.properties?.sovereignt || feature.properties?.name || "Unknown";
      const count = countryCounts[countryCode] || 0;

      layer.on({
        mouseover: (e) => {
          try {
            e.target.setStyle({
              fillOpacity: 0.95,
              weight: 2,
              color: isDarkMode ? "#f3f4f6" : "#4b5563",
            });

            const hoverInfo = {
              code: countryCode,
              count: count,
              name: countryName,
            };
            setHoveredCountry(hoverInfo);
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
            if (count > 0 && onFilter) {
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
        className={`rounded-2xl cursor-pointer transition-all duration-300 p-6 ${
          mode === "dark"
            ? "bg-gradient-to-br from-gray-800 to-gray-700 border-gray-600 shadow-md hover:shadow-xl text-white"
            : "bg-gradient-to-br from-white to-gray-50 border-blue-100 shadow-lg hover:shadow-xl text-gray-800"
        }`}
      >
        <h3 className="text-xl font-semibold mb-4">Applicants by Country</h3>
        <div className="flex items-center justify-center p-8">
          <div className="text-red-500 flex flex-col items-center">
            <Icon icon="mdi:alert-circle-outline" className="w-12 h-12 mb-3" />
            <p className="text-lg font-medium">Error loading map data</p>
            <p className="text-sm opacity-75 mt-1">
              Please check your connection or try again later
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`mt-10 rounded-xl ${
        isDarkMode ? "bg-gray-800 text-gray-100" : "bg-white text-gray-800"
      } shadow-xl transition-all duration-300 ease-in-out hover:shadow-lg`}
    >
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h3 className="text-xl font-bold">Applicants by Country</h3>
            <p
              className={`text-sm mt-1 ${
                isDarkMode ? "text-gray-400" : "text-gray-500"
              }`}
            >
              {totalApplicants} total applicants from{" "}
              {Object.keys(countryCounts).length} countries
            </p>
          </div>

          <button
            onClick={() => setShowLegend(!showLegend)}
            className={`p-2 rounded-full ${
              isDarkMode
                ? "bg-gray-700 hover:bg-gray-600"
                : "bg-gray-100 hover:bg-gray-200"
            } transition-colors duration-200`}
          >
            <Icon icon="mdi:information-outline" className="w-5 h-5" />
          </button>
        </div>

        {mapError && (
          <div className="mb-6 p-3 bg-red-100 text-red-800 rounded-lg flex items-center">
            <Icon icon="mdi:alert-circle-outline" className="w-5 h-5 mr-2" />
            {mapError}
          </div>
        )}

        <div className="grid md:grid-cols-10 gap-6">
          <div className="md:col-span-7">
            <div className="relative h-[450px] w-full rounded-lg overflow-hidden shadow-md">
              <MapContainer
                center={[20, 0]}
                zoom={2}
                style={{ height: "100%", width: "100%", borderRadius: "8px" }}
                scrollWheelZoom={true}
                zoomControl={false}
                className={isDarkMode ? "dark-map" : ""}
              >
                <TileLayer
                  url={
                    isDarkMode
                      ? "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                      : "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
                  }
                  attribution='© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> & <a href="https://carto.com/attributions">CARTO</a>'
                />
                <GeoJSON
                  key={JSON.stringify(candidates)}
                  data={countriesGeoJson}
                  style={getStyle}
                  onEachFeature={onEachFeature}
                />
              </MapContainer>

              {showLegend && (
                <div
                  className={`absolute bottom-4 left-4 p-3 rounded-lg shadow-lg z-[1000] ${
                    isDarkMode
                      ? "bg-gray-900 bg-opacity-90"
                      : "bg-white bg-opacity-90"
                  } flex flex-col gap-2`}
                >
                  <span className="text-xs font-medium mb-1">Applicants</span>
                  <div className="flex flex-col gap-1.5">
                    <span className="flex items-center gap-2 text-xs">
                      <span
                        className="w-3 h-3 rounded-sm"
                        style={{ backgroundColor: "#bfdbfe" }}
                      ></span>
                      <span>1-3</span>
                    </span>
                    <span className="flex items-center gap-2 text-xs">
                      <span
                        className="w-3 h-3 rounded-sm"
                        style={{ backgroundColor: "#93c5fd" }}
                      ></span>
                      <span>4-5</span>
                    </span>
                    <span className="flex items-center gap-2 text-xs">
                      <span
                        className="w-3 h-3 rounded-sm"
                        style={{ backgroundColor: "#60a5fa" }}
                      ></span>
                      <span>6-10</span>
                    </span>
                    <span className="flex items-center gap-2 text-xs">
                      <span
                        className="w-3 h-3 rounded-sm"
                        style={{ backgroundColor: "#3b82f6" }}
                      ></span>
                      <span>11-20</span>
                    </span>
                    <span className="flex items-center gap-2 text-xs">
                      <span
                        className="w-3 h-3 rounded-sm"
                        style={{ backgroundColor: "#1d4ed8" }}
                      ></span>
                      <span>20+</span>
                    </span>
                  </div>
                </div>
              )}

              {hoveredCountry && (
                <div
                  className={`absolute top-4 left-4 p-4 rounded-lg shadow-lg z-[1000] ${
                    isDarkMode
                      ? "bg-gray-900 bg-opacity-95"
                      : "bg-white bg-opacity-95"
                  } max-w-[220px]`}
                >
                  <h4 className="font-medium text-base">
                    {hoveredCountry.name || "Unknown"}
                  </h4>
                  <div className="mt-1 flex items-center gap-2">
                    <div
                      className={`inline-flex items-center justify-center ${
                        hoveredCountry.count > 0
                          ? "bg-blue-500 text-white"
                          : isDarkMode
                          ? "bg-gray-700 text-gray-300"
                          : "bg-gray-200 text-gray-600"
                      } px-2.5 py-1 text-xs font-medium rounded-full`}
                    >
                      {hoveredCountry.count}
                    </div>
                    <span className="text-sm">
                      {hoveredCountry.count === 1 ? "Applicant" : "Applicants"}
                    </span>
                  </div>
                  {hoveredCountry.count > 0 && (
                    <p
                      className={`text-xs mt-2 ${
                        isDarkMode ? "text-gray-400" : "text-gray-500"
                      }`}
                    >
                      Click to filter by this country
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="md:col-span-3">
            <MemoizedDeviceChart
              candidates={candidates}
              mode={mode}
              onFilter={onFilter}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
