import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { auth, db } from '../utils/firebaseConfig';  // Asegúrate de importar la configuración de Firebase y Firestore
import { doc, getDoc, setDoc } from 'firebase/firestore';  // Para trabajar con Firestore
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';

dotenv.config();

// **Registro de postulante (solo rol 'postulante')**
export const registerPostulante = async (req: Request, res: Response) => {
    const { email, password, usuario, nombres, apellidos, dni, edad, telefono } = req.body;

    // Validación de errores
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        // Crear usuario con Firebase Authentication
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const userId = userCredential.user.uid;

        // Guardar la información adicional del postulante en Firestore
        await setDoc(doc(db, 'users', userId), {
            email,
            usuario,
            nombres,
            apellidos,
            dni,
            edad,
            telefono,
            role: 'postulante',  // Siempre será 'postulante'
            createdAt: new Date().toISOString(),  // Timestamp de creación
        });

        res.status(201).json({ message: 'Postulante registrado correctamente', userId });
    } catch (error) {
        res.status(500).json({ message: 'Error en el registro', error: (error as Error).message });
    }
};

// **Login para administrador y postulantes**
export const login = async (req: Request, res: Response) => {
    const { email, password } = req.body;

    try {
        // Autenticar usuario con Firebase Authentication
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const userId = userCredential.user.uid;
        
        // Extraer el rol desde la base de datos de Firestore (ya sea 'admin' o 'postulante')
        const userDocRef = doc(db, 'users', userId);
        const userDoc = await getDoc(userDocRef);
        const userData = userDoc.data();

        if (!userData || !userData.role) {
            return res.status(404).json({ message: 'Usuario no encontrado en la base de datos o sin rol asignado' });
        }

        const role = userData.role;

        // Generar un token JWT que incluye el userId y el rol
        const token = jwt.sign(
            { userId, role },  // Incluir el userId y el rol en el token
            process.env.JWT_SECRET || 'supersecreto', 
            { expiresIn: '1h' }
        );

        // Enviar el token y el ID del usuario en la respuesta
        res.status(200).json({ message: 'Login exitoso', token, role, userId }); // Incluye el role en la respuesta
    } catch (error) {
        res.status(500).json({ message: 'Error en el login', error: (error as Error).message });
    }
};

