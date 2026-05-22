import React, { useState, useEffect } from 'react';
import axios from 'axios';

export default function YouTubeInfo({ locationName }) {
  const [videoId, setVideoId] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!locationName) return;

    const fetchVideo = async () => {
      setLoading(true);
      try {
        const res = await axios.get(`http://localhost:5000/weather/youtube/${encodeURIComponent(locationName)}`);
        setVideoId(res.data.videoId);
      } catch (err) {
        setVideoId(null);
      } finally {
        setLoading(false);
      }
    };

    fetchVideo();
  }, [locationName]);

  if (!locationName) return null;
  
  if (loading) {
    return <div className="mt-6 text-sm text-slate-400">Loading YouTube video...</div>;
  }

  if (!videoId) return null;

  return (
    <div className="h-full flex flex-col bg-white/5 border border-white/10 text-white backdrop-blur-md rounded-2xl overflow-hidden shadow-xl">
      <div className="p-6 border-b border-white/10 shrink-0">
        <h3 className="text-xl font-semibold flex items-center gap-3">
          <span className="text-red-500">▶</span> Explore {locationName}
        </h3>
      </div>
      <div className="p-4 flex-1 min-h-[300px]">
        <iframe
          width="100%"
          height="100%"
          src={`https://www.youtube.com/embed/${videoId}`}
          title={`YouTube video for ${locationName}`}
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="rounded-xl"
        ></iframe>
      </div>
    </div>
  );
}
