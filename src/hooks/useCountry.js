import { useEffect, useState } from "react";

export const useCountry = () => {
  const [countries, setCountries] = useState([]);
  const [countryOptions, setCountryOptions] = useState([]);
  const [loading, setLoading] = useState(true); // Add loading state

  // Define regional options
  const regionalOptions = [
    { label: "All of Africa", value: "All of Africa" },
    { label: "All of Europe", value: "All of Europe" },
    { label: "All of Asia", value: "All of Asia" },
    { label: "All of North America", value: "All of North America" },
    { label: "All of South America", value: "All of South America" },
    { label: "All of Oceania", value: "All of Oceania" },
    { label: "Global (All Regions)", value: "Global (All Regions)" }
  ];

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
        }));
        const sortedOptions = [
          ...options.filter((opt) => opt.value === "Kenya"),
          ...options.filter((opt) => opt.value !== "Kenya"),
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
  }, []);

  const getDialCode = (countryName) => {
    // Don't try to get dial code for regional options
    if (regionalOptions.some(opt => opt.value === countryName)) {
      return "";
    }
    const country = countries.find(
      (c) => c.name.toUpperCase() === countryName?.toUpperCase()
    );
    return country ? country.dialCode : "";
  };

  return { countries, countryOptions, getDialCode, loading };
};
