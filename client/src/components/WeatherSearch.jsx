import { useState } from "react";
import axios from "axios";

function WeatherSearch() {
    const [city, setCity] = useState("");
    const [weather, setWeather] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const fetchWeather = async () => {
        if (!city.trim()) {
            setError("Please enter a city name.");
            return;
        }

        try {
            setLoading(true);
            setError("");

            const response = await axios.get(
                `http://localhost:5000/weather/${city}`
            );

            setWeather(response.data);
        } catch (error) {
            setError("Failed to fetch weather data.");
            setWeather(null);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <h2>Search Weather</h2>

            <input
                type="text"
                placeholder="Enter city..."
                value={city}
                onChange={(e) => setCity(e.target.value)}
            />

            <button onClick={fetchWeather}>Search</button>

            {loading && <p>Loading weather data...</p>}

            {error && <p>{error}</p>}
            {weather && (
                <div>
                    <h3>
                        {weather.city}, {weather.country}
                    </h3>

                    <p>Temperature: {weather.temperature}°C</p>
                    <p>Condition: {weather.condition}</p>
                    <p>Humidity: {weather.humidity}%</p>
                    <p>Wind Speed: {weather.windKph} kph</p>

                    <img src={weather.icon} alt={weather.condition} />
                </div>
            )}
        </div>
    );
}

export default WeatherSearch;
