import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { InteractiveMap } from '../components/map/InteractiveMap';
import { LocationShareModal } from '../components/map/LocationShareModal';
import { NearbyService, ServiceCategory } from '../types';
import { localDb } from '../services/storage';
import { emergencyService } from '../services/emergencyService';
import { locationService } from '../services/locationService';
import {
  Search,
  Phone,
  Navigation,
  Share2,
  ShieldAlert,
  Hospital,
  Wrench,
  Fuel,
  Compass,
} from 'lucide-react';
import { HonestStatusBadge } from '../components/common/HonestStatusBadge';

export const MapExplorerPage: React.FC = () => {
  const { location } = useApp();
  const [selectedService, setSelectedService] = useState<NearbyService | null>(null);
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const allServices = localDb.getServices();

  const filtered = allServices.filter(
    (s) =>
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="pb-6 text-left">
      {/* INTERACTIVE VECTOR MAP */}
      <InteractiveMap
        services={allServices}
        selectedService={selectedService}
        onSelectService={setSelectedService}
        onOpenShareModal={() => setIsShareOpen(true)}
        heightClass="h-[380px]"
      />

      {/* SEARCH BAR & LIST */}
      <div className="p-4 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-black text-[#0f1d32] uppercase tracking-wider">
            Nearby Rescue & Utility Points ({filtered.length})
          </span>
          <HonestStatusBadge type="verified" label="OSM GEODATA" />
        </div>

        {/* SEARCH INPUT */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search police, hospitals, mechanics, fuel..."
            className="w-full pl-9 pr-4 py-2.5 bg-white border border-[#e5ebf3] rounded-2xl text-xs text-[#0f1d32] shadow-2xs focus:outline-hidden focus:ring-2 focus:ring-[#e84e5f]"
          />
        </div>

        {/* SERVICES LIST */}
        <div className="space-y-2.5 mt-2">
          {filtered.map((s) => {
            const isSelected = selectedService?.id === s.id;
            return (
              <div
                key={s.id}
                onClick={() => setSelectedService(s)}
                className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 text-left ${
                  isSelected
                    ? 'bg-rose-50/70 border-[#e84e5f] shadow-xs'
                    : 'bg-white border-[#e5ebf3] hover:bg-slate-50'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 text-white ${
                      s.category === 'police'
                        ? 'bg-blue-600'
                        : s.category === 'hospital'
                        ? 'bg-[#e84e5f]'
                        : s.category === 'mechanic'
                        ? 'bg-amber-600'
                        : s.category === 'fuel'
                        ? 'bg-emerald-600'
                        : 'bg-indigo-600'
                    }`}
                  >
                    {s.category === 'police' && <ShieldAlert className="w-4 h-4" />}
                    {s.category === 'hospital' && <Hospital className="w-4 h-4" />}
                    {s.category === 'mechanic' && <Wrench className="w-4 h-4" />}
                    {s.category === 'fuel' && <Fuel className="w-4 h-4" />}
                    {s.category === 'safe_haven' && <Compass className="w-4 h-4" />}
                  </div>

                  <div>
                    <strong className="text-xs sm:text-sm font-bold text-[#0f1d32] block">
                      {s.name}
                    </strong>
                    <span className="text-[11px] text-[#5b6b82] block line-clamp-1">
                      {s.address}
                    </span>
                    <span className="text-[10px] text-emerald-600 font-semibold block mt-1">
                      📍 {s.distanceKm} km away • {s.openHours}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      emergencyService.callNumber(s.phone);
                    }}
                    className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-700 hover:bg-emerald-100 flex items-center justify-center cursor-pointer shadow-2xs"
                  >
                    <Phone className="w-3.5 h-3.5" />
                  </button>

                  <a
                    href={locationService.getGoogleMapsDirectionsUrl(s.lat, s.lng)}
                    target="_blank"
                    rel="noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="w-8 h-8 rounded-full bg-[#f8fafd] border border-[#e5ebf3] text-slate-700 hover:text-blue-600 flex items-center justify-center cursor-pointer shadow-2xs"
                  >
                    <Navigation className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <LocationShareModal isOpen={isShareOpen} onClose={() => setIsShareOpen(false)} />
    </div>
  );
};
