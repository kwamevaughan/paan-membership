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
        setCountryOptions([{ label: "Kenya", value: "Kenya" }]);
      });
  }, []);

  return { countries, countryOptions };
};
