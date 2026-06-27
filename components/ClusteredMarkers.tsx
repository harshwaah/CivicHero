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

interface MarkerWithGmpClickProps {
  marker: MapMarkerType;
  colors: { background: string; borderColor: string; glyphColor: string };
  markerKey: string;
  onRegister: (key: string, element: google.maps.marker.AdvancedMarkerElement | null) => void;
}

function MarkerWithGmpClick({ marker, colors, markerKey, onRegister }: MarkerWithGmpClickProps) {
  const markerRef = useRef<google.maps.marker.AdvancedMarkerElement | null>(null);
  const { onClick } = marker;

  useEffect(() => {
    const element = markerRef.current;
    if (!element || !onClick) return;

    const handler = () => {
      onClick();
    };

    element.addEventListener('gmp-click', handler);

    return () => {
      element.removeEventListener('gmp-click', handler);
    };
  }, [onClick]);

  return (
    <AdvancedMarker
      position={{ lat: marker.lat, lng: marker.lng }}
      title={marker.title}
      ref={(el) => {
        markerRef.current = el;
        onRegister(markerKey, el);
      }}
    >
      <Pin background={colors.background} borderColor={colors.borderColor} glyphColor={colors.glyphColor} />
    </AdvancedMarker>
  );
}

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

  const handleRegister = (key: string, element: google.maps.marker.AdvancedMarkerElement | null) => {
    if (element) {
      if (markerElements[key] !== element) {
        setMarkerElements(prev => ({ ...prev, [key]: element }));
      }
    } else {
      if (markerElements[key]) {
        setMarkerElements(prev => {
          const next = { ...prev };
          delete next[key];
          return next;
        });
      }
    }
  };

  return (
    <>
      {markers.map((marker, idx) => {
        const colors = getMarkerColor(marker.urgency, marker.status);
        const key = marker.id || idx.toString();
        return (
          <MarkerWithGmpClick
            key={key}
            marker={marker}
            colors={colors}
            markerKey={key}
            onRegister={handleRegister}
          />
        );
      })}
    </>
  );
}
