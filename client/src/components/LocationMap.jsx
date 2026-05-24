import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import axios from 'axios';

import L from 'leaflet';
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

function MapUpdater({ center }) {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.flyTo(center, 10, { duration: 1.5 });
    }
  }, [center, map]);
  return null;
}

function MapClickHandler({ onLocationSelect, setMarkerPosition }) {
  useMapEvents({
    click: async (e) => {
      const { lat, lng } = e.latlng;
      setMarkerPosition([lat, lng]);
      try {
        const res = await axios.get(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`);
        const address = res.data?.address;
        if (address) {
          const city = address.city || address.town || address.village || address.state || address.country;
          if (city) {
            onLocationSelect(city);
          }
        }
      } catch (error) {
        console.error("Reverse geocoding failed", error);
      }
    },
  });
  return null;
}

export default function LocationMap({ locationName, onLocationSelect }) {
  const [markerPosition, setMarkerPosition] = useState([51.505, -0.09]);

  // Update map pin when user types a location name
  useEffect(() => {
    if (!locationName) return;
    
    // Simple debounce to prevent spamming the geocoding API while typing
    const delayDebounceFn = setTimeout(async () => {
      try {
        const res = await axios.get(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(locationName)}&limit=1`);
        if (res.data && res.data.length > 0) {
          const { lat, lon } = res.data[0];
          setMarkerPosition([parseFloat(lat), parseFloat(lon)]);
        }
      } catch (err) {
        console.error("Forward geocoding failed", err);
      }
    }, 1000);

    return () => clearTimeout(delayDebounceFn);
  }, [locationName]);

  return (
    <div className="h-[300px] w-full rounded-xl overflow-hidden border border-white/10 shadow-lg z-0">
      <MapContainer center={markerPosition} zoom={2} scrollWheelZoom={false} style={{ height: '100%', width: '100%' }}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <MapUpdater center={markerPosition} />
        <MapClickHandler onLocationSelect={onLocationSelect} setMarkerPosition={setMarkerPosition} />
        <Marker position={markerPosition}>
          <Popup>
            {locationName ? `Selected: ${locationName}` : "Click anywhere on the map to search!"}
          </Popup>
        </Marker>
      </MapContainer>
    </div>
  );
}
