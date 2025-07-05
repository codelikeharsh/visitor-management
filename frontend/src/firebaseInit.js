import { initializeApp } from "firebase/app";
import { getMessaging, getToken, onMessage } from "firebase/messaging";

const firebaseConfig = {
  apiKey: "AIzaSyBXwD3xWhibD5HHUhukiV2BNgvJdyPDnxc",
  authDomain: "visitor-system-4a553.firebaseapp.com",
  projectId: "visitor-system-4a553",
  storageBucket: "visitor-system-4a553.appspot.com", // ✅ FIXED
  messagingSenderId: "54289565918",
  appId: "1:54289565918:web:ba954a637c7c00f1481a4f",
};

const app = initializeApp(firebaseConfig);
const messaging = getMessaging(app);

export const requestFCMToken = async () => {
  try {
    const registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js');
    const token = await getToken(getMessaging(), {
      vapidKey: "BHHkxDUXkIgJZkhmqfDRwN75obm6mDAc1RD8c_PHRybVF9ObueISM4zngQ5IkcRZOHWdZ98ROe68lXkJnQ_wmAY",
      serviceWorkerRegistration: registration,
    });

    console.log("✅ FCM Token:", token);

    // 🔔 Send to backend
    await fetch("http://localhost:5050/subscribe", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ token }),
    });

    return token;
  } catch (error) {
    console.error("❌ Error getting FCM token:", error);
    return null;
  }
};


export const onMessageListener = () =>
  new Promise((resolve) => {
    onMessage(messaging, (payload) => {
      resolve(payload);
    });
  });
