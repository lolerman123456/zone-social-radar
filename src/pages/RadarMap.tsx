
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Wrapper } from "@googlemaps/react-wrapper";
import { useAuth } from '@/hooks/useAuth';
import useLocation from '@/hooks/useLocation';
import RadiusSlider from '@/components/RadiusSlider';
import GhostModeToggle from '@/components/GhostModeToggle';
import RecenterButton from '@/components/RecenterButton';
import LocationPermissionModal from '@/components/LocationPermissionModal';
import SocialCard from '@/components/SocialCard';
import ProfileDrawer from '@/components/ProfileDrawer';
import { darkMapStyles } from '@/lib/mapStyles';
import Logo from '@/components/Logo';
import { ChevronLeft } from 'lucide-react';
import { doc, getDoc, setDoc, collection, query, where, getDocs, GeoPoint } from 'firebase/firestore';
import { firestore } from '@/lib/firebase';

// Mock nearby users data
const MOCK_NEARBY_USERS = [
  { 
    id: '1', 
    name: 'Alex Chen', 
    photoUrl: 'https://i.pravatar.cc/150?img=11', 
    position: { lat: 0, lng: 0 },  // Will be set dynamically
    socialLinks: { instagram: 'alexchen', twitter: 'alex_code' } 
  },
  { 
    id: '2', 
    name: 'Jordan Smith', 
    photoUrl: 'https://i.pravatar.cc/150?img=32', 
    position: { lat: 0, lng: 0 },  // Will be set dynamically 
    socialLinks: { instagram: 'jsmith', twitter: 'jordans' } 
  },
  { 
    id: '3', 
    name: 'Taylor Kim', 
    photoUrl: 'https://i.pravatar.cc/150?img=23', 
    position: { lat: 0, lng: 0 },  // Will be set dynamically
    socialLinks: { instagram: 'taylork' } 
  },
];

interface RadarMapProps {}

const API_KEY = "AIzaSyCjIwAJEFHqjHDOABZzeOQtvVg7F8ESYHI";
const METERS_PER_FOOT = 0.3048;

