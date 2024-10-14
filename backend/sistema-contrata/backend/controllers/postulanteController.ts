import { Request, Response } from 'express';
import { CustomRequest } from '../middlewares/authMiddleware';
import { subirDocumento } from '../services/documentUploadService';
import { createDoc, getDocById, queryDocsByField, queryDocsByFields, updateDocById } from '../services/firebaseService';
import { DocumentData, QueryDocumentSnapshot } from 'firebase/firestore'; // Importar desde 'firebase/firestore'

// Función para postularse a una convocatoria
export const postularseConvocatoria = async (req: CustomRequest, res: Response) => {
  try {
    const { idConvocatoria } = req.params;
    const idPostulante = req.user?.userId;
    const fechaPostulacion = new Date().toISOString();

    console.log('ID Postulante:', idPostulante);
    console.log('ID Convocatoria:', idConvocatoria);

    if (!idPostulante || !idConvocatoria) {
      return res.status(400).json({ message: 'Faltan campos requeridos (idPostulante o idConvocatoria).' });
    }

    // Verificar si la convocatoria existe
    const convocatoriaDoc = await getDocById('convocatorias', idConvocatoria);
    if (!convocatoriaDoc.exists) {
      console.log('Error: Convocatoria no encontrada');
      return res.status(404).json({ message: 'Convocatoria no encontrada.' });
    }

    const convocatoria = convocatoriaDoc.data();
    const { titulo, documentosRequeridos } = convocatoria;

    console.log('Convocatoria encontrada:', convocatoria);
    console.log('Documentos requeridos:', documentosRequeridos);

    // Verificar si el postulante ya se ha postulado a esta convocatoria
    const postulacionExistente = await queryDocsByFields('postulaciones', {
      idConvocatoria,
      idPostulante
    });

    console.log('Postulación existente:', !postulacionExistente.empty);

    if (!postulacionExistente.empty) {
      return res.status(400).json({ message: 'Ya te has postulado a esta convocatoria. No puedes postularte dos veces.' });
    }

    // Verificar que los documentos requeridos hayan sido subidos
    const documentosSubidos = await queryDocsByField('documentosPostulantes', 'idPostulante', idPostulante);
    if (!documentosSubidos || documentosSubidos.empty) {
      return res.status(400).json({ message: 'No has subido ningún documento. Ve a "Mis Documentos" para subirlos.' });
    }

    const documentos = documentosSubidos.docs[0].data();

    console.log('Documentos subidos:', documentos);

    // Verificar qué documentos faltan
    const documentosFaltantes: string[] = [];

    if (documentosRequeridos.cv && !documentos.cvUrl) {
      documentosFaltantes.push('CV');
    }
    if (documentosRequeridos.dni && !documentos.dniUrl) {
      documentosFaltantes.push('DNI');
    }
    if (documentosRequeridos.certificadosEstudios && !documentos.certificadosEstudiosUrl) {
      documentosFaltantes.push('Certificados de Estudios');
    }
    if (documentosRequeridos.certificadosTrabajo && !documentos.certificadosTrabajoUrl) {
      documentosFaltantes.push('Certificados de Trabajo');
    }
    if (documentosRequeridos.declaracionJurada && !documentos.declaracionJuradaUrl) {
      documentosFaltantes.push('Declaración Jurada');
    }

    console.log('Documentos faltantes:', documentosFaltantes);

    // Si faltan documentos, devolver un mensaje específico
    if (documentosFaltantes.length > 0) {
      return res.status(400).json({
        message: `Faltan los siguientes documentos: ${documentosFaltantes.join(', ')}. Por favor, ve a "Mis Documentos" para subirlos.`
      });
    }

    // Crear nueva postulación si todos los documentos requeridos están presentes
    const postulacion = {
      idConvocatoria,
      nombreConvocatoria: titulo,
      idPostulante,
      fechaPostulacion,
      documentosSubidos: documentos,
      estado: 'en proceso',
    };

    console.log('Postulación a crear:', postulacion);

    await createDoc('postulaciones', postulacion);

    console.log('Postulación creada con éxito:', postulacion);

    return res.status(201).json({ message: 'Postulación realizada con éxito' });

  } catch (error) {
    console.error('Error en la postulación:', error); 
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
    return res.status(500).json({ error: 'Error al realizar la postulación', details: errorMessage });
  }
};

