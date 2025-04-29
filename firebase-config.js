// Import the functions you need from the SDKs you need
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getDatabase } from 'firebase/database';

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: 'AIzaSyCj1HIltzE4oMJoQ8IlxMbJ7RoD1D4cX7Q',
  authDomain: 'in-stock-eeac3.firebaseapp.com',
  projectId: 'in-stock-eeac3',
  storageBucket: 'in-stock-eeac3.firebasestorage.app',
  messagingSenderId: '241011790828',
  appId: '1:241011790828:web:1fd7069d984e6df3d866c9',
  measurementId: 'G-FC2BJV9W7B',
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getDatabase(app);

export default auth;
export { db };
