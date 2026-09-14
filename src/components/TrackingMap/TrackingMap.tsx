import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import './TrackingMap.css';

interface TrackingMapProps {
  startLat?: number;
  startLng?: number;
  destLat?: number;
  destLng?: number;
  orderStatus?: string;
  driverName?: string;
  driverPhone?: string;
  destinationAddress?: string;
}

export default function TrackingMap({
  startLat = 30.7180,
  startLng = 76.7350,
  destLat = 30.7046,
  destLng = 76.7179,
  orderStatus = 'Preparing',
  driverName = 'Rajesh Kumar',
  driverPhone = '+91 98765 43210',
  destinationAddress,
}: TrackingMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const driverMarkerRef = useRef<L.Marker | null>(null);
  const [distanceKm, setDistanceKm] = useState<string>('2.8 km');
  const [etaMins, setEtaMins] = useState<string>('18–24 mins');

  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Destroy existing instance if any
    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
    }

    const sLat = startLat || 30.7180;
    const sLng = startLng || 76.7350;
    const dLat = destLat || 30.7046;
    const dLng = destLng || 76.7179;

    const startCoords: [number, number] = [sLat, sLng];
    const destCoords: [number, number] = [dLat, dLng];

    // Calculate approximate driver position based on order status
    let driverProgress = 0.15; // Restaurant
    if (orderStatus === 'ReadyForPickup') driverProgress = 0.25;
    else if (orderStatus === 'OutForDelivery') driverProgress = 0.65;
    else if (orderStatus === 'Delivered') driverProgress = 1.0;

    const driverCoords: [number, number] = [
      sLat + (dLat - sLat) * driverProgress,
      sLng + (dLng - sLng) * driverProgress,
    ];

    // Initialize Leaflet Map
    const map = L.map(mapContainerRef.current, {
      zoomControl: false,
      attributionControl: false,
    }).setView(driverCoords, 14);

    mapInstanceRef.current = map;

    // Add OpenStreetMap Tile Layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
    }).addTo(map);

    // Zoom control in top-right
    L.control.zoom({ position: 'topright' }).addTo(map);

    // 1. Restaurant / Kitchen Marker Icon
    const restaurantIcon = L.divIcon({
      html: `
        <div class="map-marker-pin restaurant-pin" title="QuickBite Partner Kitchen">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M18 2v6a3 3 0 0 1-3 3 3 3 0 0 1-3-3V2"/>
            <path d="M15 2v14a4 4 0 0 1-4 4H7"/>
            <path d="M7 2v20"/>
          </svg>
        </div>
      `,
      className: 'custom-leaflet-div-icon',
      iconSize: [38, 38],
      iconAnchor: [19, 19],
    });

    L.marker(startCoords, { icon: restaurantIcon })
      .addTo(map)
      .bindPopup('<b>🍳 QuickBite Kitchen</b><br>Freshly prepared here');

    // 2. Customer Destination Marker Icon
    const homeIcon = L.divIcon({
      html: `
        <div class="map-marker-pin home-pin" title="Your Delivery Destination">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
            <polyline points="9 22 9 12 15 12 15 22"/>
          </svg>
        </div>
      `,
      className: 'custom-leaflet-div-icon',
      iconSize: [38, 38],
      iconAnchor: [19, 19],
    });

    L.marker(destCoords, { icon: homeIcon })
      .addTo(map)
      .bindPopup(`<b>📍 Delivery Address</b><br>${destinationAddress || 'Your Location'}`);

    // 3. Delivery Rider Marker with Pulse Ring
    const driverIcon = L.divIcon({
      html: `
        <div class="map-marker-pin driver-pin" title="Delivery Partner">
          <div class="map-pulse-ring"></div>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#E85D22" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="5.5" cy="17.5" r="2.5"/>
            <circle cx="18.5" cy="17.5" r="2.5"/>
            <path d="M5.5 17.5l4-8h4l2 4h3"/>
            <path d="M14 9l-2-4h-3"/>
          </svg>
        </div>
      `,
      className: 'custom-leaflet-div-icon',
      iconSize: [42, 42],
      iconAnchor: [21, 21],
    });

    const driverMarker = L.marker(driverCoords, { icon: driverIcon, zIndexOffset: 1000 })
      .addTo(map)
      .bindPopup(`<b>🛵 ${driverName}</b><br>Status: ${orderStatus}`);

    driverMarkerRef.current = driverMarker;

    // 4. Draw Polyline Route
    const routeLine = L.polyline([startCoords, driverCoords, destCoords], {
      color: '#E85D22',
      weight: 4,
      dashArray: '8, 8',
      opacity: 0.85,
    }).addTo(map);

    // Fit bounds
    map.fitBounds(routeLine.getBounds(), { padding: [48, 48] });

    // Approx distance calc
    const dist = (Math.sqrt(Math.pow(sLat - dLat, 2) + Math.pow(sLng - dLng, 2)) * 111).toFixed(1);
    setDistanceKm(`${dist} km`);
    const mins = Math.max(10, Math.round(Number(dist) * 6));
    setEtaMins(`${mins}–${mins + 8} mins`);

    // Clean up
    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, [startLat, startLng, destLat, destLng, orderStatus, destinationAddress]);

  const handleRecenter = () => {
    if (!mapInstanceRef.current) return;
    const sLat = startLat || 30.7180;
    const sLng = startLng || 76.7350;
    const dLat = destLat || 30.7046;
    const dLng = destLng || 76.7179;
    const bounds = L.latLngBounds([
      [sLat, sLng],
      [dLat, dLng],
    ]);
    mapInstanceRef.current.fitBounds(bounds, { padding: [48, 48] });
  };

  return (
    <div className="tracking-map-container">
      {/* Live OSM Leaflet Map Container */}
      <div ref={mapContainerRef} className="leaflet-map-view" />

      {/* Floating Header Card */}
      <div className="map-floating-overlay-top">
        <div className="map-badge-live">
          <span className="live-dot" /> LIVE TRACKING
        </div>
        <div className="map-meta-chips">
          <span className="map-chip">⏱️ {etaMins}</span>
          <span className="map-chip">📍 {distanceKm}</span>
        </div>
      </div>

      {/* Recenter Action Button */}
      <button
        className="map-recenter-btn"
        onClick={handleRecenter}
        title="Recenter Route"
        aria-label="Recenter Map"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <circle cx="12" cy="12" r="3" />
          <path d="M12 2v4M12 18v4M2 12h4M18 12h4" />
        </svg>
      </button>

      {/* Driver Floating Bottom Bar */}
      <div className="map-floating-driver-bar">
        <div className="map-driver-avatar">🛵</div>
        <div className="map-driver-info">
          <div className="map-driver-name">{driverName}</div>
          <div className="map-driver-status">
            {orderStatus === 'OutForDelivery' ? '⚡ On the way with your food' : '👨‍🍳 Waiting for kitchen dispatch'}
          </div>
        </div>
        {driverPhone && (
          <a href={`tel:${driverPhone}`} className="map-driver-call-btn" title="Call Delivery Partner">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
            </svg>
            Call
          </a>
        )}
      </div>
    </div>
  );
}
