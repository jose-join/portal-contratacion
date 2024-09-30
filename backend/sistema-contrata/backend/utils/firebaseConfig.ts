import dotenv from 'dotenv';
dotenv.config();  // Cargar las variables de entorno desde el archivo .env

import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs } from "firebase/firestore";  // Inicializamos Firestore
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

// Prueba de conexión a Firestore
const testConnection = async () => {
  try {
    const testCollection = collection(db, 'test');  // Acceder a la colección 'test'
    const snapshot = await getDocs(testCollection);  // Obtener documentos de la colección
    if (!snapshot.empty) {
      console.log('Conexión a Firestore exitosa, documentos encontrados:', snapshot.docs.length);
    } else {
      console.log('Conexión a Firestore exitosa, pero no hay documentos en la colección.');
    }
  } catch (err) {
    console.error("Error conectando a Firestore:", err);
  }
};

testConnection();  // Ejecutamos la prueba de conexión
