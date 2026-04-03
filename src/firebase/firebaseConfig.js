import { initializeApp, getApps } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getMessaging, getToken, onMessage } from "firebase/messaging";

// ... your existing config using import.meta.env ...
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApps()[0];
export const auth = getAuth(app);

let messaging;
if (typeof window !== "undefined" && "serviceWorker" in navigator) {
  messaging = getMessaging(app);
}

// THE FIX: Create a function to register the SW with dynamic URL params
const registerServiceWorker = async () => {
  if ("serviceWorker" in navigator) {
    try {
      // Build the query string from your environment variables
      const swUrl = `/firebase-messaging-sw.js?apiKey=${firebaseConfig.apiKey}&projectId=${firebaseConfig.projectId}&messagingSenderId=${firebaseConfig.messagingSenderId}&appId=${firebaseConfig.appId}`;
      
      const registration = await navigator.serviceWorker.register(swUrl);
      console.log("Service Worker registered successfully.", registration);
      return registration;
    } catch (error) {
      console.error("Service Worker registration failed:", error);
      return null;
    }
  }
  return null;
};

export const requestForToken = async () => {
  if (!messaging) return null;

  try {
    const permission = await Notification.requestPermission();
    if (permission !== "granted") {
      console.warn("Notification permission not granted");
      return null;
    }

    // IMPORTANT: Register the SW BEFORE getting the token
    const swRegistration = await registerServiceWorker();

    const token = await getToken(messaging, {
      vapidKey: import.meta.env.VITE_FIREBASE_VAPID_KEY,
      serviceWorkerRegistration: swRegistration, // Pass the registration here!
    });
    
    return token;
  } catch (error) {
    console.error("An error occurred while retrieving token. ", error);
    return null;
  }
};

export const onMessageListener = (callback) => {
  if (!messaging) return;
  return onMessage(messaging, callback);
};