importScripts('https://www.gstatic.com/firebasejs/10.3.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.3.1/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: "AIzaSyBXwD3xWhibD5HHUhukiV2BNgvJdyPDnxc",
  authDomain: "visitor-system-4a553.firebaseapp.com",
  projectId: "visitor-system-4a553",
  storageBucket: "visitor-system-4a553.appspot.com",
  messagingSenderId: "54289565918",
  appId: "1:54289565918:web:ba954a637c7c00f1481a4f"
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Background message received:', payload);

  const { title, body, image } = payload.notification;


  self.registration.showNotification(title, {
    body,
    icon: '/logo192.png',
  });
});

