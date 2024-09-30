import { Request, Response } from 'express';
import { CustomRequest } from '../middlewares/authMiddleware';
import { subirDocumento } from '../services/documentUploadService';
import { createDoc, getDocById, queryDocsByField } from '../services/firebaseService';
import { DocumentData, QueryDocumentSnapshot } from 'firebase/firestore'; // Importar desde 'firebase/firestore'

// Función para postularse a una convocatoria
export const postularseConvocatoria = async (req: CustomRequest, res: Response) => {
  try {
    const { idConvocatoria } = req.params;  // ID de la convocatoria a la que el postulante quiere postularse
    const idPostulante = req.user?.userId;  // Obtener el ID del postulante autenticado desde el token
    const fechaPostulacion = new Date().toISOString();  // Fecha de la postulación

    // Verificar que el ID del postulante y de la convocatoria existan
    if (!idPostulante || !idConvocatoria) {
      return res.status(400).json({ message: 'Faltan campos requeridos' });
    }

    // Obtener la convocatoria desde Firestore usando el ID
    const convocatoriaDoc = await getDocById('convocatorias', idConvocatoria);
    if (!convocatoriaDoc) {
      return res.status(404).json({ message: 'Convocatoria no encontrada.' });
    }

    // Obtener el nombre de la convocatoria desde el documento de la convocatoria
    const nombreConvocatoria = convocatoriaDoc.nombre; // Asegúrate de que este campo existe en Firestore

    // Verificar si el postulante ha subido los documentos necesarios (CV y DNI)
    const documentosSubidos = await queryDocsByField('documentosPostulantes', 'idPostulante', idPostulante);
    if (!documentosSubidos || documentosSubidos.empty || !documentosSubidos.docs[0].data().cvUrl || !documentosSubidos.docs[0].data().dniUrl) {
      return res.status(400).json({ message: 'Faltan documentos obligatorios para postular (CV y DNI).' });
    }

    // Crear el objeto de postulación, incluyendo el nombre de la convocatoria
    const postulacion = {
      idConvocatoria,
      nombreConvocatoria, // Incluimos el nombre de la convocatoria
      idPostulante,
      fechaPostulacion,
      documentosSubidos: documentosSubidos.docs[0].data(),  // Documentos subidos del postulante (CV, DNI, etc.)
      estado: 'en proceso',  // Estado inicial
    };

    // Guardar la postulación en Firestore
    await createDoc('postulaciones', postulacion);
    res.status(200).json({ message: 'Postulación realizada con éxito' });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
    res.status(500).json({ error: 'Error al realizar la postulación', details: errorMessage });
  }
};

// Función para subir documentos del postulante
export const subirDocumentosPostulante = async (req: CustomRequest, res: Response) => {
  try {
    const idPostulante = req.user?.userId;  // Obtener el ID del postulante desde el token

    // Verificar que los archivos obligatorios (CV y DNI) hayan sido subidos
    const files = req.files as { [fieldname: string]: Express.Multer.File[] };
    if (!files || !files['cv'] || !files['dni']) {
      return res.status(400).json({ message: 'El CV y el DNI son documentos obligatorios.' });
    }
    const cvFile = files['cv'][0];  // Accede al archivo CV
    const dniFile = files['dni'][0];  // Accede al archivo DNI

    // Subir los archivos a Firebase Storage
    const cvUrl = await subirDocumento(cvFile.buffer, `postulantes/${idPostulante}/cv.pdf`);
    const dniUrl = await subirDocumento(dniFile.buffer, `postulantes/${idPostulante}/dni.pdf`);

    // Crear el objeto de documentos subidos
    const documentosSubidos = {
      idPostulante,
      cvUrl,
      dniUrl,
    };

    // Guardar en Firestore
    await createDoc('documentosPostulantes', documentosSubidos);
    res.status(200).json({ message: 'Documentos subidos con éxito.', documentosSubidos });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
    res.status(500).json({ error: 'Error al subir los documentos', details: errorMessage });
  }
};

export const verPostulaciones = async (req: CustomRequest, res: Response) => {
  try {
    const idPostulante = req.user?.userId;  // Obtener el ID del postulante desde el token

    if (!idPostulante) {
      return res.status(400).json({ message: 'No se encontró el ID del postulante' });
    }

    // Obtener todas las postulaciones del postulante
    const querySnapshot = await queryDocsByField('postulaciones', 'idPostulante', idPostulante);

    // Mapa para convertir las postulaciones en un array de objetos
    const postulaciones = await Promise.all(querySnapshot.docs.map(async (doc: QueryDocumentSnapshot<DocumentData>) => {
      const postulacionData = doc.data();
      const idConvocatoria = postulacionData.idConvocatoria;

      // Obtener el documento de la convocatoria desde Firestore
      const convocatoriaDoc = await getDocById('convocatorias', idConvocatoria);
      
      if (convocatoriaDoc) {
        console.log(`Convocatoria encontrada: ${idConvocatoria}, Título: ${convocatoriaDoc.titulo}`);
      } else {
        console.log(`Convocatoria no encontrada: ${idConvocatoria}`);
      }

      // Obtener el título de la convocatoria (nombre de la convocatoria), o un valor por defecto si no existe
      const nombreConvocatoria = convocatoriaDoc?.titulo || 'Convocatoria sin título';

      // Devolver la postulación junto con el nombre de la convocatoria
      return {
        id: doc.id, // El ID de la postulación
        nombreConvocatoria, // Agregar el título (nombre) de la convocatoria
        ...postulacionData, // El resto de los datos de la postulación
      };
    }));

    // Enviar las postulaciones al cliente
    res.status(200).json({
      postulaciones, // Array de todas las postulaciones del postulante
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
    res.status(500).json({ error: 'Error al obtener las postulaciones', details: errorMessage });
  }
};