const RadarMap: React.FC<RadarMapProps> = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const mapRef = useRef<HTMLDivElement>(null);
  const googleMapRef = useRef<google.maps.Map | null>(null);
  const userMarkerRef = useRef<google.maps.Marker | null>(null);
  const radiusCircleRef = useRef<google.maps.Circle | null>(null);
  const nearbyMarkers = useRef<google.maps.Marker[]>([]);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [radiusFeet, setRadiusFeet] = useState(15);
  const [radiusMeters, setRadiusMeters] = useState(15 * METERS_PER_FOOT);
  const [ghostMode, setGhostMode] = useState(false);
  const [showProfileDrawer, setShowProfileDrawer] = useState(false);
  const [selectedUser, setSelectedUser] = useState<typeof MOCK_NEARBY_USERS[0] | null>(null);
  const [mapDragged, setMapDragged] = useState(false);
  
  // Get user location
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

  // Check if a modal should be shown for location permissions
  const showLocationModal = !location && (permissionState === 'prompt' || permissionDenied);

  // Initialize map when location is available
  useEffect(() => {
    if (!location || !mapRef.current || mapLoaded) return;
    
    const initMap = () => {
      const userLocation = { lat: location.latitude, lng: location.longitude };
      
      // Create Google Map instance
      const map = new google.maps.Map(mapRef.current!, {
        center: userLocation,
        zoom: 18,
        disableDefaultUI: true,
        styles: darkMapStyles,
        gestureHandling: "greedy",
        backgroundColor: '#000000',
        maxZoom: 20,
        minZoom: 15,
      });
      
      // Create user marker
      const userMarker = new google.maps.Marker({
        position: userLocation,
        map,
        icon: {
          path: google.maps.SymbolPath.CIRCLE,
          fillColor: "#FF6F61",
          fillOpacity: 1,
          strokeWeight: 0,
          scale: 9
        },
        zIndex: 999
      });
      
      // Create radius circle
      const radiusCircle = new google.maps.Circle({
        map,
        center: userLocation,
        radius: radiusMeters,
        strokeColor: "#FF6F61",
        strokeOpacity: 0.8,
        strokeWeight: 2,
        fillColor: "#FF6F61",
        fillOpacity: 0.15,
        zIndex: 1
      });
      
      // Create nearby user markers (just mock data for now)
      const userMarkers: google.maps.Marker[] = [];
      MOCK_NEARBY_USERS.forEach((nearbyUser) => {
        // Position each user randomly within the circle
        const randomPosition = getRandomPositionInCircle(userLocation, radiusMeters * 0.8);
        nearbyUser.position = randomPosition;
        
        const marker = new google.maps.Marker({
          position: randomPosition,
          map,
          title: nearbyUser.name,
          icon: {
            url: nearbyUser.photoUrl,
            scaledSize: new google.maps.Size(36, 36),
            anchor: new google.maps.Point(18, 18),
            origin: new google.maps.Point(0, 0)
          },
          zIndex: 10
        });
        
        marker.addListener("click", () => {
          setSelectedUser(nearbyUser);
        });
        
        userMarkers.push(marker);
      });
      
      // Add map event listeners
      map.addListener("dragstart", () => {
        setMapDragged(true);
      });
      
      googleMapRef.current = map;
      userMarkerRef.current = userMarker;
      radiusCircleRef.current = radiusCircle;
      nearbyMarkers.current = userMarkers;
      setMapLoaded(true);
    };

    initMap();
  }, [location, mapLoaded, radiusMeters]);

  // Update user position and radius circle when location changes
  useEffect(() => {
    if (!location || !googleMapRef.current || !userMarkerRef.current || !radiusCircleRef.current) return;
    
    const userLocation = { lat: location.latitude, lng: location.longitude };
    
    userMarkerRef.current.setPosition(userLocation);
    radiusCircleRef.current.setCenter(userLocation);
    
    if (!mapDragged) {
      googleMapRef.current.panTo(userLocation);
    }
  }, [location, mapDragged]);

  // Update radius circle when radius changes
  useEffect(() => {
    if (!radiusCircleRef.current) return;
    
    const newRadiusMeters = radiusFeet * METERS_PER_FOOT;
    radiusCircleRef.current.setRadius(newRadiusMeters);
    setRadiusMeters(newRadiusMeters);
  }, [radiusFeet]);

  // Update nearby markers visibility based on ghost mode
  useEffect(() => {
    nearbyMarkers.current.forEach(marker => {
      marker.setVisible(!ghostMode);
    });
  }, [ghostMode]);

  // Request location permission on mount if not already granted
  useEffect(() => {
    if (!permissionState) {
      requestPermission();
    }
  }, [permissionState, requestPermission]);

  // Generate random position within circle for demo markers
  const getRandomPositionInCircle = (center: google.maps.LatLngLiteral, radius: number): google.maps.LatLngLiteral => {
    const r = radius * Math.sqrt(Math.random());
    const theta = Math.random() * 2 * Math.PI;
    const x = center.lat + (r * Math.cos(theta) / 111111);
    const y = center.lng + (r * Math.sin(theta) / (111111 * Math.cos(center.lat * (Math.PI / 180))));
    return { lat: x, lng: y };
  };

  // Recenter the map on user location
  const handleRecenter = () => {
    if (!googleMapRef.current || !location) return;
    
    const userLocation = { lat: location.latitude, lng: location.longitude };
    googleMapRef.current.panTo(userLocation);
    googleMapRef.current.setZoom(18);
    setMapDragged(false);
  };

  const handleRadiusChange = (value: number) => {
    setRadiusFeet(value);
  };
  
  const handleGhostModeChange = (enabled: boolean) => {
    setGhostMode(enabled);
    toast.success(enabled ? "Ghost mode enabled" : "Ghost mode disabled");
  };
  
  const handleUpdateProfile = async (data: any) => {
    if (!user) return;
    
    try {
      // In a real app, you'd update the profile in Firestore
      console.log("Profile update data:", data);
      toast.success("Profile updated successfully");
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("Failed to update profile");
    }
  };
  
  // Render Google Maps with wrapper
  return (
    <div className="relative w-screen h-screen overflow-hidden bg-black">
      {/* Top header */}
      <div className="absolute top-0 left-0 right-0 z-10 flex items-center px-4 py-3 glass-panel">
        <button 
          onClick={() => navigate(-1)} 
          className="mr-3 rounded-full p-1.5 hover:bg-white/10"
          aria-label="Back"
        >
          <ChevronLeft className="h-5 w-5 text-white" />
        </button>
        <h1 className="text-xl font-semibold text-white">Home</h1>
      </div>

      {/* Main content with logo and map */}
      <div className="w-full h-full">
        {/* App title */}
        <div className="absolute top-20 left-0 right-0 z-10 text-center p-3">
          <h1 className="text-4xl font-bold text-white mb-1">Zoned</h1>
          <p className="text-gray-300 text-lg">Your proximity-based social radar</p>
        </div>

        {/* Map container */}
        <Wrapper apiKey={API_KEY} libraries={["places", "geometry"]}>
          <div className="w-full h-full">
            <div ref={mapRef} className="w-full h-full" />
          </div>
        </Wrapper>
        
        {!location && !locationError && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/80 z-20">
            <div className="flex flex-col items-center">
              <div className="animate-pulse h-16 w-16 bg-coral rounded-full flex items-center justify-center mb-4">
                <div className="h-10 w-10 bg-black rounded-full"></div>
              </div>
              <p className="text-white text-lg">Loading your location...</p>
            </div>
          </div>
        )}
        
        {/* You are here label (centered) */}
        {location && (
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-20 pointer-events-none">
            <div className="px-4 py-2 bg-black/90 rounded-md text-white font-medium shadow-lg">
              You are here
            </div>
          </div>
        )}
        
        {/* Radius slider */}
        <div className="absolute bottom-36 left-0 right-0 px-6 z-10">
          <RadiusSlider value={radiusFeet} onChange={handleRadiusChange} />
        </div>
        
        {/* Bottom controls */}
        <div className="absolute bottom-10 left-0 right-0 flex justify-between items-center px-6 z-10">
          <div className="w-[45%]">
            <GhostModeToggle enabled={ghostMode} onChange={handleGhostModeChange} className="bg-black/40 backdrop-blur-sm p-3 rounded-full" />
          </div>
          
          <Button 
            onClick={() => setShowProfileDrawer(true)}
            className="w-[45%] bg-coral hover:bg-coral-dark text-white rounded-full py-6"
          >
            Profile
          </Button>
        </div>
        
        {/* Recenter button - only show when map has been dragged */}
        {mapDragged && (
          <RecenterButton 
            onClick={handleRecenter} 
            className="absolute bottom-48 right-6 z-10"
          />
        )}
        
        {/* Social card for selected user */}
        {selectedUser && (
          <SocialCard 
            user={selectedUser} 
            onClose={() => setSelectedUser(null)} 
          />
        )}
      </div>
      
      {/* Permission modal */}
      <LocationPermissionModal 
        isOpen={showLocationModal}
        onRequestPermission={requestPermission}
        permissionDenied={permissionDenied}
      />
      
      {/* Profile drawer */}
      <ProfileDrawer 
        open={showProfileDrawer}
        onOpenChange={setShowProfileDrawer}
        user={user}
        ghostMode={ghostMode}
        onGhostModeChange={handleGhostModeChange}
        onUpdateProfile={handleUpdateProfile}
      />
    </div>
  );
};

export default RadarMap;
