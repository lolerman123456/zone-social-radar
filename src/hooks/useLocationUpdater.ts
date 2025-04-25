
import { useEffect } from 'react';
import { getDatabase, ref, set } from "firebase/database";
import { getAuth } from "firebase/auth";
import { LocationState } from './useLocation';

export const useLocationUpdater = (
  location: LocationState | null,
  ghostMode: boolean
) => {
  const auth = getAuth();
  const db = getDatabase();

  useEffect(() => {
    if (location) {
      updateLocation(location.latitude, location.longitude);
    }
  }, [location, ghostMode]);

  const updateLocation = (latitude: number, longitude: number) => {
    const user = auth.currentUser;
    if (!user) return;

    const userRef = ref(db, `users/${user.uid}`);
    set(userRef, {
      uid: user.uid,
      lat: latitude,
      lng: longitude,
      ghostMode: ghostMode,
      updatedAt: Date.now(),
      socials: {
        instagram: '@placeholder'
      }
    });
  };

  return { updateLocation };
};
