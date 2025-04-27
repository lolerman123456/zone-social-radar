
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Ensure the Google Maps script is loaded
document.addEventListener('DOMContentLoaded', () => {
  // Check if Google Maps API is loaded
  if (typeof google === 'undefined') {
    console.error('Google Maps API not loaded. Please check your internet connection or API key.');
  }
});

createRoot(document.getElementById("root")!).render(<App />);
