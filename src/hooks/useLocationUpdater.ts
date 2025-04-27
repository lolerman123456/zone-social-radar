
import { useEffect, useRef } from 'react';
import { getDatabase, ref, set } from "firebase/database";
import { getAuth } from "firebase/auth";
import { LocationState } from './useLocation';

export const useLocationUpdater = (
  location: LocationState | null,
  ghostMode: boolean
) => {
  const auth = getAuth();
  const db = getDatabase();
  const prevLocation = useRef<{lat: number, lng: number} | null>(null);

  useEffect(() => {
    if (location) {
      const currentLocation = {
        lat: location.latitude,
        lng: location.longitude
      };
      
      // Only update if position has changed significantly (prevents database spam)
      const hasMovedEnough = !prevLocation.current || 
        calculateDistance(prevLocation.current, currentLocation) > 5; // 5 meters threshold
        
      if (hasMovedEnough) {
        updateLocation(location.latitude, location.longitude);
        prevLocation.current = currentLocation;
      }
    }
  }, [location, ghostMode]);

  const updateLocation = (latitude: number, longitude: number) => {
    const user = auth.currentUser;
    if (!user) return;

    const userRef = ref(db, `users/${user.uid}`);
    
    // Different data depending on ghost mode
    if (ghostMode) {
      // In ghost mode, don't send location
      set(userRef, {
        uid: user.uid,
        ghostMode: true,
        updatedAt: Date.now()
      });
    } else {
      // Normal mode with location
      set(userRef, {
        uid: user.uid,
        lat: latitude,
        lng: longitude,
        ghostMode: false,
        updatedAt: Date.now(),
        socials: {
          instagram: '@placeholder'
        }
      });
    }
  };
  
  // Helper function to calculate distance between two points in meters
  const calculateDistance = (point1: {lat: number, lng: number}, point2: {lat: number, lng: number}) => {
    const R = 6371e3; // Earth radius in meters
    const φ1 = point1.lat * Math.PI/180;
    const φ2 = point2.lat * Math.PI/180;
    const Δφ = (point2.lat - point1.lat) * Math.PI/180;
    const Δλ = (point2.lng - point1.lng) * Math.PI/180;

    const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ/2) * Math.sin(Δλ/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    
    return R * c; // Distance in meters
  };

  return { updateLocation };
};
