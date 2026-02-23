// src/firebase.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage"; // <-- 1. Added Storage import

const firebaseConfig = {
 apiKey: "AIzaSyCBMPpUnQ_mub9TdV7DHI7aYuA5tQw4ibE",
 authDomain: "karvex-1ec37.firebaseapp.com",
 projectId: "karvex-1ec37",
 storageBucket: "karvex-1ec37.firebasestorage.app",
 messagingSenderId: "590697232338",
 appId: "1:590697232338:web:53e09e3301dc728355fa0b",
 measurementId: "G-FWPGT4D2F3"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Authentication, Database, and Storage
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app); // <-- 2. Initialized and exported Storage

export default app;