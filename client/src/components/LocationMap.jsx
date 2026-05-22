import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
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

function MapClickHandler({ onLocationSelect, setMarkerPosition }) {
  useMapEvents({
    click: async (e) => {
      const { lat, lng } = e.latlng;
      setMarkerPosition([lat, lng]);
      try {
        const res = await axios.get(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`);
        const city = res.data.address.city || res.data.address.town || res.data.address.village || res.data.address.country;
        if (city) {
          onLocationSelect(city);
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

  return (
    <div className="h-[300px] w-full rounded-xl overflow-hidden border border-white/10 shadow-lg mt-6 z-0">
      <MapContainer center={markerPosition} zoom={2} scrollWheelZoom={false} style={{ height: '100%', width: '100%' }}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
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
