
import { useEffect, useRef } from 'react';
import { NearbyUser } from '@/hooks/useNearbyUsers';
import { useMapMarkerAnimation } from '@/hooks/useMapMarkerAnimation';

interface UserMarkersProps {
  map: google.maps.Map | null;
  otherUsers: NearbyUser[];
  onUserSelect: (user: any) => void;
}

const UserMarkers = ({ map, otherUsers, onUserSelect }: UserMarkersProps) => {
  const nearbyMarkers = useRef<{[key: string]: google.maps.Marker}>({});
  const markersPositionRef = useRef<{[key: string]: google.maps.LatLngLiteral}>({});
  const { animateMarkers, animationFrameRef } = useMapMarkerAnimation();

  useEffect(() => {
    if (!map) return;
    
    const existingMarkerIds = new Set(Object.keys(nearbyMarkers.current));
    
    otherUsers.forEach(user => {
      if (!user.lat || !user.lng || user.ghostMode) return;
      existingMarkerIds.delete(user.uid);
      
      const userPosition = { lat: user.lat, lng: user.lng };
      markersPositionRef.current[user.uid] = userPosition;
      
      if (!nearbyMarkers.current[user.uid]) {
        const marker = new google.maps.Marker({
          position: userPosition,
          map,
          icon: {
            path: google.maps.SymbolPath.CIRCLE,
            fillColor: "#00FFAA",
            fillOpacity: 1,
            strokeColor: "#00FFAA",
            strokeWeight: 2,
            scale: 6
          },
          title: user.name || 'User'
        });

        marker.addListener("click", () => {
          const originalScale = marker.getIcon() as google.maps.Symbol;
          const expandedIcon = {
            ...originalScale,
            scale: 8
          };
          marker.setIcon(expandedIcon);
          
          setTimeout(() => {
            marker.setIcon(originalScale);
          }, 300);
          
          const socialCardData = {
            id: user.uid,
            name: user.name || 'User ' + user.uid.substring(0, 4),
            photoUrl: user.photoUrl,
            socialLinks: {
              instagram: user.socials?.instagram || '',
              twitter: user.socials?.twitter || '',
            }
          };
          
          onUserSelect(socialCardData);
        });

        nearbyMarkers.current[user.uid] = marker;
      }
    });
    
    existingMarkerIds.forEach(uid => {
      if (nearbyMarkers.current[uid]) {
        nearbyMarkers.current[uid].setMap(null);
        delete nearbyMarkers.current[uid];
        delete markersPositionRef.current[uid];
      }
    });

    // Start animation loop
    animateMarkers(nearbyMarkers.current, markersPositionRef.current);

    return () => {
      if (animationFrameRef.current !== null) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      Object.values(nearbyMarkers.current).forEach(marker => {
        marker.setMap(null);
        google.maps.event.clearInstanceListeners(marker);
      });
    };
  }, [map, otherUsers, onUserSelect, animateMarkers]);

  return null;
};

export default UserMarkers;
