import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCzJFGmyGFJ-IsyR_BrgoRSezlDJXcRxXk",
  authDomain: "foodtruckapp-d9c25.firebaseapp.com",
  projectId: "foodtruckapp-d9c25",
  storageBucket: "foodtruckapp-d9c25.firebasestorage.app",
  messagingSenderId: "511404974177",
  appId: "1:511404974177:web:2876372584bc7dd5238a20",
  measurementId: "G-BL2X62S7B3"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);