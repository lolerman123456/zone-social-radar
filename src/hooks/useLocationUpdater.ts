
import { useEffect, useRef } from 'react';
import { getDatabase, ref, set, get } from "firebase/database";
import { getAuth } from "firebase/auth";
import { LocationState } from './useLocation';

export const useLocationUpdater = (
  location: LocationState | null,
  ghostMode: boolean
) => {
  const auth = getAuth();
  const db = getDatabase();
  const prevLocation = useRef<{lat: number, lng: number} | null>(null);
  const userDataRef = useRef<any>(null);
  const updateIntervalRef = useRef<number | null>(null);

  // Load initial user data once
  useEffect(() => {
    const loadUserData = async () => {
      const user = auth.currentUser;
      if (!user) return;

      try {
        const userRef = ref(db, `users/${user.uid}`);
        const snapshot = await get(userRef);
        if (snapshot.exists()) {
          userDataRef.current = snapshot.val();
          console.log("Loaded user data:", userDataRef.current);
        }
      } catch (error) {
        console.error("Error loading user data:", error);
      }
    };
    
    if (auth.currentUser) {
      loadUserData();
    }
    
    // Set up interval to force update location EVERY 1 SECOND
    if (updateIntervalRef.current === null) {
      updateIntervalRef.current = window.setInterval(() => {
        if (location && auth.currentUser) {
          // Force update location every 1 second regardless of movement
          updateLocation(location.latitude, location.longitude);
        }
      }, 1000); // Changed to 1 second for more responsive updates
    }
    
    return () => {
      if (updateIntervalRef.current !== null) {
        clearInterval(updateIntervalRef.current);
        updateIntervalRef.current = null;
      }
    };
  }, [auth.currentUser?.uid]);

  // Update location when it changes
  useEffect(() => {
    if (location) {
      const currentLocation = {
        lat: location.latitude,
        lng: location.longitude
      };
      
      // Minimal threshold (0.1 meter) to capture very small movements
      const hasMovedEnough = !prevLocation.current || 
        calculateDistance(prevLocation.current, currentLocation) > 0.1; // 0.1 meter threshold (was 0.5)
        
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
      // In ghost mode, don't send location but keep updating timestamp
      set(userRef, {
        uid: user.uid,
        ghostMode: true,
        updatedAt: Date.now(),
        // Preserve other user data
        name: userDataRef.current?.name || user.displayName || 'User',
        photoUrl: userDataRef.current?.photoUrl || user.photoURL,
        socials: userDataRef.current?.socials || {}
      });
    } else {
      // Normal mode with location
      set(userRef, {
        uid: user.uid,
        lat: latitude,
        lng: longitude,
        ghostMode: false,
        updatedAt: Date.now(),
        // Preserve user data
        name: userDataRef.current?.name || user.displayName || 'User',
        photoUrl: userDataRef.current?.photoUrl || user.photoURL,
        socials: userDataRef.current?.socials || {}
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
