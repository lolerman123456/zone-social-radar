
import { useState, useEffect } from 'react';
import { getDatabase, ref, onValue, off, DataSnapshot } from "firebase/database";
import { getAuth } from "firebase/auth";

export const useNearbyUsers = () => {
  const [otherUsers, setOtherUsers] = useState<any[]>([]);
  const auth = getAuth();
  const db = getDatabase();

  useEffect(() => {
    const usersRef = ref(db, "users");

    const handleData = (snapshot: DataSnapshot) => {
      const data = snapshot.val();
      if (data) {
        const usersArray = Object.entries(data)
          .map(([uid, userData]: any) => ({
            uid,
            ...userData,
          }))
          .filter((u) => {
            if (u.uid === auth.currentUser?.uid) return false;
            const freshness = 60 * 1000; // 60 seconds
            const isFresh = Date.now() - u.updatedAt < freshness;
            return isFresh;
          });
        setOtherUsers(usersArray);
      }
    };

    onValue(usersRef, handleData);
    return () => off(usersRef, "value", handleData);
  }, []);

  return { otherUsers };
};
