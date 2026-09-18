'use client';

import React, { createContext, useContext, ReactNode, useState, useCallback, useMemo } from 'react';
import { APIProvider, Map, AdvancedMarker, Pin, useMap } from '@vis.gl/react-google-maps';
import { DeckGlOverlay } from '@/components/DeckGlOverlay';
import { ClusteredMarkers } from '@/components/ClusteredMarkers';
import { MapPin, Layers, Crosshair, Check, AlertCircle } from 'lucide-react';
import { mapsConfig, DEFAULT_MAP_CENTER } from '@/lib/config';

interface MapMarkerType {
  lat: number;
  lng: number;
  title?: string;
  category?: string;
  urgency?: string;
  id?: string;
  onClick?: () => void;
  status?: string;
}

export const getMarkerColor = (urgency?: string, status?: string) => {
  if (status === 'Resolved') return { background: '#10b981', borderColor: '#059669', glyphColor: '#ffffff' }; // emerald
  switch (urgency) {
    case 'Critical': return { background: '#ef4444', borderColor: '#b91c1c', glyphColor: '#ffffff' }; // red
    case 'High': return { background: '#f97316', borderColor: '#c2410c', glyphColor: '#ffffff' }; // orange
    case 'Medium': return { background: '#f59e0b', borderColor: '#b45309', glyphColor: '#ffffff' }; // amber
    default: return { background: '#3b82f6', borderColor: '#1d4ed8', glyphColor: '#ffffff' }; // blue
  }
};

interface MapContextProps {
  apiKey: string | null;
  mapStyle: 'streets' | 'satellite' | 'terrain';
  setMapStyle: (style: 'streets' | 'satellite' | 'terrain') => void;
  registeredMarkers: MapMarkerType[];
  registerMarker: (marker: MapMarkerType) => void;
}

const MapContext = createContext<MapContextProps | undefined>(undefined);

export function MapProvider({ children }: { children: ReactNode }) {
  const [mapStyle, setMapStyle] = useState<'streets' | 'satellite' | 'terrain'>('streets');
  const [registeredMarkers, setRegisteredMarkers] = useState<MapMarkerType[]>([]);

  const apiKey = mapsConfig.apiKey;

  const registerMarker = useCallback((marker: MapMarkerType) => {
    setRegisteredMarkers((prev) => [...prev, marker]);
  }, []);

  const value: MapContextProps = {
    apiKey,
    mapStyle,
    setMapStyle,
    registeredMarkers,
    registerMarker,
  };

  return <MapContext.Provider value={value}>{children}</MapContext.Provider>;
}

export function useMaps() {
  const context = useContext(MapContext);
  if (!context) {
    throw new Error('useMaps must be used within a MapProvider');
  }
  return context;
}

interface CivicMapProps {
  locationName: string;
  categoryName: string;
  latitude?: number;
  longitude?: number;
  interactive?: boolean;
  markers?: MapMarkerType[];
  onClick?: (e: any) => void;
  heatmapData?: any[]; // optional, if we add heatmap layer
  children?: ReactNode;
  mapId?: string;
  showLocateMe?: boolean;
}

const defaultCenter = {
  lat: DEFAULT_MAP_CENTER.lat,
  lng: DEFAULT_MAP_CENTER.lng,
};

function LocateMeControl() {
  const map = useMap();
  const [locating, setLocating] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const locateUser = () => {
    if (!map) return;
    
    if (!navigator.geolocation) {
      setStatusMessage('Geolocation is not supported by your browser. Centered on Mumbai.');
      map.panTo(defaultCenter);
      map.setZoom(14);
      setTimeout(() => setStatusMessage(null), 4000);
      return;
    }

    setLocating(true);
    setStatusMessage('Acquiring your coordinates...');

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        map.panTo({ lat: latitude, lng: longitude });
        map.setZoom(16);
        setLocating(false);
        setStatusMessage('Location found!');
        setTimeout(() => setStatusMessage(null), 3000);
      },
      (error) => {
        // Gracefully handle permission denial or disabled policy without console warning noise
        map.panTo(defaultCenter);
        map.setZoom(14);
        setLocating(false);
        const userNotice = error?.code === 1
          ? 'Location permission not enabled. Centered on Mumbai.'
          : 'Location lookup unavailable. Centered on Mumbai.';
        setStatusMessage(userNotice);
        setTimeout(() => setStatusMessage(null), 4000);
      },
      {
        enableHighAccuracy: true,
        timeout: 8000,
        maximumAge: 30000,
      }
    );
  };

  return (
    <div className="absolute bottom-6 right-6 z-10 flex flex-col items-end gap-2 pointer-events-auto">
      {statusMessage && (
        <div className="bg-slate-900/95 text-white backdrop-blur text-xs font-medium px-3.5 py-2 rounded-xl shadow-lg border border-slate-700 max-w-xs animate-in fade-in slide-in-from-bottom-2 duration-200">
          {statusMessage}
        </div>
      )}
      <button 
        onClick={locateUser}
        disabled={locating}
        className={`w-12 h-12 rounded-2xl bg-white/95 backdrop-blur border border-slate-200 shadow-xl flex items-center justify-center transition-all duration-200 ${
          locating 
            ? 'text-emerald-500 ring-2 ring-emerald-400/50 animate-pulse' 
            : 'text-slate-700 hover:text-emerald-600 hover:bg-white hover:scale-105 active:scale-95'
        }`}
        title="Locate Myself (HTML5 Geolocation / Mumbai Default)"
      >
        <Crosshair className={`w-5 h-5 ${locating ? 'animate-spin' : ''}`} />
      </button>
    </div>
  );
}

