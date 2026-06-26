'use client';

import React, { createContext, useContext, ReactNode, useState, useCallback } from 'react';
import { useJsApiLoader, GoogleMap, Marker } from '@react-google-maps/api';
import MapPlaceholder from '@/components/MapPlaceholder';

interface MapMarkerType {
  lat: number;
  lng: number;
  title?: string;
  category?: string;
}

interface MapContextProps {
  isLoaded: boolean;
  loadError: Error | undefined;
  apiKey: string | null;
  mapStyle: 'streets' | 'satellite' | 'terrain';
  setMapStyle: (style: 'streets' | 'satellite' | 'terrain') => void;
  registeredMarkers: MapMarkerType[];
  registerMarker: (marker: MapMarkerType) => void;
}

const MapContext = createContext<MapContextProps | undefined>(undefined);

const libraries: ("places" | "geometry" | "drawing" | "visualization")[] = ['places', 'visualization'];

export function MapProvider({ children }: { children: ReactNode }) {
  const [mapStyle, setMapStyle] = useState<'streets' | 'satellite' | 'terrain'>('streets');
  const [registeredMarkers, setRegisteredMarkers] = useState<MapMarkerType[]>([]);

  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '';

  const { isLoaded, loadError } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: apiKey,
    libraries,
  });

  const registerMarker = useCallback((marker: MapMarkerType) => {
    setRegisteredMarkers((prev) => [...prev, marker]);
  }, []);

  const value: MapContextProps = {
    isLoaded,
    loadError,
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
}

const containerStyle = {
  width: '100%',
  height: '100%',
  borderRadius: '24px'
};

const defaultCenter = {
  lat: 40.7128,
  lng: -74.0060
};

/**
 * Polymorphic map component that abstracts Google Maps/Placeholder rendering.
 */
export function CivicMap({
  locationName,
  categoryName,
  latitude,
  longitude,
  interactive = true,
  markers = [],
}: CivicMapProps) {
  const { isLoaded, loadError, apiKey } = useMaps();

  const center = latitude && longitude ? { lat: latitude, lng: longitude } : defaultCenter;

  if (loadError || !apiKey) {
    return (
      <MapPlaceholder 
        locationName={locationName} 
        categoryName={categoryName} 
      />
    );
  }

  if (!isLoaded) {
    return (
      <div className="w-full h-48 bg-slate-100 rounded-3xl animate-pulse flex items-center justify-center border border-slate-200">
        <span className="font-mono text-xs font-bold text-slate-400 uppercase tracking-widest">Loading Map...</span>
      </div>
    );
  }

  return (
    <div className="w-full h-full min-h-[200px] relative rounded-3xl overflow-hidden border border-slate-200 shadow-sm">
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={center}
        zoom={14}
        options={{
          disableDefaultUI: !interactive,
          zoomControl: interactive,
          streetViewControl: false,
          mapTypeControl: false,
          clickableIcons: interactive,
        }}
      >
        {latitude && longitude && (
          <Marker position={center} />
        )}
        {markers.map((marker, idx) => (
          <Marker 
            key={idx}
            position={{ lat: marker.lat, lng: marker.lng }}
            title={marker.title}
          />
        ))}
      </GoogleMap>
    </div>
  );
}
