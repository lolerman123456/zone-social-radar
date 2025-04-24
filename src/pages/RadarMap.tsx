
import { getDatabase, ref, onValue, set, off } from "firebase/database";
import { getAuth } from "firebase/auth";
import { DataSnapshot } from "firebase/database";
import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Wrapper } from "@googlemaps/react-wrapper";
import { useAuth } from '@/hooks/useAuth';
import useLocation from '@/hooks/useLocation';
import RadiusSlider from '@/components/RadiusSlider';
import GhostModeToggle from '@/components/GhostModeToggle';
import RecenterButton from '@/components/RecenterButton';
import LocationPermissionModal from '@/components/LocationPermissionModal';
import ProfileDrawer from '@/components/ProfileDrawer';
import { darkMapStyles } from '@/lib/mapStyles';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import PlaceMarker from '@/components/PlaceMarker';
import { createRoot } from 'react-dom/client';

const API_KEY = "AIzaSyCjIwAJEFHqjHDOABZzeOQtvVg7F8ESYHI";
const METERS_PER_FOOT = 0.3048;

const ZOOM_MIN = 15;
const ZOOM_MAX = 20;
const RADIUS_MIN = 20;
const RADIUS_MAX = 150;

const animateMapTo = (
  map: google.maps.Map, 
  { center, zoom }: { center?: google.maps.LatLngLiteral, zoom?: number },
  duration = 500
) => {
  if (!map) return;
  
  const startCenter = map.getCenter()?.toJSON();
  const startZoom = map.getZoom();
  const targetCenter = center || startCenter;
  const targetZoom = zoom !== undefined ? zoom : startZoom;
  
  if (center && map.panTo) {
    map.panTo(targetCenter);
  }
  
  if (zoom !== undefined && startZoom !== targetZoom) {
    map.setZoom(targetZoom);
  }
};

