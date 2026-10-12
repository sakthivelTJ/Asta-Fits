import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getFunctions } from 'firebase/functions';

const firebaseConfig = {
  apiKey: 'AIzaSyAstaFitPlaceholderKeyForLocalDev',
  authDomain: 'asta-fit.firebaseapp.com',
  projectId: 'asta-fit',
  storageBucket: 'asta-fit.appspot.com',
  messagingSenderId: '123456789',
  appId: '1:123456789:web:astaFitAppId',
};

// Initialize Firebase App singleton
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const db = getFirestore(app);
const functions = getFunctions(app);

export { app, auth, db, functions };
