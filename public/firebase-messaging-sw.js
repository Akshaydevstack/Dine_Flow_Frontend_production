importScripts("https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js");

// 1. Extract the config from the URL query parameters
const params = new URLSearchParams(location.search);

const firebaseConfig = {
  apiKey: params.get("apiKey"),
  projectId: params.get("projectId"),
  messagingSenderId: params.get("messagingSenderId"),
  appId: params.get("appId"),
};

// 2. Initialize Firebase ONLY if we actually got the config
if (firebaseConfig.apiKey) {
  firebase.initializeApp(firebaseConfig);
  const messaging = firebase.messaging();

  messaging.onBackgroundMessage((payload) => {
    console.log("🔥 Background FCM received:", payload);
    self.registration.showNotification(
      payload.notification.title,
      {
        body: payload.notification.body,
        icon: "/vite.svg", // Update this to your actual app icon
      }
    );
  });
} else {
  console.warn("Firebase SW: Missing config parameters in URL.");
}