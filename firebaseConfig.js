import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Paste your Firebase config object here
const firebaseConfig = {
  apiKey: "AIzaSyCTTGTqtSdXzb0gG_J-XkUeLhGN7NXke4k",
  authDomain: "dawai-e474f.firebaseapp.com",
  projectId: "dawai-e474f",
  storageBucket: "dawai-e474f.firebasestorage.app",
  messagingSenderId: "298197382493",
  appId: "1:298197382493:web:16ce03b1e66c8b4e3ee4b4",
  measurementId: "G-DH1QL6SR0Y"
};

let app;
let auth;
let db;

try {
  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  db = getFirestore(app);
  console.log("Firebase initialized successfully!");
} catch (error) {
  console.error("Firebase initialization error:", error);
}

export { app, auth, db };