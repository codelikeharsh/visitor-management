import { initializeApp } from "firebase/app";
import { getMessaging, getToken, onMessage } from "firebase/messaging";

// ✅ Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyBXwD3xWhibD5HHUhukiV2BNgvJdyPDnxc",
  authDomain: "visitor-system-4a553.firebaseapp.com",
  projectId: "visitor-system-4a553",
  storageBucket: "visitor-system-4a553.appspot.com",
  messagingSenderId: "54289565918",
  appId: "1:54289565918:web:ba954a637c7c00f1481a4f",
};

// ✅ Initialize Firebase
const app = initializeApp(firebaseConfig);
const messaging = getMessaging(app);

// ✅ Use environment variable for backend URL
const API_URL = process.env.REACT_APP_BACKEND_URL || "http://localhost:5050";

export const requestFCMToken = async () => {
  try {
    const registration = await navigator.serviceWorker.ready;

    const token = await getToken(messaging, {
      vapidKey: "BHHkxDUXkIgJZkhmqfDRwN75obm6mDAc1RD8c_PHRybVF9ObueISM4zngQ5IkcRZOHWdZ98ROe68lXkJnQ_wmAY",
      serviceWorkerRegistration: registration,
    });

    if (token) {
      console.log("✅ FCM Token:", token);

      // ✅ Send token to backend (Render)
      await fetch(`${API_URL}/subscribe`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      });
    } else {
      console.warn("⚠️ No token received.");
    }

    return token;
  } catch (error) {
    console.error("❌ Error getting FCM token:", error);
    return null;
  }
};

// ✅ Foreground message listener
export const onMessageListener = () =>
  new Promise((resolve) => {
    onMessage(messaging, (payload) => {
      resolve(payload);
    });
  });
