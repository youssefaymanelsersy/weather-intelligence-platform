import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import LocationMap from '../components/LocationMap';
import WeatherChart from '../components/WeatherChart';
import WikipediaInfo from '../components/WikipediaInfo';
import YouTubeInfo from '../components/YouTubeInfo';
import { CloudSun, Trash2, DownloadCloud, Search, Navigation, LogOut } from 'lucide-react';
import '../index.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default function Dashboard() {
  const { user, logout } = useContext(AuthContext);
  const [location, setLocation] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [weatherData, setWeatherData] = useState(null);
  const [history, setHistory] = useState([]);
  const [toastMessage, setToastMessage] = useState(null);

  const showToast = (msg, type = "info") => {
    setToastMessage({ msg, type });
    setTimeout(() => setToastMessage(null), 3000);
  };

  const fetchHistory = async () => {
    try {
      const res = await axios.get(`${API_URL}/weather/history`);
      setHistory(res.data);
    } catch (err) {
      showToast("Failed to load history", "error");
    }
  };

  useEffect(() => {
    fetchHistory();
    // Pre-fill dates to a default 5-day range from today
    const today = new Date();
    const next5 = new Date();
    next5.setDate(today.getDate() + 5);
    setStartDate(today.toISOString().split('T')[0]);
    setEndDate(next5.toISOString().split('T')[0]);
  }, []);

  const setDateRange = (days) => {
    const start = new Date();
    const end = new Date();
    end.setDate(start.getDate() + days);
    setStartDate(start.toISOString().split('T')[0]);
    setEndDate(end.toISOString().split('T')[0]);
  };

  const handleUseMyLocation = () => {
    if (!navigator.geolocation) {
      showToast("Geolocation is not supported by your browser", "error");
      return;
    }
    showToast("Finding your location...", "info");
    navigator.geolocation.getCurrentPosition(async (position) => {
      try {
        const { latitude, longitude } = position.coords;
        const res = await axios.get(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
        const city = res.data.address.city || res.data.address.town || res.data.address.village || res.data.address.country;
        if (city) {
          setLocation(city);
          showToast(`Location set to ${city}!`, "success");
        } else {
          showToast("Could not determine city name", "error");
        }
      } catch (err) {
        showToast("Failed to geocode your location", "error");
      }
    }, () => {
      showToast("Unable to retrieve your location", "error");
    });
  };

  const handleSearch = async (e) => {
    if (e) e.preventDefault();
    if (!location || !startDate || !endDate) {
      showToast("Please fill in all fields", "error");
      return;
    }

    try {
      const res = await axios.post(`${API_URL}/weather/query`, {
        location,
        startDate,
        endDate
      });
      setWeatherData(res.data);
      setLocation(res.data.location); // Update the input field and map to the fully resolved city name
      fetchHistory(); // Refresh history
      showToast(`Successfully fetched weather for ${res.data.location}`, "success");
    } catch (err) {
      showToast(err.response?.data?.message || "Something went wrong.", "error");
    }
  };

  const handleLocationSelect = (city) => {
    setLocation(city);
    showToast(`Location set to ${city} from map!`, "success");
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`${API_URL}/weather/query/${id}`);
      fetchHistory(); // Refresh list
      showToast("Query deleted successfully", "success");
    } catch (err) {
      showToast("Failed to delete", "error");
    }
  };

  const handleDownload = async (url, filename) => {
    try {
      showToast("Downloading...", "info");
      const res = await axios.get(url, { responseType: 'blob' });
      const blob = new Blob([res.data], { type: res.headers['content-type'] });
      const link = document.createElement('a');
      link.href = window.URL.createObjectURL(blob);
      link.download = filename;
      link.click();
      window.URL.revokeObjectURL(link.href);
      showToast(`${filename.toUpperCase()} Downloaded!`, "success");
    } catch (err) {
      showToast("Failed to download file", "error");
    }
  };

  const exportCSV = () => handleDownload(`${API_URL}/weather/export/csv`, 'weather_export.csv');
  const exportJSON = () => handleDownload(`${API_URL}/weather/export/json`, 'weather_export.json');

  return (
    <div className="min-h-screen bg-slate-950 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.3),rgba(255,255,255,0))] text-white p-6 pb-20 relative">
      
      {toastMessage && (
        <div className={`fixed top-4 right-4 px-6 py-3 rounded-xl shadow-xl z-50 transition-opacity duration-300 border ${
          toastMessage.type === 'error' ? 'bg-red-900/90 border-red-500 text-red-100' :
          toastMessage.type === 'success' ? 'bg-green-900/90 border-green-500 text-green-100' :
          'bg-slate-800/90 border-slate-500 text-white'
        }`}>
          {toastMessage.msg}
        </div>
      )}

      <div className="max-w-5xl mx-auto space-y-10">
        
        <header className="pt-10 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="text-center md:text-left">
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent flex items-center justify-center md:justify-start gap-4 pb-2">
              <CloudSun className="w-12 h-12 text-blue-400" />
              SkyCast
            </h1>
            <p className="mt-2 text-slate-400 max-w-2xl">
              Advanced meteorological analysis with interactive mapping, Wikipedia insights, and comprehensive historical tracking.
            </p>
          </div>
          
          <div className="flex flex-wrap justify-center md:justify-end items-center gap-3">
            <div className="bg-white/5 backdrop-blur-md px-5 py-2.5 rounded-full border border-white/10 text-sm text-slate-300 shadow-sm">
              Welcome, <span className="text-white font-semibold">{user?.name}</span>
            </div>
            <button 
              onClick={logout}
              className="flex items-center gap-2 text-sm bg-white/5 hover:bg-red-500/10 text-slate-300 hover:text-red-400 px-5 py-2.5 rounded-full border border-white/10 hover:border-red-500/30 transition-all shadow-sm"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Sign Out</span>
            </button>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          <div className="space-y-6">
            <form onSubmit={handleSearch} className="bg-white/5 backdrop-blur-md p-6 rounded-2xl border border-white/10 shadow-xl space-y-4">
              <h2 className="text-xl font-semibold mb-4 text-white">Query Parameters</h2>
              
              <div className="space-y-2">
                <label className="text-sm text-slate-300 block">Location</label>
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    placeholder="E.g., London, Tokyo, 90210" 
                    value={location} 
                    onChange={(e) => setLocation(e.target.value)} 
                    className="flex-1 px-4 py-2 rounded-md bg-black/20 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button type="button" onClick={handleUseMyLocation} className="px-3 py-2 rounded-md bg-white/10 hover:bg-white/20 transition-colors border border-white/10" title="Use Current Location">
                    <Navigation className="w-5 h-5 text-blue-400" />
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center mb-1">
                  <label className="text-sm text-slate-300 block">Date Range</label>
                  <div className="flex gap-2">
                    <button type="button" onClick={() => setDateRange(0)} className="text-xs px-3 py-1 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 transition-colors">Today</button>
                    <button type="button" onClick={() => setDateRange(3)} className="text-xs px-3 py-1 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 transition-colors">3 Days</button>
                    <button type="button" onClick={() => setDateRange(5)} className="text-xs px-3 py-1 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 transition-colors">5 Days</button>
                    <button type="button" onClick={() => setDateRange(7)} className="text-xs px-3 py-1 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 transition-colors">7 Days</button>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <input 
                    type="date" 
                    value={startDate} 
                    onChange={(e) => setStartDate(e.target.value)} 
                    className="w-full px-4 py-2 rounded-md bg-black/20 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 [color-scheme:dark]"
                  />
                    <input 
                    type="date" 
                    value={endDate} 
                    onChange={(e) => setEndDate(e.target.value)} 
                    className="w-full px-4 py-2 rounded-md bg-black/20 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 [color-scheme:dark]"
                  />
                </div>
              </div>

              <button type="submit" className="w-full py-2 px-4 rounded-md bg-blue-600 hover:bg-blue-500 text-white font-semibold flex items-center justify-center gap-2 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500">
                <Search className="w-4 h-4" />
                Analyze Weather
              </button>
            </form>

            <LocationMap locationName={location} onLocationSelect={handleLocationSelect} />
          </div>

          <div className="space-y-6">
            {weatherData ? (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="bg-white/5 backdrop-blur-md p-6 rounded-2xl border border-white/10 shadow-xl">
                  <h2 className="text-2xl font-bold text-white mb-6">Forecast for {weatherData.location}</h2>
                  
                  <div className="flex gap-4 overflow-x-auto pb-4 snap-x">
                    {weatherData.results.map((day) => (
                      <div key={day.id} className="snap-start min-w-[120px] bg-black/20 p-4 rounded-xl border border-white/5 text-center flex flex-col items-center hover:bg-black/30 transition-colors">
                        <p className="text-sm text-slate-400">{new Date(day.date).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}</p>
                        <img src={day.icon} alt={day.condition} className="w-16 h-16 my-2 drop-shadow-lg" />
                        <p className="text-2xl font-bold text-white">{day.temperature}°</p>
                        <p className="text-xs text-slate-400 mt-1">{day.condition}</p>
                      </div>
                    ))}
                  </div>

                  <WeatherChart data={weatherData.results} />
                </div>
              </div>
            ) : (
              <div className="h-full min-h-[400px] border-2 border-dashed border-white/10 rounded-2xl flex flex-col items-center justify-center text-slate-500 bg-white/5 backdrop-blur-sm">
                <CloudSun className="w-16 h-16 mb-4 opacity-50 text-blue-400" />
                <p>Run a query to see the meteorological analysis</p>
              </div>
            )}
          </div>

        </div>

        {/* Secondary Content Row: Wikipedia and YouTube */}
        {weatherData && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <WikipediaInfo locationName={weatherData.location} />
            <YouTubeInfo locationName={weatherData.location} />
          </div>
        )}

        <div className="bg-white/5 backdrop-blur-md p-8 rounded-2xl border border-white/10 shadow-xl mt-10">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
            <h2 className="text-2xl font-bold text-white">Analysis History</h2>
            <div className="flex gap-3">
              <button onClick={exportJSON} className="flex items-center px-4 py-2 rounded-md border border-white/20 text-white hover:bg-white/10 transition-colors">
                <DownloadCloud className="w-4 h-4 mr-2" />
                JSON
              </button>
              <button onClick={exportCSV} className="flex items-center px-4 py-2 rounded-md border border-white/20 text-white hover:bg-white/10 transition-colors">
                <DownloadCloud className="w-4 h-4 mr-2" />
                CSV
              </button>
            </div>
          </div>
          
          <div className="space-y-3">
            {history.length === 0 ? (
              <p className="text-slate-400">No history found. Create your first query above.</p>
            ) : (
              history.map((item) => (
                <div key={item.id} className="flex justify-between items-center p-4 bg-black/20 rounded-xl border border-white/5 hover:border-white/10 transition-colors">
                  <div>
                    <h4 className="font-semibold text-white">{item.location}</h4>
                    <p className="text-sm text-slate-400">
                      {new Date(item.startDate).toLocaleDateString()} - {new Date(item.endDate).toLocaleDateString()}
                    </p>
                  </div>
                  <button onClick={() => handleDelete(item.id)} className="p-2 rounded-md text-red-400 hover:text-red-300 hover:bg-red-400/10 transition-colors">
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="text-center py-10 mt-10 border-t border-white/10">
          <h3 className="text-lg text-slate-300 mb-2">Developed by Youssef Ayman</h3>
          <p className="text-sm text-slate-500 max-w-3xl mx-auto">
            <strong>About PM Accelerator:</strong> The Product Manager Accelerator is a premier program designed to help aspiring and current product managers land their dream jobs. They provide mentorship, hands-on experience, and career guidance to build top-tier product management skills.
          </p>
        </div>

      </div>
    </div>
  );
}

