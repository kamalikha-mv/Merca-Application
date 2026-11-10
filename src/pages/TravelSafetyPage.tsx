import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { travelSafetyService, POPULAR_DESTINATIONS } from '../services/travelSafetyService';
import { TravelReport, PersonalisationPreferences } from '../types/travelSafety';
import { TravelSafetyMap } from '../components/travel/TravelSafetyMap';
import { RouteOptionsCard } from '../components/travel/RouteOptionsCard';
import { JourneyMilestonesTimeline } from '../components/travel/JourneyMilestonesTimeline';
import { SafetyAnalyticsSection } from '../components/travel/SafetyAnalyticsSection';
import { NearbyPlacesDirectory } from '../components/travel/NearbyPlacesDirectory';
import { PersonaliseSafetyModal } from '../components/travel/PersonaliseSafetyModal';
import { LiveTravelMonitorDrawer } from '../components/travel/LiveTravelMonitorDrawer';
import {
  Compass,
  MapPin,
  Navigation,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  RotateCcw,
  SlidersHorizontal,
  Radio,
  CheckCircle2,
  AlertCircle,
  Clock,
  Layers,
  Share2,
} from 'lucide-react';

export const TravelSafetyPage: React.FC = () => {
  const { location, refreshLocation, showToast } = useApp();
  const [searchParams] = useSearchParams();
  const queryParamDest = searchParams.get('dest');

  // Starting location state (defaults to detected location, user can manually override)
  const [startLocationName, setStartLocationName] = useState<string>(() => {
    return location.town ? `${location.town}, ${location.city || 'Tamil Nadu'}` : 'Kilambakkam, Chennai Metropolitan Area';
  });
  const [isEditingStart, setIsEditingStart] = useState<boolean>(false);

  // Destination query
  const [destinationQuery, setDestinationQuery] = useState<string>(
    queryParamDest || 'Chennai International Airport (MAA)'
  );

  // Analysis State
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [report, setReport] = useState<TravelReport | null>(null);
  const [selectedRouteId, setSelectedRouteId] = useState<string>('route-recommended');

  // Active view tab
  const [activeTab, setActiveTab] = useState<'routes' | 'milestones' | 'safety' | 'nearby'>('routes');

  // Modals & Live Monitoring
  const [isPersonaliseOpen, setIsPersonaliseOpen] = useState<boolean>(false);
  const [isLiveMonitoringActive, setIsLiveMonitoringActive] = useState<boolean>(false);

  // Sync starting location when GPS position updates
  useEffect(() => {
    if (location.isLive || location.isPermissionGranted) {
      if (!isEditingStart && location.address) {
        setStartLocationName(location.town ? `${location.town}, ${location.city || 'Tamil Nadu'}` : location.address);
      }
    }
  }, [location, isEditingStart]);

  // Initial Auto-Analysis on page mount
  useEffect(() => {
    const initialTarget = queryParamDest || 'Chennai International Airport (MAA)';
    handleAnalyzeJourney(initialTarget);
  }, [queryParamDest]);

  const handleAnalyzeJourney = async (targetDest?: string) => {
    const dest = targetDest || destinationQuery;
    if (!dest.trim()) {
      showToast('Please enter your destination to analyse safety.', 'error');
      return;
    }

    setIsAnalyzing(true);

    try {
      // Simulate realistic network analysis delay (radar scan)
      const startCoords = {
        name: startLocationName,
        lat: location.lat !== 0 ? location.lat : 12.8610,
        lng: location.lng !== 0 ? location.lng : 80.0627,
      };

      const res = await travelSafetyService.analyzeJourney(startCoords, dest, report?.personalisation);
      setReport(res);
      setSelectedRouteId(res.selectedRouteId);
      setIsAnalyzing(false);
      showToast('✅ Travel intelligence report compiled successfully!', 'success');
    } catch {
      setIsAnalyzing(false);
      showToast('⚠️ Could not complete travel analysis. Please try again.', 'error');
    }
  };

  const handleApplyPersonalisation = (prefs: PersonalisationPreferences) => {
    if (!report) return;
    const refined = travelSafetyService.refineWithPersonalisation(report, prefs);
    setReport(refined);
    showToast('✨ Personalised safety recommendations applied to routes!', 'success');
  };

  const selectedRoute = report?.routes.find((r) => r.id === selectedRouteId) || report?.routes[0];

  return (
    <div className="space-y-6 text-left">
      {/* PERSONALISATION MODAL */}
      <PersonaliseSafetyModal
        isOpen={isPersonaliseOpen}
        onClose={() => setIsPersonaliseOpen(false)}
        currentPreferences={report?.personalisation}
        onSavePreferences={handleApplyPersonalisation}
      />

      {/* TOP HERO BANNER: TRAVEL SAFETY INTELLIGENCE */}
      <div className="bg-gradient-to-r from-[#0f1d32] via-[#162744] to-[#1c3254] text-white rounded-3xl p-5 sm:p-7 shadow-lg relative overflow-hidden border border-slate-800">
        <div className="absolute right-0 top-0 translate-x-6 -translate-y-6 w-52 h-52 bg-[#e84e5f]/20 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="p-1.5 rounded-xl bg-[#e84e5f] text-white shadow-xs">
                <Compass className="w-5 h-5" />
              </span>
              <span className="text-[10px] font-black uppercase tracking-widest text-[#e84e5f] bg-[#e84e5f]/15 px-2.5 py-0.5 rounded-full">
                Mecra Route Intelligence
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              Predictive Travel Safety & Corridor Analytics
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl leading-relaxed">
              Real-time multi-route hazard comparison, crime records, lighting audits, and 24/7 emergency safe hubs. Minimal input, maximum situational safety.
            </p>
          </div>

          {/* PERSONALISE BUTTON (TOP RIGHT) */}
          {report && (
            <button
              onClick={() => setIsPersonaliseOpen(true)}
              className="px-4 py-2.5 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs flex items-center gap-2 border border-white/20 backdrop-blur-md transition-all cursor-pointer shrink-0 self-start md:self-center shadow-xs"
            >
              <SlidersHorizontal className="w-3.5 h-3.5 text-amber-300" />
              <span>Personalise My Safety</span>
              {report.personalisation && (
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
              )}
            </button>
          )}
        </div>
      </div>

      {/* INPUT CONTROLS CARD: START & DESTINATION */}
      <div className="bg-white rounded-3xl border border-[#e5ebf3] p-4 sm:p-6 shadow-xs space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
          {/* START LOCATION (AUTO-DETECTED WITH MANUAL OVERRIDE) */}
          <div className="md:col-span-5 space-y-1">
            <div className="flex items-center justify-between text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              <span className="flex items-center gap-1 text-slate-700">
                <MapPin className="w-3.5 h-3.5 text-blue-600" />
                Starting Point (Auto-Detected)
              </span>
              <button
                type="button"
                onClick={() => setIsEditingStart(!isEditingStart)}
                className="text-blue-600 hover:text-blue-800 text-[10px] font-bold underline cursor-pointer"
              >
                {isEditingStart ? 'Done' : 'Edit Manually'}
              </button>
            </div>

            {isEditingStart ? (
              <input
                type="text"
                value={startLocationName}
                onChange={(e) => setStartLocationName(e.target.value)}
                placeholder="Enter starting location..."
                className="w-full px-3.5 py-2.5 rounded-2xl border border-slate-200 text-xs font-bold text-[#0f1d32] focus:outline-none focus:border-blue-500 bg-slate-50"
              />
            ) : (
              <div className="px-3.5 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                <span className="text-xs font-bold text-[#0f1d32] truncate">
                  {startLocationName}
                </span>
                <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" title="GPS Locked" />
              </div>
            )}
          </div>

          {/* ARROW ICON */}
          <div className="hidden md:flex md:col-span-1 justify-center pt-4 text-slate-400">
            <ArrowRight className="w-5 h-5" />
          </div>

          {/* DESTINATION SEARCH BOX (REQUIRED USER INPUT) */}
          <div className="md:col-span-4 space-y-1">
            <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block flex items-center gap-1">
              <Navigation className="w-3.5 h-3.5 text-[#e84e5f]" />
              Enter Your Destination
            </label>
            <input
              type="text"
              value={destinationQuery}
              onChange={(e) => setDestinationQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAnalyzeJourney()}
              placeholder="Where are you travelling to?"
              className="w-full px-3.5 py-2.5 rounded-2xl border-2 border-slate-200 hover:border-slate-300 focus:border-[#e84e5f] text-xs font-bold text-[#0f1d32] placeholder-slate-400 focus:outline-none bg-white transition-colors"
            />
          </div>

          {/* PRIMARY CTA: ANALYSE MY JOURNEY */}
          <div className="md:col-span-2 pt-1 md:pt-4">
            <button
              type="button"
              onClick={() => handleAnalyzeJourney()}
              disabled={isAnalyzing}
              className={`w-full py-3 px-4 rounded-2xl font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer ${
                isAnalyzing
                  ? 'bg-slate-300 text-slate-500 cursor-not-allowed'
                  : 'bg-[#e84e5f] hover:bg-[#d43d4e] active:scale-95 text-white shadow-rose-500/25'
              }`}
            >
              {isAnalyzing ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Scanning...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                  <span>Analyse My Journey</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* QUICK POPULAR PRESET DESTINATION BUTTONS */}
        <div className="pt-2 border-t border-slate-100">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
            Suggested Corridor Destinations:
          </span>
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            {POPULAR_DESTINATIONS.map((preset) => (
              <button
                type="button"
                key={preset.id}
                onClick={() => {
                  setDestinationQuery(preset.name);
                  handleAnalyzeJourney(preset.name);
                }}
                className={`px-3 py-1.5 rounded-xl border text-[11px] font-bold shrink-0 transition-all cursor-pointer flex items-center gap-1.5 ${
                  destinationQuery === preset.name
                    ? 'bg-blue-50 border-blue-500 text-blue-900 shadow-2xs'
                    : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700'
                }`}
              >
                <span>{preset.name.split('(')[0].trim()}</span>
                <span className="text-[9px] text-slate-400 font-normal">
                  ~{preset.approxDistanceKm}km
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ACTIVE LIVE MONITORING DRAWER (IF ACTIVATED) */}
      {isLiveMonitoringActive && selectedRoute && report && (
        <LiveTravelMonitorDrawer
          selectedRoute={selectedRoute}
          milestones={report.milestones}
          destinationName={report.destinationName}
          onEndMonitoring={() => {
            setIsLiveMonitoringActive(false);
            showToast('Safe travel monitoring ended.', 'info');
          }}
        />
      )}

      {/* ANALYSIS RESULTS SECTION */}
      {report && (
        <div className="space-y-6">
          {/* INTERACTIVE LEAFLET ROUTE MAP */}
          <TravelSafetyMap
            routes={report.routes}
            selectedRouteId={selectedRouteId}
            onSelectRoute={(id) => setSelectedRouteId(id)}
            startCoords={report.startCoords}
            startName={report.startLocationName}
            destCoords={report.destinationCoords}
            destName={report.destinationName}
            milestones={report.milestones}
            nearbyPlaces={report.nearbyPlaces}
            isLiveMonitoringActive={isLiveMonitoringActive}
          />

          {/* ACTIVE ROUTE SELECTION & LIVE WATCH CTA BAR */}
          {selectedRoute && (
            <div className="p-4 rounded-3xl bg-white border border-[#e5ebf3] shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold shrink-0">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black text-[#0f1d32] uppercase">
                      Selected Corridor:
                    </span>
                    <span className="text-xs font-extrabold text-emerald-700">
                      {selectedRoute.name}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    {selectedRoute.distanceKm} km • Est. {selectedRoute.durationMinutes} mins • {selectedRoute.safetyScore}% Safety Rating
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {!isLiveMonitoringActive ? (
                  <button
                    onClick={() => {
                      setIsLiveMonitoringActive(true);
                      showToast('🛡️ Safe travel monitoring activated! Route breadcrumbs armed.', 'success');
                    }}
                    className="w-full sm:w-auto px-5 py-2.5 rounded-2xl bg-[#0f1d32] hover:bg-slate-800 text-white font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-md cursor-pointer transition-all active:scale-95"
                  >
                    <Radio className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
                    <span>Start Safe Travel Monitoring</span>
                  </button>
                ) : (
                  <span className="text-xs font-black text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-300 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                    Monitoring Live
                  </span>
                )}
              </div>
            </div>
          )}

          {/* SECTION NAVIGATION TABS */}
          <div className="flex items-center gap-1.5 bg-[#f1f5fb] p-1.5 rounded-2xl border border-[#e5ebf3] overflow-x-auto scrollbar-none">
            {[
              { key: 'routes', label: 'Route Options & Comparison', icon: Navigation },
              { key: 'milestones', label: 'Step-by-Step Milestones', icon: Clock },
              { key: 'safety', label: 'Safety & Hazard Analytics', icon: ShieldCheck },
              { key: 'nearby', label: 'Nearby Safe Hubs & Services', icon: Compass },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.key;
              return (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key as any)}
                  className={`px-4 py-2.5 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-2 shrink-0 ${
                    isActive
                      ? 'bg-white text-[#0f1d32] shadow-xs'
                      : 'text-[#5b6b82] hover:text-[#0f1d32]'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-[#e84e5f]' : 'text-slate-400'}`} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* TAB CONTENT PANELS */}
          {activeTab === 'routes' && (
            <RouteOptionsCard
              routes={report.routes}
              selectedRouteId={selectedRouteId}
              onSelectRoute={(id) => setSelectedRouteId(id)}
            />
          )}

          {activeTab === 'milestones' && selectedRoute && (
            <JourneyMilestonesTimeline
              milestones={report.milestones}
              selectedRouteName={selectedRoute.name}
            />
          )}

          {activeTab === 'safety' && (
            <SafetyAnalyticsSection
              safety={report.safety}
              lastUpdatedSource={report.lastUpdatedSource}
            />
          )}

          {activeTab === 'nearby' && (
            <NearbyPlacesDirectory places={report.nearbyPlaces} />
          )}
        </div>
      )}
    </div>
  );
};
