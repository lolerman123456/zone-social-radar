
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAnalytics, isSupported } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyAvtJ3Cd978FIOzACmCQ93qMMGCx31vpUo",
  authDomain: "zoned-91ada.firebaseapp.com",
  projectId: "zoned-91ada",
  storageBucket: "zoned-91ada.firebasestorage.app",
  messagingSenderId: "706124264611",
  appId: "1:706124264611:web:7d2683d952488f85463b16",
  measurementId: "G-BFTL0WBZE6"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const firestore = getFirestore(app);
const storage = getStorage(app);
const googleProvider = new GoogleAuthProvider();

// Initialize Analytics conditionally (might not be supported in all environments)
const analyticsPromise = isSupported().then(yes => yes ? getAnalytics(app) : null);

export { app, auth, firestore, storage, googleProvider, analyticsPromise };