const RadarMap: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const mapRef = useRef<HTMLDivElement>(null);
  const googleMapRef = useRef<google.maps.Map | null>(null);
  const userMarkerRef = useRef<google.maps.Marker | null>(null);
  const radiusCircleRef = useRef<google.maps.Circle | null>(null);
  const nearbyMarkers = useRef<google.maps.Marker[]>([]);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [radiusFeet, setRadiusFeet] = useState(RADIUS_MIN);
  const [radiusMeters, setRadiusMeters] = useState(RADIUS_MIN * METERS_PER_FOOT);
  const [ghostMode, setGhostMode] = useState(false);
  const [showProfileDrawer, setShowProfileDrawer] = useState(false);
  const [mapDragged, setMapDragged] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [otherUsers, setOtherUsers] = useState<any[]>([]);
  const { 
    location, 
    error: locationError, 
    requestPermission, 
    permissionState,
    permissionDenied 
  } = useLocation({
    enableHighAccuracy: true,
    timeout: 10000,
    maximumAge: 0
  });

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
          .filter((u) => u.uid !== auth.currentUser?.uid); // Exclude current user
        setOtherUsers(usersArray);
      }
    };

    onValue(usersRef, handleData);
    return () => off(usersRef, "value", handleData);
  }, []);

  function updateLocation(latitude: number, longitude: number) {
    const user = auth.currentUser;
    if (!user) return;

    const userRef = ref(db, `users/${user.uid}`);
    set(userRef, {
      uid: user.uid,
      lat: latitude,
      lng: longitude,
      ghostMode: false,
      updatedAt: Date.now(),
      socials: {
        instagram: '@placeholder'
      }
    });
  }

  useEffect(() => {
    if (location) {
      updateLocation(location.latitude, location.longitude);
    }
  }, [location]);

  const showLocationModal = !location && (permissionState === 'prompt' || permissionDenied);

  useEffect(() => {
    if (!location || !mapRef.current || mapLoaded) return;
    
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
        
        const addExamplePlaces = () => {
          const places = [
            {
              position: {
                lat: location.latitude + 0.001,
                lng: location.longitude + 0.001
              },
              type: 'library' as const
            },
            {
              position: {
                lat: location.latitude - 0.001,
                lng: location.longitude + 0.002
              },
              type: 'coffee' as const
            },
            {
              position: {
                lat: location.latitude + 0.002,
                lng: location.longitude - 0.001
              },
              type: 'unknown' as const
            }
          ];
          
          places.forEach(place => {
            const customMarkerDiv = document.createElement("div");
            const root = createRoot(customMarkerDiv);
            root.render(<PlaceMarker type={place.type} />);
            
            const customMarkerOverlay = new google.maps.OverlayView();
            
            customMarkerOverlay.onAdd = function() {
              const panes = this.getPanes();
              panes.overlayMouseTarget.appendChild(customMarkerDiv);
            };
            
            customMarkerOverlay.draw = function() {
              const projection = this.getProjection();
              if (!projection) return;
              
              const position = projection.fromLatLngToDivPixel(
                new google.maps.LatLng(place.position.lat, place.position.lng)
              );
              
              if (position) {
                customMarkerDiv.style.position = 'absolute';
                customMarkerDiv.style.left = (position.x - 12) + 'px';
                customMarkerDiv.style.top = (position.y - 12) + 'px';
              }
            };
            
            customMarkerOverlay.setMap(map);
            
            const stdMarker = new google.maps.Marker({
              position: place.position,
              map,
              visible: false
            });
            
            nearbyMarkers.current.push(stdMarker);
          });
        };
        
        map.addListener("dragstart", () => {
          setMapDragged(true);
        });
        
        map.addListener("idle", () => {
          if (isAnimating) {
            setIsAnimating(false);
          }
        });
        
        googleMapRef.current = map;
        userMarkerRef.current = userCircleMarker;
        radiusCircleRef.current = radarCircle;
        
        try {
          addExamplePlaces();
        } catch (error) {
          console.error("Failed to add place markers:", error);
        }
        
        setMapLoaded(true);
      } catch (error) {
        console.error("Error initializing map:", error);
      }
    };
    
    initMap();
  }, [location, mapLoaded, radiusFeet, isAnimating]);

  useEffect(() => {
    if (!location || !googleMapRef.current || !userMarkerRef.current || !radiusCircleRef.current) return;
    
    const userLocation = { lat: location.latitude, lng: location.longitude };
    
    userMarkerRef.current.setPosition(userLocation);
    radiusCircleRef.current.setCenter(userLocation);
    
    if (!mapDragged) {
      const zoomLevel = getZoomFromRadius(radiusFeet);
      setIsAnimating(true);
      animateMapTo(googleMapRef.current, { center: userLocation, zoom: zoomLevel }, 300);
    }
  }, [location, mapDragged, radiusFeet]);

  useEffect(() => {
    if (!radiusCircleRef.current) return;
    
    const newRadiusMeters = radiusFeet * METERS_PER_FOOT;
    radiusCircleRef.current.setRadius(newRadiusMeters);
    setRadiusMeters(newRadiusMeters);
  }, [radiusFeet]);

  useEffect(() => {
    nearbyMarkers.current.forEach(marker => {
      marker.setVisible(!ghostMode);
    });
  }, [ghostMode]);

  useEffect(() => {
    if (!permissionState) {
      requestPermission();
    }
  }, [permissionState, requestPermission]);

  const handleRecenter = () => {
    if (!googleMapRef.current || !location) return;
    
    const userLocation = { lat: location.latitude, lng: location.longitude };
    
    setIsAnimating(true);
    
    animateMapTo(googleMapRef.current, { 
      center: userLocation,
      zoom: getZoomFromRadius(radiusFeet)
    }, 300);
    
    setMapDragged(false);
    
    if (userMarkerRef.current) {
      const originalIcon = userMarkerRef.current.getIcon();
      userMarkerRef.current.setIcon({
        ...(originalIcon as google.maps.Symbol),
        scale: 12,
      });
      
      setTimeout(() => {
        if (userMarkerRef.current) {
          userMarkerRef.current.setIcon({
            ...(originalIcon as google.maps.Symbol),
            scale: 10,
          });
          
          setTimeout(() => {
            if (userMarkerRef.current) {
              userMarkerRef.current.setIcon({
                ...(originalIcon as google.maps.Symbol),
                scale: 8,
              });
            }
          }, 100);
        }
      }, 100);
    }
  };

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

  const handleRadiusChange = (val: number) => {
    setRadiusFeet(val);

    if (googleMapRef.current && location) {
      const zoomLevel = getZoomFromRadius(val);
      setIsAnimating(true);
      animateMapTo(googleMapRef.current, { zoom: zoomLevel }, 300);
    }
  };

  const handleRadiusChangeComplete = (val: number) => {
    if (googleMapRef.current && location) {
      const zoomLevel = getZoomFromRadius(val);
      setIsAnimating(true);
      animateMapTo(googleMapRef.current, { zoom: zoomLevel }, 300);
    }
  };

  const handleGhostModeChange = (enabled: boolean) => {
    setGhostMode(enabled);
    if (enabled) {
      toast.success("Ghost mode enabled");
    } else {
      toast.success("Ghost mode disabled");
    }
  };

  const handleUpdateProfile = async (data: any) => {
    if (!user) return;
    
    try {
      console.log("Profile update data:", data);
      toast.success("Profile updated successfully");
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("Failed to update profile");
    }
  };

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-[#10141B]">
      <motion.div 
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.5 }}
        className="absolute top-0 left-0 right-0 z-10 flex items-center px-4 py-3 glass-panel"
      >
        <h1 className="text-2xl font-outfit font-bold text-white">Zoned</h1>
      </motion.div>

      <div className="w-full h-full">
        <Wrapper apiKey={API_KEY} libraries={["places", "geometry"]}>
          <div className="w-full h-full">
            <div ref={mapRef} className="w-full h-full" />
          </div>
        </Wrapper>
        
        {!location && !locationError && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/80 z-20">
            <div className="flex flex-col items-center">
              <motion.div 
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ repeat: Infinity, duration: 1.5 }}
                className="h-16 w-16 bg-coral rounded-full flex items-center justify-center mb-4"
              >
                <div className="h-10 w-10 bg-black rounded-full"></div>
              </motion.div>
              <p className="text-white text-lg">Loading your location...</p>
            </div>
          </div>
        )}
        
        <motion.div 
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="absolute bottom-36 left-0 right-0 px-6 z-10"
        >
          <RadiusSlider 
            value={radiusFeet}
            min={RADIUS_MIN}
            max={RADIUS_MAX}
            onChange={handleRadiusChange}
            onChangeComplete={handleRadiusChangeComplete}
          />
        </motion.div>
        
        <motion.div 
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.5 }}
          className="absolute bottom-10 left-0 right-0 flex justify-between items-center px-6 z-10"
        >
          <div className="w-[45%]">
            <GhostModeToggle 
              enabled={ghostMode} 
              onChange={handleGhostModeChange} 
              className="bg-black/40 backdrop-blur-sm p-3 rounded-full" 
            />
          </div>
          
          <motion.div
            whileTap={{ scale: 0.95 }}
            whileHover={{ scale: 1.05 }}
            className="w-[45%]"
          >
            <Button 
              onClick={() => setShowProfileDrawer(true)}
              className="w-full bg-coral hover:bg-coral-dark text-white rounded-full py-6"
            >
              Profile
            </Button>
          </motion.div>
        </motion.div>
        
        <AnimatePresence>
          {mapDragged && (
            <RecenterButton 
              onClick={handleRecenter} 
              className="absolute bottom-60 right-6 z-10"
            />
          )}
        </AnimatePresence>
      </div>
      
      <LocationPermissionModal 
        isOpen={showLocationModal}
        onRequestPermission={requestPermission}
        permissionDenied={permissionDenied}
      />
      
      <ProfileDrawer 
        open={showProfileDrawer}
        onOpenChange={setShowProfileDrawer}
        user={user}
        ghostMode={ghostMode}
        onGhostModeChange={handleGhostMode => {
          setGhostMode(handleGhostMode);
          setShowProfileDrawer(false);
        }}
        onUpdateProfile={handleUpdateProfile}
      />
    </div>
  );
};

export default RadarMap;
