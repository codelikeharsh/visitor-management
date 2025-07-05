import { initializeApp } from "firebase/app";
import { getMessaging, getToken, onMessage } from "firebase/messaging";

const firebaseConfig = {
  apiKey: "AIzaSyBXwD3xWhibD5HHUhukiV2BNgvJdyPDnxc",
  authDomain: "visitor-system-4a553.firebaseapp.com",
  projectId: "visitor-system-4a553",
  storageBucket: "visitor-system-4a553.firebasestorage.app",
  messagingSenderId: "54289565918",
  appId: "1:54289565918:web:ba954a637c7c00f1481a4f"
};

const app = initializeApp(firebaseConfig);
const messaging = getMessaging(app);

export const requestFCMToken = async () => {
  try {
    const token = await getToken(messaging, {
      vapidKey: "BHHkxDUXkIgJZkhmqfDRwN75obm6mDAc1RD8c_PHRybVF9ObueISM4zngQ5IkcRZOHWdZ98ROe68lXkJnQ_wmAY",
    });
    console.log("✅ FCM Token:", token);
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
