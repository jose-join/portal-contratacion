// Importaciones de Firebase y Firestore
import { db } from '../utils/firebaseConfig';
import { collection, query, where, getDocs, QuerySnapshot, DocumentData, addDoc, getDoc, doc, updateDoc, DocumentReference } from 'firebase/firestore';

// Consultar documentos por un campo específico y devolver el QuerySnapshot completo
export const queryDocsByField = async (collectionName: string, field: string, value: any): Promise<QuerySnapshot<DocumentData>> => {
  const q = query(collection(db, collectionName), where(field, '==', value));
  const snapshot = await getDocs(q);  // Ejecutar la consulta y obtener el QuerySnapshot
  return snapshot;  // Retornar el QuerySnapshot completo
};
// Crear un nuevo documento en una colección
export const createDoc = async (collectionName: string, data: any) => {
  const docRef = await addDoc(collection(db, collectionName), data);
  return docRef.id;
};

// Obtener un documento por ID desde una colección
export const getDocById = async (collectionName: string, id: string) => {
  const docRef = doc(db, collectionName, id);
  const docSnap = await getDoc(docRef);
  if (!docSnap.exists()) throw new Error(`${collectionName} no encontrada`); // Mantener el manejo de error si no existe
  return docSnap;  // Retornar el DocumentSnapshot completo
};

// Actualizar un documento en una colección
export const updateDocById = async (collectionName: string, id: string, data: any) => {
  const docRef = doc(db, collectionName, id);
  await updateDoc(docRef, data);
};

// Eliminar un documento en una colección
export const deleteDocById = async (collectionName: string, id: string) => {
  const docRef = doc(db, collectionName, id);
  await deleteDoc(docRef);
};

// Obtener todos los documentos de una colección
export const getAllDocs = async (collectionName: string) => {
  const snapshot = await getDocs(collection(db, collectionName));
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
};


function deleteDoc(docRef: DocumentReference<DocumentData, DocumentData>) {
  throw new Error('Function not implemented.');
}

