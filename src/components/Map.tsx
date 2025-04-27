
import React, { useRef, useEffect, useState } from 'react';
import { darkMapStyles } from '@/lib/mapStyles';
import { motion, AnimatePresence } from 'framer-motion';
import SocialCard from './SocialCard';

const ZOOM_MIN = 15;
const ZOOM_MAX = 20;
const METERS_PER_FOOT = 0.3048;

interface MapProps {
  location: { latitude: number; longitude: number } | null;
  radiusFeet: number;
  otherUsers: any[];
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
  const nearbyMarkers = useRef<google.maps.Marker[]>([]);
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
      // Smoothly animate marker to new position
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
    
    // Clear existing markers
    nearbyMarkers.current.forEach(marker => {
      google.maps.event.clearInstanceListeners(marker);
      marker.setMap(null);
    });
    nearbyMarkers.current = [];

    // Add markers for each user in range
    otherUsers.forEach(user => {
      if (!user.lat || !user.lng || user.ghostMode) return;

      const userPosition = { lat: user.lat, lng: user.lng };
      
      const marker = new google.maps.Marker({
        position: userPosition,
        map: googleMapRef.current,
        icon: {
          path: google.maps.SymbolPath.CIRCLE,
          fillColor: "#00FFAA",
          fillOpacity: 1,
          strokeColor: "#00FFAA",
          strokeWeight: 2,
          scale: 6
        },
        animation: google.maps.Animation.DROP
      });

      // Add click event for marker
      marker.addListener("click", () => {
        // Convert user data to format expected by SocialCard
        const socialCardData = {
          id: user.uid,
          name: user.name || 'Unknown User',
          photoUrl: user.photoUrl,
          socialLinks: {
            instagram: user.socials?.instagram || '',
            twitter: user.socials?.tiktok || '',
          }
        };
        
        setSelectedUser(socialCardData);
      });

      nearbyMarkers.current.push(marker);
    });
  }, [otherUsers, location]);

  // Helper function for smooth marker animation
  const animateMarkerTo = (marker: google.maps.Marker, newPosition: google.maps.LatLngLiteral) => {
    const startPosition = marker.getPosition()?.toJSON();
    if (!startPosition) {
      marker.setPosition(newPosition);
      return;
    }
    
    const frames = 50;
    const duration = 500; // ms
    let frame = 0;
    
    const animate = () => {
      if (frame >= frames) {
        marker.setPosition(newPosition);
        return;
      }
      
      frame++;
      const progress = frame / frames;
      
      // Linear interpolation between positions
      const lat = startPosition.lat + (newPosition.lat - startPosition.lat) * progress;
      const lng = startPosition.lng + (newPosition.lng - startPosition.lng) * progress;
      
      marker.setPosition({ lat, lng });
      
      setTimeout(animate, duration / frames);
    };
    
    animate();
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
