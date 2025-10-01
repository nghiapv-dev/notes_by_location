import React, { useRef, useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import { useGeoNotes } from "../context/GeoNotesContext";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

import icon from "leaflet/dist/images/marker-icon.png";
import iconShadow from "leaflet/dist/images/marker-shadow.png";

let DefaultIcon = L.divIcon({
  html: `<div class="bg-blue-500 rounded-full w-6 h-6 border-2 border-white shadow-lg flex items-center justify-center">
    <div class="bg-white rounded-full w-2 h-2"></div>
  </div>`,
  className: "custom-div-icon",
  iconSize: [24, 24],
  iconAnchor: [12, 24],
});

const MapController = ({ center, zoom }) => {
  const map = useMap();

  useEffect(() => {
    if (center) {
      map.setView(center, zoom || map.getZoom());
    }
  }, [center, zoom, map]);

  return null;
};

const MapComponent = ({ center, zoom = 13, onMapReady }) => {
  const { notes } = useGeoNotes();
  const mapRef = useRef(null);
  const [userLocation, setUserLocation] = useState(null);
  const [mapCenter, setMapCenter] = useState(null);

  useEffect(() => {
    if (!center && !userLocation) {
      getCurrentLocation();
    }
  }, [center, userLocation]);

  const getCurrentLocation = async () => {
    try {
      if ("geolocation" in navigator) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const userPos = [
              position.coords.latitude,
              position.coords.longitude,
            ];
            setUserLocation(userPos);
            if (!center) {
              setMapCenter(userPos);
            }
          },
          (error) => {
            console.warn("Could not get user location:", error);
            setMapCenter([10.8231, 106.6297]);
          },
          {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 60000,
          }
        );
      } else {
        setMapCenter([10.8231, 106.6297]);
      }
    } catch (error) {
      console.warn("Geolocation error:", error);
      setMapCenter([10.8231, 106.6297]);
    }
  };

  const finalCenter = center || mapCenter || [10.8231, 106.6297];

  useEffect(() => {
    if (mapRef.current && onMapReady) {
      onMapReady(mapRef.current);
    }
  }, [onMapReady]);

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleString("vi-VN", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="relative w-full h-full">
      <MapContainer
        ref={mapRef}
        center={finalCenter}
        zoom={zoom}
        className="w-full h-full rounded-lg"
        zoomControl={true}
        scrollWheelZoom={true}
      >
        <MapController center={center} zoom={zoom} />

        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* User location marker */}
        {userLocation && (
          <Marker
            position={userLocation}
            icon={L.divIcon({
              html: `<div class="bg-blue-600 rounded-full w-4 h-4 border-2 border-white shadow-lg animate-pulse"></div>`,
              className: "user-location-icon",
              iconSize: [16, 16],
              iconAnchor: [8, 8],
            })}
          >
            <Popup>
              <div className="text-center">
                <div className="font-semibold text-blue-600">
                  📍 Your Location
                </div>
                <div className="text-xs text-gray-500">
                  {userLocation[0].toFixed(6)}, {userLocation[1].toFixed(6)}
                </div>
              </div>
            </Popup>
          </Marker>
        )}

        {notes.map((note) => (
          <Marker
            key={note.id}
            position={[note.lat, note.lng]}
            icon={DefaultIcon}
          >
            <Popup className="custom-popup" maxWidth={300}>
              <div className="p-2">
                {/* Image display */}
                {note.imageUrl && (
                  <div className="mb-3">
                    <img
                      src={note.imageUrl}
                      alt="Note attachment"
                      className="w-full h-32 object-cover rounded-lg"
                      onError={(e) => {
                        e.target.style.display = "none";
                      }}
                    />
                  </div>
                )}

                <div className="font-semibold text-gray-800 mb-2">
                  {note.text}
                </div>
                <div className="text-xs text-gray-500 mb-1">
                  📍 {note.lat.toFixed(6)}, {note.lng.toFixed(6)}
                </div>
                <div className="text-xs text-gray-500">
                  🕒 {formatTimestamp(note.timestamp)}
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>

      {notes.length === 0 && (
        <div
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 
                        bg-white bg-opacity-90 p-4 rounded-lg shadow-lg text-center z-10"
        >
          <div className="text-gray-600 mb-2">📍 No notes yet</div>
          <div className="text-sm text-gray-500">
            Tap the "+" button to add your first geo-note!
          </div>
        </div>
      )}
    </div>
  );
};

export default MapComponent;
