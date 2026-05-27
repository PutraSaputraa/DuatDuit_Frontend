import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCxjUfDif2m6iqB_KrylkTwNlYGebVzJ30",
  authDomain: "duatduit.firebaseapp.com",
  projectId: "duatduit",
  storageBucket: "duatduit.firebasestorage.app",
  messagingSenderId: "391370610241",
  appId: "1:391370610241:web:dc43d19b032c09ae2e98c0",
  measurementId: "G-BMCVH5MF45"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
