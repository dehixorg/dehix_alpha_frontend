import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getDatabase } from "firebase/database";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
// import { getAnalytics } from 'firebase/analytics'
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC__API_KEY,
  authDomain: process.env.NEXT_PUBLIC__AUTH_DOMAIN,
  databaseURL: process.env.NEXT_PUBLIC__DATABASE_URL,
  projectId: process.env.NEXT_PUBLIC__PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC__STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC__MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC__APP_ID,
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
const auth = getAuth(app);
auth.useDeviceLanguage();
export const googleProvider = new GoogleAuthProvider();
export const realtime = getDatabase(app);
export const storage = getStorage(app);
export { auth };