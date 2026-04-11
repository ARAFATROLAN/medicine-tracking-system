import React, { useState, useEffect, useRef } from "react";
import vehicleAPI from "../../Services/vehicleAPI";
import "./VehicleTracking.css";

declare global {
  interface Window {
    L?: any;
  }
}

interface Vehicle {
  id: number;
  number_plate: string;
  vehicle_type: string;
  driver_name: string;
  status: string;
  latestLocation?: VehicleLocation;
}

interface VehicleLocation {
  id: number;
  latitude: number;
  longitude: number;
  speed?: number;
  accuracy?: number;
  address?: string;
  timestamp: string;
}

const DEFAULT_CENTER = { lat: 24.8607, lng: 67.0011 };

const VehicleTracking: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [locationHistory, setLocationHistory] = useState<VehicleLocation[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mapReady, setMapReady] = useState(false);
  const [mapError, setMapError] = useState<string | null>(null);
  const mapRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  const routeLineRef = useRef<any>(null);

  useEffect(() => {
    loadLeafletResources();
  }, []);

  useEffect(() => {
    if (mapReady && !mapRef.current) {
      initializeMap();
    }
  }, [mapReady]);

  const loadLeafletResources = () => {
    if (window.L) {
      setMapReady(true);
      return;
    }

    const leafletCssId = "leaflet-css";
    if (!document.getElementById(leafletCssId)) {
      const link = document.createElement("link");
      link.id = leafletCssId;
      link.rel = "stylesheet";
      link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
      link.crossOrigin = "";
      document.head.appendChild(link);
    }

    const script = document.createElement("script");
    script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
    script.async = true;
    script.defer = true;
    script.onload = () => {
      setMapReady(true);
    };
    script.onerror = () => {
      setMapError("Unable to load map library.");
    };
    document.body.appendChild(script);
  };

  const initializeMap = () => {
    const mapElement = document.getElementById("tracking-map");
    if (!mapElement || !window.L) return;

    if (mapRef.current) {
      mapRef.current.invalidateSize();
      return;
    }

    const map = window.L.map(mapElement, {
      center: [DEFAULT_CENTER.lat, DEFAULT_CENTER.lng],
      zoom: 12,
      zoomControl: true,
      attributionControl: true,
    });

    const tileLayer = window.L.tileLayer("https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png", {
      maxZoom: 19,
      subdomains: ["a", "b", "c"],
      detectRetina: true,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(map);

    tileLayer.on("tileerror", () => {
      setMapError("Unable to load map tiles. Check network access or try again.");
    });

    mapRef.current = map;

    setTimeout(() => {
      map.invalidateSize();
      map.setView([DEFAULT_CENTER.lat, DEFAULT_CENTER.lng], 12);
      loadInTransitVehicles();
    }, 200);
  };

  const clearMap = () => {
    markersRef.current.forEach((marker) => {
      if (marker && typeof marker.remove === "function") {
        marker.remove();
      }
    });
    markersRef.current = [];
    if (routeLineRef.current && typeof routeLineRef.current.remove === "function") {
      routeLineRef.current.remove();
      routeLineRef.current = null;
    }
  };

  const loadInTransitVehicles = async () => {
    if (!mapRef.current || !window.L) return;

    try {
      const response = await vehicleAPI.getInTransitVehicles(25);
      const vehicles = response.data?.data || response.data || [];

      clearMap();
      const bounds = window.L.latLngBounds([]);

      vehicles.forEach((vehicle: any) => {
        const location = vehicle.latestLocation;
        if (!location) return;

        const position: [number, number] = [Number(location.latitude), Number(location.longitude)];

        const marker = window.L.circleMarker(position, {
          radius: 8,
          color: "#1d4ed8",
          fillColor: "#3b82f6",
          fillOpacity: 0.9,
          weight: 2,
        }).addTo(mapRef.current);

        marker.bindPopup(`
          <div style="font-size:13px; line-height:1.4;">
            <strong>${vehicle.number_plate}</strong><br/>
            ${vehicle.driver_name || "No driver"}<br/>
            Status: ${vehicle.status}
          </div>
        `);

        markersRef.current.push(marker);
        bounds.extend(position);
      });

      if (bounds.isValid()) {
        mapRef.current.fitBounds(bounds, { padding: [40, 40] });
      }
    } catch (err) {
      console.error("Failed to load in-transit vehicles:", err);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      setError("Please enter a vehicle number plate.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await vehicleAPI.getVehicleByNumberPlate(searchQuery.trim());
      if (response.data?.success) {
        const vehicle = response.data.data;
        setSelectedVehicle(vehicle);

        if (vehicle.latestLocation) {
          setLocationHistory([vehicle.latestLocation]);
          showVehicleOnMap(vehicle.latestLocation, vehicle);
        } else {
          await fetchLocationHistory(vehicle.id);
        }
      }
    } catch (err: any) {
      setSelectedVehicle(null);
      setLocationHistory([]);
      setError(err.response?.data?.message || "Vehicle not found. Please check the number plate.");
    } finally {
      setLoading(false);
    }
  };

  const fetchLocationHistory = async (vehicleId: number) => {
    try {
      const response = await vehicleAPI.getLocationHistory(vehicleId, 120);
      if (response.data?.success) {
        const locations = response.data.data.locations;
        setLocationHistory(locations);
        if (locations.length > 0) {
          showRouteOnMap(locations);
        }
      }
    } catch (err) {
      console.error("Failed to fetch location history:", err);
    }
  };

  const showVehicleOnMap = (location: VehicleLocation, vehicle: Vehicle) => {
    if (!mapRef.current || !window.L) return;

    clearMap();

    const position: [number, number] = [Number(location.latitude), Number(location.longitude)];

    const marker = window.L.circleMarker(position, {
      radius: 10,
      color: "#dc2626",
      fillColor: "#f87171",
      fillOpacity: 0.95,
      weight: 2,
    }).addTo(mapRef.current);

    marker.bindPopup(`
      <div style="font-size:13px; line-height:1.4;">
        <strong>${vehicle.number_plate}</strong><br/>
        ${vehicle.vehicle_type}<br/>
        Driver: ${vehicle.driver_name}
      </div>
    `);

    markersRef.current.push(marker);
    mapRef.current.setView(position, 14);
    marker.openPopup();
  };

  const showRouteOnMap = (locations: VehicleLocation[]) => {
    if (!mapRef.current || !window.L) return;

    clearMap();

    const path = locations.map((location) => [Number(location.latitude), Number(location.longitude)]) as [number, number][];

    if (path.length === 0) return;

    routeLineRef.current = window.L.polyline(path, {
      color: "#2563eb",
      weight: 5,
      opacity: 0.9,
      lineCap: "round",
    }).addTo(mapRef.current);

    const startMarker = window.L.circleMarker(path[0], {
      radius: 7,
      color: "#16a34a",
      fillColor: "#6ee7b7",
      fillOpacity: 0.95,
      weight: 2,
    }).addTo(mapRef.current);

    const endMarker = window.L.circleMarker(path[path.length - 1], {
      radius: 9,
      color: "#b91c1c",
      fillColor: "#fca5a5",
      fillOpacity: 0.95,
      weight: 2,
    }).addTo(mapRef.current);

    markersRef.current.push(startMarker, endMarker);

    const bounds = window.L.latLngBounds(path);
    if (bounds.isValid()) {
      mapRef.current.fitBounds(bounds, { padding: [40, 40] });
    }
  };

  const getRouteDistance = (): string => {
    if (locationHistory.length < 2) return "0 km";

    let distance = 0;
    for (let i = 0; i < locationHistory.length - 1; i++) {
      distance += calculateDistance(
        locationHistory[i].latitude,
        locationHistory[i].longitude,
        locationHistory[i + 1].latitude,
        locationHistory[i + 1].longitude
      );
    }
    return (distance / 1000).toFixed(2) + " km";
  };

  const calculateDistance = (
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ): number => {
    const R = 6371;
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c * 1000;
  };

  return (
    <div className="vehicle-tracking-container">
      <div className="tracking-header">
        <h2>Track Vehicle in Transit</h2>
        <button className="btn-close" onClick={onClose}>
          ✕
        </button>
      </div>

      <div className="tracking-content">
        <div className="search-panel">
          <div className="search-box">
            <input
              type="text"
              placeholder="Search by number plate (e.g., ABC-12345)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === "Enter") handleSearch();
              }}
              className="search-input"
            />
            <button onClick={handleSearch} className="btn-search" disabled={loading}>
              {loading ? "Searching..." : "Track"}
            </button>
          </div>

          {error && <div className="alert alert-error">{error}</div>}

          {selectedVehicle && (
            <div className="vehicle-info">
              <h3>Vehicle Details</h3>
              <div className="info-grid">
                <div className="info-item">
                  <label>Number Plate:</label>
                  <span>{selectedVehicle.number_plate}</span>
                </div>
                <div className="info-item">
                  <label>Type:</label>
                  <span>{selectedVehicle.vehicle_type}</span>
                </div>
                <div className="info-item">
                  <label>Driver:</label>
                  <span>{selectedVehicle.driver_name}</span>
                </div>
                <div className="info-item">
                  <label>Status:</label>
                  <span className={`status-badge status-${selectedVehicle.status}`}>
                    {selectedVehicle.status}
                  </span>
                </div>
              </div>
              {selectedVehicle.latestLocation && (
                <div className="location-info">
                  <h4>Current Location</h4>
                  <p>
                    <strong>Speed:</strong> {selectedVehicle.latestLocation.speed || 0} km/h
                  </p>
                  <p>
                    <strong>Accuracy:</strong> {selectedVehicle.latestLocation.accuracy || "N/A"} m
                  </p>
                  <p>
                    <strong>Address:</strong> {selectedVehicle.latestLocation.address || "Unknown"}
                  </p>
                  <p>
                    <strong>Time:</strong> {new Date(selectedVehicle.latestLocation.timestamp).toLocaleString()}
                  </p>
                </div>
              )}
              {locationHistory.length > 1 && (
                <div className="route-stats">
                  <div className="stat">
                    <span>Distance Covered:</span>
                    <strong>{getRouteDistance()}</strong>
                  </div>
                  <div className="stat">
                    <span>Positions Tracked:</span>
                    <strong>{locationHistory.length}</strong>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="map-panel">
          <div id="tracking-map" className="tracking-map"></div>
          {mapError && <div className="map-error">{mapError}</div>}
          {!mapReady && !mapError && <div className="map-loading">Loading map...</div>}
        </div>
      </div>
    </div>
  );
};

export default VehicleTracking;
