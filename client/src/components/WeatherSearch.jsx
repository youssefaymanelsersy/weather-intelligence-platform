import { useState } from "react";
import axios from "axios";

function WeatherSearch() {
    const [city, setCity] = useState("");
    const [weather, setWeather] = useState(null);

    const fetchWeather = async () => {
        try {
            const response = await axios.get(`http://localhost:5000/weather/${city}`);

            setWeather(response.data);
        } catch (error) {
            console.error("Error fetching weather:", error);
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
