import express from "express";
import axios from "axios";

const router = express.Router();

router.get("/:city", async (req, res) => {
  try {
    const city = req.params.city;

    const apiKey = process.env.WEATHER_API_KEY;

    const response = await axios.get(
      `http://api.weatherapi.com/v1/current.json?key=${apiKey}&q=${city}&aqi=yes`
    );

    res.json(response.data);
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch weather data",
      error: error.message,
    });
  }
});

export default router;