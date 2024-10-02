import { Request, Response } from 'express';
import { CustomRequest } from '../middlewares/authMiddleware';
import { subirDocumento } from '../services/documentUploadService';
import { createDoc, getDocById, queryDocsByField } from '../services/firebaseService';
import { DocumentData, QueryDocumentSnapshot } from 'firebase/firestore'; // Importar desde 'firebase/firestore'

// Función para postularse a una convocatoria
export const postularseConvocatoria = async (req: CustomRequest, res: Response) => {
  try {
    const { idConvocatoria } = req.params;
    const idPostulante = req.user?.userId;
    const fechaPostulacion = new Date().toISOString();

    console.log('ID Convocatoria:', idConvocatoria); // Agregar log para depurar
    console.log('ID Postulante:', idPostulante); // Agregar log para depurar

    if (!idPostulante || !idConvocatoria) {
      return res.status(400).json({ message: 'Faltan campos requeridos' });
    }

    const convocatoriaDoc = await getDocById('convocatorias', idConvocatoria);
    console.log('ConvocatoriaDoc:', convocatoriaDoc); // Agregar log para verificar si existe la convocatoria

    if (!convocatoriaDoc) {
      return res.status(404).json({ message: 'Convocatoria no encontrada.' });
    }

    const nombreConvocatoria = convocatoriaDoc.data().nombre;
    console.log('Nombre de la Convocatoria:', nombreConvocatoria); // Verifica que la convocatoria tenga nombre

    const documentosSubidos = await queryDocsByField('documentosPostulantes', 'idPostulante', idPostulante);
    console.log('Documentos Subidos:', documentosSubidos.docs[0].data()); // Verifica si los documentos están correctos

    if (!documentosSubidos || documentosSubidos.empty || !documentosSubidos.docs[0].data().cvUrl || !documentosSubidos.docs[0].data().dniUrl) {
      return res.status(400).json({ message: 'Faltan documentos obligatorios para postular (CV y DNI).' });
    }

    const postulacion = {
      idConvocatoria,
      nombreConvocatoria,
      idPostulante,
      fechaPostulacion,
      documentosSubidos: documentosSubidos.docs[0].data(),
      estado: 'en proceso',
    };

    await createDoc('postulaciones', postulacion);
    res.status(200).json({ message: 'Postulación realizada con éxito' });
  } catch (error) {
    console.error('Error en la postulación:', error); // Agregar log para cualquier otro error
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

      try {
        // Obtener el documento de la convocatoria desde Firestore
        const convocatoriaDoc = await getDocById('convocatorias', idConvocatoria);

        let nombreConvocatoria = 'Convocatoria sin título';

        if (convocatoriaDoc.exists()) { // Ahora esto funcionará correctamente
          const convocatoriaData = convocatoriaDoc.data();  // Asegúrate de obtener los datos del documento
          console.log(`Convocatoria encontrada: ${idConvocatoria}, Título: ${convocatoriaData.titulo}`);
          nombreConvocatoria = convocatoriaData?.titulo || nombreConvocatoria;  // Título o valor por defecto
        } else {
          console.log(`Convocatoria no encontrada: ${idConvocatoria}`);
        }

        // Devolver la postulación junto con el nombre de la convocatoria
        return {
          id: doc.id, // El ID de la postulación
          nombreConvocatoria, // Agregar el título (nombre) de la convocatoria
          ...postulacionData, // El resto de los datos de la postulación
        };
      } catch (convocatoriaError) {
        console.error(`Error al obtener la convocatoria con ID ${idConvocatoria}:`, convocatoriaError);
        return {
          id: doc.id,
          nombreConvocatoria: 'Error al obtener convocatoria', // Mensaje de error para el cliente
          ...postulacionData,
        };
      }
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
export const verificarPostulacion = async (req: CustomRequest, res: Response) => {
  try {
    const idPostulante = req.user?.userId;  // Obtener el ID del postulante desde el token
    const { idConvocatoria } = req.params; // ID de la convocatoria desde la URL

    if (!idPostulante || !idConvocatoria) {
      return res.status(400).json({ message: 'Faltan campos requeridos' });
    }

    // Consultar si ya existe una postulación para esta convocatoria y postulante
    const querySnapshot = await queryDocsByField('postulaciones', 'idConvocatoria', idConvocatoria);

    // Verificar si el postulante ya se ha postulado
    const postulacion = querySnapshot.docs.find(doc => doc.data().idPostulante === idPostulante);

    if (postulacion) {
      // Si ya está postulado, devolver un estado de "postulado"
      return res.status(200).json({ postulado: true });
    } else {
      // Si no está postulado, devolver un estado de "no postulado"
      return res.status(200).json({ postulado: false });
    }
  } catch (error) {
    console.error('Error al verificar postulación:', error);
    res.status(500).json({ message: 'Error al verificar postulación', error });
  }
};

