import express from "express";
import axios from "axios";
import prisma from "../config/prisma.js";
import { createClient } from "redis";

const router = express.Router();
const apiKey = process.env.WEATHER_API_KEY;

// Redis Setup with fallback
let redisClient = null;
(async () => {
  const client = createClient({
    socket: {
      reconnectStrategy: false,
    },
  });

  client.on("error", () => {});

  try {
    await client.connect();
    console.log("Redis cache connected successfully.");
    redisClient = client;
  } catch (e) {
    console.log("Redis not available locally. Operating without cache.");
    redisClient = null;
  }
})();

router.post("/query", async (req, res) => {
  try {
    const { location, startDate, endDate } = req.body;

    if (!location || !startDate || !endDate) {
      return res.status(400).json({ message: "Location, startDate, and endDate are required." });
    }

    // 1. Check Redis Cache First
    const cacheKey = `weather_api:${location.toLowerCase()}:${startDate}:${endDate}`;
    let weatherData = null;

    if (redisClient) {
      try {
        const cachedResponse = await redisClient.get(cacheKey);
        if (cachedResponse) {
          weatherData = JSON.parse(cachedResponse);
          console.log("Cache HIT for:", cacheKey);
        }
      } catch (err) {
        console.error("Redis get error:", err);
      }
    }

    // 2. If not cached, fetch from external WeatherAPI
    if (!weatherData) {
      console.log("Cache MISS. Fetching from external API...");
      const diffTime = Math.abs(new Date(endDate) - new Date(startDate));
      const diffDays = Math.min(Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1, 10);

      const apiUrl = `http://api.weatherapi.com/v1/forecast.json?key=${apiKey}&q=${encodeURIComponent(location)}&days=${diffDays}&aqi=no&alerts=no`;
      const response = await axios.get(apiUrl);
      weatherData = response.data;

      // Save to Redis cache for 15 minutes (900 seconds)
      if (redisClient) {
        try {
          await redisClient.setEx(cacheKey, 900, JSON.stringify(weatherData));
        } catch (err) {}
      }
    }

    // 3. Save the query to PostgreSQL history
    const savedQuery = await prisma.weatherQuery.create({
      data: {
        location: weatherData.location.name,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        results: {
          create: weatherData.forecast.forecastday.map((day) => ({
            date: new Date(day.date),
            temperature: day.day.avgtemp_c,
            maxTemp: day.day.maxtemp_c,
            minTemp: day.day.mintemp_c,
            condition: day.day.condition.text,
            icon: day.day.condition.icon,
            humidity: day.day.avghumidity,
            windKph: day.day.maxwind_kph,
          })),
        },
      },
      include: {
        results: true,
      },
    });

    res.status(201).json(savedQuery);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error processing weather query" });
  }
});

router.get("/history", async (req, res) => {
  try {
    const queries = await prisma.weatherQuery.findMany({
      orderBy: { createdAt: "desc" },
      include: { results: true },
    });
    res.json(queries);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch history" });
  }
});

router.put("/results/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { temperature, condition } = req.body;

    const updatedResult = await prisma.weatherQueryResult.update({
      where: { id: parseInt(id) },
      data: {
        ...(temperature && { temperature: parseFloat(temperature) }),
        ...(condition && { condition }),
      },
    });

    res.json(updatedResult);
  } catch (error) {
    res.status(500).json({ message: "Failed to update record" });
  }
});

router.delete("/query/:id", async (req, res) => {
  try {
    const { id } = req.params;

    await prisma.weatherQuery.delete({
      where: { id: parseInt(id) },
    });

    res.json({ message: "Query deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete query" });
  }
});

router.get("/export/csv", async (req, res) => {
  try {
    const queries = await prisma.weatherQuery.findMany({
      include: { results: true },
    });

    let csvContent = "QueryId,Location,StartDate,EndDate,ResultDate,AvgTemp,Condition\n";
    
    queries.forEach(query => {
      query.results.forEach(result => {
        csvContent += `${query.id},"${query.location}",${query.startDate.toISOString().split('T')[0]},${query.endDate.toISOString().split('T')[0]},${result.date.toISOString().split('T')[0]},${result.temperature},"${result.condition}"\n`;
      });
    });

    res.header('Content-Type', 'text/csv');
    res.attachment('weather_export.csv');
    return res.send(csvContent);
  } catch (error) {
    res.status(500).json({ message: "Failed to export data" });
  }
});

router.get("/export/json", async (req, res) => {
  try {
    const queries = await prisma.weatherQuery.findMany({
      include: { results: true },
    });
    res.header('Content-Type', 'application/json');
    res.attachment('weather_export.json');
    return res.send(JSON.stringify(queries, null, 2));
  } catch (error) {
    res.status(500).json({ message: "Failed to export JSON data" });
  }
});

router.get("/info/:location", async (req, res) => {
  try {
    const { location } = req.params;
    const wikiResponse = await axios.get(`https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(location)}`, {
      headers: { 'User-Agent': 'WeatherIntelligenceApp/1.0 (contact@example.com)' }
    });
    res.json({
      title: wikiResponse.data.title,
      extract: wikiResponse.data.extract,
      thumbnail: wikiResponse.data.thumbnail?.source || null,
      content_urls: wikiResponse.data.content_urls
    });
  } catch (error) {
    res.status(404).json({ message: "Wikipedia info not found for this location" });
  }
});

router.get("/youtube/:location", async (req, res) => {
  try {
    const { location } = req.params;
    const query = `Walking tour in ${location} 4K`;
    
    // Scrape YouTube search results page for the first videoId
    const response = await axios.get(`https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`, {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' }
    });
    
    const match = response.data.match(/"videoRenderer":\{"videoId":"([a-zA-Z0-9_-]{11})"/);
    const videoId = match ? match[1] : 'dQw4w9WgXcQ'; // Fallback to Rickroll if nothing found
    
    res.json({ videoId });
  } catch (error) {
    res.status(500).json({ message: "Failed to find video" });
  }
});

export default router;