export const subirDocumentosPostulante = async (req: CustomRequest, res: Response) => {
  try {
    const idPostulante = req.user?.userId;  // Obtener el ID del postulante desde el token

    // Acceder a los archivos subidos (uno o varios)
    const files = req.files as { [fieldname: string]: Express.Multer.File[] };
    
    // Verificar si al menos un archivo ha sido subido
    if (!files || Object.keys(files).length === 0) {
      return res.status(400).json({ message: 'Debes subir al menos un documento.' });
    }

    // Variables para almacenar las URLs de los documentos
    let cvUrl = null;
    let dniUrl = null;
    let certificadosEstudiosUrl = null;
    let certificadosTrabajoUrl = null;
    let declaracionJuradaUrl = null;

    const timestamp = new Date().getTime(); // Para generar nombres únicos si es necesario

    // Subir solo los documentos que han sido enviados
    if (files['cv']) {
      const cvFile = files['cv'][0];
      cvUrl = await subirDocumento(cvFile.buffer, `postulantes/${idPostulante}/cv_${timestamp}.pdf`);
    }
    
    if (files['dni']) {
      const dniFile = files['dni'][0];
      dniUrl = await subirDocumento(dniFile.buffer, `postulantes/${idPostulante}/dni_${timestamp}.pdf`);
    }

    if (files['certificadosEstudios']) {
      const certificadosEstudiosFile = files['certificadosEstudios'][0];
      certificadosEstudiosUrl = await subirDocumento(certificadosEstudiosFile.buffer, `postulantes/${idPostulante}/certificadosEstudios_${timestamp}.pdf`);
    }

    if (files['certificadosTrabajo']) {
      const certificadosTrabajoFile = files['certificadosTrabajo'][0];
      certificadosTrabajoUrl = await subirDocumento(certificadosTrabajoFile.buffer, `postulantes/${idPostulante}/certificadosTrabajo_${timestamp}.pdf`);
    }

    if (files['declaracionJurada']) {
      const declaracionJuradaFile = files['declaracionJurada'][0];
      declaracionJuradaUrl = await subirDocumento(declaracionJuradaFile.buffer, `postulantes/${idPostulante}/declaracionJurada_${timestamp}.pdf`);
    }

    // Verificar si ya existen documentos subidos para este postulante
    const documentosExistentes = await queryDocsByField('documentosPostulantes', 'idPostulante', idPostulante);

    if (!documentosExistentes.empty) {
      // Si ya existen documentos, actualizar el documento existente
      const docId = documentosExistentes.docs[0].id;
      
      // Actualizar solo los documentos que hayan sido subidos
      const updateData: any = {};
      if (cvUrl) updateData.cvUrl = cvUrl;
      if (dniUrl) updateData.dniUrl = dniUrl;
      if (certificadosEstudiosUrl) updateData.certificadosEstudiosUrl = certificadosEstudiosUrl;
      if (certificadosTrabajoUrl) updateData.certificadosTrabajoUrl = certificadosTrabajoUrl;
      if (declaracionJuradaUrl) updateData.declaracionJuradaUrl = declaracionJuradaUrl;

      await updateDocById('documentosPostulantes', docId, updateData);

      return res.status(200).json({ message: 'Documentos actualizados con éxito.' });
    } else {
      // Si no existen documentos, crear un nuevo documento
      const documentosSubidos = {
        idPostulante,
        cvUrl,
        dniUrl,
        certificadosEstudiosUrl,
        certificadosTrabajoUrl,
        declaracionJuradaUrl,
      };

      await createDoc('documentosPostulantes', documentosSubidos);

      return res.status(200).json({ message: 'Documentos subidos con éxito.', documentosSubidos });
    }

  } catch (error) {
      console.error('Error en subirDocumentosPostulante:', error); // Log para depurar el error
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      return res.status(500).json({ error: 'Error al subir los documentos', details: errorMessage });
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

export const obtenerDocumentosPostulante = async (req: CustomRequest, res: Response) => {
  try {
    const idPostulante = req.user?.userId;

    // Verificar si el postulante tiene documentos subidos
    const documentosExistentes = await queryDocsByField('documentosPostulantes', 'idPostulante', idPostulante);

    if (!documentosExistentes.empty) {
      const documentos = documentosExistentes.docs[0].data();

      // Asegúrate de utilizar los nombres correctos de los campos en Firestore
      return res.status(200).json({
        certificadosEstudios: documentos.certificadosEstudiosUrl || null,  // Ahora accede a certificadosEstudiosUrl
        certificadosTrabajo: documentos.certificadosTrabajoUrl || null,    // Ahora accede a certificadosTrabajoUrl
        cv: documentos.cvUrl || null,                                     // Acceso a cvUrl
        declaracionJurada: documentos.declaracionJuradaUrl || null,        // Ahora accede a declaracionJuradaUrl
        dni: documentos.dniUrl || null                                    // Acceso a dniUrl
      });
    } else {
      return res.status(200).json({ message: 'No se encontraron documentos subidos.' });
    }
  } catch (error) {
    return res.status(500).json({ message: 'Error al obtener los documentos del postulante.', error });
  }
};

