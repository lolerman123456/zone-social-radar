
import { useState, useEffect } from 'react';

export interface LocationState {
  latitude: number;
  longitude: number;
  accuracy: number;
  timestamp: number;
}

export interface UseLocationResult {
  location: LocationState | null;
  error: string | null;
  requestPermission: () => void;
  permissionState: PermissionState | null;
  permissionDenied: boolean;
}

const useLocation = (options?: PositionOptions): UseLocationResult => {
  const [location, setLocation] = useState<LocationState | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [permissionState, setPermissionState] = useState<PermissionState | null>(null);
  const [permissionDenied, setPermissionDenied] = useState(false);

  const onSuccess = (position: GeolocationPosition) => {
    setLocation({
      latitude: position.coords.latitude,
      longitude: position.coords.longitude,
      accuracy: position.coords.accuracy,
      timestamp: position.timestamp,
    });
    setError(null);
  };

  const onError = (error: GeolocationPositionError) => {
    setError(error.message);
    if (error.code === 1) {
      setPermissionDenied(true);
    }
  };

  const requestPermission = async () => {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by this browser");
      return;
    }
    
    try {
      const permission = await navigator.permissions.query({ name: "geolocation" as PermissionName });
      setPermissionState(permission.state);
      
      if (permission.state === "granted" || permission.state === "prompt") {
        navigator.geolocation.getCurrentPosition(onSuccess, onError, options);
      } else {
        setPermissionDenied(true);
      }
      
      permission.addEventListener("change", () => {
        setPermissionState(permission.state);
        if (permission.state === "granted") {
          setPermissionDenied(false);
        } else if (permission.state === "denied") {
          setPermissionDenied(true);
        }
      });
    } catch (err) {
      // Fallback for browsers that don't support permissions API
      navigator.geolocation.getCurrentPosition(onSuccess, onError, options);
    }
  };

  useEffect(() => {
    let watchId: number | null = null;
    
    if (permissionState === "granted") {
      watchId = navigator.geolocation.watchPosition(onSuccess, onError, options);
    }
    
    return () => {
      if (watchId !== null) {
        navigator.geolocation.clearWatch(watchId);
      }
    };
  }, [permissionState, options]);

  return { 
    location, 
    error, 
    requestPermission,
    permissionState,
    permissionDenied 
  };
};

export default useLocation;
