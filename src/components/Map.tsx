
import React, { useRef, useEffect, useState } from 'react';
import { darkMapStyles } from '@/lib/mapStyles';
import { motion, AnimatePresence } from 'framer-motion';
import SocialCard from './SocialCard';
import { NearbyUser } from '@/hooks/useNearbyUsers';
import UserMarkers from './map/UserMarkers';
import UserLocation from './map/UserLocation';

const ZOOM_MIN = 15;
const ZOOM_MAX = 20;

interface MapProps {
  location: { latitude: number; longitude: number } | null;
  radiusFeet: number;
  otherUsers: NearbyUser[];
  onMapDrag: () => void;
  isAnimating: boolean;
  setIsAnimating: (value: boolean) => void;
}

const Map: React.FC<MapProps> = ({
  location,
  radiusFeet,
  otherUsers,
  onMapDrag,
  isAnimating,
  setIsAnimating
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const googleMapRef = useRef<google.maps.Map | null>(null);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  
  // Initialize map
  useEffect(() => {
    if (!mapRef.current) return;
    
    const initialLocation = location ? 
      { lat: location.latitude, lng: location.longitude } : 
      { lat: 37.7749, lng: -122.4194 };
    
    const map = new google.maps.Map(mapRef.current, {
      center: initialLocation,
      zoom: getZoomFromRadius(radiusFeet),
      disableDefaultUI: true,
      styles: darkMapStyles,
      gestureHandling: "greedy",
      backgroundColor: '#10141B',
      maxZoom: ZOOM_MAX,
      minZoom: ZOOM_MIN,
      tilt: 0,
      clickableIcons: false
    });

    googleMapRef.current = map;

    map.addListener("dragstart", onMapDrag);
    map.addListener("idle", () => {
      if (isAnimating) setIsAnimating(false);
    });
    
    return () => {
      if (googleMapRef.current) {
        google.maps.event.clearInstanceListeners(googleMapRef.current);
      }
    };
  }, []);

  const getZoomFromRadius = (feet: number) => {
    const meters = feet * 0.3048;
    return Math.max(
      ZOOM_MIN,
      Math.min(
        ZOOM_MAX,
        20 - Math.log2(meters / 15)
      )
    );
  };

  return (
    <div className="w-full h-full">
      <div ref={mapRef} className="w-full h-full" />
      
      {googleMapRef.current && (
        <>
          <UserLocation
            map={googleMapRef.current}
            location={location}
            radiusFeet={radiusFeet}
          />
          <UserMarkers
            map={googleMapRef.current}
            otherUsers={otherUsers}
            onUserSelect={setSelectedUser}
          />
        </>
      )}
      
      <AnimatePresence>
        {selectedUser && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
          >
            <SocialCard 
              user={selectedUser} 
              onClose={() => setSelectedUser(null)}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Map;
