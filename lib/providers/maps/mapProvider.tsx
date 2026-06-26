'use client';

import React, { createContext, useContext, ReactNode, useState } from 'react';
import MapPlaceholder from '@/components/MapPlaceholder';

interface MapMarker {
  lat: number;
  lng: number;
  title?: string;
  category?: string;
}

interface MapContextProps {
  isLoaded: boolean;
  apiKey: string | null;
  mapStyle: 'streets' | 'satellite' | 'terrain';
  setMapStyle: (style: 'streets' | 'satellite' | 'terrain') => void;
  registeredMarkers: MapMarker[];
  registerMarker: (marker: MapMarker) => void;
}

const MapContext = createContext<MapContextProps | undefined>(undefined);

export function MapProvider({ children }: { children: ReactNode }) {
  const [mapStyle, setMapStyle] = useState<'streets' | 'satellite' | 'terrain'>('streets');
  const [registeredMarkers, setRegisteredMarkers] = useState<MapMarker[]>([]);

  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || null;

  const registerMarker = (marker: MapMarker) => {
    setRegisteredMarkers((prev) => [...prev, marker]);
  };

  const value: MapContextProps = {
    isLoaded: false, // Will become true once Google Maps script loads
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
  markers?: MapMarker[];
}

/**
 * Polymorphic map component that abstracts Google Maps/Placeholder rendering.
 * Swapping from placeholder to Google Map in Phase 2.1 will require NO code changes outside of this file.
 */
export function CivicMap({
  locationName,
  categoryName,
  latitude,
  longitude,
  interactive = true,
  markers = [],
}: CivicMapProps) {
  const { apiKey } = useMaps();

  // If apiKey is present, in the next phase we will render the real Google Maps Canvas:
  // return <GoogleMapContainer apiKey={apiKey} markers={markers} ... />

  return (
    <MapPlaceholder 
      locationName={locationName} 
      categoryName={categoryName} 
    />
  );
}
