import { geohashForLocation, geohashQueryBounds, distanceBetween } from 'geofire-common';

export { geohashForLocation, distanceBetween };

/**
 * Returns Firestore query bounds for a geohash proximity query.
 * Use the result to run multiple range queries and merge client-side.
 *
 * @param lat - centre latitude
 * @param lng - centre longitude
 * @param radiusKm - search radius in kilometres
 */
export function proximityBounds(
  lat: number,
  lng: number,
  radiusKm: number,
): ReturnType<typeof geohashQueryBounds> {
  return geohashQueryBounds([lat, lng], radiusKm * 1000);
}

/**
 * Returns true if a point is within radiusKm of the centre.
 * Used for client-side filtering after the geohash range query over-fetches.
 */
export function withinRadius(
  centerLat: number,
  centerLng: number,
  pointLat: number,
  pointLng: number,
  radiusKm: number,
): boolean {
  const distanceKm = distanceBetween([pointLat, pointLng], [centerLat, centerLng]);
  return distanceKm <= radiusKm;
}
