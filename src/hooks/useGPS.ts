import { useState, useEffect, useCallback, useRef } from 'react';
import { gpsToSvg, type GPSStatus, type GPSPosition } from '@/lib/gps';
import { buildings, waypoints } from '@/lib/campus-data';
import { snapToNearestBuilding } from '@/lib/gps';

export function useGPS() {
  const [status, setStatus] = useState<GPSStatus>('idle');
  const [position, setPosition] = useState<GPSPosition | null>(null);
  const [error, setError] = useState<string | null>(null);
  const watchIdRef = useRef<number | null>(null);

  const handlePosition = useCallback((pos: GeolocationPosition) => {
    const { latitude: lat, longitude: lng, accuracy } = pos.coords;
    const svgPos = gpsToSvg(lat, lng);

    if (!svgPos) {
      setStatus('off_campus');
      setError('You appear to be off campus. GPS tracking paused.');
      return;
    }

    const snap = snapToNearestBuilding(lat, lng, buildings, waypoints);

    setPosition({
      lat,
      lng,
      accuracy,
      svgPos,
      nearestNodeId: snap?.nodeId ?? null,
      timestamp: Date.now(),
    });
    setStatus('tracking');
    setError(null);
  }, []);

  const handleError = useCallback(
    (err: GeolocationPositionError, isInitial: boolean) => {
      if (err.code === 1) {
        setStatus('denied');
        setError('Location access denied. Please enable GPS in browser settings.');
      } else if (isInitial) {
        setStatus('unavailable');
        setError('Could not get your location.');
      }
    },
    [],
  );

  const startTracking = useCallback(() => {
    if (!('geolocation' in navigator)) {
      setStatus('unavailable');
      setError('Geolocation not supported by this browser.');
      return;
    }

    setStatus('requesting');
    setError(null);

    // One-shot first reading for fast UX
    navigator.geolocation.getCurrentPosition(
      handlePosition,
      (err) => handleError(err, true),
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 5000 },
    );

    // Continuous watch
    watchIdRef.current = navigator.geolocation.watchPosition(
      handlePosition,
      (err) => handleError(err, false),
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 3000 },
    );
  }, [handlePosition, handleError]);

  const stopTracking = useCallback(() => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
    setStatus('idle');
    setPosition(null);
    setError(null);
  }, []);

  useEffect(() => {
    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
    };
  }, []);

  return { status, position, error, startTracking, stopTracking };
}
