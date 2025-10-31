import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCzMg44aUO-vuShW_aV-QfJ_XliJ5pBCig",
  authDomain: "fir-8b2ab.firebaseapp.com",
  databaseURL: "https://fir-8b2ab-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "fir-8b2ab",
  storageBucket: "fir-8b2ab.firebasestorage.app",
  messagingSenderId: "345062486843",
  appId: "1:345062486843:web:bf1d99959112003096bd1e",
  measurementId: "G-YXYQ8GLLGJ"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
