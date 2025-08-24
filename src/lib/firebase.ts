
// Import the functions you need from the SDKs you need
import { initializeApp, getApps } from "firebase/app";
import { getAuth } from "firebase/auth";

// Your Firebase project configuration
const firebaseConfig = {
  apiKey: "AIzaSyDaR_PgOPoGi3NheLWE6gqU3K5fR_xmLlU",
  authDomain: "adaptilearn-jl2sn.firebaseapp.com",
  projectId: "adaptilearn-jl2sn",
  storageBucket: "adaptilearn-jl2sn.firebasestorage.app",
  messagingSenderId: "241388972786",
  appId: "1:241388972786:web:145eca90ce727942477e6b"
};

// Initialize Firebase
let app;
if (!getApps().length) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApps()[0];
}

const auth = getAuth(app);

export { app, auth };
