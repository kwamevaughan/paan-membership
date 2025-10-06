import { useEffect, useState, useMemo } from "react";

export const useCountry = () => {
  const [countries, setCountries] = useState([]);
  const [countryOptions, setCountryOptions] = useState([]);
  const [loading, setLoading] = useState(true); // Add loading state

  // Define regional options with useMemo to prevent recreation on every render
  const regionalOptions = useMemo(() => [
    { label: "All of Africa", value: "All of Africa" },
    { label: "All of Europe", value: "All of Europe" },
    { label: "All of Asia", value: "All of Asia" },
    { label: "All of North America", value: "All of North America" },
    { label: "All of South America", value: "All of South America" },
    { label: "All of Oceania", value: "All of Oceania" },
    { label: "Global (All Regions)", value: "Global (All Regions)" }
  ], []);

  useEffect(() => {
    fetch("/assets/misc/countries.json", { cache: "no-store" })
      .then((res) => {
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        return res.json();
      })
      .then((data) => {
        if (!data || !Array.isArray(data)) {
          throw new Error("Invalid countries data");
        }
        setCountries(data);
        const options = data.map((country) => ({
          label: `${country.flag || country.emoji || ''} ${country.name}`.trim(),
          value: country.name,
          // Enhanced search text to include more variations and common names
          searchText: [
            country.name.toLowerCase(),
            country.iso?.toLowerCase() || '',
            // Add common alternative names or variations
            country.name.toLowerCase().replace(/[^a-z0-9\s]/g, ''), // Remove special chars
            country.name.toLowerCase().replace(/\s+/g, ' ').trim(), // Normalize spaces
          ].join(' ')
        }));
        // Sort countries alphabetically by name, with Kenya first
        const sortedOptions = [
          ...options.filter((opt) => opt.value === "Kenya"),
          ...options
            .filter((opt) => opt.value !== "Kenya")
            .sort((a, b) => a.value.localeCompare(b.value))
        ];
        
        // Add regional options at the top of the list
        setCountryOptions([...regionalOptions, ...sortedOptions]);
      })
      .catch((err) => {
        console.error("Error fetching countries:", err.message);
        console.warn("Using fallback data for Kenya and Ghana");
        const fallback = [
          { name: "Kenya", iso: "KE", flag: "🇰🇪", dialCode: "+254" },
          { name: "Ghana", iso: "GH", flag: "🇬🇭", dialCode: "+233" },
        ];
        setCountries(fallback);
        // Include regional options even in fallback case
        setCountryOptions([
          ...regionalOptions,
          ...fallback.map((c) => ({ label: `${c.flag || ''} ${c.name}`.trim(), value: c.name }))
        ]);
      })
      .finally(() => {
        setLoading(false); // Set loading to false when done
      });
  }, [regionalOptions]);

  // Helper function to normalize country names for comparison
  const normalizeCountryName = (name) => {
    if (!name) return '';
    return name.trim().toLowerCase().replace(/[^a-z0-9\s]/g, '');
  };

  const getDialCode = (countryName) => {
    // Don't try to get dial code for regional options
    if (!countryName || regionalOptions.some(opt => opt.value === countryName)) {
      return "";
    }
    
    const searchTerm = normalizeCountryName(countryName);
    const country = countries.find(
      (c) => {
        const countryNameNormalized = normalizeCountryName(c.name);
        return countryNameNormalized.includes(searchTerm) || 
               searchTerm.includes(countryNameNormalized);
      }
    );
    return country ? country.dialCode : "";
  };

  // Function to find a country by name (case-insensitive and partial match)
  const findCountry = (countryName) => {
    if (!countryName) return null;
    
    const searchTerm = normalizeCountryName(countryName);
    
    // First try exact match
    let country = countries.find(c => 
      normalizeCountryName(c.name) === searchTerm
    );
    
    // If no exact match, try partial match
    if (!country) {
      country = countries.find(c => 
        normalizeCountryName(c.name).includes(searchTerm) ||
        searchTerm.includes(normalizeCountryName(c.name))
      );
    }
    
    return country;
  };

  return { countries, countryOptions, getDialCode, findCountry, loading };
};
