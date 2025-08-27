// firebase.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const firebaseConfig = typeof __firebase_config !== "undefined"
  ? JSON.parse(__firebase_config)
  : {
      apiKey: "AIzaSyDjpa5ijSQ8bpWhS0ARfAr_GxGm0dQ1hig",
      authDomain: "object-324fa.firebaseapp.com",
      projectId: "object-324fa",
      storageBucket: "object-324fa.appspot.com",
      messagingSenderId: "109119896647",
      appId: "1:109119896647:web:657adb0baf1664e8a5c562",
    };

// 앱 ID도 외부에서 받을 수 있도록 처리
export const appId = typeof __app_id !== "undefined" ? __app_id : "default-app-id";

// Firebase 초기화
export const app = initializeApp(firebaseConfig);

// Firebase 서비스 export
export const auth = getAuth(app);
export const db = getFirestore(app);
