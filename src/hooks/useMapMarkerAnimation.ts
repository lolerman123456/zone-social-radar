
import { useRef, useCallback } from 'react';
import { motion } from 'framer-motion';

const ANIMATION_SPEED = 0.08;

export const useMapMarkerAnimation = () => {
  const animationFrameRef = useRef<number | null>(null);

  const animateMarkers = useCallback((
    markers: { [key: string]: google.maps.Marker },
    targetPositions: { [key: string]: google.maps.LatLngLiteral },
    userMarker?: google.maps.Marker | null,
    userLocation?: { lat: number; lng: number } | null,
    radiusCircle?: google.maps.Circle | null
  ) => {
    // Process smooth marker animations for nearby users
    Object.keys(markers).forEach(uid => {
      const marker = markers[uid];
      const targetPosition = targetPositions[uid];
      
      if (marker && targetPosition) {
        const currentPosition = marker.getPosition()?.toJSON();
        if (currentPosition) {
          const newLat = currentPosition.lat + (targetPosition.lat - currentPosition.lat) * ANIMATION_SPEED;
          const newLng = currentPosition.lng + (targetPosition.lng - currentPosition.lng) * ANIMATION_SPEED;
          
          marker.setPosition({ lat: newLat, lng: newLng });
        }
      }
    });
    
    // Also animate user marker with the same smoothness if it exists
    if (userMarker && userLocation) {
      const currentPosition = userMarker.getPosition()?.toJSON();
      if (currentPosition) {
        const newLat = currentPosition.lat + (userLocation.lat - currentPosition.lat) * ANIMATION_SPEED;
        const newLng = currentPosition.lng + (userLocation.lng - currentPosition.lng) * ANIMATION_SPEED;
        
        userMarker.setPosition({ lat: newLat, lng: newLng });
        
        // Move radius circle along with the user marker
        if (radiusCircle) {
          radiusCircle.setCenter({ lat: newLat, lng: newLng });
        }
      }
    }
    
    // Continue animation loop
    animationFrameRef.current = requestAnimationFrame(() => 
      animateMarkers(markers, targetPositions, userMarker, userLocation, radiusCircle)
    );
  }, []);

  return {
    animateMarkers,
    animationFrameRef
  };
};
