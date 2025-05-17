import { useEffect, useState } from "react";

export const useCountry = () => {
  const [countries, setCountries] = useState([]);
  const [countryOptions, setCountryOptions] = useState([]);
  const [loading, setLoading] = useState(true); // Add loading state

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
          label: country.name,
          value: country.name,
        }));
        const sortedOptions = [
          ...options.filter((opt) => opt.value === "Kenya"),
          ...options.filter((opt) => opt.value !== "Kenya"),
        ];
        setCountryOptions(sortedOptions);
      })
      .catch((err) => {
        console.error("Error fetching countries:", err.message);
        console.warn("Using fallback data for Kenya and Ghana");
        const fallback = [
          { name: "Kenya", iso: "KE", flag: "🇰🇪", dialCode: "+254" },
          { name: "Ghana", iso: "GH", flag: "🇬🇭", dialCode: "+233" },
        ];
        setCountries(fallback);
        setCountryOptions(
          fallback.map((c) => ({ label: c.name, value: c.name }))
        );
      })
      .finally(() => {
        setLoading(false); // Set loading to false when done
      });
  }, []);

  const getDialCode = (countryName) => {
    const country = countries.find(
      (c) => c.name.toUpperCase() === countryName?.toUpperCase()
    );
    return country ? country.dialCode : "";
  };

  return { countries, countryOptions, getDialCode, loading };
};
