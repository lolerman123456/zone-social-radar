
// Dark theme with building outlines for a "radar-like" effect, inspired by your reference image.
export const darkMapStyles = [
  {
    "elementType": "geometry",
    "stylers": [
      { "color": "#10141B" }
    ]
  },
  {
    "elementType": "labels.icon",
    "stylers": [
      { "visibility": "off" }
    ]
  },
  {
    "featureType": "road",
    "elementType": "geometry",
    "stylers": [
      { "color": "#181D26" }
    ]
  },
  {
    "featureType": "road",
    "elementType": "geometry.stroke",
    "stylers": [
      { "color": "#1F232C" },
      { "weight": 1 }
    ]
  },
  {
    "featureType": "road",
    "elementType": "labels.text.fill",
    "stylers": [
      { "color": "#38414e" }
    ]
  },
  {
    "featureType": "road",
    "elementType": "labels.text.stroke",
    "stylers": [
      { "color": "#141821" }
    ]
  },
  {
    "featureType": "poi",
    "stylers": [
      { "visibility": "off" }
    ]
  },
  {
    "featureType": "transit",
    "stylers": [
      { "visibility": "off" }
    ]
  },
  {
    "featureType": "water",
    "elementType": "geometry",
    "stylers": [
      { "color": "#131822" }
    ]
  },
  {
    // Outlined buildings, inspired by your image
    "featureType": "building",
    "elementType": "geometry",
    "stylers": [
      { "color": "#13171d" },
      { "weight": 1 }
    ]
  },
  {
    "featureType": "building",
    "elementType": "geometry.stroke",
    "stylers": [
      { "color": "#8E9196" },
      { "weight": 2 }
    ]
  },
  {
    "featureType": "administrative.country",
    "elementType": "labels.text.fill",
    "stylers": [
      { "color": "#656a77" }
    ]
  },
  {
    "featureType": "administrative.neighborhood",
    "elementType": "geometry.stroke",
    "stylers": [
      { "color": "#1e1e24", "weight": 1 }
    ]
  },
  {
    "featureType": "administrative.land_parcel",
    "stylers": [
      { "visibility": "off" }
    ]
  },
  {
    // Subtle grid lines, dark blue/gray
    "featureType": "all",
    "elementType": "labels.text.fill",
    "stylers": [
      { "color": "#28375b" }
    ]
  }
];
