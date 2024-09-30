import { Request, Response } from 'express';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../utils/firebaseConfig';

// Función para obtener los eventos guardados en Firebase
export const obtenerEventos = async (req: Request, res: Response) => {
  try {
    const snapshot = await getDocs(collection(db, 'eventosBlockchain'));
    const eventos = snapshot.docs.map(doc => doc.data());
    res.status(200).json(eventos);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener los eventos', details: error });
  }
};
