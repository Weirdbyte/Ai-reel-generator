import { initializeApp } from "firebase/app";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "",   // add api key
  authDomain: "ai-reels-873b7.firebaseapp.com",
  projectId: "ai-reels-873b7",
  storageBucket: "ai-reels-873b7.firebasestorage.app",
  messagingSenderId: "55556091316",
  appId: "1:55556091316:web:d700c5631444bbc47816e1",
  measurementId: "G-NBBQP2KSLQ"
};

const app = initializeApp(firebaseConfig);
export const storage = getStorage(app);
