import * as React from "react";
import { createContext, useContext, useEffect, useState } from "react";
import { useLoadScript } from "@react-google-maps/api";

const WeatherContext = createContext(undefined);

export const useWeatherContext = () => {
  const weatherContext = useContext(WeatherContext);
  if (weatherContext === undefined) {
    throw new Error("useWeatherContext must be called inside a GlobalStore");
  }
  return weatherContext;
};

const WeatherStore = ({ children }) => {
  const [screen, setScreen] = useState(false);
  const [error, setError] = useState(null);
  const [isVarLoaded, setIsVarLoaded] = useState(false);
  const [city, setCity] = useState("Your location");
  const [temp, setTemp] = useState(null);
  const [unit, setUnit] = useState("C");
  const [results, setResults] = useState(null);
  const [yourLocation, setYourLocation] = useState("Your location");
  const { isLoaded } = useLoadScript({
    googleMapsApiKey: process.env.REACT_APP_GOOGLE_API_KEY,
    libraries: ["places"],
  });

  const cityHandler = (city) => {
    if (city === "Your location") {
      setCity(yourLocation);
    } else {
      setCity(city);
    }
  };

  const tempHandler = (temp, unit) => {
    setTemp(temp);
    setUnit(unit);
  };

  const changeScreen = () => {
    setScreen((prev) => !prev);
  };

  useEffect(() => {
    if (city === "Your location") {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          let coordX = position.coords.latitude;
          let coordY = position.coords.longitude;
          fetch(
            "https://api.openweathermap.org/geo/1.0/reverse?lat=" +
              coordX +
              "&lon=" +
              coordY +
              "&appid=" +
              process.env.REACT_APP_APIKEY
          )
            .then((res) => {
              return res.json();
            })
            .then((result) => {
              setCity(result[0].name);
              setYourLocation(result[0].name);
            });
        },
        (err) => {
          console.log("Error:");
          console.log(err);
        }
      );
    }
  }, []);

  useEffect(() => {
    fetch(
      "https://api.openweathermap.org/data/2.5/weather?q=" +
        city +
        "&units=metric" +
        "&appid=" +
        process.env.REACT_APP_APIKEY
    )
      .then((res) => res.json())
      .then(
        (result) => {
          if (result["cod"] !== 200) {
            setIsVarLoaded(false);
          } else {
            setIsVarLoaded(true);
            setResults(result);
          }
        },
        (error) => {
          setIsVarLoaded(true);
          setError(error);
        }
      );
  }, [city]);

  useEffect(() => {
    if (results !== null) {
      if (unit === "F") {
        let newT = results.main.feels_like * 1.8 + 32;
        setTemp(newT);
      } else {
        setTemp(results.main.feels_like);
      }
    }
  }, [results]);

  const weatherStoreValues = {
    screen,
    setScreen,
    error,
    setError,
    isLoaded,
    isVarLoaded,
    setIsVarLoaded,
    city,
    setCity,
    temp,
    setTemp,
    unit,
    setUnit,
    results,
    setResults,
    cityHandler,
    tempHandler,
    changeScreen,
  };

  return (
    <WeatherContext.Provider value={weatherStoreValues}>
      {children}
    </WeatherContext.Provider>
  );
};
export default WeatherStore;