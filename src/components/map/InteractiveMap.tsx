import React, { useEffect, useRef, useState } from 'react';
import { useApp } from '../../context/AppContext';
import { NearbyService, ServiceCategory } from '../../types';
import {
  ShieldAlert,
  Hospital,
  Wrench,
  Fuel,
  Compass,
  Phone,
  Navigation,
  Crosshair,
  ZoomIn,
  ZoomOut,
  Share2,
  CheckCircle2,
  MapPin,
  Flame,
  Pill,
} from 'lucide-react';
import { emergencyService } from '../../services/emergencyService';
import { locationService } from '../../services/locationService';

declare const L: any;

interface InteractiveMapProps {
  services: NearbyService[];
  selectedService: NearbyService | null;
  onSelectService: (service: NearbyService | null) => void;
  onOpenShareModal: () => void;
  heightClass?: string;
}

export const InteractiveMap: React.FC<InteractiveMapProps> = ({
  services,
  selectedService,
  onSelectService,
  onOpenShareModal,
  heightClass = 'h-[420px]',
}) => {
  const { location, refreshLocation, isLoadingLocation } = useApp();
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const leafletMapRef = useRef<any>(null);
  const markersLayerRef = useRef<any>(null);

  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [mapReady, setMapReady] = useState(false);

  const filteredServices =
    filterCategory === 'all'
      ? services
      : services.filter((s) => s.category === filterCategory);

  // Initialize Leaflet Map
  useEffect(() => {
    if (typeof L === 'undefined' || !mapContainerRef.current) return;

    if (!leafletMapRef.current) {
      // Clear container leaflet id if any
      if ((mapContainerRef.current as any)._leaflet_id) {
        (mapContainerRef.current as any)._leaflet_id = null;
      }

      const hasRealCoords = Boolean(location.lat && location.lng && location.lat !== 0);
      const initialCenter: [number, number] = hasRealCoords
        ? [location.lat, location.lng]
        : services.length > 0
        ? [services[0].lat, services[0].lng]
        : [12.8718, 80.0815];

      const map = L.map(mapContainerRef.current, {
        center: initialCenter,
        zoom: 14,
        zoomControl: false,
        attributionControl: false,
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
      }).addTo(map);

      // Attribution small text
      L.control
        .attribution({ position: 'bottomright', prefix: '© OpenStreetMap contributors' })
        .addTo(map);

      leafletMapRef.current = map;
      markersLayerRef.current = L.layerGroup().addTo(map);
      setMapReady(true);

      setTimeout(() => {
        map.invalidateSize();
      }, 200);
    }

    return () => {
      if (leafletMapRef.current) {
        leafletMapRef.current.remove();
        leafletMapRef.current = null;
      }
    };
  }, []);

  // Recenter when location changes
  useEffect(() => {
    if (leafletMapRef.current && location.lat && location.lng && location.lat !== 0) {
      leafletMapRef.current.setView([location.lat, location.lng], leafletMapRef.current.getZoom());
    }
  }, [location.lat, location.lng]);

  // Update Markers when services, filter or selection changes
  useEffect(() => {
    if (!leafletMapRef.current || !markersLayerRef.current || typeof L === 'undefined') return;

    markersLayerRef.current.clearLayers();

    // 1. User Location Pulse Marker (Rendered only with valid coordinates)
    if (location.lat && location.lng && location.lat !== 0) {
      const userPinHtml = `
        <div class="relative flex items-center justify-center">
          <span class="absolute w-8 h-8 rounded-full bg-blue-500/40 animate-ping"></span>
          <span class="absolute w-5 h-5 rounded-full bg-blue-400/50"></span>
          <span class="relative w-3.5 h-3.5 rounded-full bg-blue-600 border-2 border-white shadow-lg"></span>
        </div>
      `;

      const userIcon = L.divIcon({
        className: 'user-pulse-marker',
        html: userPinHtml,
        iconSize: [32, 32],
        iconAnchor: [16, 16],
      });

      const userMarker = L.marker([location.lat, location.lng], { icon: userIcon });
      userMarker.bindPopup(`
        <div class="p-1 text-xs">
          <strong class="text-blue-700 block">Your Current Location</strong>
          <p class="text-slate-600 mt-0.5">${location.address || 'Live GPS Position'}</p>
          <span class="inline-block mt-1 bg-blue-50 text-blue-700 font-bold px-1.5 py-0.5 rounded text-[10px]">
            GPS Accuracy: ±${location.accuracy}m
          </span>
        </div>
      `);
      markersLayerRef.current.addLayer(userMarker);
    }

    // 2. Add Nearby Service Pins
    filteredServices.forEach((svc) => {
      let pinColor = '#2563eb'; // blue
      let letter = 'P';

      if (svc.category === 'hospital') {
        pinColor = '#e84e5f'; // brand red
        letter = 'H';
      } else if (svc.category === 'pharmacy') {
        pinColor = '#059669'; // emerald
        letter = 'Rx';
      } else if (svc.category === 'mechanic') {
        pinColor = '#d97706'; // amber
        letter = 'M';
      } else if (svc.category === 'safe_haven') {
        pinColor = '#7c3aed'; // purple
        letter = 'S';
      } else if (svc.category === 'fire') {
        pinColor = '#ea580c'; // orange
        letter = 'F';
      } else if (svc.category === 'fuel') {
        pinColor = '#0284c7'; // sky
        letter = '⛽';
      }

      const isSelected = selectedService?.id === svc.id;

      const pinHtml = `
        <div style="background-color: ${pinColor}; border: 2px solid #ffffff; transform: ${
        isSelected ? 'scale(1.25)' : 'scale(1)'
      };" class="w-7 h-7 rounded-full text-white font-black text-[11px] flex items-center justify-center shadow-lg transition-transform cursor-pointer">
          ${letter}
        </div>
      `;

      const serviceIcon = L.divIcon({
        className: 'service-pin-marker',
        html: pinHtml,
        iconSize: [28, 28],
        iconAnchor: [14, 14],
      });

      const marker = L.marker([svc.lat, svc.lng], { icon: serviceIcon });

      const popupHtml = `
        <div style="font-family: inherit; min-width: 180px;" class="p-1 text-xs">
          <div style="color: ${pinColor}; font-weight: 800; font-size: 13px;" class="leading-tight">${
        svc.name
      }</div>
          <div style="color: #64748b; font-size: 11px; margin-top: 2px;">${svc.address}</div>
          <div style="display: flex; gap: 6px; margin-top: 6px; align-items: center;">
            <span style="background: #f1f5fb; color: #0f1d32; font-weight: 700; padding: 2px 6px; border-radius: 4px; font-size: 10px;">
              ${svc.distanceKm} km away
            </span>
            <span style="color: #059669; font-weight: 700; font-size: 10px;">${svc.openHours}</span>
          </div>
          <div style="display: flex; gap: 4px; margin-top: 8px;">
            <a href="tel:${svc.phone.split('/')[0].trim()}" style="background: ${pinColor}; color: white; text-decoration: none; padding: 4px 8px; border-radius: 6px; font-weight: bold; font-size: 10px; display: inline-flex; align-items: center; gap: 4px;">
              📞 Call ${svc.phone.split('/')[0].trim()}
            </a>
            <a href="https://www.google.com/maps/dir/?api=1&destination=${svc.lat},${
        svc.lng
      }" target="_blank" style="background: #0f1d32; color: white; text-decoration: none; padding: 4px 8px; border-radius: 6px; font-weight: bold; font-size: 10px;">
              Directions ↗
            </a>
          </div>
        </div>
      `;

      marker.bindPopup(popupHtml);
      marker.on('click', () => {
        onSelectService(svc);
      });

      markersLayerRef.current.addLayer(marker);

      if (isSelected) {
        marker.openPopup();
      }
    });
  }, [filteredServices, selectedService, location]);

  const handleZoomIn = () => {
    leafletMapRef.current?.zoomIn();
  };

  const handleZoomOut = () => {
    leafletMapRef.current?.zoomOut();
  };

  const handleRecenter = () => {
    if (leafletMapRef.current) {
      leafletMapRef.current.setView([location.lat, location.lng], 15);
    }
    refreshLocation();
  };

  return (
    <div className="relative w-full rounded-2xl overflow-hidden border border-slate-200 shadow-md bg-white flex flex-col">
      {/* MAP CONTROLS & FILTER BAR */}
      <div className="p-3 bg-white border-b border-slate-200 flex flex-wrap items-center justify-between gap-2 z-10">
        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto py-0.5 no-scrollbar">
          {[
            { id: 'all', label: 'All (5-10km)', icon: MapPin },
            { id: 'police', label: 'Police', icon: ShieldAlert },
            { id: 'hospital', label: 'Hospitals', icon: Hospital },
            { id: 'pharmacy', label: '24/7 Meds', icon: Pill },
            { id: 'mechanic', label: 'Towing/Mechanic', icon: Wrench },
            { id: 'safe_haven', label: 'Safe Havens', icon: Compass },
          ].map((cat) => {
            const Icon = cat.icon;
            const isSelected = filterCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setFilterCategory(cat.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                  isSelected
                    ? 'bg-[#0f1d32] text-white shadow-xs'
                    : 'bg-[#f1f5fb] text-[#5b6b82] hover:bg-slate-200 hover:text-[#0f1d32]'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{cat.label}</span>
              </button>
            );
          })}
        </div>

        {/* Share Live GPS Button */}
        <button
          onClick={onOpenShareModal}
          className="px-3 py-1.5 rounded-xl bg-blue-50 text-blue-700 hover:bg-blue-100 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer border border-blue-200 shrink-0"
        >
          <Share2 className="w-3.5 h-3.5" />
          <span>Share Live GPS</span>
        </button>
      </div>

      {/* LEAFLET CONTAINER */}
      <div className={`relative w-full ${heightClass} bg-slate-100`}>
        <div ref={mapContainerRef} className="w-full h-full z-0" />

        {/* FLOATING MAP TOOLS */}
        <div className="absolute right-3 top-3 z-20 flex flex-col gap-1.5">
          <button
            onClick={handleRecenter}
            title="Recenter on My Location"
            className="w-9 h-9 rounded-xl bg-white/95 backdrop-blur-md shadow-md border border-slate-200 text-[#0f1d32] hover:text-blue-600 flex items-center justify-center cursor-pointer transition-transform active:scale-90"
          >
            <Crosshair
              className={`w-4 h-4 ${isLoadingLocation ? 'animate-spin text-blue-600' : ''}`}
            />
          </button>
          <button
            onClick={handleZoomIn}
            title="Zoom In"
            className="w-9 h-9 rounded-xl bg-white/95 backdrop-blur-md shadow-md border border-slate-200 text-[#0f1d32] hover:text-blue-600 flex items-center justify-center cursor-pointer transition-transform active:scale-90"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <button
            onClick={handleZoomOut}
            title="Zoom Out"
            className="w-9 h-9 rounded-xl bg-white/95 backdrop-blur-md shadow-md border border-slate-200 text-[#0f1d32] hover:text-blue-600 flex items-center justify-center cursor-pointer transition-transform active:scale-90"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
        </div>

        {/* RADAR / ACTIVE STATUS CHIP */}
        <div className="absolute left-3 bottom-3 z-20 bg-white/95 backdrop-blur-md border border-slate-200 rounded-full px-3 py-1 text-[11px] font-bold text-slate-800 shadow-md flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>
            {location.isLive || location.isPermissionGranted
              ? `${location.town || 'Your Area'} • `
              : ''}
            {filteredServices.length} verified emergency places nearby
          </span>
        </div>
      </div>

      {/* SELECTED SERVICE QUICK CARD / HORIZONTAL TRAY */}
      {selectedService && (
        <div className="p-3.5 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-fadeIn">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-black px-2 py-0.5 rounded-md bg-[#e84e5f] text-white uppercase tracking-wider">
                {selectedService.category}
              </span>
              <h4 className="text-sm font-black text-[#0f1d32]">{selectedService.name}</h4>
            </div>
            <p className="text-xs text-slate-600 mt-1 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span>{selectedService.address}</span>
              <span>•</span>
              <strong className="text-slate-800">{selectedService.distanceKm} km away</strong>
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <a
              href={`tel:${selectedService.phone.split('/')[0].trim()}`}
              onClick={() => emergencyService.callNumber(selectedService.phone)}
              className="px-4 py-2 rounded-xl bg-[#e84e5f] hover:bg-[#d43d4e] text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
            >
              <Phone className="w-3.5 h-3.5" />
              <span>Call {selectedService.phone.split('/')[0].trim()}</span>
            </a>
            <a
              href={locationService.getGoogleMapsDirectionsUrl(
                selectedService.lat,
                selectedService.lng
              )}
              target="_blank"
              rel="noreferrer"
              className="px-3.5 py-2 rounded-xl bg-[#0f1d32] hover:bg-slate-800 text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
            >
              <Navigation className="w-3.5 h-3.5 text-blue-300" />
              <span>Navigate</span>
            </a>
          </div>
        </div>
      )}
    </div>
  );
};
