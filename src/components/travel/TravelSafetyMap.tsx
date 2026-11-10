import React, { useEffect, useRef, useState } from 'react';
import { RouteOption, RouteMilestone, NearbyRoutePlace } from '../../types/travelSafety';
import {
  Navigation,
  Crosshair,
  ZoomIn,
  ZoomOut,
  MapPin,
  Shield,
  Hospital,
  Fuel,
  AlertTriangle,
  Layers,
} from 'lucide-react';

declare const L: any;

interface TravelSafetyMapProps {
  routes: RouteOption[];
  selectedRouteId: string;
  onSelectRoute: (id: string) => void;
  startCoords: [number, number];
  startName: string;
  destCoords: [number, number];
  destName: string;
  milestones: RouteMilestone[];
  nearbyPlaces: NearbyRoutePlace[];
  isLiveMonitoringActive?: boolean;
  currentProgressKm?: number;
}

export const TravelSafetyMap: React.FC<TravelSafetyMapProps> = ({
  routes,
  selectedRouteId,
  onSelectRoute,
  startCoords,
  startName,
  destCoords,
  destName,
  milestones,
  nearbyPlaces,
  isLiveMonitoringActive = false,
  currentProgressKm = 0,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const leafletMapRef = useRef<any>(null);
  const polylinesLayerRef = useRef<any>(null);
  const markersLayerRef = useRef<any>(null);

  const [filterLayer, setFilterLayer] = useState<'all' | 'police' | 'hospitals' | 'hazards'>('all');

  // Initialize Map
  useEffect(() => {
    if (typeof L === 'undefined' || !mapContainerRef.current) return;

    if (!leafletMapRef.current) {
      if ((mapContainerRef.current as any)._leaflet_id) {
        (mapContainerRef.current as any)._leaflet_id = null;
      }

      const map = L.map(mapContainerRef.current, {
        center: startCoords,
        zoom: 13,
        zoomControl: false,
        attributionControl: false,
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
      }).addTo(map);

      L.control
        .attribution({ position: 'bottomright', prefix: '© OpenStreetMap | Mecra Safety Telemetry' })
        .addTo(map);

      leafletMapRef.current = map;
      polylinesLayerRef.current = L.layerGroup().addTo(map);
      markersLayerRef.current = L.layerGroup().addTo(map);

      setTimeout(() => {
        map.invalidateSize();
      }, 250);
    }

    return () => {
      if (leafletMapRef.current) {
        leafletMapRef.current.remove();
        leafletMapRef.current = null;
      }
    };
  }, []);

  // Update polylines and markers whenever routes, selection, or filter changes
  useEffect(() => {
    if (!leafletMapRef.current || !polylinesLayerRef.current || !markersLayerRef.current) return;

    polylinesLayerRef.current.clearLayers();
    markersLayerRef.current.clearLayers();

    const allRoutePoints: [number, number][] = [];

    // Draw Routes
    routes.forEach((route) => {
      const isSelected = route.id === selectedRouteId;
      const coords = route.coordinates;
      if (!coords || coords.length === 0) return;

      coords.forEach((c) => allRoutePoints.push(c));

      // Selected vs Unselected styling
      const polyline = L.polyline(coords, {
        color: isSelected
          ? route.type === 'recommended'
            ? '#10b981'
            : '#3b82f6'
          : '#94a3b8',
        weight: isSelected ? 6 : 4,
        opacity: isSelected ? 0.95 : 0.5,
        dashArray: isSelected ? undefined : '6, 6',
        lineCap: 'round',
        lineJoin: 'round',
      });

      polyline.on('click', () => {
        onSelectRoute(route.id);
      });

      polyline.bindTooltip(
        `<div class="font-bold text-xs">${route.name} (${route.distanceKm} km • ${route.durationMinutes} min)</div>`,
        { sticky: true }
      );

      polylinesLayerRef.current.addLayer(polyline);
    });

    // START PIN
    const startIcon = L.divIcon({
      className: 'custom-start-marker',
      html: `
        <div style="background-color: #0f1d32; color: white; width: 34px; height: 34px; border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 14px rgba(0,0,0,0.3); border: 3px solid #ffffff; font-weight: 900; font-size: 11px;">
          START
        </div>
      `,
      iconSize: [34, 34],
      iconAnchor: [17, 17],
    });

    const startMarker = L.marker(startCoords, { icon: startIcon }).addTo(markersLayerRef.current);
    startMarker.bindPopup(`
      <div style="font-family: inherit; font-size: 12px; padding: 4px;">
        <strong style="color: #0f1d32; display: block; font-size: 13px;">Departure: ${startName}</strong>
        <span style="color: #64748b;">GPS Coordinates Verified</span>
      </div>
    `);

    // DESTINATION PIN
    const destIcon = L.divIcon({
      className: 'custom-dest-marker',
      html: `
        <div style="background-color: #e84e5f; color: white; width: 34px; height: 34px; border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 14px rgba(232, 78, 95, 0.45); border: 3px solid #ffffff; font-weight: 900; font-size: 11px;">
          DEST
        </div>
      `,
      iconSize: [34, 34],
      iconAnchor: [17, 17],
    });

    const destMarker = L.marker(destCoords, { icon: destIcon }).addTo(markersLayerRef.current);
    destMarker.bindPopup(`
      <div style="font-family: inherit; font-size: 12px; padding: 4px;">
        <strong style="color: #e84e5f; display: block; font-size: 13px;">Destination: ${destName}</strong>
        <span style="color: #64748b;">Arrival Point Verified</span>
      </div>
    `);

    // Add Key Route Landmarks / Milestones along the route
    milestones.forEach((m) => {
      if (m.type === 'start' || m.type === 'destination') return;

      let color = '#3b82f6';
      let symbol = '📍';
      if (m.type === 'police') {
        color = '#1d4ed8';
        symbol = '🛡️';
      } else if (m.type === 'hospital') {
        color = '#e11d48';
        symbol = '🏥';
      } else if (m.type === 'hazard') {
        color = '#ea580c';
        symbol = '⚠️';
      } else if (m.type === 'fuel') {
        color = '#d97706';
        symbol = '⛽';
      } else if (m.type === 'transit') {
        color = '#7c3aed';
        symbol = '🚆';
      }

      // Check layer filter
      if (filterLayer === 'police' && m.type !== 'police') return;
      if (filterLayer === 'hospitals' && m.type !== 'hospital') return;
      if (filterLayer === 'hazards' && m.type !== 'hazard') return;

      const landmarkIcon = L.divIcon({
        className: 'custom-milestone-marker',
        html: `
          <div style="background-color: ${color}; color: white; width: 28px; height: 28px; border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 2px 8px rgba(0,0,0,0.25); border: 2px solid #ffffff; font-size: 13px;">
            ${symbol}
          </div>
        `,
        iconSize: [28, 28],
        iconAnchor: [14, 14],
      });

      const mark = L.marker([m.lat, m.lng], { icon: landmarkIcon }).addTo(markersLayerRef.current);
      mark.bindPopup(`
        <div style="font-family: inherit; font-size: 12px; padding: 4px;">
          <div style="font-weight: 800; color: #0f1d32; font-size: 13px;">${m.title}</div>
          <div style="color: #64748b; margin-top: 2px;">Distance: <strong>${m.distanceFromStartKm} km</strong> from start</div>
          ${m.safetyNote ? `<div style="margin-top: 4px; padding: 4px; background: #f8fafc; border-left: 2px solid ${color}; font-size: 11px;">${m.safetyNote}</div>` : ''}
          ${m.contactNumber ? `<div style="margin-top: 4px;"><a href="tel:${m.contactNumber.split('/')[0].trim()}" style="color: #2563eb; font-weight: bold; text-decoration: none;">📞 ${m.contactNumber}</a></div>` : ''}
        </div>
      `);
    });

    // Fit map bounds to encompass start, destination, and route polylines
    if (allRoutePoints.length > 0) {
      try {
        const bounds = L.latLngBounds(allRoutePoints);
        bounds.extend(startCoords);
        bounds.extend(destCoords);
        leafletMapRef.current.fitBounds(bounds, { padding: [40, 40], maxZoom: 14 });
      } catch {}
    }
  }, [routes, selectedRouteId, startCoords, destCoords, milestones, filterLayer]);

  const handleZoomIn = () => leafletMapRef.current?.zoomIn();
  const handleZoomOut = () => leafletMapRef.current?.zoomOut();
  const handleFitRoute = () => {
    if (!leafletMapRef.current) return;
    const selected = routes.find((r) => r.id === selectedRouteId);
    if (selected && selected.coordinates.length > 0) {
      const bounds = L.latLngBounds(selected.coordinates);
      bounds.extend(startCoords);
      bounds.extend(destCoords);
      leafletMapRef.current.fitBounds(bounds, { padding: [40, 40] });
    }
  };

  const selectedRoute = routes.find((r) => r.id === selectedRouteId) || routes[0];

  return (
    <div className="relative w-full rounded-3xl overflow-hidden border border-[#e5ebf3] shadow-md bg-slate-100">
      {/* MAP CANVAS CONTAINER */}
      <div ref={mapContainerRef} className="w-full h-[360px] sm:h-[420px] lg:h-[460px] z-10" />

      {/* TOP FLOATING ROUTE CHIP & FILTER BAR */}
      <div className="absolute top-3 left-3 right-3 z-20 flex flex-wrap items-center justify-between gap-2 pointer-events-none">
        {/* ACTIVE ROUTE PILL */}
        <div className="pointer-events-auto bg-white/95 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-slate-200 shadow-md flex items-center gap-2 text-xs">
          <span
            className={`w-2.5 h-2.5 rounded-full ${
              selectedRoute?.type === 'recommended' ? 'bg-emerald-500 animate-pulse' : 'bg-blue-500'
            }`}
          />
          <span className="font-extrabold text-[#0f1d32] truncate max-w-[200px] sm:max-w-xs">
            {selectedRoute?.name}
          </span>
          <span className="text-[11px] font-bold text-slate-500 border-l border-slate-200 pl-2">
            {selectedRoute?.distanceKm} km • {selectedRoute?.durationMinutes}m
          </span>
        </div>

        {/* QUICK CATEGORY FILTER PILLS */}
        <div className="pointer-events-auto bg-white/95 backdrop-blur-md p-1 rounded-2xl border border-slate-200 shadow-md flex items-center gap-1 text-[11px] font-bold">
          <button
            onClick={() => setFilterLayer('all')}
            className={`px-2.5 py-1 rounded-xl transition-all cursor-pointer ${
              filterLayer === 'all'
                ? 'bg-[#0f1d32] text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setFilterLayer('police')}
            className={`px-2.5 py-1 rounded-xl transition-all cursor-pointer flex items-center gap-1 ${
              filterLayer === 'police'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-blue-700'
            }`}
          >
            <Shield className="w-3 h-3" />
            <span>Police</span>
          </button>
          <button
            onClick={() => setFilterLayer('hospitals')}
            className={`px-2.5 py-1 rounded-xl transition-all cursor-pointer flex items-center gap-1 ${
              filterLayer === 'hospitals'
                ? 'bg-rose-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-rose-700'
            }`}
          >
            <Hospital className="w-3 h-3" />
            <span>ER</span>
          </button>
          <button
            onClick={() => setFilterLayer('hazards')}
            className={`px-2.5 py-1 rounded-xl transition-all cursor-pointer flex items-center gap-1 ${
              filterLayer === 'hazards'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-amber-700'
            }`}
          >
            <AlertTriangle className="w-3 h-3" />
            <span>Hazards</span>
          </button>
        </div>
      </div>

      {/* MAP FLOATING CONTROLS (RIGHT SIDE) */}
      <div className="absolute right-3 bottom-3 z-20 flex flex-col gap-1.5">
        <button
          onClick={handleFitRoute}
          title="Fit Route Bounds"
          className="w-9 h-9 rounded-xl bg-white/95 backdrop-blur-md border border-slate-200 text-slate-700 hover:text-blue-600 shadow-md flex items-center justify-center cursor-pointer transition-all active:scale-95"
        >
          <Crosshair className="w-4 h-4" />
        </button>
        <button
          onClick={handleZoomIn}
          title="Zoom In"
          className="w-9 h-9 rounded-xl bg-white/95 backdrop-blur-md border border-slate-200 text-slate-700 hover:text-blue-600 shadow-md flex items-center justify-center cursor-pointer transition-all active:scale-95"
        >
          <ZoomIn className="w-4 h-4" />
        </button>
        <button
          onClick={handleZoomOut}
          title="Zoom Out"
          className="w-9 h-9 rounded-xl bg-white/95 backdrop-blur-md border border-slate-200 text-slate-700 hover:text-blue-600 shadow-md flex items-center justify-center cursor-pointer transition-all active:scale-95"
        >
          <ZoomOut className="w-4 h-4" />
        </button>
      </div>

      {/* BOTTOM RADAR CHIP */}
      <div className="absolute left-3 bottom-3 z-20 bg-white/95 backdrop-blur-md border border-slate-200 rounded-full px-3 py-1 text-[11px] font-bold text-slate-800 shadow-md flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
        <span>Live Corridor Safety Telemetry Active</span>
      </div>
    </div>
  );
};
