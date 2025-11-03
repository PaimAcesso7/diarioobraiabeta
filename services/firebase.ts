import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyC23SBapgM4lAfyzc9HY6R9Zt96h8FDNC",
  authDomain: "diariodeobraiabeta.firebaseapp.com",
  projectId: "diariodeobraiabeta",
  storageBucket: "diariodeobraiabeta.appspot.com",
  messagingSenderId: "62365217585",
  appId: "1:62365217585:web:4bcc689f74935b3f1dfda0"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
