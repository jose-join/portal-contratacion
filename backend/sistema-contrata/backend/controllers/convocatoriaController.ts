import { FormData } from '../models/formData';
import { Request, Response } from 'express';
import { enviarABlockchain } from '../services/blockchainService';  // Interacción con la blockchain
import {
  createDoc,
  getDocById,
  updateDocById,
  deleteDocById,
  getAllDocs,
  queryDocsByField
} from '../services/firebaseService';  // Funciones para Firebase

// Función para crear una convocatoria en Firebase
export const createConvocatoria = async (req: Request, res: Response) => {
  try {
    const convocatoriaData: FormData = req.body;
    convocatoriaData.subidoBlockchain = false; // Aún no se sube a la blockchain
    convocatoriaData.validado = false;         // No está validada inicialmente

    // Se guarda la convocatoria en Firebase
    const id = await createDoc('convocatorias', convocatoriaData);
    res.status(200).json({ message: 'Convocatoria creada en Firebase con éxito', id });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
    res.status(500).json({ error: 'Error al crear la convocatoria en Firebase', details: errorMessage });
  }
};
// Función para validar una convocatoria en Firebase
export const validarConvocatoria = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const convocatoriaSnapshot = await getDocById('convocatorias', id);  // Devuelve el DocumentSnapshot
    const convocatoria = convocatoriaSnapshot.data();  // Obtiene los datos del documento

    if (convocatoria?.subidoBlockchain) {
      return res.status(400).json({ message: 'La convocatoria ya ha sido subida a la blockchain.' });
    }

    // Marcar la convocatoria como validada
    await updateDocById('convocatorias', id, { validado: true });
    res.status(200).json({ message: 'Convocatoria validada con éxito' });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
    res.status(500).json({ error: 'Error al validar la convocatoria', details: errorMessage });
  }
};
// Función para actualizar una convocatoria en Firebase (solo si no ha sido subida a la blockchain)
export const actualizarConvocatoria = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    console.log(`Actualizando convocatoria con ID: ${id}`);  // Verifica que el ID es correcto

    const updatedData: FormData = req.body;
    const convocatoriaSnapshot = await getDocById('convocatorias', id);  // Obtener el DocumentSnapshot
    const convocatoria = convocatoriaSnapshot.data() as FormData;  // Extraer los datos y asegurarte de que sea del tipo FormData

    if (!convocatoria) {
      return res.status(404).json({ message: 'Convocatoria no encontrada.' });
    }

    if (!convocatoria.subidoBlockchain) {  // Asegúrate de que subidoBlockchain existe y es accesible
      await updateDocById('convocatorias', id, updatedData);
      res.status(200).json({ message: 'Convocatoria actualizada con éxito' });
    } else {
      res.status(400).json({ message: 'No se puede actualizar. La convocatoria ya está en la blockchain.' });
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
    res.status(500).json({ error: 'Error al actualizar la convocatoria', details: errorMessage });
  }
};

// Función para mostrar una convocatoria
export const mostrarConvocatoria = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const convocatoria = await getDocById('convocatorias', id);
    res.status(200).json(convocatoria);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
    res.status(404).json({ message: errorMessage });
  }
};

