import { useEffect, useState } from "react";

export const useCountry = () => {
  const [countries, setCountries] = useState([]);
  const [countryOptions, setCountryOptions] = useState([]);

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

        // Move Kenya to the top
        const sortedOptions = [
          ...options.filter((opt) => opt.value === "Kenya"),
          ...options.filter((opt) => opt.value !== "Kenya"),
        ];

        setCountryOptions(sortedOptions);
      })
      .catch((err) => {
        console.error("Error fetching countries:", err);
        // Fallback data with Kenya and Ghana
        setCountries([
          { name: "Kenya", iso: "KE", flag: "🇰🇪", dialCode: "+254" },
          { name: "Ghana", iso: "GH", flag: "🇬🇭", dialCode: "+233" },
        ]);
        setCountryOptions([
          { label: "Kenya", value: "Kenya" },
          { label: "Ghana", value: "Ghana" },
        ]);
      });
  }, []);

  const getDialCode = (countryName) => {
    const country = countries.find((c) => c.name === countryName);
    return country ? country.dialCode : "";
  };

  return { countries, countryOptions, getDialCode };
};
