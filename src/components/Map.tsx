
import React, { useRef, useEffect, useState } from 'react';
import { darkMapStyles } from '@/lib/mapStyles';
import { motion, AnimatePresence } from 'framer-motion';
import SocialCard from './SocialCard';
import { NearbyUser } from '@/hooks/useNearbyUsers';

const ZOOM_MIN = 15;
const ZOOM_MAX = 20;
const METERS_PER_FOOT = 0.3048;

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
  const userMarkerRef = useRef<google.maps.Marker | null>(null);
  const radiusCircleRef = useRef<google.maps.Circle | null>(null);
  const nearbyMarkers = useRef<{[key: string]: google.maps.Marker}>({});
  const markersPositionRef = useRef<{[key: string]: google.maps.LatLngLiteral}>({});
  const [selectedUser, setSelectedUser] = useState<any>(null);

  // Initialize map as soon as component mounts, don't wait for location
  useEffect(() => {
    if (!mapRef.current) return;
    
    const initialLocation = location ? 
      { lat: location.latitude, lng: location.longitude } : 
      { lat: 37.7749, lng: -122.4194 }; // Default location until we get user's location
    
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

    // Add event listeners for map interaction
    map.addListener("dragstart", onMapDrag);
    map.addListener("idle", () => {
      if (isAnimating) setIsAnimating(false);
    });
    
    // Animation loop to smoothly move markers
    const animationFrame = () => {
      // Process smooth marker animations
      Object.keys(nearbyMarkers.current).forEach(uid => {
        const marker = nearbyMarkers.current[uid];
        const targetPosition = markersPositionRef.current[uid];
        
        if (marker && targetPosition) {
          const currentPosition = marker.getPosition()?.toJSON();
          if (currentPosition) {
            // Interpolate position for smooth movement (easing function)
            const newLat = currentPosition.lat + (targetPosition.lat - currentPosition.lat) * 0.1;
            const newLng = currentPosition.lng + (targetPosition.lng - currentPosition.lng) * 0.1;
            
            marker.setPosition({ lat: newLat, lng: newLng });
          }
        }
      });
      
      requestAnimationFrame(animationFrame);
    };
    
    requestAnimationFrame(animationFrame);
    
    return () => {
      // Clean up Google Maps objects when component unmounts
      if (googleMapRef.current) {
        google.maps.event.clearInstanceListeners(googleMapRef.current);
      }
    };
  }, []);

  // Update map when location changes
  useEffect(() => {
    if (!googleMapRef.current || !location) return;
    
    const userLocation = { lat: location.latitude, lng: location.longitude };
    
    // Only center map on first location or when animating back to user location
    if (!userMarkerRef.current || isAnimating) {
      googleMapRef.current.panTo(userLocation);
    }
    
    // Create or update user marker with animation
    if (!userMarkerRef.current) {
      const userCircleMarker = new google.maps.Marker({
        position: userLocation,
        map: googleMapRef.current,
        icon: {
          path: google.maps.SymbolPath.CIRCLE,
          fillColor: "#ea384c",
          fillOpacity: 1,
          strokeColor: "#ea384c",
          strokeWeight: 2,
          scale: 8
        },
        zIndex: 1000,
        animation: google.maps.Animation.DROP
      });

      userMarkerRef.current = userCircleMarker;
    } else {
      // Update target position - animation handled by animation loop
      animateMarkerTo(userMarkerRef.current, userLocation);
    }

    // Create or update radius circle
    if (!radiusCircleRef.current) {
      const radarCircle = new google.maps.Circle({
        map: googleMapRef.current,
        center: userLocation,
        radius: radiusFeet * METERS_PER_FOOT,
        strokeColor: "#ea384c",
        strokeOpacity: 0.8,
        strokeWeight: 2,
        fillColor: "#ea384c",
        fillOpacity: 0.1,
        zIndex: 500,
      });

      radiusCircleRef.current = radarCircle;
    } else {
      radiusCircleRef.current.setCenter(userLocation);
      radiusCircleRef.current.setRadius(radiusFeet * METERS_PER_FOOT);
    }
  }, [location, radiusFeet, isAnimating]);

  // Update other users' markers
  useEffect(() => {
    if (!googleMapRef.current || !location) return;
    
    console.log("Updating markers for other users:", otherUsers);
    
    // Track existing marker IDs for cleanup
    const existingMarkerIds = new Set(Object.keys(nearbyMarkers.current));
    
    // Create or update markers for each user in range
    otherUsers.forEach(user => {
      if (!user.lat || !user.lng || user.ghostMode) return;
      existingMarkerIds.delete(user.uid); // Keep this marker

      console.log("Processing user:", user.name || user.uid);
      const userPosition = { lat: user.lat, lng: user.lng };
      
      // Store target position for animation
      markersPositionRef.current[user.uid] = userPosition;
      
      if (!nearbyMarkers.current[user.uid]) {
        // Create new marker if it doesn't exist
        console.log("Creating new marker for", user.name || user.uid);
        const marker = new google.maps.Marker({
          position: userPosition, // Start at actual position
          map: googleMapRef.current,
          icon: {
            path: google.maps.SymbolPath.CIRCLE,
            fillColor: "#00FFAA",
            fillOpacity: 1,
            strokeColor: "#00FFAA",
            strokeWeight: 2,
            scale: 6
          },
          animation: google.maps.Animation.DROP,
          title: user.name || 'User'
        });

        // Add click event with animation for marker
        marker.addListener("click", () => {
          // Animation effect when clicked
          const originalScale = marker.getIcon() as google.maps.Symbol;
          const expandedIcon = {
            ...originalScale,
            scale: 8 // Make it slightly bigger when clicked
          };
          marker.setIcon(expandedIcon);
          
          setTimeout(() => {
            marker.setIcon(originalScale);
          }, 300);
          
          // Convert user data to format expected by SocialCard
          const socialCardData = {
            id: user.uid,
            name: user.name || 'User ' + user.uid.substring(0, 4),
            photoUrl: user.photoUrl,
            socialLinks: {
              instagram: user.socials?.instagram || '',
              twitter: user.socials?.tiktok || '',
            }
          };
          
          setSelectedUser(socialCardData);
        });

        nearbyMarkers.current[user.uid] = marker;
      }
    });
    
    // Clean up markers for users who are no longer nearby
    existingMarkerIds.forEach(uid => {
      if (nearbyMarkers.current[uid]) {
        nearbyMarkers.current[uid].setMap(null);
        google.maps.event.clearInstanceListeners(nearbyMarkers.current[uid]);
        delete nearbyMarkers.current[uid];
        delete markersPositionRef.current[uid];
      }
    });
  }, [otherUsers, location]);

  // Helper function for smooth marker animation setup
  const animateMarkerTo = (marker: google.maps.Marker, newPosition: google.maps.LatLngLiteral) => {
    const currentPosition = marker.getPosition()?.toJSON();
    if (!currentPosition) {
      marker.setPosition(newPosition);
      return;
    }
    
    // Only update target position - animation handled by animation loop
    marker.set("targetPosition", newPosition);
  };

  // Helper function to calculate zoom level based on radius
  const getZoomFromRadius = (feet: number) => {
    const meters = feet * METERS_PER_FOOT;
    const baseZoom = 20;
    return Math.max(
      ZOOM_MIN,
      Math.min(
        ZOOM_MAX,
        baseZoom - Math.log2(meters / 15)
      )
    );
  };

  return (
    <div className="w-full h-full">
      <div ref={mapRef} className="w-full h-full" />
      
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
