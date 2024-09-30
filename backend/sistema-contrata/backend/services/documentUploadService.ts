
import { storage } from '../utils/firebaseConfig';  // Firebase Storage configurado correctamente
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

// Función para subir un archivo a Firebase Storage
export const subirDocumento = async (file: Buffer, path: string): Promise<string> => {
  try {
    const storageRef = ref(storage, path);
    await uploadBytes(storageRef, file);
    const downloadUrl = await getDownloadURL(storageRef);
    return downloadUrl;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
    throw new Error('Error al subir el archivo: ' + errorMessage);
  }
};
