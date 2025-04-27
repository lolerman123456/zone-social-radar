
import { useEffect, useRef } from 'react';
import { useMapMarkerAnimation } from '@/hooks/useMapMarkerAnimation';

interface UserLocationProps {
  map: google.maps.Map | null;
  location: { latitude: number; longitude: number } | null;
  radiusFeet: number;
}

const METERS_PER_FOOT = 0.3048;

const UserLocation = ({ map, location, radiusFeet }: UserLocationProps) => {
  const userMarkerRef = useRef<google.maps.Marker | null>(null);
  const radiusCircleRef = useRef<google.maps.Circle | null>(null);
  const userLocationRef = useRef<{lat: number, lng: number} | null>(null);
  const { animateMarkers, animationFrameRef } = useMapMarkerAnimation();

  useEffect(() => {
    if (!map || !location) return;

    userLocationRef.current = { lat: location.latitude, lng: location.longitude };

    if (!userMarkerRef.current) {
      userMarkerRef.current = new google.maps.Marker({
        position: userLocationRef.current,
        map,
        icon: {
          path: google.maps.SymbolPath.CIRCLE,
          fillColor: "#ea384c",
          fillOpacity: 1,
          strokeColor: "#ea384c",
          strokeWeight: 2,
          scale: 8
        },
        zIndex: 1000,
      });

      radiusCircleRef.current = new google.maps.Circle({
        map,
        center: userLocationRef.current,
        radius: radiusFeet * METERS_PER_FOOT,
        strokeColor: "#ea384c",
        strokeOpacity: 0.8,
        strokeWeight: 2,
        fillColor: "#ea384c",
        fillOpacity: 0.1,
        zIndex: 500,
      });
    }

    if (radiusCircleRef.current) {
      radiusCircleRef.current.setRadius(radiusFeet * METERS_PER_FOOT);
    }

    // Start animation loop for user marker
    animateMarkers(
      {},
      {},
      userMarkerRef.current,
      userLocationRef.current,
      radiusCircleRef.current
    );

    return () => {
      if (animationFrameRef.current !== null) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [map, location, radiusFeet, animateMarkers]);

  return null;
};

export default UserLocation;
