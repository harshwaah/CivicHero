'use client';

import React, { useMemo, useEffect, useState, useRef } from 'react';
import { useMap } from '@vis.gl/react-google-maps';
import { GoogleMapsOverlay } from '@deck.gl/google-maps';
import { HeatmapLayer } from '@deck.gl/aggregation-layers';
import { log } from '@deck.gl/core';

// Silence benign luma.gl/deck.gl warnings such as weightsTexture not found in shader layout
if (typeof window !== 'undefined' && log) {
  log.level = 0;
  log.enable(false);
}

// Monkey-patch GoogleMapsOverlay to safely guard early frames before projection initializes
if (typeof window !== 'undefined' && GoogleMapsOverlay) {
  const proto = GoogleMapsOverlay.prototype as any;
  if (proto && !proto.__projectionSafePatched) {
    proto.__projectionSafePatched = true;
    
    const origDrawRaster = proto._onDrawRaster;
    if (typeof origDrawRaster === 'function') {
      proto._onDrawRaster = function (...args: any[]) {
        try {
          if (!this._overlay || !this._overlay.getProjection()) {
            // Projection not yet ready; skip this frame without throwing
            return;
          }
          return origDrawRaster.apply(this, args);
        } catch (err: any) {
          if (
            err?.message?.includes('fromLatLngToDivPixel') ||
            err?.message?.includes('Cannot read properties of null')
          ) {
            // Benign projection timing mismatch during map mount/unmount
            return;
          }
          console.warn('Overlay draw timing notice:', err);
        }
      };
    }

    const origSetMap = proto.setMap;
    if (typeof origSetMap === 'function') {
      proto.setMap = function (mapInstance: any) {
        try {
          return origSetMap.call(this, mapInstance);
        } catch (err: any) {
          if (
            err?.message?.includes('fromLatLngToDivPixel') ||
            err?.message?.includes('Cannot read properties of null')
          ) {
            return;
          }
          console.warn('Overlay setMap notice:', err);
        }
      };
    }
  }
}

interface DeckGlOverlayProps {
  heatmapData: { position: [number, number], weight: number }[];
}

export function DeckGlOverlay({ heatmapData }: DeckGlOverlayProps) {
  const map = useMap();
  const [overlay, setOverlay] = useState<GoogleMapsOverlay | null>(null);
  const overlayRef = useRef<GoogleMapsOverlay | null>(null);

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

  // Initialize overlay instance and safely attach when map projection is available
  useEffect(() => {
    if (!map) return;

    let isMounted = true;
    let listener: google.maps.MapsEventListener | null = null;
    let idleListener: google.maps.MapsEventListener | null = null;

    try {
      const instance = new GoogleMapsOverlay({
        interleaved: false,
      });
      overlayRef.current = instance;
      requestAnimationFrame(() => {
        if (isMounted) {
          setOverlay(instance);
        }
      });

      const attachWhenReady = () => {
        if (!isMounted || !overlayRef.current) return;
        try {
          overlayRef.current.setMap(map);
        } catch {
          // Handled gracefully by monkey-patch
        }
      };

      if (map.getProjection && map.getProjection()) {
        attachWhenReady();
      } else {
        listener = map.addListener('projection_changed', attachWhenReady);
        idleListener = map.addListener('idle', attachWhenReady);
      }
    } catch (err) {
      console.warn('DeckGL overlay initialization handled:', err);
    }

    return () => {
      isMounted = false;
      if (listener && window.google?.maps?.event) {
        google.maps.event.removeListener(listener);
      }
      if (idleListener && window.google?.maps?.event) {
        google.maps.event.removeListener(idleListener);
      }
      if (overlayRef.current) {
        try {
          overlayRef.current.setMap(null);
        } catch {}
      }
    };
  }, [map]);

  // Synchronize layers
  useEffect(() => {
    if (!overlay) return;
    try {
      overlay.setProps({ layers });
    } catch {}
  }, [overlay, layers]);

  return null;
}