// Función para mostrar todas las convocatorias
export const mostrarTodasConvocatorias = async (req: Request, res: Response) => {
  try {
    const convocatorias = await getAllDocs('convocatorias');
    res.status(200).json(convocatorias);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
    res.status(500).json({ error: 'Error al obtener las convocatorias', details: errorMessage });
  }
};
// Función para contar el número de postulantes en una convocatoria específica
export const contarPostulantesConvocatoria = async (req: Request, res: Response) => {
  try {
    const { idConvocatoria } = req.params;
    const convocatoriaSnapshot = await getDocById('convocatorias', idConvocatoria);
    const convocatoria = convocatoriaSnapshot.data();  // Extraer los datos

    if (!convocatoria) {
      return res.status(404).json({ message: 'Convocatoria no encontrada.' });
    }

    const postulaciones = await queryDocsByField('postulaciones', 'idConvocatoria', idConvocatoria);
    const numeroPostulantes = postulaciones.size;

    const postulantesConEstado = await Promise.all(
      postulaciones.docs.map(async (doc) => {
        const postulanteId = doc.data().idPostulante;
        const postulanteSnapshot = await getDocById('users', postulanteId);
        const postulanteData = postulanteSnapshot.data();  // Obtener los datos del postulante

        if (!postulanteData) {
          console.warn(`Usuario no encontrado con ID: ${postulanteId}`);
          return {
            nombre: `Usuario con ID ${postulanteId} no encontrado`,
            estado: doc.data().estado || 'Sin estado',
          };
        }

        const nombreCompleto = `${postulanteData.nombres} ${postulanteData.apellidos}` || 'Nombre no disponible';
        return {
          nombre: nombreCompleto,
          estado: doc.data().estado || 'Sin estado',  // Obtener el estado desde las postulaciones
        };
      })
    );

    res.status(200).json({
      idConvocatoria,
      nombreConvocatoria: convocatoria.titulo || 'Sin título',
      numeroPostulantes,
      postulantes: postulantesConEstado,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
    res.status(500).json({ message: 'Error al contar los postulantes', details: errorMessage });
  }
};

// Función para subir una convocatoria validada a la blockchain
export const subirConvocatoriaBlockchain = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const convocatoriaSnapshot = await getDocById('convocatorias', id);  // Obtener el DocumentSnapshot
    const convocatoria = convocatoriaSnapshot.data();  // Extraer los datos

    // Verificar si la convocatoria ha sido validada
    if (!convocatoria?.validado) {
      return res.status(400).json({ message: 'La convocatoria no ha sido validada.' });
    }

    // Extraer las fechas importantes de la convocatoria
    const { inicioConvocatoria, cierreConvocatoria, fechaEvaluacion, publicacionResultados } = convocatoria?.fechasImportantes || {};

    // Subir la convocatoria a la blockchain
    const resultadoBlockchain = await enviarABlockchain({
      id,
      inicioConvocatoria: new Date(inicioConvocatoria).getTime() / 1000,
      cierreConvocatoria: new Date(cierreConvocatoria).getTime() / 1000,
      fechaEvaluacion: new Date(fechaEvaluacion).getTime() / 1000,
      publicacionResultados: new Date(publicacionResultados).getTime() / 1000,
    });

    if (resultadoBlockchain.success) {
      await updateDocById('convocatorias', id, { subidoBlockchain: true });
      res.status(200).json({ message: 'Convocatoria subida a la blockchain con éxito' });
    } else {
      res.status(500).json({ message: 'Error al subir la convocatoria a la blockchain' });
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
    res.status(500).json({ error: 'Error al subir la convocatoria a la blockchain', details: errorMessage });
  }
};
// Función para subir convocatoria con postulantes a la blockchain y cambiar el estado a "evaluacion"
export const subirConvocatoriaConPostulantes = async (req: Request, res: Response) => {
  try {
    const { idConvocatoria } = req.params;

    // Obtener la convocatoria
    const convocatoriaSnapshot = await getDocById('convocatorias', idConvocatoria);
    const convocatoria = convocatoriaSnapshot.data() as FormData;

    if (!convocatoria) {
      return res.status(404).json({ message: 'Convocatoria no encontrada.' });
    }

    // Verificar si la convocatoria ha sido validada
    if (!convocatoria.validado) {
      return res.status(400).json({ message: 'La convocatoria no ha sido validada.' });
    }

    // Obtener todos los postulantes asociados a esta convocatoria
    const postulantesSnapshot = await queryDocsByField('postulaciones', 'idConvocatoria', idConvocatoria);
    const postulantes = postulantesSnapshot.docs.map(doc => doc.data().idPostulante);

    if (postulantes.length === 0) {
      return res.status(404).json({ message: 'No hay postulantes para esta convocatoria' });
    }

    try {
      // Enviar la convocatoria y los postulantes a la blockchain
      const resultadoBlockchain = await enviarABlockchain({
        id: idConvocatoria,
        postulantes: postulantes, // Lista de IDs de postulantes
        inicioConvocatoria: new Date(convocatoria.fechasImportantes.inicioConvocatoria).getTime() / 1000,
        cierreConvocatoria: new Date(convocatoria.fechasImportantes.cierreConvocatoria).getTime() / 1000,
        fechaEvaluacion: new Date(convocatoria.fechasImportantes.fechaEvaluacion).getTime() / 1000,
        publicacionResultados: new Date(convocatoria.fechasImportantes.publicacionResultados).getTime() / 1000,
      });

      // Verificar si el proceso de blockchain fue exitoso
      if (resultadoBlockchain.success) {
        // Actualizar la convocatoria en Firebase
        await updateDocById('convocatorias', idConvocatoria, { subidoBlockchain: true, estado: 'evaluacion' });

        // Actualizar el estado de los postulantes a "evaluacion"
        await Promise.all(
          postulantesSnapshot.docs.map(async (doc) => {
            await updateDocById('postulaciones', doc.id, { estado: 'evaluacion' });
          })
        );

        return res.status(200).json({ message: 'Convocatoria y postulantes subidos a la blockchain con éxito, estado actualizado a evaluación.' });
      } else {
        // Error en la respuesta de la blockchain
        console.error('Error en la respuesta de la blockchain:', resultadoBlockchain.error);
        return res.status(500).json({ message: 'Error al subir la convocatoria con postulantes a la blockchain.', blockchainError: resultadoBlockchain.error });
      }
    } catch (blockchainError) {
      // Errores al intentar interactuar con la blockchain
      console.error('Error al interactuar con la blockchain:', blockchainError);
      return res.status(500).json({
        message: 'Error al interactuar con la blockchain',
        blockchainError: blockchainError instanceof Error ? blockchainError.message : 'Error desconocido en la blockchain',
      });
    }

  } catch (firebaseError) {
    // Captura cualquier error en el proceso de obtención de la convocatoria o postulantes
    console.error('Error en la función subirConvocatoriaConPostulantes:', firebaseError);
    const errorMessage = firebaseError instanceof Error ? firebaseError.message : 'Error desconocido';
    return res.status(500).json({ error: 'Error al subir la convocatoria con postulantes a la blockchain.', details: errorMessage });
  }
};

export const eliminarConvocatoria = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const convocatoriaSnapshot = await getDocById('convocatorias', id); // Obtener el DocumentSnapshot
    const convocatoria = convocatoriaSnapshot.data() as FormData;  // Extraer los datos como FormData

    if (!convocatoria) {
      return res.status(404).json({ message: 'Convocatoria no encontrada.' });
    }

    // Si la convocatoria ha sido subida a la blockchain, también debe eliminarse de la blockchain
    if (convocatoria.subidoBlockchain) {
      try {
        // Emitir el evento de eliminación en la blockchain si está subida
        const resultadoBlockchain = await enviarABlockchain({
          id: id,
          inicioConvocatoria: 0,
          cierreConvocatoria: 0,
          fechaEvaluacion: 0,
          publicacionResultados: 0
        });

        if (!resultadoBlockchain.success) {
          // Manejar error al eliminar de la blockchain
          console.error('Error al eliminar la convocatoria en la blockchain:', resultadoBlockchain.error);
        } else {
          console.log('Convocatoria eliminada de la blockchain:', resultadoBlockchain.transactionHash);
        }
      } catch (error) {
        console.error('Error al interactuar con la blockchain para eliminar la convocatoria:', error);
      }
    }

    // Eliminar la convocatoria de Firebase
    await deleteDocById('convocatorias', id);
    res.status(200).json({ message: 'Convocatoria eliminada con éxito, tanto de Firebase como de la blockchain (si estaba subida).' });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
    res.status(500).json({ error: 'Error al eliminar la convocatoria', details: errorMessage });
  }
};
