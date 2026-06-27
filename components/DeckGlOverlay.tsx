'use client';

import React, { useMemo, useEffect, useState } from 'react';
import { useMap } from '@vis.gl/react-google-maps';
import { GoogleMapsOverlay } from '@deck.gl/google-maps';
import { HeatmapLayer } from '@deck.gl/aggregation-layers';
import { log } from '@deck.gl/core';

// Silence benign luma.gl/deck.gl warnings such as weightsTexture not found in shader layout
if (typeof window !== 'undefined' && log) {
  log.level = 0;
  log.enable(false);
}

interface DeckGlOverlayProps {
  heatmapData: { position: [number, number], weight: number }[];
}

export function DeckGlOverlay({ heatmapData }: DeckGlOverlayProps) {
  const map = useMap();
  const [overlay] = useState(() => new GoogleMapsOverlay({
    interleaved: false,
  }));

  const layers = useMemo(() => [
    new HeatmapLayer({
      id: 'heatmapLayer',
      data: heatmapData,
      getPosition: (d: any) => d.position,
      getWeight: (d: any) => d.weight,
      radiusPixels: 40,
      intensity: 1,
      threshold: 0.1,
      colorRange: [
        [255, 255, 178],
        [254, 204, 92],
        [253, 141, 60],
        [240, 59, 32],
        [189, 0, 38]
      ]
    })
  ], [heatmapData]);

  useEffect(() => {
    overlay.setProps({ layers });
  }, [overlay, layers]);

  useEffect(() => {
    if (map) {
      overlay.setMap(map);
    }
    return () => {
      overlay.setMap(null);
    };
  }, [map, overlay]);

  return null;
}
