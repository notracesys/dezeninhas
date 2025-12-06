// @ts-nocheck
import { FirebaseOptions } from 'firebase/app';

// This configuration reads from environment variables for production deployments 
// on platforms like Netlify or Vercel.
// For local development, if these variables are not set in a .env.local file,
// it will fall back to the hardcoded values.
export const firebaseConfig: FirebaseOptions = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyDjmgOcAebnKxg7dPlyVuSYWkcaVJnM_as",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "studio-9688338833-1fbbb.firebaseapp.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "studio-9688338833-1fbbb",
  appId: "1:846396000808:web:f117278aa5356bea3a831d",
  measurementId: "",
  messagingSenderId: "846396000808",
};