function MapStyleControl() {
  const { mapStyle, setMapStyle } = useMaps();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="absolute top-6 left-6 z-10">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-10 h-10 rounded-xl bg-white border border-slate-200 shadow-sm flex items-center justify-center text-slate-700 hover:text-brand-primary transition-colors"
        title="Map Type"
      >
        <Layers className="w-4 h-4" />
      </button>
      
      {isOpen && (
        <div className="absolute top-12 left-0 mt-2 p-2 bg-white rounded-xl border border-slate-200 shadow-xl flex flex-col gap-1 w-32">
          {(['streets', 'satellite', 'terrain'] as const).map(style => (
            <button
              key={style}
              onClick={() => {
                setMapStyle(style);
                setIsOpen(false);
              }}
              className={`px-3 py-2 rounded-lg text-left font-mono text-[10px] font-bold uppercase tracking-wider transition-colors ${mapStyle === style ? 'bg-brand-primary/10 text-brand-primary' : 'text-slate-600 hover:bg-slate-50'}`}
            >
              {style}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export function CivicMap({
  locationName,
  categoryName,
  latitude,
  longitude,
  interactive = true,
  markers = [],
  onClick,
  heatmapData = [],
  children,
  mapId = 'DEMO_MAP_ID',
  showLocateMe = false
}: CivicMapProps) {
  const { apiKey, mapStyle } = useMaps();

  const center = latitude && longitude ? { lat: latitude, lng: longitude } : defaultCenter;
  
  const hasValidKey = Boolean(apiKey) && apiKey !== 'YOUR_API_KEY';

  const getGoogleMapTypeId = () => {
    switch (mapStyle) {
      case 'satellite': return 'hybrid';
      case 'terrain': return 'terrain';
      default: return 'roadmap';
    }
  };

  if (!hasValidKey) {
    return (
      <div className="w-full h-full min-h-[300px] flex items-center justify-center p-8 bg-slate-50 border border-slate-200 rounded-[28px]">
        <div style={{textAlign:'center',maxWidth:520}}>
          <h2 className="font-sans font-bold text-xl text-slate-800 mb-2">Google Maps API Key Required</h2>
          <p className="text-sm text-slate-600 mb-4"><strong>Step 1:</strong> <a href="https://console.cloud.google.com/google/maps-apis/start?utm_campaign=gmp-code-assist-ais" target="_blank" rel="noopener" className="text-blue-600 underline">Get an API Key</a></p>
          <p className="text-sm text-slate-600 mb-2"><strong>Step 2:</strong> Add your key as a secret in AI Studio:</p>
          <ul className="text-left text-sm text-slate-600 space-y-1 mb-4 list-disc pl-5">
            <li>Open <strong>Settings</strong> (⚙️ gear icon, <strong>top-right corner</strong>)</li>
            <li>Select <strong>Secrets</strong></li>
            <li>Type <code>GOOGLE_MAPS_PLATFORM_KEY</code> as the secret name, press <strong>Enter</strong></li>
            <li>Paste your API key as the value, press <strong>Enter</strong></li>
          </ul>
          <p className="text-xs text-slate-500 font-mono">The app rebuilds automatically after you add the secret.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full min-h-[300px] relative rounded-[28px] overflow-hidden border border-slate-200 shadow-sm isolate">
      <APIProvider apiKey={apiKey!} version="weekly">
        <Map
          defaultCenter={center}
          defaultZoom={14}
          mapId={mapId}
          mapTypeId={getGoogleMapTypeId()}
          style={{ width: '100%', height: '100%' }}
          disableDefaultUI={!interactive}
          zoomControl={interactive}
          streetViewControl={false}
          mapTypeControl={false}
          onClick={onClick}
          clickableIcons={interactive}
          gestureHandling={interactive ? "auto" : "none"}
        >
          {latitude && longitude && markers.length === 0 && (
            <AdvancedMarker position={center}>
              <Pin background="#3b82f6" borderColor="#1d4ed8" glyphColor="#ffffff" />
            </AdvancedMarker>
          )}
          {markers.length > 0 && (
            <ClusteredMarkers markers={markers} />
          )}
          {children}
          {heatmapData.length > 0 && <DeckGlOverlay heatmapData={heatmapData} />}
        </Map>
        {interactive && hasValidKey && <MapStyleControl />}
        {showLocateMe && interactive && hasValidKey && <LocateMeControl />}
      </APIProvider>
    </div>
  );
}
