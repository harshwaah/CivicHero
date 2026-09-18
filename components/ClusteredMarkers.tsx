'use client';

import React from 'react';
import { AdvancedMarker, Pin } from '@vis.gl/react-google-maps';

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
          >
            <Pin background={colors.background} borderColor={colors.borderColor} glyphColor={colors.glyphColor} />
          </AdvancedMarker>
        );
      })}
    </>
  );
}

