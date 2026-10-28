import React, { useState } from 'react';
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
} from 'lucide-react';
import { emergencyService } from '../../services/emergencyService';
import { locationService } from '../../services/locationService';

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
  heightClass = 'h-[360px]',
}) => {
  const { location, refreshLocation, isLoadingLocation } = useApp();
  const [zoomLevel, setZoomLevel] = useState(1);
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const [filterCategory, setFilterCategory] = useState<string>('all');

  const filteredServices =
    filterCategory === 'all'
      ? services
      : services.filter((s) => s.category === filterCategory);

  // Map Category Icons & Colors
  const getCategoryColor = (cat: ServiceCategory) => {
    switch (cat) {
      case 'police':
        return { bg: 'bg-blue-600', text: 'text-blue-600', border: 'border-blue-200' };
      case 'hospital':
        return { bg: 'bg-[#e84e5f]', text: 'text-[#e84e5f]', border: 'border-rose-200' };
      case 'mechanic':
        return { bg: 'bg-amber-600', text: 'text-amber-600', border: 'border-amber-200' };
      case 'fuel':
        return { bg: 'bg-emerald-600', text: 'text-emerald-600', border: 'border-emerald-200' };
      case 'safe_haven':
        return { bg: 'bg-indigo-600', text: 'text-indigo-600', border: 'border-indigo-200' };
      default:
        return { bg: 'bg-slate-700', text: 'text-slate-700', border: 'border-slate-200' };
    }
  };

  // Compute 2D SVG / Canvas pin projection relative to center
  const getPinPosition = (service: NearbyService, index: number) => {
    // Generate organic radial spread based on coordinates and index
    const angle = (index * (360 / Math.max(1, services.length)) * Math.PI) / 180;
    const distanceScale = Math.min(service.distanceKm * 45 * zoomLevel, 130);
    const x = 180 + Math.cos(angle) * distanceScale + panOffset.x;
    const y = 170 + Math.sin(angle) * distanceScale + panOffset.y;
    return { x, y };
  };

  return (
    <div className={`relative w-full ${heightClass} bg-[#0e1a2d] overflow-hidden select-none`}>
      {/* MAP GRID & RADAR CANVAS */}
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* Grid pattern */}
          <pattern id="grid" width="30" height="30" patternUnits="userSpaceOnUse">
            <path
              d="M 30 0 L 0 0 0 30"
              fill="none"
              stroke="rgba(255, 255, 255, 0.05)"
              strokeWidth="1"
            />
          </pattern>
          {/* Gradient for trajectory */}
          <linearGradient id="routeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#2563eb" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#e84e5f" stopOpacity="0.9" />
          </linearGradient>
        </defs>

        <rect width="100%" height="100%" fill="url(#grid)" />

        {/* Distance Range Circles around User */}
        <circle
          cx={180 + panOffset.x}
          cy={170 + panOffset.y}
          r={50 * zoomLevel}
          fill="none"
          stroke="rgba(59, 130, 246, 0.18)"
          strokeWidth="1.5"
          strokeDasharray="4 4"
        />
        <circle
          cx={180 + panOffset.x}
          cy={170 + panOffset.y}
          r={105 * zoomLevel}
          fill="none"
          stroke="rgba(59, 130, 246, 0.12)"
          strokeWidth="1"
        />

        {/* Dynamic Route Line if a service is selected */}
        {selectedService && (
          <line
            x1={180 + panOffset.x}
            y1={170 + panOffset.y}
            x2={getPinPosition(selectedService, services.indexOf(selectedService)).x}
            y2={getPinPosition(selectedService, services.indexOf(selectedService)).y}
            stroke="url(#routeGradient)"
            strokeWidth="3"
            strokeDasharray="6 3"
            className="animate-pulse"
          />
        )}
      </svg>

      {/* RADAR SWEEP EFFECT */}
      <div
        className="absolute w-[240px] h-[240px] rounded-full pointer-events-none -translate-x-1/2 -translate-y-1/2 opacity-25 radar-sweep"
        style={{
          left: `${180 + panOffset.x}px`,
          top: `${170 + panOffset.y}px`,
          background:
            'conic-gradient(from 0deg, rgba(37, 99, 235, 0.4) 0deg, rgba(37, 99, 235, 0) 60deg, transparent 360deg)',
        }}
      />

      {/* USER CENTER GPS PIN */}
      <div
        className="absolute z-20 -translate-x-1/2 -translate-y-1/2 cursor-pointer flex flex-col items-center"
        style={{ left: `${180 + panOffset.x}px`, top: `${170 + panOffset.y}px` }}
        onClick={() => {
          onSelectService(null);
          refreshLocation();
        }}
      >
        <div className="relative flex items-center justify-center">
          <span className="w-8 h-8 rounded-full bg-blue-500/25 absolute gps-pulse" />
          <div className="w-4.5 h-4.5 rounded-full bg-blue-600 border-2 border-white shadow-lg flex items-center justify-center text-white">
            <span className="w-1.5 h-1.5 rounded-full bg-white" />
          </div>
        </div>
        <span className="bg-[#0f1d32]/90 text-white text-[9px] font-bold px-2 py-0.5 rounded-full mt-1 backdrop-blur-xs border border-blue-500/30 shadow-md">
          You are here
        </span>
      </div>

      {/* NEARBY SERVICES PINS */}
      {filteredServices.map((service, index) => {
        const pos = getPinPosition(service, index);
        const isSelected = selectedService?.id === service.id;
        const color = getCategoryColor(service.category);

        return (
          <div
            key={service.id}
            onClick={() => onSelectService(service)}
            className={`absolute z-20 -translate-x-1/2 -translate-y-1/2 transition-all duration-300 cursor-pointer flex flex-col items-center ${
              isSelected ? 'scale-125 z-30' : 'hover:scale-110'
            }`}
            style={{ left: `${pos.x}px`, top: `${pos.y}px` }}
          >
            <div
              className={`w-7 h-7 rounded-full flex items-center justify-center shadow-lg border-2 border-white text-white transition-all ${
                color.bg
              } ${isSelected ? 'ring-4 ring-rose-400' : ''}`}
            >
              {service.category === 'police' && <ShieldAlert className="w-3.5 h-3.5" />}
              {service.category === 'hospital' && <Hospital className="w-3.5 h-3.5" />}
              {service.category === 'mechanic' && <Wrench className="w-3.5 h-3.5" />}
              {service.category === 'fuel' && <Fuel className="w-3.5 h-3.5" />}
              {service.category === 'safe_haven' && <Compass className="w-3.5 h-3.5" />}
            </div>

            <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-md bg-[#0f1d32]/90 text-white border border-slate-700/80 mt-1 whitespace-nowrap shadow-xs">
              {service.distanceKm} km
            </span>
          </div>
        );
      })}

      {/* TOP FLOATING CONTROLS: CATEGORY QUICK FILTER PILLS */}
      <div className="absolute top-3 left-3 right-3 z-30 flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
        {[
          { id: 'all', label: 'All Services' },
          { id: 'police', label: 'Police' },
          { id: 'hospital', label: 'Hospitals' },
          { id: 'mechanic', label: 'Mechanics' },
          { id: 'safe_haven', label: 'Safe Havens' },
        ].map((f) => (
          <button
            key={f.id}
            onClick={() => setFilterCategory(f.id)}
            className={`px-2.5 py-1 rounded-full text-[11px] font-bold whitespace-nowrap cursor-pointer transition-all border ${
              filterCategory === f.id
                ? 'bg-[#e84e5f] text-white border-[#e84e5f] shadow-sm'
                : 'bg-[#0f1d32]/85 text-slate-200 border-slate-700 hover:bg-[#0f1d32]'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* RIGHT FLOATING MAP TOOLBAR (Recenter, Zoom, Share) */}
      <div className="absolute right-3 bottom-4 z-30 flex flex-col gap-2">
        <button
          onClick={() => {
            setPanOffset({ x: 0, y: 0 });
            setZoomLevel(1);
            refreshLocation();
          }}
          title="Recenter Map"
          className="w-8 h-8 rounded-full bg-[#0f1d32]/90 text-white border border-slate-700/80 flex items-center justify-center cursor-pointer shadow-lg hover:bg-slate-800 active:scale-95 transition-transform"
        >
          <Crosshair
            className={`w-4 h-4 ${isLoadingLocation ? 'animate-spin text-blue-400' : ''}`}
          />
        </button>

        <button
          onClick={() => setZoomLevel((z) => Math.min(z + 0.25, 2.0))}
          title="Zoom In"
          className="w-8 h-8 rounded-full bg-[#0f1d32]/90 text-white border border-slate-700/80 flex items-center justify-center cursor-pointer shadow-lg hover:bg-slate-800 active:scale-95 transition-transform"
        >
          <ZoomIn className="w-4 h-4" />
        </button>

        <button
          onClick={() => setZoomLevel((z) => Math.max(z - 0.25, 0.75))}
          title="Zoom Out"
          className="w-8 h-8 rounded-full bg-[#0f1d32]/90 text-white border border-slate-700/80 flex items-center justify-center cursor-pointer shadow-lg hover:bg-slate-800 active:scale-95 transition-transform"
        >
          <ZoomOut className="w-4 h-4" />
        </button>

        <button
          onClick={onOpenShareModal}
          title="Share My Live Coordinates"
          className="w-8 h-8 rounded-full bg-[#e84e5f] text-white flex items-center justify-center cursor-pointer shadow-lg hover:bg-[#d33c4d] active:scale-95 transition-transform"
        >
          <Share2 className="w-4 h-4" />
        </button>
      </div>

      {/* BOTTOM POPUP SHEET WHEN A SERVICE PIN IS SELECTED */}
      {selectedService && (
        <div className="absolute left-3 right-3 bottom-3 z-30 bg-white rounded-2xl p-3.5 shadow-2xl border border-slate-200 animate-in fade-in slide-in-from-bottom-2">
          <div className="flex items-start justify-between gap-2">
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-black text-[#0f1d32]">
                  {selectedService.name}
                </span>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-sm bg-emerald-50 text-emerald-700">
                  {selectedService.isOpen24x7 ? '24/7' : 'Open'}
                </span>
              </div>
              <p className="text-[11px] text-[#5b6b82] mt-0.5 leading-snug line-clamp-1">
                {selectedService.address}
              </p>
            </div>

            <button
              onClick={() => onSelectService(null)}
              className="text-slate-400 hover:text-slate-700 text-xs font-bold p-1"
            >
              ✕
            </button>
          </div>

          <div className="flex items-center justify-between mt-2.5 pt-2 border-t border-slate-100 text-xs">
            <span className="font-bold text-[#0f1d32]">
              📍 {selectedService.distanceKm} km away
            </span>

            <div className="flex items-center gap-2">
              <button
                onClick={() => emergencyService.callNumber(selectedService.phone)}
                className="px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] flex items-center gap-1 cursor-pointer shadow-xs active:scale-95"
              >
                <Phone className="w-3 h-3" />
                <span>Call</span>
              </button>

              <a
                href={locationService.getGoogleMapsDirectionsUrl(
                  selectedService.lat,
                  selectedService.lng
                )}
                target="_blank"
                rel="noreferrer"
                className="px-2.5 py-1.5 rounded-lg bg-[#e84e5f] hover:bg-[#d33c4d] text-white font-bold text-[11px] flex items-center gap-1 cursor-pointer shadow-xs active:scale-95"
              >
                <Navigation className="w-3 h-3" />
                <span>Directions</span>
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
