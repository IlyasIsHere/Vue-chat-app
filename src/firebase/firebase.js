// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: "AIzaSyCtddYcYDPPJAFCL-b3gN9FUEdZagayi6E",
    authDomain: "chat-app-1a2ec.firebaseapp.com",
    projectId: "chat-app-1a2ec",
    storageBucket: "chat-app-1a2ec.appspot.com",
    messagingSenderId: "20853944664",
    appId: "1:20853944664:web:0f2300ecb924a6d6fc352d",
    measurementId: "G-9DS49HH883"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const db = getFirestore(app);
const auth = getAuth(app);
export { db, auth };
