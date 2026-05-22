import express from "express";
import axios from "axios";
import prisma from "../config/prisma.js";

const router = express.Router();

router.get("/:city", async (req, res) => {
  try {
    const city = req.params.city;

    const apiKey = process.env.WEATHER_API_KEY;

    const response = await axios.get(
      `http://api.weatherapi.com/v1/forecast.json?key=${apiKey}&q=${city}&aqi=yes&days=5`,
    );

    const weatherData = {
      city: response.data.location.name,
      country: response.data.location.country,
      localTime: response.data.location.localtime,

      temperature: response.data.current.temp_c,
      feelsLike: response.data.current.feelslike_c,
      condition: response.data.current.condition.text,
      icon: response.data.current.condition.icon,

      humidity: response.data.current.humidity,
      windKph: response.data.current.wind_kph,
      pressure: response.data.current.pressure_mb,
      uv: response.data.current.uv,

      airQuality: {
        co: response.data.current.air_quality.co,
        no2: response.data.current.air_quality.no2,
        o3: response.data.current.air_quality.o3,
        pm2_5: response.data.current.air_quality.pm2_5,
      },
      forecast: response.data.forecast.forecastday.map((day) => ({
        date: day.date,
        maxTemp: day.day.maxtemp_c,
        minTemp: day.day.mintemp_c,
        condition: day.day.condition.text,
        icon: day.day.condition.icon,
      })),
    };

    // Save to Supabase
    await prisma.weatherSearch.create({
      data: {
        city: weatherData.city,
        country: weatherData.country,
        temperature: weatherData.temperature,
        condition: weatherData.condition,
        humidity: weatherData.humidity,
        windKph: weatherData.windKph,
      },
    });

    res.json(weatherData);
  } catch (error) {
    if (error.response) {
      return res.status(error.response.status).json({
        message: error.response.data.error?.message || "Weather API error",
      });
    }

    res.status(500).json({
      message: "Internal server error",
    });
  }
});

export default router;
