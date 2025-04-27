
import { useState, useEffect } from 'react';
import { getDatabase, ref, onValue, off, DataSnapshot } from "firebase/database";
import { getAuth } from "firebase/auth";

export interface NearbyUser {
  uid: string;
  name?: string;
  lat?: number;
  lng?: number;
  updatedAt?: number;
  ghostMode?: boolean;
  photoUrl?: string;
  socials?: {
    instagram?: string;
    tiktok?: string;
    twitter?: string;
  };
}

export const useNearbyUsers = () => {
  const [otherUsers, setOtherUsers] = useState<NearbyUser[]>([]);
  const [loading, setLoading] = useState(true);
  const auth = getAuth();
  const db = getDatabase();

  useEffect(() => {
    const usersRef = ref(db, "users");
    console.log("Starting to listen for nearby users");

    const handleData = (snapshot: DataSnapshot) => {
      const data = snapshot.val();
      if (data) {
        console.log("Received users data:", data);
        const usersArray = Object.entries(data)
          .map(([uid, userData]: [string, any]) => ({
            uid,
            ...userData,
          }))
          .filter((u) => {
            // Filter out current user
            if (u.uid === auth.currentUser?.uid) return false;
            
            // Filter out users without location
            if (!u.lat || !u.lng) return false;
            
            // Filter out users in ghost mode
            if (u.ghostMode) return false;
            
            // Check for freshness (active in the last 60 seconds)
            const freshness = 60 * 1000; // 60 seconds
            const isFresh = u.updatedAt && (Date.now() - u.updatedAt < freshness);
            return isFresh;
          });
        
        console.log("Filtered nearby users:", usersArray);
        setOtherUsers(usersArray);
      } else {
        console.log("No users data available");
        setOtherUsers([]);
      }
      setLoading(false);
    };

    onValue(usersRef, handleData, (error) => {
      console.error("Error fetching nearby users:", error);
      setLoading(false);
    });
    
    return () => off(usersRef, "value", handleData);
  }, []);

  return { otherUsers, loading };
};
