// Production browser geolocation helpers for Luke Shop delivery location.
// Persistence is handled by the real Luke Shop Backend API; this module only
// acquires customer-approved browser coordinates.

export const DELIVERY_LOCATION_PROTOTYPE = false;

export function geolocationSupported() {
  return typeof navigator !== 'undefined' && 'geolocation' in navigator;
}

export function getCurrentLocation({ timeout = 12000 } = {}) {
  return new Promise((resolve, reject) => {
    if (!geolocationSupported()) { reject(new Error('Location is not supported on this device.')); return; }
    navigator.geolocation.getCurrentPosition(
      (pos) => resolve({
        latitude: pos.coords.latitude,
        longitude: pos.coords.longitude,
        accuracy_meters: pos.coords.accuracy,
        location_source: 'GPS',
        location_updated_at: new Date().toISOString(),
      }),
      (err) => reject(new Error(err.code === 1 ? 'Location permission was denied.' : 'Could not get your location right now.')),
      { enableHighAccuracy: true, timeout, maximumAge: 0 },
    );
  });
}

export function startLiveShare(onUpdate, onError) {
  if (!geolocationSupported()) { onError?.(new Error('Location is not supported on this device.')); return () => {}; }
  const id = navigator.geolocation.watchPosition(
    (pos) => onUpdate?.({
      latitude: pos.coords.latitude,
      longitude: pos.coords.longitude,
      accuracy_meters: pos.coords.accuracy,
      location_source: 'GPS',
      location_updated_at: new Date().toISOString(),
    }),
    (err) => onError?.(new Error(err.code === 1 ? 'Location permission was denied.' : 'Live location paused — signal lost.')),
    { enableHighAccuracy: true, timeout: 15000, maximumAge: 2000 },
  );
  return () => { try { navigator.geolocation.clearWatch(id); } catch { /* ignore */ } };
}

export function shouldStopSharing(orderStatus, fulfillmentStatus) {
  const done = ['DELIVERED', 'COMPLETED', 'PICKED_UP', 'CANCELLED', 'FAILED', 'REFUNDED'];
  return done.includes(String(orderStatus || '').toUpperCase()) || done.includes(String(fulfillmentStatus || '').toUpperCase());
}

export function mapLink(location) {
  if (location?.latitude == null || location?.longitude == null) return '';
  return `https://www.google.com/maps?q=${encodeURIComponent(`${location.latitude},${location.longitude}`)}`;
}
