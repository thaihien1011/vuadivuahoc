import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

export const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyC77Rt8N3un-YHAMPGaRCBKIwxeZjbpMSI",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "vuadivuahoc-5187a.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "vuadivuahoc-5187a",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "vuadivuahoc-5187a.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "791378523101",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:791378523101:web:64ba7cae974b1144353c34"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export default app;
