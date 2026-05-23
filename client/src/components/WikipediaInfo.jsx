import React, { useEffect, useState } from 'react';
import axios from 'axios';

export default function WikipediaInfo({ locationName }) {
  const [info, setInfo] = useState(null);
  const [loading, setLoading] = useState(false);

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  useEffect(() => {
    if (!locationName) return;

    const fetchInfo = async () => {
      setLoading(true);
      try {
        const res = await axios.get(`${API_URL}/weather/info/${locationName}`);
        setInfo(res.data);
      } catch (err) {
        setInfo(null);
      } finally {
        setLoading(false);
      }
    };

    fetchInfo();
  }, [locationName]);

  if (loading) {
    return <div className="mt-6 text-sm text-slate-400">Loading Wikipedia info...</div>;
  }

  if (!info) return null;

  return (
    <div className="h-full bg-white/5 border border-white/10 text-white backdrop-blur-md rounded-2xl overflow-hidden shadow-xl">
      <div className="p-6 border-b border-white/10">
        <h3 className="text-xl font-semibold flex items-center gap-3">
          {info.thumbnail && <img src={info.thumbnail} alt={info.title} className="w-10 h-10 rounded-full object-cover" />}
          About {info.title}
        </h3>
      </div>
      <div className="p-6">
        <p className="text-slate-300 leading-relaxed whitespace-pre-wrap text-sm md:text-base">
          {info.extract}
        </p>
        {info.content_urls?.desktop?.page && (
          <div className="mt-4 pt-4 border-t border-white/10">
            <a 
              href={info.content_urls.desktop.page} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-blue-400 hover:text-blue-300 text-sm font-medium transition-colors"
            >
              Read more on Wikipedia →
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
