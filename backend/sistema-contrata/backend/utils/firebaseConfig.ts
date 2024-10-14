import dotenv from 'dotenv';
dotenv.config();  // Cargar las variables de entorno desde el archivo .env

import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs, terminate } from "firebase/firestore";  // Inicializamos Firestore
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";

// Configuración de Firebase con variables del archivo .env
const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  projectId: process.env.FIREBASE_PROJECT_ID,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.FIREBASE_APP_ID,
  measurementId: process.env.FIREBASE_MEASUREMENT_ID,
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);

// Inicializamos Firestore
export const db = getFirestore(app);

// Inicializamos Firebase Auth para autenticación de usuarios
export const auth = getAuth(app);

// Inicializamos Firebase Storage
export const storage = getStorage(app);

  // Ejecutamos la prueba de conexión

