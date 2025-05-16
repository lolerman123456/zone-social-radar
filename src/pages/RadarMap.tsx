
import React, { useState, useEffect } from "react";
import { GoogleMap, Marker, useLoadScript } from "@react-google-maps/api";
import { onValue, ref } from "firebase/database";
import { database } from "../lib/firebase";
import { darkMapStyles } from "../lib/mapStyles";

const libraries = ["places"];
const mapContainerStyle = {
  width: "100vw",
  height: "100vh",
};
const options = {
  disableDefaultUI: true,
  zoomControl: true,
  styles: darkMapStyles, // Apply dark map styles
};

interface User {
  id: string;
  lat: number;
  lng: number;
  socials: {
    instagram?: string;
    snapchat?: string;
  };
  ghostMode?: boolean;
}

const UserMarker: React.FC<{ user: User }> = ({ user }) => {
  const [position, setPosition] = useState<{ lat: number; lng: number }>({
    lat: user.lat,
    lng: user.lng,
  });

  useEffect(() => {
    const animationDuration = 300; // milliseconds
    const steps = 30;
    const latStep = (user.lat - position.lat) / steps;
    const lngStep = (user.lng - position.lng) / steps;

    let currentStep = 0;
    const interval = setInterval(() => {
      currentStep++;
      setPosition((prev) => ({
        lat: prev.lat + latStep,
        lng: prev.lng + lngStep,
      }));

      if (currentStep >= steps) {
        clearInterval(interval);
      }
    }, animationDuration / steps);

    return () => clearInterval(interval);
  }, [user.lat, user.lng]);

  return <Marker position={position} />;
};

export default function RadarMap() {
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: "AIzaSyCjIwAJEFHqjHDOABZzeOQtvVg7F8ESYHI", // Using the API key from index.html
    libraries: libraries as any,
  });

  const [currentUserLocation, setCurrentUserLocation] = useState<{
    lat: number;
    lng: number;
  } | null>(null);

  const [nearbyUsers, setNearbyUsers] = useState<User[]>([]);

  useEffect(() => {
    navigator.geolocation.watchPosition(
      (position) => {
        setCurrentUserLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
      },
      (error) => console.error(error),
      { enableHighAccuracy: true }
    );
  }, []);

  useEffect(() => {
    const usersRef = ref(database, "users");

    const unsubscribe = onValue(usersRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const users = Object.keys(data).map((key) => ({
          id: key,
          ...data[key],
        })) as User[];

        setNearbyUsers(users.filter((user) => !user.ghostMode)); // hide ghost users
      }
    });

    return () => unsubscribe();
  }, []);

  if (loadError) return <h1>Error loading maps</h1>;
  if (!isLoaded) return <h1>Loading Maps...</h1>;

  return (
    <div style={{ width: "100%", height: "100vh" }}>
      {currentUserLocation && (
        <GoogleMap
          mapContainerStyle={mapContainerStyle}
          zoom={18}
          center={currentUserLocation}
          options={options}
        >
          {/* Render current user's own marker */}
          <Marker position={currentUserLocation} />

          {/* Render nearby users with smooth animation */}
          {nearbyUsers.map((user) => (
            <UserMarker key={user.id} user={user} />
          ))}
        </GoogleMap>
      )}
    </div>
  );
}
