
import React, { useRef, useEffect } from 'react';
import { darkMapStyles } from '@/lib/mapStyles';

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

  useEffect(() => {
    if (!location || !mapRef.current) return;

    const initMap = () => {
      try {
        const userLocation = { lat: location.latitude, lng: location.longitude };

        const map = new google.maps.Map(mapRef.current!, {
          center: userLocation,
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

        const userCircleMarker = new google.maps.Marker({
          position: userLocation,
          map,
          icon: {
            path: google.maps.SymbolPath.CIRCLE,
            fillColor: "#ea384c",
            fillOpacity: 1,
            strokeColor: "#ea384c",
            strokeWeight: 2,
            scale: 8
          },
          zIndex: 1000
        });

        userMarkerRef.current = userCircleMarker;

        const radarCircle = new google.maps.Circle({
          map,
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

        map.addListener("dragstart", onMapDrag);
        map.addListener("idle", () => {
          if (isAnimating) setIsAnimating(false);
        });
      } catch (error) {
        console.error("Error initializing map:", error);
      }
    };

    initMap();
  }, [location, radiusFeet, isAnimating]);

  useEffect(() => {
    if (!googleMapRef.current || !location) return;

    nearbyMarkers.current.forEach(marker => marker.setMap(null));
    nearbyMarkers.current = [];

    otherUsers.forEach(user => {
      if (!user.lat || !user.lng || user.ghostMode) return;

      const marker = new google.maps.Marker({
        position: { lat: user.lat, lng: user.lng },
        map: googleMapRef.current,
        icon: {
          path: google.maps.SymbolPath.CIRCLE,
          fillColor: "#00FFAA",
          fillOpacity: 1,
          strokeColor: "#00FFAA",
          strokeWeight: 2,
          scale: 6
        }
      });

      nearbyMarkers.current.push(marker);
    });
  }, [otherUsers, location]);

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
    </div>
  );
};

export default Map;
