import { IssueRepository } from '../repositories/issueRepository';
import { MapMarker } from '../models';

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
   * Simulates looking up coordinates from physical street address
   */
  async geocodeAddress(address: string): Promise<{ lat: number; lng: number }> {
    // Standard coordinates for general vicinity
    console.log(`Simulating geocoding lookups for address: ${address}`);
    return {
      lat: 37.7749 + (Math.random() - 0.5) * 0.05,
      lng: -122.4194 + (Math.random() - 0.5) * 0.05,
    };
  },
};
