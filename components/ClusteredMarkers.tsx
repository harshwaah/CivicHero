'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useMap, AdvancedMarker, Pin } from '@vis.gl/react-google-maps';
import { MarkerClusterer } from '@googlemaps/markerclusterer';

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

export function ClusteredMarkers({ markers }: { markers: MapMarkerType[] }) {
  const map = useMap();
  const [markerElements, setMarkerElements] = useState<{[key: string]: google.maps.marker.AdvancedMarkerElement}>({});
  const clusterer = useRef<MarkerClusterer | null>(null);

  useEffect(() => {
    if (!map) return;
    if (!clusterer.current) {
      clusterer.current = new MarkerClusterer({ map });
    }
  }, [map]);

  useEffect(() => {
    clusterer.current?.clearMarkers();
    clusterer.current?.addMarkers(Object.values(markerElements));
  }, [markerElements]);

  return (
    <>
      {markers.map((marker, idx) => {
        const colors = getMarkerColor(marker.urgency, marker.status);
        const key = marker.id || idx.toString();
        return (
          <AdvancedMarker
            key={key}
            position={{ lat: marker.lat, lng: marker.lng }}
            title={marker.title}
            onClick={marker.onClick}
            ref={(markerElement) => {
              if (markerElement && markerElements[key] !== markerElement) {
                setMarkerElements(prev => ({ ...prev, [key]: markerElement }));
              }
            }}
          >
            <Pin background={colors.background} borderColor={colors.borderColor} glyphColor={colors.glyphColor} />
          </AdvancedMarker>
        );
      })}
    </>
  );
}
