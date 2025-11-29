import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
    apiKey: "AIzaSyDz76O1s77tqTfFztPqqGnDacEVO1F6OBs",
    authDomain: "napawan-wedding.firebaseapp.com",
    projectId: "napawan-wedding",
    storageBucket: "napawan-wedding.firebasestorage.app",
    messagingSenderId: "752707768546",
    appId: "1:752707768546:web:87dcdf2906534a2a1b8ebb"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
export const storage = getStorage(app);
