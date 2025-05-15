import { useEffect, useState } from "react";

export const useCountry = () => {
  const [countries, setCountries] = useState([]);
  const [countryOptions, setCountryOptions] = useState([]);

  useEffect(() => {
    fetch("/assets/misc/countries.json")
      .then((res) => res.json())
      .then((data) => {
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
        setCountries([
          { name: "Kenya", iso: "KE", flag: "🇰🇪", dialCode: "+254" },
        ]);
        setCountryOptions([{ label: "Kenya", value: "Kenya" }]);
      });
  }, []);

  // Function to get the dialing code for a country
  const getDialCode = (countryName) => {
    const country = countries.find((c) => c.name === countryName);
    return country ? country.dialCode : "";
  };

  return { countries, countryOptions, getDialCode };
};
