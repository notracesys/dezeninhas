'use client';

import { firebaseConfig } from '@/firebase/config';
import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore'

// IMPORTANT: DO NOT MODIFY THIS FUNCTION
export function initializeFirebase() {
  if (!getApps().length) {
    let firebaseApp;
    // When running locally, we initialize with the firebaseConfig object.
    // On Firebase App Hosting, the SDK is automatically configured.
    if (process.env.NEXT_PUBLIC_FIREBASE_API_KEY) {
      firebaseApp = initializeApp(firebaseConfig);
    } else {
      try {
        // This will succeed on App Hosting.
        firebaseApp = initializeApp();
      } catch (e) {
        // If it fails, it means we are in a local environment
        // where the config variables are not set.
        console.warn('Firebase initialization failed. Using fallback config. Make sure to set your environment variables for local development.');
        firebaseApp = initializeApp(firebaseConfig);
      }
    }
    return getSdks(firebaseApp);
  }

  // If already initialized, return the SDKs with the already initialized App
  return getSdks(getApp());
}

export function getSdks(firebaseApp: FirebaseApp) {
  return {
    firebaseApp,
    auth: getAuth(firebaseApp),
    firestore: getFirestore(firebaseApp)
  };
}

export * from './provider';
export * from './client-provider';
export * from './firestore/use-collection';
export * from './firestore/use-doc';
export * from './non-blocking-updates';
export * from './non-blocking-login';
export * from './errors';
export * from './error-emitter';
