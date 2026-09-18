import { IssueRepository } from '../repositories/issueRepository';
import { MapMarker } from '../models';
import { DEFAULT_MAP_CENTER } from '../config';

export const MapService = {
  /**
   * Retrieves map markers representing active concerns across coordinates
   */
  async getActiveMarkers(): Promise<MapMarker[]> {
    const issues = await IssueRepository.getAll();
    return issues
      .filter((i) => i.coordinates)
      .map((i) => ({
        id: i.id,
        lat: i.coordinates!.lat,
        lng: i.coordinates!.lng,
        title: i.title,
        status: i.status,
        category: i.category,
        urgency: i.urgency,
      }));
  },

  /**
   * Simulates looking up coordinates from physical street address with Mumbai neighborhood grounding
   */
  async geocodeAddress(address: string): Promise<{ lat: number; lng: number }> {
    console.log(`Geocoding lookup for address: ${address}`);
    return {
      lat: DEFAULT_MAP_CENTER.lat + (Math.random() - 0.5) * 0.05,
      lng: DEFAULT_MAP_CENTER.lng + (Math.random() - 0.5) * 0.05,
    };
  },
};
