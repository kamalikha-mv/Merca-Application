import React, { useState } from 'react';
import { NearbyRoutePlace, PlaceCategory } from '../../types/travelSafety';
import {
  Shield,
  Hospital,
  Pill,
  Fuel,
  Wrench,
  Utensils,
  Hotel,
  Compass,
  Train,
  Bus,
  Phone,
  Navigation,
  Clock,
  Star,
  Search,
  ExternalLink,
} from 'lucide-react';

interface NearbyPlacesDirectoryProps {
  places: NearbyRoutePlace[];
}

export const NearbyPlacesDirectory: React.FC<NearbyPlacesDirectoryProps> = ({ places }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const categories: { key: string; label: string; icon: any; count: number }[] = [
    { key: 'all', label: 'All Places', icon: Compass, count: places.length },
    {
      key: 'police',
      label: 'Police',
      icon: Shield,
      count: places.filter((p) => p.category === 'police').length,
    },
    {
      key: 'hospital',
      label: 'Hospitals',
      icon: Hospital,
      count: places.filter((p) => p.category === 'hospital').length,
    },
    {
      key: 'pharmacy',
      label: 'Pharmacies',
      icon: Pill,
      count: places.filter((p) => p.category === 'pharmacy').length,
    },
    {
      key: 'ambulance',
      label: 'Ambulance',
      icon: Hospital,
      count: places.filter((p) => p.category === 'ambulance').length,
    },
    {
      key: 'railway',
      label: 'Railways',
      icon: Train,
      count: places.filter((p) => p.category === 'railway').length,
    },
    {
      key: 'bus',
      label: 'Bus Terminals',
      icon: Bus,
      count: places.filter((p) => p.category === 'bus').length,
    },
    {
      key: 'fuel',
      label: 'Fuel & EV',
      icon: Fuel,
      count: places.filter((p) => p.category === 'fuel').length,
    },
    {
      key: 'mechanic',
      label: 'Mechanics',
      icon: Wrench,
      count: places.filter((p) => p.category === 'mechanic').length,
    },
    {
      key: 'restaurant',
      label: 'Restaurants',
      icon: Utensils,
      count: places.filter((p) => p.category === 'restaurant').length,
    },
    {
      key: 'hotel',
      label: 'Hotels',
      icon: Hotel,
      count: places.filter((p) => p.category === 'hotel').length,
    },
    {
      key: 'public_place',
      label: 'Public Havens',
      icon: Compass,
      count: places.filter((p) => p.category === 'public_place').length,
    },
  ];

  const filteredPlaces = places.filter((p) => {
    const matchesCat = selectedCategory === 'all' || p.category === selectedCategory;
    const matchesSearch =
      searchQuery.trim() === '' ||
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.category.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  return (
    <div className="space-y-4">
      {/* SECTION HEADER & SEARCH INPUT */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-sm font-black text-[#0f1d32] uppercase tracking-wider flex items-center gap-2">
            <Compass className="w-4 h-4 text-blue-600" />
            Verified Nearby Safe Hubs & Emergency Services
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Every location features verified distance, 24/7 hours, direct phone line, and map route.
          </p>
        </div>

        {/* SEARCH BAR */}
        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search nearby places..."
            className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-slate-200 text-xs text-[#0f1d32] placeholder-slate-400 focus:outline-none focus:border-blue-500 bg-white"
          />
        </div>
      </div>

      {/* HORIZONTAL CATEGORY PILL BAR */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        {categories
          .filter((c) => c.count > 0 || c.key === 'all')
          .map((cat) => {
            const Icon = cat.icon;
            const isSelected = selectedCategory === cat.key;
            return (
              <button
                key={cat.key}
                onClick={() => setSelectedCategory(cat.key)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold shrink-0 transition-all cursor-pointer flex items-center gap-1.5 ${
                  isSelected
                    ? 'bg-[#0f1d32] text-white shadow-xs'
                    : 'bg-white hover:bg-slate-100 text-slate-600 border border-slate-200'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isSelected ? 'text-amber-300' : 'text-slate-400'}`} />
                <span>{cat.label}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-black ${
                    isSelected ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  {cat.count}
                </span>
              </button>
            );
          })}
      </div>

      {/* PLACES GRID */}
      {filteredPlaces.length === 0 ? (
        <div className="p-8 text-center bg-white rounded-3xl border border-slate-200 text-slate-500 text-xs">
          No places found matching your filter or search query.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {filteredPlaces.map((place) => {
            let catColor = 'bg-blue-50 text-blue-700 border-blue-200';
            let catIcon = Compass;

            if (place.category === 'police') {
              catColor = 'bg-blue-50 text-blue-700 border-blue-200';
              catIcon = Shield;
            } else if (place.category === 'hospital' || place.category === 'ambulance') {
              catColor = 'bg-rose-50 text-[#e84e5f] border-rose-200';
              catIcon = Hospital;
            } else if (place.category === 'pharmacy') {
              catColor = 'bg-emerald-50 text-emerald-700 border-emerald-200';
              catIcon = Pill;
            } else if (place.category === 'fuel') {
              catColor = 'bg-amber-50 text-amber-700 border-amber-200';
              catIcon = Fuel;
            } else if (place.category === 'mechanic') {
              catColor = 'bg-orange-50 text-orange-700 border-orange-200';
              catIcon = Wrench;
            } else if (place.category === 'restaurant') {
              catColor = 'bg-green-50 text-green-700 border-green-200';
              catIcon = Utensils;
            } else if (place.category === 'hotel') {
              catColor = 'bg-indigo-50 text-indigo-700 border-indigo-200';
              catIcon = Hotel;
            } else if (place.category === 'railway' || place.category === 'bus') {
              catColor = 'bg-purple-50 text-purple-700 border-purple-200';
              catIcon = Train;
            }

            const CatIcon = catIcon;

            return (
              <div
                key={place.id}
                className="p-4 rounded-3xl bg-white border border-[#e5ebf3] hover:border-slate-300 shadow-xs flex flex-col justify-between transition-all hover:-translate-y-0.5 group"
              >
                <div>
                  {/* TOP CATEGORY BADGE & DISTANCE */}
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span
                      className={`px-2 py-0.5 rounded-lg border text-[10px] font-black uppercase tracking-wider flex items-center gap-1 ${catColor}`}
                    >
                      <CatIcon className="w-3 h-3" />
                      {place.category.replace('_', ' ')}
                    </span>

                    <span className="text-xs font-black text-slate-800 bg-slate-50 px-2 py-0.5 rounded-lg border border-slate-200">
                      {place.distanceKm} km away
                    </span>
                  </div>

                  {/* PLACE NAME */}
                  <h4 className="text-xs sm:text-sm font-black text-[#0f1d32] leading-snug group-hover:text-blue-900 transition-colors">
                    {place.name}
                  </h4>

                  {/* ADDRESS */}
                  <p className="text-[11px] text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                    📍 {place.address}
                  </p>

                  {/* TIMINGS & RATING */}
                  <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-600">
                    <span className="flex items-center gap-1 font-semibold text-slate-700">
                      <Clock className="w-3 h-3 text-slate-400" />
                      {place.openHours}
                    </span>
                    <span className="flex items-center gap-0.5 font-bold text-amber-600">
                      <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                      {place.rating}
                    </span>
                  </div>
                </div>

                {/* BOTTOM ACTION BUTTONS: CALL & DIRECTIONS */}
                <div className="mt-3 pt-2.5 border-t border-slate-100 grid grid-cols-2 gap-2">
                  {place.phone ? (
                    <a
                      href={`tel:${place.phone.split('/')[0].trim()}`}
                      className="py-1.5 px-2 rounded-xl bg-slate-50 hover:bg-blue-50 border border-slate-200 hover:border-blue-200 text-blue-700 font-bold text-[11px] flex items-center justify-center gap-1 transition-colors cursor-pointer"
                    >
                      <Phone className="w-3 h-3" />
                      <span>Call Now</span>
                    </a>
                  ) : (
                    <div className="py-1.5 px-2 rounded-xl bg-slate-50 text-slate-400 text-[11px] text-center font-medium">
                      No Phone Listed
                    </div>
                  )}

                  <a
                    href={place.directionsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="py-1.5 px-2 rounded-xl bg-[#0f1d32] hover:bg-slate-800 text-white font-bold text-[11px] flex items-center justify-center gap-1 transition-colors cursor-pointer shadow-2xs"
                  >
                    <Navigation className="w-3 h-3" />
                    <span>Directions</span>
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
